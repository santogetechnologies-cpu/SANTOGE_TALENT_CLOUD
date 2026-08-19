-- =====================================================================
-- SANTOGE TALENT CLOUD — SUPABASE PRODUCTION DATABASE SCHEMA
-- Migration: 0001_initial_schema.sql
-- =====================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role TEXT NOT NULL DEFAULT 'STUDENT' CHECK (role IN (
        'SUPER_ADMIN', 'OPERATIONS_MANAGER', 'FINANCE_ADMIN', 'CONTENT_MANAGER',
        'COLLEGE_SUPER_ADMIN', 'COLLEGE_PLACEMENT_OFFICER', 'DEPARTMENT_COORDINATOR',
        'MENTOR', 'BATCH_COORDINATOR', 'STUDENT', 'RECRUITER'
    )),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    first_login BOOLEAN NOT NULL DEFAULT FALSE,
    college_id UUID,
    department_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Permissions and Role Permissions
CREATE TABLE IF NOT EXISTS public.permissions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role TEXT NOT NULL,
    permission_id TEXT NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role, permission_id)
);

-- 3. Colleges table
CREATE TABLE IF NOT EXISTS public.colleges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    logo_url TEXT,
    total_students INT NOT NULL DEFAULT 0,
    placed_count INT NOT NULL DEFAULT 0,
    placement_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
    average_package_lpa NUMERIC(5,2) NOT NULL DEFAULT 0,
    highest_package_lpa NUMERIC(5,2) NOT NULL DEFAULT 0,
    companies_visited_count INT NOT NULL DEFAULT 0,
    offers_generated_count INT NOT NULL DEFAULT 0,
    admin_name TEXT NOT NULL,
    admin_email TEXT NOT NULL,
    placement_officer_name TEXT NOT NULL,
    placement_officer_email TEXT NOT NULL,
    subscription_status TEXT NOT NULL DEFAULT 'ENTERPRISE_ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Departments table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    coordinator_name TEXT NOT NULL,
    coordinator_email TEXT NOT NULL,
    total_students INT NOT NULL DEFAULT 0,
    placed_count INT NOT NULL DEFAULT 0,
    placement_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    average_talent_score INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(college_id, code)
);

-- 5. Batches table
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    track_name TEXT NOT NULL,
    total_students INT NOT NULL DEFAULT 0,
    active_today INT NOT NULL DEFAULT 0,
    attendance_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    average_talent_score INT NOT NULL DEFAULT 0,
    mentor_id UUID REFERENCES public.profiles(id),
    mentor_name TEXT NOT NULL,
    coordinator_id UUID REFERENCES public.profiles(id),
    coordinator_name TEXT NOT NULL,
    telegram_group_url TEXT NOT NULL DEFAULT '',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(college_id, code)
);

-- 6. Students table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    roll_number TEXT NOT NULL,
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    college_name TEXT NOT NULL,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    department_name TEXT NOT NULL,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    batch_name TEXT NOT NULL,
    avatar_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    cgpa NUMERIC(4,2) NOT NULL DEFAULT 0,
    graduation_year INT NOT NULL DEFAULT 2026,
    talent_score INT NOT NULL DEFAULT 0,
    talent_score_details JSONB NOT NULL DEFAULT '{}',
    iri_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    iri_score_details JSONB NOT NULL DEFAULT '{}',
    placement_readiness INT NOT NULL DEFAULT 0,
    skills JSONB NOT NULL DEFAULT '[]',
    enrolled_tracks JSONB NOT NULL DEFAULT '[]',
    active_specialization TEXT,
    daily_mission JSONB NOT NULL DEFAULT '{}',
    streak_days INT NOT NULL DEFAULT 0,
    total_xp INT NOT NULL DEFAULT 0,
    attendance_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
    risk_status TEXT NOT NULL DEFAULT 'ON_TRACK' CHECK (risk_status IN ('ON_TRACK', 'PARTIAL', 'STRUGGLING', 'INACTIVE')),
    risk_reasons JSONB NOT NULL DEFAULT '[]',
    smart_promotion_stage TEXT NOT NULL DEFAULT 'FOUNDATION',
    github_username TEXT,
    github_stats JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(college_id, roll_number)
);

-- 7. Career Tracks & Modules
CREATE TABLE IF NOT EXISTS public.career_tracks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    total_modules INT NOT NULL DEFAULT 12,
    skills_covered JSONB NOT NULL DEFAULT '[]',
    specializations JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.learning_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id TEXT NOT NULL REFERENCES public.career_tracks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 1,
    estimated_hours NUMERIC(4,1) NOT NULL DEFAULT 4,
    skills_taught JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Daily Missions & Tasks
CREATE TABLE IF NOT EXISTS public.daily_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    day_number INT NOT NULL DEFAULT 1,
    track_id TEXT REFERENCES public.career_tracks(id),
    track_name TEXT NOT NULL,
    theme TEXT NOT NULL,
    tasks JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(date, track_id)
);

CREATE TABLE IF NOT EXISTS public.student_mission_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES public.daily_missions(id) ON DELETE CASCADE,
    task_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    xp_earned INT NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, mission_id, task_id)
);

-- 9. Projects & Submissions
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'INDUSTRY_PROJECT',
    track_id TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'Intermediate',
    description TEXT NOT NULL,
    skills_gained JSONB NOT NULL DEFAULT '[]',
    github_repo TEXT,
    status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'EVALUATED', 'REJECTED')),
    score INT,
    reviewer_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Hack Missions
CREATE TABLE IF NOT EXISTS public.hack_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    sponsor_company TEXT NOT NULL,
    industry_problem TEXT NOT NULL,
    deadline_hours_remaining INT NOT NULL DEFAULT 48,
    prize_xp INT NOT NULL DEFAULT 500,
    status TEXT NOT NULL DEFAULT 'LIVE',
    participants_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Placement Schedules & Submissions
CREATE TABLE IF NOT EXISTS public.placement_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    day_number INT NOT NULL,
    date DATE NOT NULL,
    theme TEXT NOT NULL,
    english_topic TEXT NOT NULL,
    aptitude_topic TEXT NOT NULL,
    reasoning_topic TEXT NOT NULL,
    hr_question_prompt TEXT NOT NULL,
    speaking_prompt TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.placement_task_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    schedule_id UUID NOT NULL REFERENCES public.placement_schedules(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    response_data JSONB NOT NULL DEFAULT '{}',
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Score History & XP Transactions
CREATE TABLE IF NOT EXISTS public.talent_score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    overall_score INT NOT NULL,
    breakdown JSONB NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.iri_score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    overall_iri NUMERIC(5,2) NOT NULL,
    breakdown JSONB NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    reason TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Attendance tracking
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL DEFAULT 'DAILY_SYNC',
    present BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, date, type)
);

-- 14. Campus Drives table
CREATE TABLE IF NOT EXISTS public.campus_drives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    ctc_lpa NUMERIC(6,2) NOT NULL,
    location TEXT NOT NULL DEFAULT 'Bengaluru / Hybrid',
    drive_date DATE NOT NULL,
    registration_deadline DATE NOT NULL,
    eligibility JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'REGISTRATION_OPEN' CHECK (status IN ('DRAFT', 'REGISTRATION_OPEN', 'SHORTLISTING', 'INTERVIEWING', 'COMPLETED', 'CANCELLED')),
    stats JSONB NOT NULL DEFAULT '{}',
    rounds JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Company CRM table
CREATE TABLE IF NOT EXISTS public.company_crm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    tier TEXT NOT NULL DEFAULT 'Tier 1 Product',
    contact_person TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    relationship_status TEXT NOT NULL DEFAULT 'ACTIVE_PARTNER',
    average_ctc_lpa NUMERIC(6,2) NOT NULL DEFAULT 0,
    average_offers INT NOT NULL DEFAULT 0,
    notes JSONB NOT NULL DEFAULT '[]',
    interaction_logs JSONB NOT NULL DEFAULT '[]',
    follow_up_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. Job Postings table
CREATE TABLE IF NOT EXISTS public.job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID REFERENCES public.profiles(id),
    company_name TEXT NOT NULL,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    ctc_min_lpa NUMERIC(6,2) NOT NULL,
    ctc_max_lpa NUMERIC(6,2) NOT NULL,
    required_skills JSONB NOT NULL DEFAULT '[]',
    eligibility JSONB NOT NULL DEFAULT '{}',
    description TEXT NOT NULL,
    applicants_count INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Candidate Applications table
CREATE TABLE IF NOT EXISTS public.candidate_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    college_name TEXT NOT NULL,
    avatar_url TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    talent_score INT NOT NULL DEFAULT 0,
    iri_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    cgpa NUMERIC(4,2) NOT NULL DEFAULT 0,
    stage TEXT NOT NULL DEFAULT 'DISCOVERED' CHECK (stage IN ('DISCOVERED', 'SHORTLISTED', 'ASSESSMENT', 'INTERVIEW', 'SELECTED', 'OFFER', 'JOINED')),
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
    interview_date TIMESTAMPTZ,
    feedback_verdict TEXT,
    offer_details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(job_id, student_id)
);

-- 18. Mentor Interventions table
CREATE TABLE IF NOT EXISTS public.mentor_interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID REFERENCES public.profiles(id),
    mentor_name TEXT NOT NULL,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    notes TEXT NOT NULL,
    assigned_practice_topic TEXT,
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. Batch Announcements table
CREATE TABLE IF NOT EXISTS public.batch_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    published_to_telegram BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. Payments & Invoices table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    college_name TEXT NOT NULL,
    amount_inr NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (status IN ('PENDING_VERIFICATION', 'VERIFIED_ACTIVE', 'FAILED', 'REFUNDED')),
    transaction_ref TEXT NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    college_name TEXT NOT NULL,
    plan_name TEXT NOT NULL,
    total_licenses INT NOT NULL DEFAULT 500,
    used_licenses INT NOT NULL DEFAULT 0,
    amount_inr NUMERIC(12,2) NOT NULL,
    billing_cycle TEXT NOT NULL DEFAULT 'Annual',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    renewal_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. Content Items table
CREATE TABLE IF NOT EXISTS public.content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    track_name TEXT NOT NULL,
    module_name TEXT NOT NULL DEFAULT 'Core Curriculum',
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED')),
    author_name TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id),
    reviewer_name TEXT,
    review_notes TEXT,
    content_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 23. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 24. Audit Logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 25. System Settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_college ON public.profiles(college_id);
CREATE INDEX IF NOT EXISTS idx_students_college ON public.students(college_id);
CREATE INDEX IF NOT EXISTS idx_students_dept ON public.students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_batch ON public.students(batch_id);
CREATE INDEX IF NOT EXISTS idx_students_talent ON public.students(talent_score);
CREATE INDEX IF NOT EXISTS idx_students_risk ON public.students(risk_status);
CREATE INDEX IF NOT EXISTS idx_drives_college ON public.campus_drives(college_id);
CREATE INDEX IF NOT EXISTS idx_apps_job ON public.candidate_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_apps_student ON public.candidate_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_apps_stage ON public.candidate_applications(stage);
CREATE INDEX IF NOT EXISTS idx_notifs_user ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_logs(actor_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_xp_student ON public.xp_transactions(student_id);
