-- ============================================================================
-- Migration: 003_placement_schema.sql
-- Description: Placement accelerator progress, assessments, mocks, certifications,
--              recruiter hiring drives, offers, and authoritative talent scores.
-- ============================================================================

-- 1. Placement Accelerator Attendance (90-Day synchronized cohort)
CREATE TABLE IF NOT EXISTS public.placement_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    day INT NOT NULL CHECK (day BETWEEN 1 AND 90),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_placement_day UNIQUE (student_id, day)
);

-- 2. Student Technical Days (Self-paced technical milestone tracking)
CREATE TABLE IF NOT EXISTS public.student_technical_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    day INT NOT NULL CHECK (day BETWEEN 1 AND 90),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_tech_day UNIQUE (student_id, day)
);

-- 3. Student Milestone Assessments (Day 30, Day 60, Day 90)
CREATE TABLE IF NOT EXISTS public.student_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    day INT NOT NULL CHECK (day IN (30, 60, 90)),
    score NUMERIC(5, 2) NOT NULL CHECK (score BETWEEN 0 AND 100),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_assessment_day UNIQUE (student_id, day)
);

-- 4. Phase 2 Mock Interviews (AI & Mentor mock evaluation)
CREATE TABLE IF NOT EXISTS public.student_mocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    mock_id TEXT NOT NULL,
    score NUMERIC(5, 2) NOT NULL CHECK (score BETWEEN 0 AND 100),
    feedback_summary TEXT,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_mock UNIQUE (student_id, mock_id)
);

-- 5. Phase 2 Skill Certifications
CREATE TABLE IF NOT EXISTS public.student_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_cert UNIQUE (student_id, label)
);

-- 6. Recruiter Partner Hiring Drives
CREATE TABLE IF NOT EXISTS public.hiring_drives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company TEXT NOT NULL,
    roles TEXT NOT NULL,
    ctc TEXT NOT NULL,
    min_score INT NOT NULL DEFAULT 650 CHECK (min_score BETWEEN 0 AND 1000),
    open_slots INT NOT NULL DEFAULT 50 CHECK (open_slots > 0),
    status TEXT NOT NULL DEFAULT 'Active Drive' CHECK (status IN ('Active Drive', 'Shortlisting', 'Interviews Live', 'Closed')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Placements & Offer Conversion
CREATE TABLE IF NOT EXISTS public.placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    offer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    package_lpa NUMERIC(5, 2) NOT NULL CHECK (package_lpa > 0),
    status TEXT NOT NULL DEFAULT 'offered' CHECK (status IN ('offered', 'accepted', 'declined')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Authoritative Talent Scores & Component Breakdown
CREATE TABLE IF NOT EXISTS public.talent_scores (
    student_id UUID PRIMARY KEY REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    talent_score INT NOT NULL DEFAULT 0 CHECK (talent_score BETWEEN 0 AND 1000),
    readiness_t INT NOT NULL DEFAULT 50 CHECK (readiness_t BETWEEN 0 AND 100),
    readiness_c INT NOT NULL DEFAULT 50 CHECK (readiness_c BETWEEN 0 AND 100),
    readiness_a INT NOT NULL DEFAULT 50 CHECK (readiness_a BETWEEN 0 AND 100),
    readiness_e INT NOT NULL DEFAULT 50 CHECK (readiness_e BETWEEN 0 AND 100),
    readiness_r INT NOT NULL DEFAULT 50 CHECK (readiness_r BETWEEN 0 AND 100),
    readiness_m INT NOT NULL DEFAULT 50 CHECK (readiness_m BETWEEN 0 AND 100),
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
