export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole =
  | 'SUPER_ADMIN'
  | 'OPERATIONS_MANAGER'
  | 'FINANCE_ADMIN'
  | 'CONTENT_MANAGER'
  | 'COLLEGE_SUPER_ADMIN'
  | 'COLLEGE_PLACEMENT_OFFICER'
  | 'DEPARTMENT_COORDINATOR'
  | 'MENTOR'
  | 'BATCH_COORDINATOR'
  | 'STUDENT'
  | 'RECRUITER';

export type RiskStatus = 'ON_TRACK' | 'PARTIAL' | 'STRUGGLING' | 'INACTIVE';
export type PipelineStage = 'DISCOVERED' | 'SHORTLISTED' | 'ASSESSMENT' | 'INTERVIEW' | 'SELECTED' | 'OFFER' | 'JOINED';
export type DriveStatus = 'DRAFT' | 'REGISTRATION_OPEN' | 'SHORTLISTING' | 'INTERVIEWING' | 'COMPLETED' | 'CANCELLED';
export type ContentWorkflowState = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
export type PaymentStatus = 'PENDING_VERIFICATION' | 'VERIFIED_ACTIVE' | 'FAILED' | 'REFUNDED';
export type ProjectStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'EVALUATED' | 'REJECTED';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          role: UserRole;
          is_active: boolean;
          first_login: boolean;
          college_id: string | null;
          department_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          is_active?: boolean;
          first_login?: boolean;
          college_id?: string | null;
          department_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          is_active?: boolean;
          first_login?: boolean;
          college_id?: string | null;
          department_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      permissions: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          category: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          created_at?: string;
        };
      };
      role_permissions: {
        Row: {
          role: string;
          permission_id: string;
        };
        Insert: {
          role: string;
          permission_id: string;
        };
        Update: {
          role?: string;
          permission_id?: string;
        };
      };
      colleges: {
        Row: {
          id: string;
          name: string;
          code: string;
          city: string;
          state: string;
          logo_url: string | null;
          total_students: number;
          placed_count: number;
          placement_percentage: number;
          average_package_lpa: number;
          highest_package_lpa: number;
          companies_visited_count: number;
          offers_generated_count: number;
          admin_name: string;
          admin_email: string;
          placement_officer_name: string;
          placement_officer_email: string;
          subscription_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          city: string;
          state: string;
          logo_url?: string | null;
          total_students?: number;
          placed_count?: number;
          placement_percentage?: number;
          average_package_lpa?: number;
          highest_package_lpa?: number;
          companies_visited_count?: number;
          offers_generated_count?: number;
          admin_name: string;
          admin_email: string;
          placement_officer_name: string;
          placement_officer_email: string;
          subscription_status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          city?: string;
          state?: string;
          logo_url?: string | null;
          total_students?: number;
          placed_count?: number;
          placement_percentage?: number;
          average_package_lpa?: number;
          highest_package_lpa?: number;
          companies_visited_count?: number;
          offers_generated_count?: number;
          admin_name?: string;
          admin_email?: string;
          placement_officer_name?: string;
          placement_officer_email?: string;
          subscription_status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      departments: {
        Row: {
          id: string;
          college_id: string;
          name: string;
          code: string;
          coordinator_name: string;
          coordinator_email: string;
          total_students: number;
          placed_count: number;
          placement_rate: number;
          average_talent_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          college_id: string;
          name: string;
          code: string;
          coordinator_name: string;
          coordinator_email: string;
          total_students?: number;
          placed_count?: number;
          placement_rate?: number;
          average_talent_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          college_id?: string;
          name?: string;
          code?: string;
          coordinator_name?: string;
          coordinator_email?: string;
          total_students?: number;
          placed_count?: number;
          placement_rate?: number;
          average_talent_score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      batches: {
        Row: {
          id: string;
          college_id: string;
          name: string;
          code: string;
          track_name: string;
          total_students: number;
          active_today: number;
          attendance_percent: number;
          average_talent_score: number;
          mentor_id: string | null;
          mentor_name: string;
          coordinator_id: string | null;
          coordinator_name: string;
          telegram_group_url: string;
          start_date: string;
          end_date: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          college_id: string;
          name: string;
          code: string;
          track_name: string;
          total_students?: number;
          active_today?: number;
          attendance_percent?: number;
          average_talent_score?: number;
          mentor_id?: string | null;
          mentor_name: string;
          coordinator_id?: string | null;
          coordinator_name: string;
          telegram_group_url?: string;
          start_date: string;
          end_date: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          college_id?: string;
          name?: string;
          code?: string;
          track_name?: string;
          total_students?: number;
          active_today?: number;
          attendance_percent?: number;
          average_talent_score?: number;
          mentor_id?: string | null;
          mentor_name?: string;
          coordinator_id?: string | null;
          coordinator_name?: string;
          telegram_group_url?: string;
          start_date?: string;
          end_date?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      students: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          email: string;
          phone: string;
          roll_number: string;
          college_id: string;
          college_name: string;
          department_id: string;
          department_name: string;
          batch_id: string;
          batch_name: string;
          avatar_url: string;
          cgpa: number;
          graduation_year: number;
          talent_score: number;
          talent_score_details: Json;
          iri_score: number;
          iri_score_details: Json;
          placement_readiness: number;
          skills: Json;
          enrolled_tracks: Json;
          active_specialization: string | null;
          daily_mission: Json;
          streak_days: number;
          total_xp: number;
          attendance_percent: number;
          risk_status: RiskStatus;
          risk_reasons: Json;
          smart_promotion_stage: string;
          github_username: string | null;
          github_stats: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          email: string;
          phone: string;
          roll_number: string;
          college_id: string;
          college_name: string;
          department_id: string;
          department_name: string;
          batch_id: string;
          batch_name: string;
          avatar_url?: string;
          cgpa?: number;
          graduation_year?: number;
          talent_score?: number;
          talent_score_details?: Json;
          iri_score?: number;
          iri_score_details?: Json;
          placement_readiness?: number;
          skills?: Json;
          enrolled_tracks?: Json;
          active_specialization?: string | null;
          daily_mission?: Json;
          streak_days?: number;
          total_xp?: number;
          attendance_percent?: number;
          risk_status?: RiskStatus;
          risk_reasons?: Json;
          smart_promotion_stage?: string;
          github_username?: string | null;
          github_stats?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          name?: string;
          email?: string;
          phone?: string;
          roll_number?: string;
          college_id?: string;
          college_name?: string;
          department_id?: string;
          department_name?: string;
          batch_id?: string;
          batch_name?: string;
          avatar_url?: string;
          cgpa?: number;
          graduation_year?: number;
          talent_score?: number;
          talent_score_details?: Json;
          iri_score?: number;
          iri_score_details?: Json;
          placement_readiness?: number;
          skills?: Json;
          enrolled_tracks?: Json;
          active_specialization?: string | null;
          daily_mission?: Json;
          streak_days?: number;
          total_xp?: number;
          attendance_percent?: number;
          risk_status?: RiskStatus;
          risk_reasons?: Json;
          smart_promotion_stage?: string;
          github_username?: string | null;
          github_stats?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      career_tracks: {
        Row: {
          id: string;
          title: string;
          category: string;
          description: string;
          icon: string;
          total_modules: number;
          skills_covered: Json;
          specializations: Json;
          created_at: string;
        };
        Insert: {
          id: string;
          title: string;
          category: string;
          description: string;
          icon: string;
          total_modules?: number;
          skills_covered?: Json;
          specializations?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          category?: string;
          description?: string;
          icon?: string;
          total_modules?: number;
          skills_covered?: Json;
          specializations?: Json;
          created_at?: string;
        };
      };
      learning_modules: {
        Row: {
          id: string;
          track_id: string;
          title: string;
          description: string | null;
          order_index: number;
          estimated_hours: number;
          skills_taught: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          track_id: string;
          title: string;
          description?: string | null;
          order_index?: number;
          estimated_hours?: number;
          skills_taught?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          track_id?: string;
          title?: string;
          description?: string | null;
          order_index?: number;
          estimated_hours?: number;
          skills_taught?: Json;
          created_at?: string;
        };
      };
      daily_missions: {
        Row: {
          id: string;
          date: string;
          day_number: number;
          track_id: string | null;
          track_name: string;
          theme: string;
          tasks: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          date?: string;
          day_number?: number;
          track_id?: string | null;
          track_name: string;
          theme: string;
          tasks?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          day_number?: number;
          track_id?: string | null;
          track_name?: string;
          theme?: string;
          tasks?: Json;
          created_at?: string;
        };
      };
      student_mission_progress: {
        Row: {
          id: string;
          student_id: string;
          mission_id: string | null;
          task_id: string;
          status: string;
          xp_earned: number;
          completed_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          mission_id?: string | null;
          task_id: string;
          status?: string;
          xp_earned?: number;
          completed_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          mission_id?: string | null;
          task_id?: string;
          status?: string;
          xp_earned?: number;
          completed_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          student_id: string | null;
          title: string;
          type: string;
          track_id: string;
          difficulty: string;
          description: string;
          skills_gained: Json;
          github_repo: string | null;
          status: ProjectStatus;
          score: number | null;
          reviewer_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id?: string | null;
          title: string;
          type?: string;
          track_id: string;
          difficulty?: string;
          description: string;
          skills_gained?: Json;
          github_repo?: string | null;
          status?: ProjectStatus;
          score?: number | null;
          reviewer_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string | null;
          title?: string;
          type?: string;
          track_id?: string;
          difficulty?: string;
          description?: string;
          skills_gained?: Json;
          github_repo?: string | null;
          status?: ProjectStatus;
          score?: number | null;
          reviewer_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      hack_missions: {
        Row: {
          id: string;
          title: string;
          sponsor_company: string;
          industry_problem: string;
          deadline_hours_remaining: number;
          prize_xp: number;
          status: string;
          participants_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          sponsor_company: string;
          industry_problem: string;
          deadline_hours_remaining?: number;
          prize_xp?: number;
          status?: string;
          participants_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          sponsor_company?: string;
          industry_problem?: string;
          deadline_hours_remaining?: number;
          prize_xp?: number;
          status?: string;
          participants_count?: number;
          created_at?: string;
        };
      };
      placement_schedules: {
        Row: {
          id: string;
          batch_id: string | null;
          day_number: number;
          date: string;
          theme: string;
          english_topic: string;
          aptitude_topic: string;
          reasoning_topic: string;
          hr_question_prompt: string;
          speaking_prompt: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_id?: string | null;
          day_number: number;
          date: string;
          theme: string;
          english_topic: string;
          aptitude_topic: string;
          reasoning_topic: string;
          hr_question_prompt: string;
          speaking_prompt: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          batch_id?: string | null;
          day_number?: number;
          date?: string;
          theme?: string;
          english_topic?: string;
          aptitude_topic?: string;
          reasoning_topic?: string;
          hr_question_prompt?: string;
          speaking_prompt?: string;
          created_at?: string;
        };
      };
      placement_task_submissions: {
        Row: {
          id: string;
          student_id: string;
          schedule_id: string;
          task_type: string;
          score: number;
          response_data: Json;
          completed_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          schedule_id: string;
          task_type: string;
          score?: number;
          response_data?: Json;
          completed_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          schedule_id?: string;
          task_type?: string;
          score?: number;
          response_data?: Json;
          completed_at?: string;
        };
      };
      talent_score_history: {
        Row: {
          id: string;
          student_id: string;
          overall_score: number;
          breakdown: Json;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          overall_score: number;
          breakdown: Json;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          overall_score?: number;
          breakdown?: Json;
          recorded_at?: string;
        };
      };
      iri_score_history: {
        Row: {
          id: string;
          student_id: string;
          overall_iri: number;
          breakdown: Json;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          overall_iri: number;
          breakdown: Json;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          overall_iri?: number;
          breakdown?: Json;
          recorded_at?: string;
        };
      };
      xp_transactions: {
        Row: {
          id: string;
          student_id: string;
          amount: number;
          reason: string;
          entity_type: string | null;
          entity_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          amount: number;
          reason: string;
          entity_type?: string | null;
          entity_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          amount?: number;
          reason?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          created_at?: string;
        };
      };
      attendance: {
        Row: {
          id: string;
          student_id: string;
          batch_id: string;
          date: string;
          type: string;
          present: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          batch_id: string;
          date?: string;
          type?: string;
          present?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          batch_id?: string;
          date?: string;
          type?: string;
          present?: boolean;
          created_at?: string;
        };
      };
      campus_drives: {
        Row: {
          id: string;
          college_id: string;
          company_name: string;
          role_title: string;
          ctc_lpa: number;
          location: string;
          drive_date: string;
          registration_deadline: string;
          eligibility: Json;
          status: DriveStatus;
          stats: Json;
          rounds: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          college_id: string;
          company_name: string;
          role_title: string;
          ctc_lpa: number;
          location?: string;
          drive_date: string;
          registration_deadline?: string;
          eligibility?: Json;
          status?: DriveStatus;
          stats?: Json;
          rounds?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          college_id?: string;
          company_name?: string;
          role_title?: string;
          ctc_lpa?: number;
          location?: string;
          drive_date?: string;
          registration_deadline?: string;
          eligibility?: Json;
          status?: DriveStatus;
          stats?: Json;
          rounds?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      company_crm: {
        Row: {
          id: string;
          college_id: string;
          name: string;
          industry: string;
          tier: string;
          contact_person: string;
          contact_email: string;
          contact_phone: string;
          relationship_status: string;
          average_ctc_lpa: number;
          average_offers: number;
          notes: Json;
          interaction_logs: Json;
          follow_up_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          college_id: string;
          name: string;
          industry: string;
          tier?: string;
          contact_person: string;
          contact_email: string;
          contact_phone: string;
          relationship_status?: string;
          average_ctc_lpa?: number;
          average_offers?: number;
          notes?: Json;
          interaction_logs?: Json;
          follow_up_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          college_id?: string;
          name?: string;
          industry?: string;
          tier?: string;
          contact_person?: string;
          contact_email?: string;
          contact_phone?: string;
          relationship_status?: string;
          average_ctc_lpa?: number;
          average_offers?: number;
          notes?: Json;
          interaction_logs?: Json;
          follow_up_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_postings: {
        Row: {
          id: string;
          recruiter_id: string | null;
          company_name: string;
          title: string;
          location: string;
          ctc_min_lpa: number;
          ctc_max_lpa: number;
          required_skills: Json;
          eligibility: Json;
          description: string;
          applicants_count: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          recruiter_id?: string | null;
          company_name: string;
          title: string;
          location: string;
          ctc_min_lpa: number;
          ctc_max_lpa: number;
          required_skills?: Json;
          eligibility?: Json;
          description: string;
          applicants_count?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          recruiter_id?: string | null;
          company_name?: string;
          title?: string;
          location?: string;
          ctc_min_lpa?: number;
          ctc_max_lpa?: number;
          required_skills?: Json;
          eligibility?: Json;
          description?: string;
          applicants_count?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      candidate_applications: {
        Row: {
          id: string;
          job_id: string | null;
          job_title: string;
          company_name: string;
          student_id: string;
          student_name: string;
          college_name: string;
          avatar_url: string;
          talent_score: number;
          iri_score: number;
          cgpa: number;
          stage: PipelineStage;
          applied_date: string;
          interview_date: string | null;
          feedback_verdict: string | null;
          offer_details: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id?: string | null;
          job_title: string;
          company_name: string;
          student_id: string;
          student_name: string;
          college_name: string;
          avatar_url?: string;
          talent_score?: number;
          iri_score?: number;
          cgpa?: number;
          stage?: PipelineStage;
          applied_date?: string;
          interview_date?: string | null;
          feedback_verdict?: string | null;
          offer_details?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string | null;
          job_title?: string;
          company_name?: string;
          student_id?: string;
          student_name?: string;
          college_name?: string;
          avatar_url?: string;
          talent_score?: number;
          iri_score?: number;
          cgpa?: number;
          stage?: PipelineStage;
          applied_date?: string;
          interview_date?: string | null;
          feedback_verdict?: string | null;
          offer_details?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      mentor_interventions: {
        Row: {
          id: string;
          mentor_id: string | null;
          mentor_name: string;
          student_id: string;
          student_name: string;
          batch_id: string;
          type: string;
          notes: string;
          assigned_practice_topic: string | null;
          resolved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          mentor_id?: string | null;
          mentor_name: string;
          student_id: string;
          student_name: string;
          batch_id: string;
          type: string;
          notes: string;
          assigned_practice_topic?: string | null;
          resolved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          mentor_id?: string | null;
          mentor_name?: string;
          student_id?: string;
          student_name?: string;
          batch_id?: string;
          type?: string;
          notes?: string;
          assigned_practice_topic?: string | null;
          resolved?: boolean;
          created_at?: string;
        };
      };
      batch_announcements: {
        Row: {
          id: string;
          batch_id: string;
          author_name: string;
          author_role: string;
          title: string;
          content: string;
          is_pinned: boolean;
          published_to_telegram: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_id: string;
          author_name: string;
          author_role: string;
          title: string;
          content: string;
          is_pinned?: boolean;
          published_to_telegram?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          batch_id?: string;
          author_name?: string;
          author_role?: string;
          title?: string;
          content?: string;
          is_pinned?: boolean;
          published_to_telegram?: boolean;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          student_id: string | null;
          student_name: string;
          student_email: string;
          college_name: string;
          amount_inr: number;
          status: PaymentStatus;
          transaction_ref: string;
          invoice_number: string;
          verified_by: string | null;
          verified_at: string | null;
          rejection_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id?: string | null;
          student_name: string;
          student_email: string;
          college_name: string;
          amount_inr: number;
          status?: PaymentStatus;
          transaction_ref: string;
          invoice_number: string;
          verified_by?: string | null;
          verified_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string | null;
          student_name?: string;
          student_email?: string;
          college_name?: string;
          amount_inr?: number;
          status?: PaymentStatus;
          transaction_ref?: string;
          invoice_number?: string;
          verified_by?: string | null;
          verified_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          college_id: string;
          college_name: string;
          plan_name: string;
          total_licenses: number;
          used_licenses: number;
          amount_inr: number;
          billing_cycle: string;
          status: string;
          renewal_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          college_id: string;
          college_name: string;
          plan_name: string;
          total_licenses?: number;
          used_licenses?: number;
          amount_inr: number;
          billing_cycle?: string;
          status?: string;
          renewal_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          college_id?: string;
          college_name?: string;
          plan_name?: string;
          total_licenses?: number;
          used_licenses?: number;
          amount_inr?: number;
          billing_cycle?: string;
          status?: string;
          renewal_date?: string;
          created_at?: string;
        };
      };
      content_items: {
        Row: {
          id: string;
          title: string;
          type: string;
          track_name: string;
          module_name: string;
          status: ContentWorkflowState;
          author_name: string;
          author_id: string | null;
          reviewer_name: string | null;
          review_notes: string | null;
          content_data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          type: string;
          track_name: string;
          module_name?: string;
          status?: ContentWorkflowState;
          author_name: string;
          author_id?: string | null;
          reviewer_name?: string | null;
          review_notes?: string | null;
          content_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          type?: string;
          track_name?: string;
          module_name?: string;
          status?: ContentWorkflowState;
          author_name?: string;
          author_id?: string | null;
          reviewer_name?: string | null;
          review_notes?: string | null;
          content_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          read: boolean;
          link: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type?: string;
          title: string;
          message: string;
          read?: boolean;
          link?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          read?: boolean;
          link?: string | null;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
      };
      system_settings: {
        Row: {
          key: string;
          value: Json;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_by?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      complete_mission_task: {
        Args: {
          p_task_id: string;
          p_student_id: string;
          p_mission_id: string;
          p_xp: number;
        };
        Returns: Json;
      };
      verify_payment_and_activate: {
        Args: {
          p_payment_id: string;
          p_verifier_name: string;
        };
        Returns: Json;
      };
      current_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
      current_user_college_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      current_user_department_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      is_super_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      risk_status: RiskStatus;
      pipeline_stage: PipelineStage;
      drive_status: DriveStatus;
      content_workflow_state: ContentWorkflowState;
      payment_status: PaymentStatus;
      project_status: ProjectStatus;
    };
  };
}
