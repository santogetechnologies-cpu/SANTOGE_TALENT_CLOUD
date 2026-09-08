-- ============================================================================
-- Migration: 006_functions_and_rpc.sql
-- Description: Idempotent stored procedures, atomic student progress updates,
--              centralized Talent Score calculation, and Admin provisioning.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Atomic Placement Day Completion
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_student_placement_day(
    p_student_id UUID,
    p_day INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_updated_day INT;
    v_new_xp INT;
BEGIN
    -- Only allowed for own student or admin
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Record attendance idempotently
    INSERT INTO public.placement_attendance (student_id, day, completed_at)
    VALUES (p_student_id, p_day, now())
    ON CONFLICT (student_id, day) DO NOTHING;

    -- Advance student placement_day and increment XP
    UPDATE public.student_profiles
    SET placement_day = GREATEST(placement_day, LEAST(p_day + 1, 90)),
        xp = xp + 20,
        readiness_c = LEAST(100, readiness_c + 1),
        readiness_e = LEAST(100, readiness_e + 1),
        readiness_a = LEAST(100, readiness_a + 1),
        updated_at = now()
    WHERE id = p_student_id
    RETURNING placement_day, xp INTO v_updated_day, v_new_xp;

    -- Recalculate talent score
    PERFORM public.calculate_talent_score(p_student_id);

    RETURN jsonb_build_object(
        'ok', true,
        'student_id', p_student_id,
        'placement_day', v_updated_day,
        'xp', v_new_xp
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. Atomic Technical Skill Completion
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_student_skill(
    p_student_id UUID,
    p_skill_id TEXT,
    p_track_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_xp INT;
    v_inserted BOOLEAN := false;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO public.student_skill_completions (student_id, skill_id, track_id, completed_at)
    VALUES (p_student_id, p_skill_id, p_track_id, now())
    ON CONFLICT (student_id, skill_id) DO NOTHING;

    GET DIAGNOSTICS v_inserted = ROW_COUNT;

    IF v_inserted THEN
        UPDATE public.student_profiles
        SET xp = xp + 30,
            readiness_t = LEAST(100, readiness_t + 2),
            updated_at = now()
        WHERE id = p_student_id
        RETURNING xp INTO v_new_xp;

        PERFORM public.calculate_talent_score(p_student_id);
    ELSE
        SELECT xp INTO v_new_xp FROM public.student_profiles WHERE id = p_student_id;
    END IF;

    RETURN jsonb_build_object(
        'ok', true,
        'student_id', p_student_id,
        'skill_id', p_skill_id,
        'xp', v_new_xp
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. Atomic Lab Completion
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_student_lab(
    p_student_id UUID,
    p_lab_id TEXT,
    p_label TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_xp INT;
    v_inserted BOOLEAN := false;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO public.student_lab_completions (student_id, lab_id, label, completed_at)
    VALUES (p_student_id, p_lab_id, p_label, now())
    ON CONFLICT (student_id, lab_id) DO NOTHING;

    GET DIAGNOSTICS v_inserted = ROW_COUNT;

    IF v_inserted THEN
        UPDATE public.student_profiles
        SET xp = xp + 50,
            readiness_t = LEAST(100, readiness_t + 3),
            updated_at = now()
        WHERE id = p_student_id
        RETURNING xp INTO v_new_xp;

        PERFORM public.calculate_talent_score(p_student_id);
    ELSE
        SELECT xp INTO v_new_xp FROM public.student_profiles WHERE id = p_student_id;
    END IF;

    RETURN jsonb_build_object('ok', true, 'lab_id', p_lab_id, 'xp', v_new_xp);
END;
$$;

-- ----------------------------------------------------------------------------
-- 4. Atomic Daily Step Completion
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_student_daily_step(
    p_student_id UUID,
    p_step TEXT -- 'english', 'aptitude', 'practice'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO public.student_daily_progress (student_id, date, english_completed, aptitude_completed, practice_completed)
    VALUES (
        p_student_id,
        v_today,
        p_step = 'english',
        p_step = 'aptitude',
        p_step = 'practice'
    )
    ON CONFLICT (student_id, date) DO UPDATE SET
        english_completed = CASE WHEN p_step = 'english' THEN true ELSE student_daily_progress.english_completed END,
        aptitude_completed = CASE WHEN p_step = 'aptitude' THEN true ELSE student_daily_progress.aptitude_completed END,
        practice_completed = CASE WHEN p_step = 'practice' THEN true ELSE student_daily_progress.practice_completed END,
        updated_at = now();

    UPDATE public.student_profiles
    SET xp = xp + 15,
        updated_at = now()
    WHERE id = p_student_id;

    RETURN jsonb_build_object('ok', true, 'step', p_step, 'date', v_today);
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. Atomic Assessment Submission
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_student_assessment(
    p_student_id UUID,
    p_day INT,
    p_score NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO public.student_assessments (student_id, day, score, submitted_at)
    VALUES (p_student_id, p_day, p_score, now())
    ON CONFLICT (student_id, day) DO UPDATE SET
        score = GREATEST(student_assessments.score, p_score),
        submitted_at = now();

    UPDATE public.student_profiles
    SET xp = xp + 40,
        readiness_a = LEAST(100, readiness_a + 3),
        updated_at = now()
    WHERE id = p_student_id;

    PERFORM public.calculate_talent_score(p_student_id);

    RETURN jsonb_build_object('ok', true, 'day', p_day, 'score', p_score);
END;
$$;

-- ----------------------------------------------------------------------------
-- 6. Atomic Mock Interview Completion
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_student_mock(
    p_student_id UUID,
    p_mock_id TEXT,
    p_score NUMERIC,
    p_feedback TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO public.student_mocks (student_id, mock_id, score, feedback_summary, completed_at)
    VALUES (p_student_id, p_mock_id, p_score, p_feedback, now())
    ON CONFLICT (student_id, mock_id) DO UPDATE SET
        score = GREATEST(student_mocks.score, p_score),
        feedback_summary = p_feedback,
        completed_at = now();

    UPDATE public.student_profiles
    SET xp = xp + 50,
        readiness_m = LEAST(100, readiness_m + 5),
        updated_at = now()
    WHERE id = p_student_id;

    PERFORM public.calculate_talent_score(p_student_id);

    RETURN jsonb_build_object('ok', true, 'mock_id', p_mock_id, 'score', p_score);
END;
$$;

-- ----------------------------------------------------------------------------
-- 7. Atomic Certification Issuance
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.issue_student_certificate(
    p_student_id UUID,
    p_label TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO public.student_certifications (student_id, label, issued_at)
    VALUES (p_student_id, p_label, now())
    ON CONFLICT (student_id, label) DO NOTHING;

    UPDATE public.student_profiles
    SET xp = xp + 100,
        readiness_r = LEAST(100, readiness_r + 5),
        updated_at = now()
    WHERE id = p_student_id;

    PERFORM public.calculate_talent_score(p_student_id);

    RETURN jsonb_build_object('ok', true, 'label', p_label);
END;
$$;

-- ----------------------------------------------------------------------------
-- 8. Authoritative Talent Score Calculation Engine (T·C·A·E·R·M)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.calculate_talent_score(p_student_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_t INT; v_c INT; v_a INT; v_e INT; v_r INT; v_m INT;
    v_skills_count INT;
    v_labs_count INT;
    v_attendance_count INT;
    v_composite NUMERIC;
    v_final_score INT;
BEGIN
    SELECT readiness_t, readiness_c, readiness_a, readiness_e, readiness_r, readiness_m
    INTO v_t, v_c, v_a, v_e, v_r, v_m
    FROM public.student_profiles
    WHERE id = p_student_id;

    IF NOT FOUND THEN
        RETURN 0;
    END IF;

    SELECT COUNT(*) INTO v_skills_count FROM public.student_skill_completions WHERE student_id = p_student_id;
    SELECT COUNT(*) INTO v_labs_count FROM public.student_lab_completions WHERE student_id = p_student_id;
    SELECT COUNT(*) INTO v_attendance_count FROM public.placement_attendance WHERE student_id = p_student_id;

    -- Dynamic bonuses from verified work
    v_t := LEAST(100, v_t + LEAST(15, v_labs_count * 2 + v_skills_count));
    v_c := LEAST(100, v_c + LEAST(10, v_attendance_count / 3));

    -- Authoritative weighted index formula
    v_composite := (v_t * 0.25) + (v_c * 0.20) + (v_a * 0.15) + (v_e * 0.15) + (v_r * 0.15) + (v_m * 0.10);
    v_final_score := LEAST(1000, GREATEST(0, ROUND((v_composite * 8.5) + (v_labs_count * 8) + (v_skills_count * 3))));

    -- Upsert talent_scores table
    INSERT INTO public.talent_scores (
        student_id, talent_score, readiness_t, readiness_c, readiness_a, readiness_e, readiness_r, readiness_m, calculated_at
    )
    VALUES (
        p_student_id, v_final_score, v_t, v_c, v_a, v_e, v_r, v_m, now()
    )
    ON CONFLICT (student_id) DO UPDATE SET
        talent_score = EXCLUDED.talent_score,
        readiness_t = EXCLUDED.readiness_t,
        readiness_c = EXCLUDED.readiness_c,
        readiness_a = EXCLUDED.readiness_a,
        readiness_e = EXCLUDED.readiness_e,
        readiness_r = EXCLUDED.readiness_r,
        readiness_m = EXCLUDED.readiness_m,
        calculated_at = now();

    -- Update student_profiles snapshot
    UPDATE public.student_profiles
    SET talent_score = v_final_score,
        readiness_t = v_t,
        readiness_c = v_c,
        updated_at = now()
    WHERE id = p_student_id;

    RETURN v_final_score;
END;
$$;
