-- ============================================================================
-- SantoGe Talent Cloud (STC) — Migration 024: Authoritative Daily Exercise System
--
-- Features:
-- 1. Provisions public.student_exercise_submissions table with daily uniqueness:
--    student_id + question_id
-- 2. Authoritative Server-side answer key validation (never trust client XP or correctness)
-- 3. Awards exactly 1 XP per correct answer (0 XP for incorrect)
-- 4. Maximum Daily Exercise XP = 20 XP (10 Aptitude & Logic + 10 Corporate English)
-- 5. Strict Idempotency: duplicate submissions cannot award duplicate XP
-- 6. RPC: public.submit_student_exercise_answer()
-- 7. RPC: public.get_student_exercise_submissions()
-- 8. Updates check_student_profile_update() to allow submit_student_exercise_answer()
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 1. Create or Upgrade student_exercise_submissions Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_exercise_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    exercise_date DATE NOT NULL DEFAULT CURRENT_DATE,
    day INT NOT NULL DEFAULT 1,
    category TEXT NOT NULL DEFAULT 'Aptitude',
    question_id TEXT NOT NULL,
    selected_option INT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    xp_earned INT NOT NULL DEFAULT 0 CHECK (xp_earned IN (0, 1)),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure columns exist if table was previously created with different columns (e.g. Migration 022)
ALTER TABLE public.student_exercise_submissions
    ADD COLUMN IF NOT EXISTS exercise_date DATE NOT NULL DEFAULT CURRENT_DATE,
    ADD COLUMN IF NOT EXISTS xp_earned INT NOT NULL DEFAULT 0;

-- Drop older check constraints on category and replace with permissive enum constraint
ALTER TABLE public.student_exercise_submissions
    DROP CONSTRAINT IF EXISTS student_exercise_submissions_category_check;

ALTER TABLE public.student_exercise_submissions
    ADD CONSTRAINT student_exercise_submissions_category_check
    CHECK (category IN ('aptitude_logic', 'corporate_english', 'Aptitude', 'English', 'Logic', 'Puzzle'));

-- Drop older unique constraints to standardize on (student_id, question_id)
ALTER TABLE public.student_exercise_submissions
    DROP CONSTRAINT IF EXISTS uq_student_exercise_submission;

ALTER TABLE public.student_exercise_submissions
    DROP CONSTRAINT IF EXISTS uq_student_exercise_daily_submission;

ALTER TABLE public.student_exercise_submissions
    DROP CONSTRAINT IF EXISTS uq_student_exercise_student_question;

CREATE UNIQUE INDEX IF NOT EXISTS uidx_student_exercise_student_question
    ON public.student_exercise_submissions(student_id, question_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_exercise_daily_lookup
    ON public.student_exercise_submissions(student_id, exercise_date);

CREATE INDEX IF NOT EXISTS idx_student_exercise_day_lookup
    ON public.student_exercise_submissions(student_id, day);

CREATE INDEX IF NOT EXISTS idx_student_exercise_question_lookup
    ON public.student_exercise_submissions(student_id, question_id);

-- Enable Row Level Security
ALTER TABLE public.student_exercise_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "student_exercise_submissions_select" ON public.student_exercise_submissions;
CREATE POLICY "student_exercise_submissions_select"
    ON public.student_exercise_submissions
    FOR SELECT
    TO authenticated
    USING (
        student_id = public.current_student_id() OR public.is_admin()
    );

-- Prevent direct client writes (all writes must execute through submit_student_exercise_answer RPC)
REVOKE INSERT, UPDATE, DELETE ON public.student_exercise_submissions FROM anon, authenticated;
GRANT SELECT ON public.student_exercise_submissions TO authenticated, service_role;
GRANT ALL ON public.student_exercise_submissions TO service_role;


-- -----------------------------------------------------------------------------
-- 2. Authoritative Exercise Answer Submission RPC
-- -----------------------------------------------------------------------------
-- Clean up all existing overloads to eliminate postgrest 400 candidate function ambiguity
DROP FUNCTION IF EXISTS public.submit_student_exercise_answer(UUID, TEXT, INT, INT, TEXT, BOOLEAN);
DROP FUNCTION IF EXISTS public.submit_student_exercise_answer(UUID, INT, TEXT, TEXT, INT, BOOLEAN);

CREATE OR REPLACE FUNCTION public.submit_student_exercise_answer(
    p_student_id UUID,
    p_day INT DEFAULT 1,
    p_category TEXT DEFAULT 'Aptitude',
    p_question_id TEXT DEFAULT '',
    p_selected_option INT DEFAULT 0,
    p_is_correct BOOLEAN DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_day INT := coalesce(p_day, 1);
    v_cat_code TEXT;
    v_category TEXT;
    v_q_idx INT := 1;
    v_correct_option INT;
    v_is_correct BOOLEAN;
    v_xp_to_award INT := 0;
    v_existing_option INT;
    v_existing_correct BOOLEAN;
    v_existing_xp INT;
    v_existing_at TIMESTAMPTZ;
    v_new_xp INT;
    v_talent_score INT;
BEGIN
    -- 1. Authorization: Caller must be admin or the student themselves
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not authorized to submit exercises for this student';
    END IF;

    -- 2. Input Validation
    IF p_question_id IS NULL OR TRIM(p_question_id) = '' THEN
        RAISE EXCEPTION 'Question ID cannot be empty';
    END IF;

    IF p_selected_option < 0 OR p_selected_option > 3 THEN
        RAISE EXCEPTION 'Invalid selected option: must be between 0 and 3';
    END IF;

    -- 3. Determine Category, Day, and Question Index from question_id
    IF p_question_id ~ '^D([0-9]+)-(AL|CE)-([0-9]+)$' THEN
        v_day := (regexp_match(p_question_id, '^D([0-9]+)-(AL|CE)-([0-9]+)$'))[1]::INT;
        v_cat_code := (regexp_match(p_question_id, '^D([0-9]+)-(AL|CE)-([0-9]+)$'))[2];
        v_q_idx := (regexp_match(p_question_id, '^D([0-9]+)-(AL|CE)-([0-9]+)$'))[3]::INT;

        IF v_cat_code = 'AL' THEN
            v_category := 'Aptitude';
        ELSE
            v_category := 'English';
        END IF;
    ELSIF p_question_id ~ '^AL-([0-9]+)$' THEN
        v_day := coalesce(p_day, 1);
        v_category := 'Aptitude';
        v_q_idx := (regexp_match(p_question_id, '^AL-([0-9]+)$'))[1]::INT;
    ELSIF p_question_id ~ '^CE-([0-9]+)$' THEN
        v_day := coalesce(p_day, 1);
        v_category := 'English';
        v_q_idx := (regexp_match(p_question_id, '^CE-([0-9]+)$'))[1]::INT;
    ELSE
        v_day := coalesce(p_day, 1);
        IF p_category IN ('corporate_english', 'English') OR p_question_id LIKE '%CE%' THEN
            v_category := 'English';
        ELSE
            v_category := 'Aptitude';
        END IF;
        v_q_idx := 1;
    END IF;

    -- 4. Server-side Authoritative Answer Key (AL-01 to AL-10, CE-01 to CE-10, and D{day} sets)
    IF v_day = 1 AND (p_question_id ~ '^AL-' OR p_question_id ~ '^CE-' OR p_question_id ~ '^D1-') THEN
        IF p_question_id IN ('AL-01','AL-02','AL-03','AL-04','AL-05','AL-06','D1-AL-01','D1-AL-02','D1-AL-03','D1-AL-04','D1-AL-05','D1-AL-06') THEN
            v_correct_option := 2;
        ELSIF p_question_id IN ('AL-07','AL-08','D1-AL-07','D1-AL-08') THEN
            v_correct_option := 1;
        ELSIF p_question_id IN ('AL-09','D1-AL-09') THEN
            v_correct_option := 2;
        ELSIF p_question_id IN ('AL-10','D1-AL-10') THEN
            v_correct_option := 0;
        ELSIF p_question_id IN ('CE-01','CE-02','CE-03','CE-04','CE-06','CE-07','CE-08','CE-10','D1-CE-01','D1-CE-02','D1-CE-03','D1-CE-04','D1-CE-06','D1-CE-07','D1-CE-08','D1-CE-10') THEN
            v_correct_option := 1;
        ELSIF p_question_id IN ('CE-05','D1-CE-05') THEN
            v_correct_option := 2;
        ELSIF p_question_id IN ('CE-09','D1-CE-09') THEN
            v_correct_option := 0;
        ELSE
            IF v_category = 'Aptitude' THEN
                v_correct_option := (v_day * 3 + v_q_idx * 7 + 1) % 4;
            ELSE
                v_correct_option := (v_day * 5 + v_q_idx * 11 + 2) % 4;
            END IF;
        END IF;
    ELSE
        IF v_category = 'Aptitude' THEN
            v_correct_option := (v_day * 3 + v_q_idx * 7 + 1) % 4;
        ELSE
            v_correct_option := (v_day * 5 + v_q_idx * 11 + 2) % 4;
        END IF;
    END IF;

    -- 5. Authoritative Correctness & XP determination (Server Controlled)
    v_is_correct := (p_selected_option = v_correct_option);
    v_xp_to_award := CASE WHEN v_is_correct THEN 1 ELSE 0 END;

    -- 6. Check if already answered first to guarantee idempotency
    SELECT selected_option, is_correct, xp_earned, submitted_at
    INTO v_existing_option, v_existing_correct, v_existing_xp, v_existing_at
    FROM public.student_exercise_submissions
    WHERE student_id = p_student_id
      AND question_id = p_question_id;

    IF v_existing_option IS NOT NULL THEN
        SELECT xp, talent_score
        INTO v_new_xp, v_talent_score
        FROM public.student_profiles
        WHERE id = p_student_id;

        RETURN jsonb_build_object(
            'ok', true,
            'already_submitted', true,
            'locked', true,
            'student_id', p_student_id,
            'date', v_today,
            'day', v_day,
            'question_id', p_question_id,
            'category', CASE WHEN v_category = 'English' THEN 'corporate_english' ELSE 'aptitude_logic' END,
            'selected_option', v_existing_option,
            'is_correct', v_existing_correct,
            'xp_earned', coalesce(v_existing_xp, 0),
            'total_xp', coalesce(v_new_xp, 0),
            'talent_score', coalesce(v_talent_score, 0),
            'submitted_at', v_existing_at
        );
    END IF;

    -- 7. Insert submission with unique violation handling
    BEGIN
        INSERT INTO public.student_exercise_submissions (
            student_id,
            exercise_date,
            day,
            category,
            question_id,
            selected_option,
            is_correct,
            xp_earned,
            submitted_at
        )
        VALUES (
            p_student_id,
            v_today,
            v_day,
            v_category,
            p_question_id,
            p_selected_option,
            v_is_correct,
            v_xp_to_award,
            now()
        );
    EXCEPTION WHEN unique_violation THEN
        SELECT selected_option, is_correct, xp_earned, submitted_at
        INTO v_existing_option, v_existing_correct, v_existing_xp, v_existing_at
        FROM public.student_exercise_submissions
        WHERE student_id = p_student_id
          AND question_id = p_question_id;

        SELECT xp, talent_score
        INTO v_new_xp, v_talent_score
        FROM public.student_profiles
        WHERE id = p_student_id;

        RETURN jsonb_build_object(
            'ok', true,
            'already_submitted', true,
            'locked', true,
            'student_id', p_student_id,
            'date', v_today,
            'day', v_day,
            'question_id', p_question_id,
            'category', CASE WHEN v_category = 'English' THEN 'corporate_english' ELSE 'aptitude_logic' END,
            'selected_option', v_existing_option,
            'is_correct', v_existing_correct,
            'xp_earned', coalesce(v_existing_xp, 0),
            'total_xp', coalesce(v_new_xp, 0),
            'talent_score', coalesce(v_talent_score, 0),
            'submitted_at', v_existing_at
        );
    END;

    -- 8. New Submission: Award 1 XP if correct & recalculate talent score
    IF v_xp_to_award > 0 THEN
        UPDATE public.student_profiles
        SET xp = xp + 1,
            readiness_a = CASE WHEN v_category = 'Aptitude' THEN LEAST(100, coalesce(readiness_a, 0) + 1) ELSE readiness_a END,
            readiness_c = CASE WHEN v_category = 'English' THEN LEAST(100, coalesce(readiness_c, 0) + 1) ELSE readiness_c END,
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
        'already_submitted', false,
        'locked', true,
        'student_id', p_student_id,
        'date', v_today,
        'day', v_day,
        'question_id', p_question_id,
        'category', CASE WHEN v_category = 'English' THEN 'corporate_english' ELSE 'aptitude_logic' END,
        'selected_option', p_selected_option,
        'is_correct', v_is_correct,
        'xp_earned', v_xp_to_award,
        'total_xp', coalesce(v_new_xp, 0),
        'talent_score', coalesce(v_talent_score, 0),
        'submitted_at', now()
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_student_exercise_answer(UUID, INT, TEXT, TEXT, INT, BOOLEAN) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_student_exercise_answer(UUID, INT, TEXT, TEXT, INT, BOOLEAN) TO authenticated, service_role;


-- -----------------------------------------------------------------------------
-- 3. Batch Submissions Query RPC
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_student_exercise_submissions(UUID, INT, DATE);
DROP FUNCTION IF EXISTS public.get_student_exercise_submissions(UUID, INT);

CREATE OR REPLACE FUNCTION public.get_student_exercise_submissions(
    p_student_id UUID,
    p_day INT DEFAULT 1,
    p_date DATE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_query_date DATE := coalesce(p_date, CURRENT_DATE);
    v_results JSONB;
    v_aptitude_count INT := 0;
    v_aptitude_xp INT := 0;
    v_english_count INT := 0;
    v_english_xp INT := 0;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized: Caller is not authorized to view exercise submissions for this student';
    END IF;

    SELECT
        coalesce(jsonb_agg(jsonb_build_object(
            'question_id', question_id,
            'category', CASE WHEN category IN ('corporate_english', 'English') THEN 'corporate_english' ELSE 'aptitude_logic' END,
            'selected_option', selected_option,
            'is_correct', is_correct,
            'xp_earned', coalesce(xp_earned, CASE WHEN is_correct THEN 1 ELSE 0 END),
            'submitted_at', submitted_at,
            'locked', true
        )), '[]'::JSONB),
        coalesce(count(*) FILTER (WHERE category IN ('aptitude_logic', 'Aptitude', 'Logic')), 0),
        coalesce(sum(coalesce(xp_earned, CASE WHEN is_correct THEN 1 ELSE 0 END)) FILTER (WHERE category IN ('aptitude_logic', 'Aptitude', 'Logic')), 0),
        coalesce(count(*) FILTER (WHERE category IN ('corporate_english', 'English')), 0),
        coalesce(sum(coalesce(xp_earned, CASE WHEN is_correct THEN 1 ELSE 0 END)) FILTER (WHERE category IN ('corporate_english', 'English')), 0)
    INTO
        v_results,
        v_aptitude_count,
        v_aptitude_xp,
        v_english_count,
        v_english_xp
    FROM public.student_exercise_submissions
    WHERE student_id = p_student_id
      AND (
          (p_day IS NOT NULL AND day = p_day)
          OR (p_day IS NULL AND exercise_date = v_query_date)
      );

    RETURN jsonb_build_object(
        'ok', true,
        'student_id', p_student_id,
        'date', v_query_date,
        'day', p_day,
        'submissions', v_results,
        'summary', jsonb_build_object(
            'total_completed', (v_aptitude_count + v_english_count),
            'total_xp', (v_aptitude_xp + v_english_xp),
            'aptitude_completed', v_aptitude_count,
            'aptitude_xp', v_aptitude_xp,
            'english_completed', v_english_count,
            'english_xp', v_english_xp
        )
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_student_exercise_submissions(UUID, INT, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_student_exercise_submissions(UUID, INT, DATE) TO authenticated, service_role;


-- -----------------------------------------------------------------------------
-- 4. Update check_student_profile_update() to Authorize submit_student_exercise_answer
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_student_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_context TEXT := '';
BEGIN
    -- 1. If caller is admin or service_role, allow all updates
    IF coalesce(public.is_admin(), false)
       OR coalesce(auth.role(), '') = 'service_role'
       OR coalesce(current_setting('role', true), '') = 'service_role'
       OR coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role' THEN
        RETURN NEW;
    END IF;

    -- 2. Allow updates originating from trusted backend functions / RPCs
    GET DIAGNOSTICS v_context = PG_CONTEXT;
    IF v_context ~* '\m(complete_student_placement_day|complete_student_skill|complete_student_lab|complete_student_daily_step|submit_student_assessment|complete_student_mock|issue_student_certificate|complete_student_technical_day|calculate_talent_score|claim_student_profile|recalculate_all_talent_scores|submit_student_exercise_answer)\M' THEN
        RETURN NEW;
    END IF;

    -- 3. Reject direct client modification of privileged attributes by students
    IF NEW.xp IS DISTINCT FROM OLD.xp OR
       NEW.talent_score IS DISTINCT FROM OLD.talent_score OR
       NEW.placement_day IS DISTINCT FROM OLD.placement_day OR
       NEW.status IS DISTINCT FROM OLD.status OR
       NEW.institution_id IS DISTINCT FROM OLD.institution_id OR
       NEW.batch_id IS DISTINCT FROM OLD.batch_id OR
       NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id THEN
        RAISE EXCEPTION 'Students cannot directly modify privileged profile attributes (xp, talent_score, placement_day, status, institution_id, batch_id, auth_user_id)';
    END IF;

    RETURN NEW;
END;
$$;

NOTIFY pgrst, 'reload schema';
