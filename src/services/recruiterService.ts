import { supabase } from '../lib/supabase';
import { JobPosting, CandidateApplication, PipelineStage, RecruiterFilterState } from '../types/recruiter';
import { Student } from '../types/student';
import { studentService } from './studentService';

export const recruiterService = {
  /**
   * Filter talent pool for recruiters (with minimum Talent Score & IRI constraints)
   */
  async getTalentPool(filters: RecruiterFilterState): Promise<Student[]> {
    const list = await studentService.getStudents();

    return list.filter(student => {
      // Min score cutoff
      if (student.talentScore.overallScore < filters.minTalentScore) return false;
      // Min IRI cutoff
      if (student.iri.overallIRI < filters.minIRI) return false;
      // Min CGPA cutoff
      if (student.cgpa < filters.minCgpa) return false;
      // College filter
      if (filters.colleges.length > 0 && !filters.colleges.includes(student.collegeName)) return false;
      // Skill filter
      if (filters.skills.length > 0) {
        const studentSkillNames = student.skills.map(s => s.name.toLowerCase());
        const hasMatch = filters.skills.some(sk =>
          studentSkillNames.some(ss => ss.includes(sk.toLowerCase()))
        );
        if (!hasMatch) return false;
      }
      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchName = student.name.toLowerCase().includes(q);
        const matchCollege = student.collegeName.toLowerCase().includes(q);
        const matchSkill = student.skills.some(s => s.name.toLowerCase().includes(q));
        if (!matchName && !matchCollege && !matchSkill) return false;
      }

      return true;
    });
  },

  /**
   * Job Postings CRUD
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
    ctcMinLPA: number;
    ctcMaxLPA: number;
    requiredSkills: string[];
    eligibility: any;
    description: string;
  }): Promise<JobPosting | null> {
    const newJob = {
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
   * Candidate Applications (Kanban Pipeline)
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

  async scheduleInterview(
    applicationId: string,
    interviewDate: string
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

  async recordInterviewFeedback(
    applicationId: string,
    verdict: string,
    scheduledDate?: string
  ): Promise<boolean> {
    try {
      const dbUpdates: any = {
        feedback_verdict: verdict,
        updated_at: new Date().toISOString(),
      };
      if (scheduledDate) dbUpdates.interview_date = scheduledDate;

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
   * Recruiter Dashboard Metrics
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
      skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker'],
      cgpa: Number(row.cgpa) || 8.0,
      stage: row.stage || 'DISCOVERED',
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
    };
  },
};
