-- ============================================================================
-- SantoGe Talent Cloud (STC) — Migration 025: Technical Curriculum Lessons
--
-- Granular 90-Day Specialized Technical Curriculum Schema & Progress Tracking
-- 6 Specialized Tracks × 90 Days = 540 Lessons
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 1. Course Lessons Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id TEXT NOT NULL,
    day_number INT NOT NULL CHECK (day_number BETWEEN 1 AND 90),
    phase INT NOT NULL CHECK (phase BETWEEN 1 AND 6),
    phase_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    learning_objectives TEXT[] NOT NULL DEFAULT '{}',
    estimated_minutes INT NOT NULL DEFAULT 15,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
    lesson_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    animation_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    game_config JSONB,
    assessment_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    real_world_example JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_project_day BOOLEAN NOT NULL DEFAULT false,
    project_config JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_course_lesson_day UNIQUE (course_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_course_lessons_course_day ON public.course_lessons(course_id, day_number);
CREATE INDEX IF NOT EXISTS idx_course_lessons_phase ON public.course_lessons(course_id, phase);

-- -----------------------------------------------------------------------------
-- 2. Student Lesson Progress Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    day_number INT NOT NULL CHECK (day_number BETWEEN 1 AND 90),
    steps_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
    game_score INT NOT NULL DEFAULT 0,
    assessment_score INT NOT NULL DEFAULT 0,
    xp_earned INT NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_lesson_progress UNIQUE (student_id, course_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_student_lesson_progress_student ON public.student_lesson_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_lesson_progress_lookup ON public.student_lesson_progress(student_id, course_id, day_number);

-- -----------------------------------------------------------------------------
-- 3. Row-Level Security (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_lesson_progress ENABLE ROW LEVEL SECURITY;

-- course_lessons: public read for authenticated & anon
CREATE POLICY "course_lessons_select_all"
    ON public.course_lessons
    FOR SELECT
    USING (true);

-- course_lessons: admin only write
CREATE POLICY "course_lessons_admin_all"
    ON public.course_lessons
    FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- student_lesson_progress: student reads own, admin reads all
CREATE POLICY "student_lesson_progress_select"
    ON public.student_lesson_progress
    FOR SELECT
    USING (
        student_id = public.current_student_id()
        OR public.is_admin()
    );

-- student_lesson_progress: student writes own, admin writes all
CREATE POLICY "student_lesson_progress_insert"
    ON public.student_lesson_progress
    FOR INSERT
    WITH CHECK (
        student_id = public.current_student_id()
        OR public.is_admin()
    );

CREATE POLICY "student_lesson_progress_update"
    ON public.student_lesson_progress
    FOR UPDATE
    USING (
        student_id = public.current_student_id()
        OR public.is_admin()
    )
    WITH CHECK (
        student_id = public.current_student_id()
        OR public.is_admin()
    );

-- -----------------------------------------------------------------------------
-- 4. RPCs for Lesson Progress Tracking
-- -----------------------------------------------------------------------------

-- Atomic record of step completion inside a lesson
CREATE OR REPLACE FUNCTION public.record_student_lesson_step(
    p_student_id UUID,
    p_course_id TEXT,
    p_day INT,
    p_step_type TEXT,
    p_xp INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_existing_steps JSONB;
    v_new_xp INT := 0;
BEGIN
    -- Authorization
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Upsert lesson progress row
    INSERT INTO public.student_lesson_progress (
        student_id, course_id, day_number, steps_completed, started_at
    )
    VALUES (
        p_student_id, p_course_id, p_day, jsonb_build_array(p_step_type), now()
    )
    ON CONFLICT (student_id, course_id, day_number)
    DO UPDATE SET
        steps_completed = CASE
            WHEN public.student_lesson_progress.steps_completed ? p_step_type THEN public.student_lesson_progress.steps_completed
            ELSE public.student_lesson_progress.steps_completed || jsonb_build_array(p_step_type)
        END,
        updated_at = now()
    RETURNING steps_completed INTO v_existing_steps;

    -- Award incremental step XP if provided
    IF p_xp > 0 THEN
        UPDATE public.student_profiles
        SET xp = xp + p_xp,
            updated_at = now()
        WHERE id = p_student_id
        RETURNING xp INTO v_new_xp;

        UPDATE public.student_lesson_progress
        SET xp_earned = xp_earned + p_xp
        WHERE student_id = p_student_id AND course_id = p_course_id AND day_number = p_day;
    ELSE
        SELECT xp INTO v_new_xp FROM public.student_profiles WHERE id = p_student_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'steps_completed', v_existing_steps,
        'student_xp', v_new_xp
    );
END;
$$;

-- Complete entire daily lesson, sync with student_technical_days
CREATE OR REPLACE FUNCTION public.complete_student_lesson(
    p_student_id UUID,
    p_course_id TEXT,
    p_day INT,
    p_game_score INT DEFAULT 0,
    p_assessment_score INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_xp INT := 0;
    v_talent_score INT := 0;
    v_is_new_day BOOLEAN := false;
BEGIN
    -- Authorization
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Update or insert lesson progress completion
    INSERT INTO public.student_lesson_progress (
        student_id, course_id, day_number, game_score, assessment_score, completed_at
    )
    VALUES (
        p_student_id, p_course_id, p_day, p_game_score, p_assessment_score, now()
    )
    ON CONFLICT (student_id, course_id, day_number)
    DO UPDATE SET
        game_score = GREATEST(public.student_lesson_progress.game_score, p_game_score),
        assessment_score = GREATEST(public.student_lesson_progress.assessment_score, p_assessment_score),
        completed_at = COALESCE(public.student_lesson_progress.completed_at, now()),
        updated_at = now();

    -- Also record in student_technical_days for backwards-compatible dual gate
    INSERT INTO public.student_technical_days (student_id, day, completed_at)
    VALUES (p_student_id, p_day, now())
    ON CONFLICT (student_id, day) DO NOTHING;

    -- Check if this was a new technical day completion
    IF FOUND THEN
        v_is_new_day := true;
        UPDATE public.student_profiles
        SET xp = xp + 50,
            readiness_t = LEAST(100, readiness_t + 2),
            updated_at = now()
        WHERE id = p_student_id
        RETURNING xp INTO v_new_xp;

        PERFORM public.calculate_talent_score(p_student_id);
    ELSE
        SELECT xp INTO v_new_xp FROM public.student_profiles WHERE id = p_student_id;
    END IF;

    SELECT talent_score INTO v_talent_score FROM public.student_profiles WHERE id = p_student_id;

    RETURN jsonb_build_object(
        'success', true,
        'is_new_day', v_is_new_day,
        'xp', v_new_xp,
        'talent_score', v_talent_score
    );
END;
$$;

-- Get batch progress for a course
CREATE OR REPLACE FUNCTION public.get_student_course_progress(
    p_student_id UUID,
    p_course_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result JSONB;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'day', day_number,
            'steps_completed', steps_completed,
            'game_score', game_score,
            'assessment_score', assessment_score,
            'xp_earned', xp_earned,
            'completed_at', completed_at
        ) ORDER BY day_number ASC
    ), '[]'::jsonb)
    INTO v_result
    FROM public.student_lesson_progress
    WHERE student_id = p_student_id AND course_id = p_course_id;

    RETURN v_result;
END;
$$;
