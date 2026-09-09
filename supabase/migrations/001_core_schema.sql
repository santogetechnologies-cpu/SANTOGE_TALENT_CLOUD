-- ============================================================================
-- Migration: 001_core_schema.sql
-- Description: Core schema for institutions, batches, user roles, student
--              profiles, student technical tracks, and platform settings.
-- ============================================================================

-- 1. Institutions
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Batches (Placement Accelerator Cohorts)
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    capacity INT NOT NULL DEFAULT 300 CHECK (capacity > 0),
    dept TEXT NOT NULL DEFAULT 'Engineering',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. User Roles (Explicit Role Security Table)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Student Profiles (Stable identity linked to auth.users)
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    roll_no TEXT,
    dept TEXT NOT NULL DEFAULT 'CSE',
    college TEXT NOT NULL DEFAULT 'Partner Engineering College',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    xp INT NOT NULL DEFAULT 0 CHECK (xp >= 0),
    streak INT NOT NULL DEFAULT 0 CHECK (streak >= 0),
    placement_day INT NOT NULL DEFAULT 1 CHECK (placement_day BETWEEN 1 AND 90),
    talent_score INT NOT NULL DEFAULT 0 CHECK (talent_score BETWEEN 0 AND 1000),
    readiness_t INT NOT NULL DEFAULT 50 CHECK (readiness_t BETWEEN 0 AND 100),
    readiness_c INT NOT NULL DEFAULT 50 CHECK (readiness_c BETWEEN 0 AND 100),
    readiness_a INT NOT NULL DEFAULT 50 CHECK (readiness_a BETWEEN 0 AND 100),
    readiness_e INT NOT NULL DEFAULT 50 CHECK (readiness_e BETWEEN 0 AND 100),
    readiness_r INT NOT NULL DEFAULT 50 CHECK (readiness_r BETWEEN 0 AND 100),
    readiness_m INT NOT NULL DEFAULT 50 CHECK (readiness_m BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Student Tracks (1 to 3 Assigned Technical Tracks per Learner)
CREATE TABLE IF NOT EXISTS public.student_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    track_id TEXT NOT NULL,
    position INT NOT NULL DEFAULT 1 CHECK (position BETWEEN 1 AND 3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_track UNIQUE (student_id, track_id)
);

-- 6. Platform Settings (Admin Configuration)
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
