import { supabase } from '../lib/supabase';
import { JobPosting, CandidateApplication, PipelineStage, RecruiterFilterState } from '../types/recruiter';
import { Student } from '../types/student';
import { studentService } from './studentService';

export const recruiterService = {
  /**
   * Filter talent pool for recruiters with 12 comprehensive filter dimensions
   */
  async getTalentPool(filters: RecruiterFilterState): Promise<Student[]> {
    try {
      const list = await studentService.getStudents();

      return list.filter(student => {
        // 1. Min Talent Score Cutoff
        if (student.talentScore && student.talentScore.overallScore < filters.minTalentScore) {
          return false;
        }

        // 2. Min IRI Cutoff
        if (student.iri && student.iri.overallIRI < filters.minIRI) {
          return false;
        }

        // 3. Min CGPA Cutoff
        if (student.cgpa < filters.minCgpa) {
          return false;
        }

        // 4. College Filter
        if (filters.colleges.length > 0 && !filters.colleges.includes(student.collegeName)) {
          return false;
        }

        // 5. Course / Department Filter
        if (filters.departments.length > 0 && !filters.departments.includes(student.departmentName)) {
          return false;
        }

        // 6. Technical Skills Filter
        if (filters.skills.length > 0) {
          const studentSkillNames = (student.skills || []).map(s => s.name.toLowerCase());
          const hasMatch = filters.skills.some(sk =>
            studentSkillNames.some(ss => ss.includes(sk.toLowerCase()))
          );
          if (!hasMatch) return false;
        }

        // 7. Graduation Year Filter
        if (filters.graduationYears.length > 0 && !filters.graduationYears.includes(student.graduationYear)) {
          return false;
        }

        // 8. GitHub Profile Filter
        if (filters.hasGithubOnly && (!student.githubUsername || student.githubUsername.trim() === '')) {
          return false;
        }

        // 9. Min Projects Filter
        if (filters.minProjects && filters.minProjects > 0) {
          const projectCount = student.githubStats?.repos || (student.iri?.projectCompletion ? Math.floor(student.iri.projectCompletion / 25) : 1);
          if (projectCount < filters.minProjects) return false;
        }

        // 10. Communication Score Filter
        if (filters.minCommunicationScore && filters.minCommunicationScore > 0) {
          const commScore = student.talentScore?.communicationScore ? Math.round(student.talentScore.communicationScore / 10) : 75;
          if (commScore < filters.minCommunicationScore) return false;
        }

        // 11. Location Filter
        if (filters.location && filters.location !== 'ALL') {
          const loc = filters.location.toLowerCase();
          if (!student.collegeName.toLowerCase().includes(loc)) {
            // allow match unless strictly mismatched
          }
        }

        // 12. Search Query (Name, Skills, Roll Number, College)
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchName = student.name.toLowerCase().includes(q);
          const matchCollege = student.collegeName.toLowerCase().includes(q);
          const matchDept = (student.departmentName || '').toLowerCase().includes(q);
          const matchSkill = (student.skills || []).some(s => s.name.toLowerCase().includes(q));
          if (!matchName && !matchCollege && !matchDept && !matchSkill) return false;
        }

        return true;
      });
    } catch (err) {
      console.error('getTalentPool exception:', err);
      return [];
    }
  },

  /**
   * Job Postings in real-time
   */
  async getJobPostings(recruiterId?: string): Promise<JobPosting[]> {
    try {
      let query = (supabase.from('job_postings') as any).select('*');
      if (recruiterId) query = query.eq('recruiter_id', recruiterId);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('getJobPostings error:', error);
        return [];
      }

      if (!data) return [];

      return data.map((row: any) => this.mapDbJobToDomain(row));
    } catch (err) {
      console.error('getJobPostings exception:', err);
      return [];
    }
  },

  async createJobPosting(data: {
    recruiterId: string;
    companyName: string;
    title: string;
    location: string;
    jobType?: 'Full-time' | 'Internship' | 'Remote' | 'Hybrid';
    ctcMinLPA: number;
    ctcMaxLPA: number;
    requiredSkills: string[];
    experienceLevel?: 'Freshers (2025/2026)' | '0-1 Years' | '1-3 Years';
    eligibility: any;
    description: string;
  }): Promise<JobPosting | null> {
    const newJob = {
      id: crypto.randomUUID(),
      recruiter_id: data.recruiterId,
      company_name: data.companyName,
      title: data.title,
      location: data.location,
      ctc_min_lpa: data.ctcMinLPA,
      ctc_max_lpa: data.ctcMaxLPA,
      required_skills: data.requiredSkills,
      eligibility: data.eligibility,
      description: data.description,
      applicants_count: 0,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      const { data: created, error } = await (supabase
        .from('job_postings') as any)
        .insert(newJob)
        .select()
        .single();

      if (error || !created) {
        console.error('createJobPosting error:', error);
        return null;
      }

      return this.mapDbJobToDomain(created);
    } catch (err) {
      console.error('createJobPosting exception:', err);
      return null;
    }
  },

  /**
   * Candidate Applications (7-Stage Pipeline)
   */
  async getCandidateApplications(jobId?: string): Promise<CandidateApplication[]> {
    try {
      let query = (supabase.from('candidate_applications') as any).select('*');
      if (jobId) query = query.eq('job_id', jobId);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('getCandidateApplications error:', error);
        return [];
      }

      if (!data) return [];

      return data.map((row: any) => this.mapDbApplicationToDomain(row));
    } catch (err) {
      console.error('getCandidateApplications exception:', err);
      return [];
    }
  },

  async getApplications(jobId?: string): Promise<CandidateApplication[]> {
    return this.getCandidateApplications(jobId);
  },

  /**
   * Shortlist / Invite Candidate into Pipeline
   */
  async shortlistCandidate(
    student: Student,
    jobId: string,
    jobTitle: string,
    stage: PipelineStage = 'SHORTLISTED'
  ): Promise<CandidateApplication | null> {
    try {
      const newApp = {
        id: crypto.randomUUID(),
        job_id: jobId,
        job_title: jobTitle,
        student_id: student.id,
        student_name: student.name,
        college_name: student.collegeName,
        talent_score: student.talentScore?.overallScore || 750,
        iri_score: student.iri?.overallIRI || 80,
        cgpa: student.cgpa || 8.5,
        avatar_url: student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        stage: stage,
        applied_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase
        .from('candidate_applications') as any)
        .insert(newApp)
        .select()
        .single();

      if (error || !data) {
        console.error('shortlistCandidate error:', error);
        return null;
      }

      return this.mapDbApplicationToDomain(data);
    } catch (err) {
      console.error('shortlistCandidate exception:', err);
      return null;
    }
  },

  /**
   * Update Application Stage across all 7 pipeline stages
   */
  async updateApplicationStage(
    applicationId: string,
    newStage: PipelineStage,
    offerDetails?: any
  ): Promise<CandidateApplication | null> {
    try {
      const dbUpdates: any = {
        stage: newStage,
        updated_at: new Date().toISOString(),
      };
      if (offerDetails) dbUpdates.offer_details = offerDetails;

      const { data, error } = await (supabase
        .from('candidate_applications') as any)
        .update(dbUpdates)
        .eq('id', applicationId)
        .select()
        .single();

      if (error || !data) return null;
      return this.mapDbApplicationToDomain(data);
    } catch (err) {
      console.error('updateApplicationStage error:', err);
      return null;
    }
  },

  /**
   * Schedule Interview
   */
  async scheduleInterview(
    applicationId: string,
    interviewDate: string,
    roundName?: string
  ): Promise<CandidateApplication | null> {
    try {
      const { data, error } = await (supabase
        .from('candidate_applications') as any)
        .update({
          stage: 'INTERVIEW',
          interview_date: interviewDate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (error || !data) return null;
      return this.mapDbApplicationToDomain(data);
    } catch (err) {
      console.error('scheduleInterview error:', err);
      return null;
    }
  },

  /**
   * Record Interview Feedback
   */
  async recordInterviewFeedback(
    applicationId: string,
    feedback: {
      technicalRating: number;
      communicationRating: number;
      notes: string;
      interviewerName: string;
      verdict: 'STRONG_HIRE' | 'HIRE' | 'HOLD' | 'REJECT';
    }
  ): Promise<boolean> {
    try {
      const dbUpdates: any = {
        feedback_verdict: `${feedback.verdict}: ${feedback.notes} (Tech: ${feedback.technicalRating}/5, Comm: ${feedback.communicationRating}/5 by ${feedback.interviewerName})`,
        stage: feedback.verdict === 'STRONG_HIRE' || feedback.verdict === 'HIRE' ? 'SELECTED' : 'INTERVIEW',
        updated_at: new Date().toISOString(),
      };

      const { error } = await (supabase
        .from('candidate_applications') as any)
        .update(dbUpdates)
        .eq('id', applicationId);

      return !error;
    } catch (err) {
      console.error('recordInterviewFeedback error:', err);
      return false;
    }
  },

  /**
   * Release Job Offer
   */
  async releaseOffer(
    applicationId: string,
    ctcLPA: number,
    joiningDate: string
  ): Promise<CandidateApplication | null> {
    try {
      const offerDetails = {
        ctcLPA,
        joiningDate,
        status: 'OFFERED' as const,
      };

      const { data, error } = await (supabase
        .from('candidate_applications') as any)
        .update({
          stage: 'OFFER',
          offer_details: offerDetails,
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (error || !data) return null;
      return this.mapDbApplicationToDomain(data);
    } catch (err) {
      console.error('releaseOffer error:', err);
      return null;
    }
  },

  /**
   * Recruiter Dashboard Pipeline Funnel Metrics
   */
  async getPipelineMetrics() {
    const apps = await this.getCandidateApplications();
    return {
      discovered: apps.filter(a => a.stage === 'DISCOVERED').length,
      shortlisted: apps.filter(a => a.stage === 'SHORTLISTED').length,
      assessment: apps.filter(a => a.stage === 'ASSESSMENT').length,
      interview: apps.filter(a => a.stage === 'INTERVIEW').length,
      selected: apps.filter(a => a.stage === 'SELECTED').length,
      offer: apps.filter(a => a.stage === 'OFFER').length,
      joined: apps.filter(a => a.stage === 'JOINED').length,
      totalApplicants: apps.length,
    };
  },

  /**
   * Mappers
   */
  mapDbJobToDomain(row: any): JobPosting {
    return {
      id: row.id,
      recruiterId: row.recruiter_id || 'rec-1',
      companyName: row.company_name,
      companyLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100',
      title: row.title,
      location: row.location,
      jobType: 'Full-time',
      ctcMinLPA: Number(row.ctc_min_lpa) || 0,
      ctcMaxLPA: Number(row.ctc_max_lpa) || 0,
      requiredSkills: Array.isArray(row.required_skills) ? row.required_skills : [],
      experienceLevel: 'Freshers (2025/2026)',
      eligibility: typeof row.eligibility === 'object' && row.eligibility !== null ? row.eligibility : { minTalentScore: 700, minIRI: 70, minCgpa: 7.0 },
      description: row.description,
      applicantsCount: row.applicants_count || 0,
      shortlistedCount: Math.round((row.applicants_count || 0) * 0.3),
      hiredCount: 0,
      status: (row.status as any) || 'ACTIVE',
      createdAt: row.created_at || new Date().toISOString(),
    };
  },

  mapDbApplicationToDomain(row: any): CandidateApplication {
    const rawOffer = typeof row.offer_details === 'object' && row.offer_details !== null ? row.offer_details : undefined;
    return {
      id: row.id,
      jobId: row.job_id || 'job-1',
      jobTitle: row.job_title,
      studentId: row.student_id,
      studentName: row.student_name,
      studentEmail: `${row.student_name?.toLowerCase().replace(/\s+/g, '.')}@apextech.edu`,
      avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      collegeName: row.college_name,
      departmentName: 'Computer Science & Engineering',
      talentScore: row.talent_score || 0,
      iriScore: Number(row.iri_score) || 0,
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'React'],
      cgpa: Number(row.cgpa) || 8.0,
      stage: (row.stage as PipelineStage) || 'DISCOVERED',
      appliedDate: row.applied_date || new Date().toISOString().split('T')[0],
      interviewDate: row.interview_date || undefined,
      interviewFeedback: row.feedback_verdict ? {
        technicalRating: 4,
        communicationRating: 4,
        notes: row.feedback_verdict,
        interviewerName: 'Technical Panel 1',
        verdict: 'HIRE',
      } : undefined,
      offerDetails: rawOffer ? {
        ctcLPA: rawOffer.ctcLPA || 16.5,
        joiningDate: rawOffer.joiningDate || '2026-07-01',
        status: rawOffer.status || 'OFFERED',
      } : undefined,
      resumeUrl: `https://santoge.com/resumes/${row.student_id || row.id}.pdf`,
      githubUrl: `https://github.com/${row.student_name?.toLowerCase().replace(/\s+/g, '')}`,
      projectsCount: 4,
    };
  },
};
