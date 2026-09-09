-- ============================================================================
-- Migration: 002_curriculum_schema.sql
-- Description: Curriculum tracks, skills, and student learning progress tables.
-- ============================================================================

-- 1. Curriculum Tracks (The 15 Technical Tracks)
CREATE TABLE IF NOT EXISTS public.curriculum_tracks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    category TEXT NOT NULL,
    total_skills INT NOT NULL DEFAULT 30,
    accent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Curriculum Skills
CREATE TABLE IF NOT EXISTS public.curriculum_skills (
    id TEXT PRIMARY KEY,
    track_id TEXT NOT NULL REFERENCES public.curriculum_tracks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    day INT NOT NULL CHECK (day > 0),
    type TEXT NOT NULL CHECK (type IN ('video', 'lab', 'quiz', 'project')),
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Student Skill Completions (Idempotent per student + skill)
CREATE TABLE IF NOT EXISTS public.student_skill_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL,
    track_id TEXT NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_skill UNIQUE (student_id, skill_id)
);

-- 4. Student Lab Completions (Idempotent per student + lab)
CREATE TABLE IF NOT EXISTS public.student_lab_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    lab_id TEXT NOT NULL,
    label TEXT NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_lab UNIQUE (student_id, lab_id)
);

-- 5. Student Daily Learning Progress (Placement daily english, aptitude, practice)
CREATE TABLE IF NOT EXISTS public.student_daily_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    english_completed BOOLEAN NOT NULL DEFAULT false,
    aptitude_completed BOOLEAN NOT NULL DEFAULT false,
    practice_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_daily UNIQUE (student_id, date)
);
