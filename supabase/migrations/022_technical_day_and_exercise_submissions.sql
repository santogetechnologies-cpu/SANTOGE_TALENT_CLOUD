-- ============================================================================
-- SantoGe Talent Cloud (STC) — Migration 022: Technical Day & Exercise Submissions
--
-- Resolves:
-- 1. Restores and hardens public.complete_student_technical_day(UUID, INT)
-- 2. Restores public.get_student_completion_gate(UUID)
-- 3. Provisions public.student_exercise_submissions table with permanent locking,
--    unique attempt constraints, and strict RLS policies.
-- 4. Creates public.submit_student_exercise_answer() SECURITY DEFINER RPC to
--    enforce immutable, single-attempt question answer persistence.
-- 5. Creates public.get_student_exercise_submissions() RPC for batch retrieval.
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 1. Atomic Technical Day RPC (student_technical_days)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_student_technical_day(
    p_student_id UUID,
    p_day INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_xp INT;
    v_talent_score INT;
    v_row_count INT := 0;
BEGIN
    -- Authorization: Caller must be admin or the student themselves
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Range Validation
    IF p_day < 1 OR p_day > 90 THEN
        RAISE EXCEPTION 'Invalid technical day: must be between 1 and 90';
    END IF;

    -- Idempotent recording in student_technical_days
    INSERT INTO public.student_technical_days (student_id, day, completed_at)
    VALUES (p_student_id, p_day, now())
    ON CONFLICT (student_id, day) DO NOTHING;

    GET DIAGNOSTICS v_row_count = ROW_COUNT;

    -- Authoritative XP and readiness award only on new completion
    IF v_row_count > 0 THEN
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
        'ok', true,
        'student_id', p_student_id,
        'day', p_day,
        'xp', v_new_xp,
        'talent_score', COALESCE(v_talent_score, 0),
        'duplicate', (v_row_count = 0)
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.complete_student_technical_day(UUID, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_student_technical_day(UUID, INT) TO authenticated, service_role;

-- Revoke direct writes on student_technical_days from client roles
REVOKE INSERT, UPDATE, DELETE ON public.student_technical_days FROM anon, authenticated;
GRANT SELECT ON public.student_technical_days TO authenticated, service_role;


-- -----------------------------------------------------------------------------
-- 2. Dual Completion Gate Evaluation RPC
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_student_completion_gate(p_student_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile RECORD;
    v_completion_rule TEXT;
    v_secondary_min INT;
    v_placement_days_completed INT;
    v_placement_complete BOOLEAN;
    v_track RECORD;
    v_completed_skills_count INT;
    v_total_skills_count INT;
    v_track_pct NUMERIC;
    v_track_required NUMERIC;
    v_track_passed BOOLEAN;
    v_tracks_arr JSONB := '[]'::JSONB;
    v_all_technical_passed BOOLEAN := true;
    v_has_tracks BOOLEAN := false;
    v_track_index INT := 0;
    v_gate_unlocked BOOLEAN;
BEGIN
    -- Verify caller authorization
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Fetch student profile
    SELECT id, placement_day, xp, talent_score
    INTO v_profile
    FROM public.student_profiles
    WHERE id = p_student_id;

    IF v_profile.id IS NULL THEN
        RAISE EXCEPTION 'Student profile not found';
    END IF;

    -- Fetch platform completion rules
    SELECT
        COALESCE(value->>'rule', 'primary-plus-minimum'),
        COALESCE((value->>'secondary_minimum')::INT, 50)
    INTO v_completion_rule, v_secondary_min
    FROM public.platform_settings
    WHERE key = 'completion_rules';

    v_completion_rule := COALESCE(v_completion_rule, 'primary-plus-minimum');
    v_secondary_min := COALESCE(v_secondary_min, 50);

    -- Placement Completion: 90 days required
    SELECT COUNT(DISTINCT day) INTO v_placement_days_completed
    FROM public.placement_attendance
    WHERE student_id = p_student_id;

    v_placement_complete := (v_placement_days_completed >= 90) OR (v_profile.placement_day >= 90);

    -- Technical Completion across student assigned tracks
    FOR v_track IN
        SELECT st.track_id, st.position, ct.name AS track_name, ct.total_skills
        FROM public.student_tracks st
        LEFT JOIN public.curriculum_tracks ct ON ct.id = st.track_id
        WHERE st.student_id = p_student_id
        ORDER BY st.position ASC
    LOOP
        v_has_tracks := true;
        v_track_index := v_track_index + 1;

        SELECT COUNT(DISTINCT skill_id) INTO v_completed_skills_count
        FROM public.student_skill_completions
        WHERE student_id = p_student_id AND track_id = v_track.track_id;

        v_total_skills_count := COALESCE(NULLIF(v_track.total_skills, 0), 30);
        v_track_pct := ROUND((v_completed_skills_count::NUMERIC / v_total_skills_count::NUMERIC) * 100, 1);

        IF v_completion_rule = 'primary-only' THEN
            IF v_track_index = 1 THEN
                v_track_required := 100;
            ELSE
                v_track_required := 0;
            END IF;
        ELSIF v_completion_rule = 'all-tracks' THEN
            v_track_required := 100;
        ELSE
            -- 'primary-plus-minimum'
            IF v_track_index = 1 THEN
                v_track_required := 100;
            ELSE
                v_track_required := v_secondary_min;
            END IF;
        END IF;

        v_track_passed := (v_track_pct >= v_track_required);
        IF NOT v_track_passed THEN
            v_all_technical_passed := false;
        END IF;

        v_tracks_arr := v_tracks_arr || jsonb_build_object(
            'track_id', v_track.track_id,
            'track_name', v_track.track_name,
            'position', v_track.position,
            'completed_skills', v_completed_skills_count,
            'total_skills', v_total_skills_count,
            'pct', v_track_pct,
            'required', v_track_required,
            'passed', v_track_passed,
            'is_primary', (v_track_index = 1)
        );
    END LOOP;

    IF NOT v_has_tracks THEN
        v_all_technical_passed := false;
    END IF;

    -- Authoritative Dual Gate Evaluation
    v_gate_unlocked := v_placement_complete AND v_all_technical_passed;

    RETURN jsonb_build_object(
        'ok', true,
        'student_id', p_student_id,
        'placement_day', v_profile.placement_day,
        'placement_attendance_count', v_placement_days_completed,
        'placement_complete', v_placement_complete,
        'technical_complete', v_all_technical_passed,
        'gate_unlocked', v_gate_unlocked,
        'completion_rule', v_completion_rule,
        'secondary_minimum', v_secondary_min,
        'tracks', v_tracks_arr
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_student_completion_gate(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_student_completion_gate(UUID) TO authenticated, service_role;


-- -----------------------------------------------------------------------------
-- 3. Authoritative Question-Level Daily Exercise Submissions Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_exercise_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    day INT NOT NULL CHECK (day >= 1 AND day <= 90),
    category TEXT NOT NULL CHECK (category IN ('Aptitude', 'English', 'Logic', 'Puzzle')),
    question_id TEXT NOT NULL,
    selected_option INT NOT NULL,
    is_correct BOOLEAN DEFAULT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_exercise_submission UNIQUE (student_id, day, category, question_id)
);

CREATE INDEX IF NOT EXISTS idx_student_exercise_submissions_lookup
    ON public.student_exercise_submissions(student_id, day, category);

-- Enable RLS
ALTER TABLE public.student_exercise_submissions ENABLE ROW LEVEL SECURITY;

-- Students can read their own submissions; Admins can read all
DROP POLICY IF EXISTS "student_exercise_submissions_select" ON public.student_exercise_submissions;
CREATE POLICY "student_exercise_submissions_select"
    ON public.student_exercise_submissions
    FOR SELECT
    TO authenticated
    USING (
        student_id = public.current_student_id() OR public.is_admin()
    );

-- Prohibit direct client-side INSERT, UPDATE, DELETE
-- Submissions MUST go through the submit_student_exercise_answer() SECURITY DEFINER RPC
REVOKE INSERT, UPDATE, DELETE ON public.student_exercise_submissions FROM anon, authenticated;
GRANT SELECT ON public.student_exercise_submissions TO authenticated, service_role;
GRANT ALL ON public.student_exercise_submissions TO service_role;


-- -----------------------------------------------------------------------------
-- 4. Authoritative Exercise Answer Submission RPC
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_student_exercise_answer(
    p_student_id UUID,
    p_day INT,
    p_category TEXT,
    p_question_id TEXT,
    p_selected_option INT,
    p_is_correct BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_row_count INT := 0;
    v_existing_option INT;
    v_existing_is_correct BOOLEAN;
    v_existing_submitted_at TIMESTAMPTZ;
BEGIN
    -- 1. Caller Authorization: caller must be admin or the student themselves
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- 2. Range & Category Validation
    IF p_day < 1 OR p_day > 90 THEN
        RAISE EXCEPTION 'Invalid placement day: must be between 1 and 90';
    END IF;

    IF p_category NOT IN ('Aptitude', 'English', 'Logic', 'Puzzle') THEN
        RAISE EXCEPTION 'Invalid exercise category: %', p_category;
    END IF;

    IF p_question_id IS NULL OR TRIM(p_question_id) = '' THEN
        RAISE EXCEPTION 'Question ID cannot be empty';
    END IF;

    -- 3. Idempotent Single-Attempt Insert
    INSERT INTO public.student_exercise_submissions (
        student_id, day, category, question_id, selected_option, is_correct, submitted_at
    )
    VALUES (
        p_student_id, p_day, p_category, p_question_id, p_selected_option, p_is_correct, now()
    )
    ON CONFLICT (student_id, day, category, question_id) DO NOTHING;

    GET DIAGNOSTICS v_row_count = ROW_COUNT;

    -- 4. Check if already locked/submitted
    IF v_row_count = 0 THEN
        -- Fetch existing immutable submission
        SELECT selected_option, is_correct, submitted_at
        INTO v_existing_option, v_existing_is_correct, v_existing_submitted_at
        FROM public.student_exercise_submissions
        WHERE student_id = p_student_id
          AND day = p_day
          AND category = p_category
          AND question_id = p_question_id;

        RETURN jsonb_build_object(
            'ok', true,
            'already_submitted', true,
            'locked', true,
            'student_id', p_student_id,
            'day', p_day,
            'category', p_category,
            'question_id', p_question_id,
            'selected_option', v_existing_option,
            'is_correct', v_existing_is_correct,
            'submitted_at', v_existing_submitted_at
        );
    END IF;

    -- Note: XP is NOT awarded per individual MCQ. XP is authoritatively awarded
    -- upon complete_student_daily_step() for the category drill (+15 XP).
    RETURN jsonb_build_object(
        'ok', true,
        'already_submitted', false,
        'locked', true,
        'student_id', p_student_id,
        'day', p_day,
        'category', p_category,
        'question_id', p_question_id,
        'selected_option', p_selected_option,
        'is_correct', p_is_correct,
        'submitted_at', now()
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_student_exercise_answer(UUID, INT, TEXT, TEXT, INT, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_student_exercise_answer(UUID, INT, TEXT, TEXT, INT, BOOLEAN) TO authenticated, service_role;


-- -----------------------------------------------------------------------------
-- 5. Batch Submissions Query RPC
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_student_exercise_submissions(
    p_student_id UUID,
    p_day INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_results JSONB;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'question_id', question_id,
        'category', category,
        'selected_option', selected_option,
        'is_correct', is_correct,
        'submitted_at', submitted_at,
        'locked', true
    )), '[]'::JSONB)
    INTO v_results
    FROM public.student_exercise_submissions
    WHERE student_id = p_student_id AND day = p_day;

    RETURN jsonb_build_object(
        'ok', true,
        'student_id', p_student_id,
        'day', p_day,
        'submissions', v_results
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_student_exercise_submissions(UUID, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_student_exercise_submissions(UUID, INT) TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 6. Reload Schema Cache
-- -----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
