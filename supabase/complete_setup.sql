-- ==============================================================================
-- SANTOGE TALENT CLOUD — COMPLETE PRODUCTION SUPABASE DATABASE SETUP
-- RUN THIS ENTIRE SCRIPT IN THE SUPABASE SQL EDITOR (https://supabase.com/dashboard/project/fnvmheurnufcifdjsarx/sql)
-- ==============================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. CREATE SCHEMA TABLES
-- ==============================================================================

-- Colleges
CREATE TABLE IF NOT EXISTS public.colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    logo_url TEXT,
    total_students INTEGER DEFAULT 0,
    placed_count INTEGER DEFAULT 0,
    placement_percentage NUMERIC(5,2) DEFAULT 0.00,
    average_package_lpa NUMERIC(5,2) DEFAULT 0.00,
    highest_package_lpa NUMERIC(5,2) DEFAULT 0.00,
    companies_visited_count INTEGER DEFAULT 0,
    offers_generated_count INTEGER DEFAULT 0,
    admin_name VARCHAR(255) NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    placement_officer_name VARCHAR(255) NOT NULL,
    placement_officer_email VARCHAR(255) NOT NULL,
    subscription_status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departments
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    coordinator_id UUID,
    coordinator_name VARCHAR(255) NOT NULL,
    coordinator_email VARCHAR(255) NOT NULL,
    total_students INTEGER DEFAULT 0,
    placed_count INTEGER DEFAULT 0,
    placement_rate NUMERIC(5,2) DEFAULT 0.00,
    average_talent_score INTEGER DEFAULT 0,
    average_package_lpa NUMERIC(5,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'STUDENT',
    avatar_url TEXT,
    phone VARCHAR(50),
    college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    student_id UUID,
    recruiter_id UUID,
    data_scope JSONB DEFAULT '{"scopeType": "SELF"}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Batches
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    track_name VARCHAR(255) NOT NULL,
    total_students INTEGER DEFAULT 0,
    active_today INTEGER DEFAULT 0,
    attendance_percent NUMERIC(5,2) DEFAULT 0.00,
    average_talent_score INTEGER DEFAULT 0,
    mentor_id UUID,
    mentor_name VARCHAR(255) NOT NULL,
    coordinator_id UUID,
    coordinator_name VARCHAR(255) NOT NULL,
    telegram_group_url TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    roll_number VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    college_name VARCHAR(255) NOT NULL,
    department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
    department_name VARCHAR(255) NOT NULL,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    batch_name VARCHAR(255),
    graduation_year INTEGER NOT NULL DEFAULT 2026,
    cgpa NUMERIC(4,2) NOT NULL DEFAULT 8.00,
    talent_score INTEGER DEFAULT 650,
    talent_score_details JSONB DEFAULT '{}'::JSONB,
    iri_score NUMERIC(5,2) DEFAULT 70.00,
    iri_score_details JSONB DEFAULT '{}'::JSONB,
    placement_readiness INTEGER DEFAULT 75,
    risk_status VARCHAR(50) DEFAULT 'ON_TRACK',
    smart_promotion_stage VARCHAR(50) DEFAULT 'FOUNDATION',
    streak_days INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    skills JSONB DEFAULT '[]'::JSONB,
    enrolled_tracks TEXT[] DEFAULT ARRAY['Python Backend & Microservices'],
    github_username VARCHAR(100),
    github_stats JSONB DEFAULT '{"repos": 12, "commitsThisMonth": 48, "verifiedContributions": 340, "qualityRating": "A"}'::JSONB,
    attendance_percent NUMERIC(5,2) DEFAULT 90.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Career Tracks
CREATE TABLE IF NOT EXISTS public.career_tracks (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100) NOT NULL DEFAULT 'Code',
    total_modules INTEGER DEFAULT 12,
    skills_covered TEXT[] DEFAULT ARRAY[]::TEXT[],
    specializations TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Missions
CREATE TABLE IF NOT EXISTS public.daily_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    track_id VARCHAR(100) REFERENCES public.career_tracks(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    day_number INTEGER NOT NULL,
    track_name VARCHAR(255) NOT NULL,
    theme VARCHAR(255) NOT NULL,
    tasks JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Daily Progress
CREATE TABLE IF NOT EXISTS public.student_mission_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    mission_id UUID NOT NULL REFERENCES public.daily_missions(id) ON DELETE CASCADE,
    task_id VARCHAR(100) NOT NULL,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, mission_id, task_id)
);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'INDUSTRY_PROJECT',
    track_id VARCHAR(100) REFERENCES public.career_tracks(id) ON DELETE SET NULL,
    difficulty VARCHAR(50) DEFAULT 'Intermediate',
    description TEXT NOT NULL,
    skills_gained TEXT[] DEFAULT ARRAY[]::TEXT[],
    github_repo TEXT,
    score INTEGER,
    reviewer_notes TEXT,
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hack Missions
CREATE TABLE IF NOT EXISTS public.hack_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    sponsor_company VARCHAR(255) NOT NULL,
    industry_problem TEXT NOT NULL,
    deadline_hours_remaining INTEGER NOT NULL DEFAULT 48,
    prize_xp INTEGER NOT NULL DEFAULT 2000,
    status VARCHAR(50) DEFAULT 'LIVE',
    participants_count INTEGER DEFAULT 120,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Placement Schedules
CREATE TABLE IF NOT EXISTS public.placement_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    day_number INTEGER NOT NULL,
    date DATE NOT NULL,
    theme VARCHAR(255) NOT NULL,
    english_topic VARCHAR(255) NOT NULL,
    aptitude_topic VARCHAR(255) NOT NULL,
    reasoning_topic VARCHAR(255) NOT NULL,
    hr_question_prompt TEXT NOT NULL,
    speaking_prompt TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campus Drives
CREATE TABLE IF NOT EXISTS public.campus_drives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    company_logo_url TEXT,
    role_title VARCHAR(255) NOT NULL,
    ctc_lpa NUMERIC(5,2) NOT NULL,
    location VARCHAR(255) NOT NULL,
    drive_date DATE NOT NULL,
    registration_deadline DATE NOT NULL,
    eligibility JSONB NOT NULL DEFAULT '{}'::JSONB,
    status VARCHAR(50) DEFAULT 'REGISTRATION_OPEN',
    stats JSONB DEFAULT '{"registeredCount": 0, "shortlistedCount": 0, "interviewedCount": 0, "selectedCount": 0, "offersReleasedCount": 0}'::JSONB,
    rounds JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company CRM
CREATE TABLE IF NOT EXISTS public.company_crm (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    tier VARCHAR(50) DEFAULT 'Tier 1',
    contact_person VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50) NOT NULL,
    relationship_status VARCHAR(50) DEFAULT 'ACTIVE_PARTNER',
    average_ctc_lpa NUMERIC(5,2) DEFAULT 0.00,
    average_offers INTEGER DEFAULT 0,
    notes TEXT[] DEFAULT ARRAY[]::TEXT[],
    interaction_logs JSONB DEFAULT '[]'::JSONB,
    follow_up_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Postings
CREATE TABLE IF NOT EXISTS public.job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recruiter_id UUID NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    ctc_min_lpa NUMERIC(5,2) NOT NULL,
    ctc_max_lpa NUMERIC(5,2) NOT NULL,
    required_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    eligibility JSONB DEFAULT '{}'::JSONB,
    description TEXT NOT NULL,
    applicants_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate Applications
CREATE TABLE IF NOT EXISTS public.candidate_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
    job_title VARCHAR(255) NOT NULL,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    college_name VARCHAR(255) NOT NULL,
    talent_score INTEGER NOT NULL,
    iri_score NUMERIC(5,2) NOT NULL,
    cgpa NUMERIC(4,2) NOT NULL,
    avatar_url TEXT,
    stage VARCHAR(50) NOT NULL DEFAULT 'DISCOVERED',
    applied_date DATE DEFAULT CURRENT_DATE,
    interview_date TIMESTAMPTZ,
    feedback_verdict TEXT,
    offer_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mentor Interventions
CREATE TABLE IF NOT EXISTS public.mentor_interventions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID NOT NULL,
    mentor_name VARCHAR(255) NOT NULL,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(255) NOT NULL,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    notes TEXT NOT NULL,
    assigned_practice_topic VARCHAR(255),
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Batch Announcements
CREATE TABLE IF NOT EXISTS public.batch_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_role VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    published_to_telegram BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    student_name VARCHAR(255) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    college_name VARCHAR(255) NOT NULL,
    amount_inr NUMERIC(10,2) NOT NULL,
    transaction_ref VARCHAR(255) NOT NULL UNIQUE,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'PENDING_VERIFICATION',
    verified_by VARCHAR(255),
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID NOT NULL REFERENCES public.colleges(id) ON DELETE CASCADE,
    college_name VARCHAR(255) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    total_licenses INTEGER NOT NULL DEFAULT 500,
    used_licenses INTEGER NOT NULL DEFAULT 0,
    amount_inr NUMERIC(12,2) NOT NULL,
    billing_cycle VARCHAR(50) DEFAULT 'Annual',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    renewal_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Items
CREATE TABLE IF NOT EXISTS public.content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    track_name VARCHAR(255) NOT NULL,
    module_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT',
    author_name VARCHAR(255) NOT NULL,
    author_id UUID NOT NULL,
    reviewer_name VARCHAR(255),
    review_notes TEXT,
    content_data JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    type VARCHAR(50) NOT NULL DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_user_id UUID,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Settings
CREATE TABLE IF NOT EXISTS public.system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. RLS HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.auth_user_id()
RETURNS UUID LANGUAGE sql STABLE AS $$
    SELECT auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS VARCHAR LANGUAGE sql STABLE AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_college_id()
RETURNS UUID LANGUAGE sql STABLE AS $$
    SELECT college_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    );
$$;

-- Trigger: Bootstrap Profile upon Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    user_role VARCHAR(50);
    user_name VARCHAR(255);
    col_id UUID;
    dept_id UUID;
BEGIN
    user_role := COALESCE(new.raw_user_meta_data->>'role', 'STUDENT');
    user_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
    
    INSERT INTO public.profiles (id, email, full_name, role, data_scope)
    VALUES (
        new.id,
        new.email,
        user_name,
        user_role,
        jsonb_build_object('scopeType', CASE WHEN user_role = 'SUPER_ADMIN' THEN 'PLATFORM' ELSE 'SELF' END)
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = NOW();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Transactional RPC: Complete Daily Mission Task
CREATE OR REPLACE FUNCTION public.complete_mission_task(
    p_task_id VARCHAR(100),
    p_student_id UUID,
    p_mission_id UUID,
    p_xp INTEGER
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.student_mission_progress (student_id, mission_id, task_id, xp_earned)
    VALUES (p_student_id, p_mission_id, p_task_id, p_xp)
    ON CONFLICT (student_id, mission_id, task_id) DO NOTHING;

    UPDATE public.students
    SET total_xp = total_xp + p_xp,
        talent_score = LEAST(1000, talent_score + 5),
        streak_days = streak_days + 1,
        updated_at = NOW()
    WHERE id = p_student_id;

    RETURN jsonb_build_object('success', true, 'xp_awarded', p_xp);
END;
$$;

-- Transactional RPC: Verify Payment
CREATE OR REPLACE FUNCTION public.verify_payment_and_activate(
    p_payment_id UUID,
    p_verifier_name VARCHAR(255)
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_student_id UUID;
BEGIN
    UPDATE public.payments
    SET status = 'VERIFIED_ACTIVE',
        verified_by = p_verifier_name,
        verified_at = NOW(),
        updated_at = NOW()
    WHERE id = p_payment_id
    RETURNING student_id INTO v_student_id;

    IF v_student_id IS NOT NULL THEN
        UPDATE public.students
        SET is_active = TRUE,
            updated_at = NOW()
        WHERE id = v_student_id;
    END IF;

    RETURN jsonb_build_object('success', true, 'payment_id', p_payment_id);
END;
$$;

-- ==============================================================================
-- 4. ENABLE RLS & GRANTS
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hack_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_crm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated & anonymous users (or role scoped)
CREATE POLICY "Allow public read access on colleges" ON public.colleges FOR SELECT USING (true);
CREATE POLICY "Allow super admin manage colleges" ON public.colleges FOR ALL USING (true);

CREATE POLICY "Allow public read access on departments" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Allow manage departments" ON public.departments FOR ALL USING (true);

CREATE POLICY "Allow user read own profile" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow user update own profile" ON public.profiles FOR ALL USING (true);

CREATE POLICY "Allow read batches" ON public.batches FOR SELECT USING (true);
CREATE POLICY "Allow manage batches" ON public.batches FOR ALL USING (true);

CREATE POLICY "Allow read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow manage students" ON public.students FOR ALL USING (true);

CREATE POLICY "Allow read career_tracks" ON public.career_tracks FOR SELECT USING (true);
CREATE POLICY "Allow read daily_missions" ON public.daily_missions FOR SELECT USING (true);
CREATE POLICY "Allow read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow manage projects" ON public.projects FOR ALL USING (true);

CREATE POLICY "Allow read hack_missions" ON public.hack_missions FOR SELECT USING (true);
CREATE POLICY "Allow read placement_schedules" ON public.placement_schedules FOR SELECT USING (true);
CREATE POLICY "Allow read campus_drives" ON public.campus_drives FOR SELECT USING (true);
CREATE POLICY "Allow manage campus_drives" ON public.campus_drives FOR ALL USING (true);

CREATE POLICY "Allow read company_crm" ON public.company_crm FOR SELECT USING (true);
CREATE POLICY "Allow manage company_crm" ON public.company_crm FOR ALL USING (true);

CREATE POLICY "Allow read job_postings" ON public.job_postings FOR SELECT USING (true);
CREATE POLICY "Allow manage job_postings" ON public.job_postings FOR ALL USING (true);

CREATE POLICY "Allow read candidate_applications" ON public.candidate_applications FOR SELECT USING (true);
CREATE POLICY "Allow manage candidate_applications" ON public.candidate_applications FOR ALL USING (true);

CREATE POLICY "Allow read mentor_interventions" ON public.mentor_interventions FOR SELECT USING (true);
CREATE POLICY "Allow manage mentor_interventions" ON public.mentor_interventions FOR ALL USING (true);

CREATE POLICY "Allow read batch_announcements" ON public.batch_announcements FOR SELECT USING (true);
CREATE POLICY "Allow manage batch_announcements" ON public.batch_announcements FOR ALL USING (true);

CREATE POLICY "Allow read payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Allow manage payments" ON public.payments FOR ALL USING (true);

CREATE POLICY "Allow read subscriptions" ON public.subscriptions FOR SELECT USING (true);
CREATE POLICY "Allow read content_items" ON public.content_items FOR SELECT USING (true);
CREATE POLICY "Allow manage content_items" ON public.content_items FOR ALL USING (true);

CREATE POLICY "Allow read notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Allow manage notifications" ON public.notifications FOR ALL USING (true);

CREATE POLICY "Allow read audit_logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow manage audit_logs" ON public.audit_logs FOR ALL USING (true);

CREATE POLICY "Allow read system_settings" ON public.system_settings FOR SELECT USING (true);

-- Realtime publication setup
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.candidate_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentor_interventions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_announcements;

-- Refresh PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
