import { supabase } from '../lib/supabase';
import { Student, RiskStatus, SkillScore, TalentScoreBreakdown, IRIBreakdown } from '../types/student';
import { DataScope } from '../types/auth';

export const studentService = {
  /**
   * Fetch all students respecting multi-tenant DataScope filters
   */
  async getStudents(
    scope?: DataScope,
    filters?: {
      riskStatus?: RiskStatus;
      minScore?: number;
      searchQuery?: string;
      departmentId?: string;
      batchId?: string;
    }
  ): Promise<Student[]> {
    try {
      let query = (supabase.from('students') as any).select('*');

      // Enforce DataScope
      if (scope) {
        if (scope.collegeId) {
          query = query.eq('college_id', scope.collegeId);
        }
        if (scope.departmentIds?.[0]) {
          query = query.eq('department_id', scope.departmentIds[0]);
        }
        if (scope.departmentNames?.[0]) {
          query = query.ilike('department_name', `%${scope.departmentNames[0]}%`);
        }
        if (scope.scopeType === 'SELF' && scope.studentId) {
          query = query.eq('id', scope.studentId);
        }
      }

      // Additional search filters
      if (filters?.riskStatus) {
        query = query.eq('risk_status', filters.riskStatus);
      }
      if (filters?.minScore !== undefined) {
        query = query.gte('talent_score', filters.minScore);
      }
      if (filters?.departmentId) {
        query = query.eq('department_id', filters.departmentId);
      }
      if (filters?.batchId) {
        query = query.eq('batch_id', filters.batchId);
      }
      if (filters?.searchQuery?.trim()) {
        const q = filters.searchQuery.trim();
        query = query.or(
          `name.ilike.%${q}%,roll_number.ilike.%${q}%,email.ilike.%${q}%`
        );
      }

      const { data, error } = await query.order('talent_score', { ascending: false });

      if (error) {
        console.error('getStudents error:', error);
        return [];
      }

      if (!data) return [];

      return data.map((row: any) => this.mapDbStudentToDomain(row));
    } catch (err) {
      console.error('getStudents exception:', err);
      return [];
    }
  },

  /**
   * Get single student by ID, email, or fallback to first student
   */
  async getStudentById(studentIdentifier?: string): Promise<Student | null> {
    try {
      let query = (supabase.from('students') as any).select('*');

      if (studentIdentifier) {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentIdentifier);
        if (studentIdentifier.includes('@')) {
          query = query.eq('email', studentIdentifier);
        } else if (isUUID) {
          query = query.or(`id.eq.${studentIdentifier},user_id.eq.${studentIdentifier}`);
        } else {
          query = query.or(`roll_number.eq.${studentIdentifier},email.ilike.%${studentIdentifier}%`);
        }
      }

      const { data, error } = await query.limit(1).maybeSingle();

      if (error) {
        console.warn('getStudentById notice:', error.message);
      }

      if (data) {
        return this.mapDbStudentToDomain(data);
      }

      // If no specific student found by identifier, load first available student in database
      const { data: firstStudent } = await (supabase.from('students') as any)
        .select('*')
        .order('talent_score', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (firstStudent) {
        return this.mapDbStudentToDomain(firstStudent);
      }

      return null;
    } catch (err) {
      console.error('getStudentById exception:', err);
      return null;
    }
  },

  /**
   * Get at-risk students for early warning dashboard
   */
  async getAtRiskStudents(scope?: DataScope): Promise<Student[]> {
    const list = await this.getStudents(scope);
    return list.filter(
      s => s.riskStatus === 'STRUGGLING' || s.riskStatus === 'INACTIVE' || s.riskStatus === 'PARTIAL'
    );
  },

  /**
   * Bulk import students with CSV records
   */
  async bulkImportStudents(
    records: Array<{
      name: string;
      email: string;
      phone: string;
      rollNumber: string;
      collegeId?: string;
      collegeName?: string;
      departmentId?: string;
      departmentName?: string;
      batchId?: string;
      batchName?: string;
      graduationYear?: number;
    }>
  ): Promise<{ successCount: number; failureCount: number; errors: string[]; imported: Student[] }> {
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];
    const imported: Student[] = [];

    // Dynamically lookup default college/department if not provided
    let defaultCollege: any = null;
    let defaultDepartment: any = null;
    let defaultBatch: any = null;

    const { data: firstCol } = await (supabase.from('colleges') as any).select('id, name').limit(1).maybeSingle();
    if (firstCol) defaultCollege = firstCol;

    if (defaultCollege) {
      const { data: firstDept } = await (supabase.from('departments') as any).select('id, name').eq('college_id', defaultCollege.id).limit(1).maybeSingle();
      if (firstDept) defaultDepartment = firstDept;
      const { data: firstBat } = await (supabase.from('batches') as any).select('id, name').eq('college_id', defaultCollege.id).limit(1).maybeSingle();
      if (firstBat) defaultBatch = firstBat;
    }

    for (const rec of records) {
      try {
        const resolvedCollegeId = rec.collegeId || defaultCollege?.id;
        const resolvedCollegeName = rec.collegeName || defaultCollege?.name || 'Institution';
        const resolvedDeptId = rec.departmentId || defaultDepartment?.id;
        const resolvedDeptName = rec.departmentName || defaultDepartment?.name || 'Engineering';
        const resolvedBatchId = rec.batchId || defaultBatch?.id;
        const resolvedBatchName = rec.batchName || defaultBatch?.name || 'Batch 2026';

        if (!resolvedCollegeId || !resolvedDeptId) {
          throw new Error('College and Department must be registered in the system before importing students.');
        }

        const { data: created, error } = await (supabase
          .from('students') as any)
          .insert({
            name: rec.name,
            email: rec.email,
            phone: rec.phone,
            roll_number: rec.rollNumber,
            college_id: resolvedCollegeId,
            college_name: resolvedCollegeName,
            department_id: resolvedDeptId,
            department_name: resolvedDeptName,
            batch_id: resolvedBatchId,
            batch_name: resolvedBatchName,
            graduation_year: rec.graduationYear || 2026,
            cgpa: 8.0,
            talent_score: 650,
            iri_score: 70.0,
            risk_status: 'ON_TRACK',
            smart_promotion_stage: 'FOUNDATION',
            is_active: true,
          })
          .select()
          .single();

        if (error) {
          failureCount++;
          errors.push(`Row ${rec.rollNumber} (${rec.email}): ${error.message}`);
        } else if (created) {
          successCount++;
          imported.push(this.mapDbStudentToDomain(created));
        }
      } catch (err: any) {
        failureCount++;
        errors.push(`Row ${rec.rollNumber}: ${err.message || 'Unknown error'}`);
      }
    }

    return { successCount, failureCount, errors, imported };
  },

  /**
   * Update student profile & risk attributes
   */
  async updateStudent(studentId: string, updates: Partial<Student> & { smartPromotionStage?: string; isActive?: boolean }): Promise<boolean> {
    try {
      const dbUpdates: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.name) dbUpdates.name = updates.name;
      if (updates.phone) dbUpdates.phone = updates.phone;
      if (updates.cgpa !== undefined) dbUpdates.cgpa = updates.cgpa;
      if (updates.riskStatus) dbUpdates.risk_status = updates.riskStatus;
      if (updates.smartPromotionStage) dbUpdates.smart_promotion_stage = updates.smartPromotionStage;
      if (updates.githubUsername !== undefined) dbUpdates.github_username = updates.githubUsername;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { error } = await (supabase.from('students') as any).update(dbUpdates).eq('id', studentId);
      return !error;
    } catch (err) {
      console.error('updateStudent error:', err);
      return false;
    }
  },

  /**
   * Map database students row to strongly-typed frontend Student domain model
   */
  mapDbStudentToDomain(row: any): Student {
    const rawTalent = typeof row.talent_score_details === 'object' && row.talent_score_details !== null
      ? row.talent_score_details
      : {};

    const rawIri = typeof row.iri_score_details === 'object' && row.iri_score_details !== null
      ? row.iri_score_details
      : {};

    const rawSkills = Array.isArray(row.skills) ? row.skills : [];

    const talentScore: TalentScoreBreakdown = {
      overallScore: row.talent_score || 750,
      technicalScore: rawTalent.technicalScore || 820,
      placementScore: rawTalent.placementScore || 780,
      communicationScore: rawTalent.communicationScore || 760,
      aptitudeScore: rawTalent.aptitudeScore || 750,
      gitHubScore: rawTalent.gitHubScore || 800,
      consistencyStreak: row.streak_days || 14,
      totalXP: row.total_xp || 1450,
      unlockedOpportunitiesTier:
        (row.talent_score || 750) >= 800
          ? 'DirectInterviewPool'
          : (row.talent_score || 750) >= 700
          ? 'RecruiterVisible'
          : 'Foundation',
      scoreTrend: rawTalent.scoreTrend || [
        { month: 'Jun', score: 620 },
        { month: 'Jul', score: 680 },
        { month: 'Aug', score: 720 },
        { month: 'Sep', score: row.talent_score || 750 },
      ],
    };

    const iri: IRIBreakdown = {
      overallIRI: Number(row.iri_score) || 75.0,
      learningProgress: rawIri.learningProgress || 80,
      labPerformance: rawIri.labPerformance || 78,
      assignmentQuality: rawIri.assignmentQuality || 82,
      debuggingAbility: rawIri.debuggingAbility || 74,
      projectCompletion: rawIri.projectCompletion || 88,
      gitHubActivity: rawIri.gitHubActivity || 75,
      consistency: rawIri.consistency || 80,
      mockInterview: rawIri.mockInterview || 70,
      problemSolving: rawIri.problemSolving || 82,
      teamChallenges: rawIri.teamChallenges || 76,
      trend: rawIri.trend || 'UP',
      strengths: rawIri.strengths || ['FastAPI Architecture', 'PostgreSQL Query Planning', 'Clean Code'],
      weaknesses: rawIri.weaknesses || ['Speaking Under Pressure', 'Graph Dynamic Programming'],
      recommendations: rawIri.recommendations || ['Complete 2 more Mock Interviews', 'Submit System Design Project'],
    };

    const mappedSkills: SkillScore[] = rawSkills.length > 0
      ? rawSkills.map((s: any) => ({
          name: s.name,
          category: s.category?.toLowerCase() || 'technical',
          score: s.score || 80,
          level: s.level || 'Advanced',
          verified: s.verified ?? true,
          lastAssessed: s.lastAssessed || 'Recently',
        }))
      : [
          { name: 'Python', category: 'technical', score: 85, verified: true, level: 'Advanced', lastAssessed: '2 days ago' },
          { name: 'FastAPI', category: 'technical', score: 82, verified: true, level: 'Advanced', lastAssessed: '3 days ago' },
          { name: 'PostgreSQL', category: 'technical', score: 80, verified: true, level: 'Intermediate', lastAssessed: '1 week ago' },
          { name: 'Quantitative Aptitude', category: 'aptitude', score: 75, verified: true, level: 'Intermediate', lastAssessed: 'Yesterday' },
        ];

    return {
      id: row.id,
      userId: row.user_id || row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      rollNumber: row.roll_number,
      collegeId: row.college_id,
      collegeName: row.college_name,
      departmentId: row.department_id,
      departmentName: row.department_name,
      batchId: row.batch_id,
      batchName: row.batch_name,
      avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      cgpa: Number(row.cgpa) || 8.0,
      graduationYear: row.graduation_year || 2026,
      talentScore,
      iri,
      placementReadiness: {
        status: (row.talent_score || 750) >= 800 ? 'InterviewReady' : (row.talent_score || 750) >= 700 ? 'Advanced' : 'Foundation',
        readinessPercent: row.placement_readiness || 78,
        eligibleDrivesCount: 6,
        offersCount: 1,
      },
      skills: mappedSkills,
      enrolledTracks: Array.isArray(row.enrolled_tracks) ? row.enrolled_tracks : ['Python Backend & Microservices'],
      streakDays: row.streak_days || 0,
      riskStatus: (row.risk_status as RiskStatus) || 'ON_TRACK',
      githubUsername: row.github_username || 'developer',
      githubStats: typeof row.github_stats === 'object' && row.github_stats !== null ? {
        repos: row.github_stats.repos || 12,
        commitsThisMonth: row.github_stats.commitsThisMonth || 48,
        verifiedContributions: row.github_stats.verifiedContributions || 340,
        qualityRating: row.github_stats.qualityRating || 'A',
      } : {
        repos: 12,
        commitsThisMonth: 48,
        verifiedContributions: 340,
        qualityRating: 'A',
      },
      attendancePercent: Number(row.attendance_percent) || 90.0,
      joinedDate: row.created_at ? row.created_at.split('T')[0] : '2026-06-01',
    };
  },
};
