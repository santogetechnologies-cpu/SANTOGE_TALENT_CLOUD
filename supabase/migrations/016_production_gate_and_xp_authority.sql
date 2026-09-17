-- ============================================================================
-- SantoGe Talent Cloud (STC) — Migration 016: Production Gate & XP Authority
--
-- 1. Dual Completion Gate RPC: Authoritative calculation for 90-day placement + technical mastery
-- 2. Technical Day Atomic RPC: Secure student_technical_days mutations with +50 XP & Talent Score
-- 3. Hardened Table Privileges: Revoke direct writes on student_technical_days from authenticated
-- 4. XP Return Hardening: Ensure all student mutations return authoritative new XP & Talent Score
-- 5. Platform-Wide Talent Score Recalculation: Admin batch scoring engine
-- 6. Secure Profile Claim RPC: Allows authenticated user to link existing unlinked profile safely
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 1. Secure Student Profile Identity Claim RPC
-- Replaces unsafe browser-side updates to student_profiles.auth_user_id.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_student_profile()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_auth_uid UUID := auth.uid();
    v_email TEXT;
    v_profile_id UUID;
    v_existing_auth_uid UUID;
BEGIN
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User session required';
    END IF;

    SELECT email INTO v_email FROM auth.users WHERE id = v_auth_uid;
    IF v_email IS NULL THEN
        RAISE EXCEPTION 'No email associated with authenticated account';
    END IF;

    -- Check if student profile is already linked to this auth user
    SELECT id INTO v_profile_id
    FROM public.student_profiles
    WHERE auth_user_id = v_auth_uid;

    IF v_profile_id IS NOT NULL THEN
        RETURN jsonb_build_object('ok', true, 'profile_id', v_profile_id, 'linked', true);
    END IF;

    -- Look for unlinked profile matching email
    SELECT id, auth_user_id INTO v_profile_id, v_existing_auth_uid
    FROM public.student_profiles
    WHERE LOWER(email) = LOWER(TRIM(v_email))
      AND status = 'active'
    LIMIT 1;

    IF v_profile_id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'No active student profile found matching account email');
    END IF;

    IF v_existing_auth_uid IS NOT NULL AND v_existing_auth_uid <> v_auth_uid THEN
        RAISE EXCEPTION 'Profile is already claimed by another authenticated account';
    END IF;

    -- Safely link auth_user_id in SECURITY DEFINER context
    UPDATE public.student_profiles
    SET auth_user_id = v_auth_uid,
        updated_at = now()
    WHERE id = v_profile_id;

    RETURN jsonb_build_object('ok', true, 'profile_id', v_profile_id, 'linked', true);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_student_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_student_profile() TO authenticated, service_role;


-- -----------------------------------------------------------------------------
-- 2. Atomic Technical Day RPC (student_technical_days)
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
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    IF p_day < 1 OR p_day > 90 THEN
        RAISE EXCEPTION 'Invalid technical day: must be between 1 and 90';
    END IF;

    INSERT INTO public.student_technical_days (student_id, day, completed_at)
    VALUES (p_student_id, p_day, now())
    ON CONFLICT (student_id, day) DO NOTHING;

    GET DIAGNOSTICS v_row_count = ROW_COUNT;

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
        'talent_score', COALESCE(v_talent_score, 0)
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.complete_student_technical_day(UUID, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_student_technical_day(UUID, INT) TO authenticated, service_role;

-- Revoke direct writes on student_technical_days
REVOKE INSERT, UPDATE, DELETE ON public.student_technical_days FROM anon, authenticated;
GRANT SELECT ON public.student_technical_days TO authenticated;


-- -----------------------------------------------------------------------------
-- 3. Hardened Daily Step RPC returning Authoritative XP & Talent Score
-- -----------------------------------------------------------------------------
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
    v_already_done BOOLEAN := false;
    v_new_xp INT;
    v_talent_score INT;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT
        CASE
            WHEN p_step = 'english' THEN english_completed
            WHEN p_step = 'aptitude' THEN aptitude_completed
            WHEN p_step = 'practice' THEN practice_completed
            ELSE false
        END
    INTO v_already_done
    FROM public.student_daily_progress
    WHERE student_id = p_student_id AND date = v_today;

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

    IF NOT COALESCE(v_already_done, false) THEN
        UPDATE public.student_profiles
        SET xp = xp + 15,
            readiness_c = CASE WHEN p_step = 'english' THEN LEAST(100, readiness_c + 1) ELSE readiness_c END,
            readiness_a = CASE WHEN p_step = 'aptitude' THEN LEAST(100, readiness_a + 1) ELSE readiness_a END,
            readiness_e = CASE WHEN p_step = 'practice' THEN LEAST(100, readiness_e + 1) ELSE readiness_e END,
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
        'step', p_step,
        'date', v_today,
        'xp', v_new_xp,
        'talent_score', COALESCE(v_talent_score, 0)
    );
END;
$$;


-- -----------------------------------------------------------------------------
-- 4. Hardened Assessment Submission RPC returning Authoritative XP & Talent Score
-- -----------------------------------------------------------------------------
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
DECLARE
    v_exists BOOLEAN := false;
    v_new_xp INT;
    v_talent_score INT;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.student_assessments
        WHERE student_id = p_student_id AND day = p_day
    ) INTO v_exists;

    INSERT INTO public.student_assessments (student_id, day, score, submitted_at)
    VALUES (p_student_id, p_day, p_score, now())
    ON CONFLICT (student_id, day) DO UPDATE SET
        score = GREATEST(student_assessments.score, p_score),
        submitted_at = now();

    IF NOT v_exists THEN
        UPDATE public.student_profiles
        SET xp = xp + 40,
            readiness_a = LEAST(100, readiness_a + 3),
            updated_at = now()
        WHERE id = p_student_id
        RETURNING xp INTO v_new_xp;
    ELSE
        SELECT xp INTO v_new_xp FROM public.student_profiles WHERE id = p_student_id;
    END IF;

    PERFORM public.calculate_talent_score(p_student_id);
    SELECT talent_score INTO v_talent_score FROM public.student_profiles WHERE id = p_student_id;

    RETURN jsonb_build_object(
        'ok', true,
        'day', p_day,
        'score', p_score,
        'xp', v_new_xp,
        'talent_score', COALESCE(v_talent_score, 0)
    );
END;
$$;


-- -----------------------------------------------------------------------------
-- 5. Hardened Mock Interview Completion RPC returning Authoritative XP & Talent Score
-- -----------------------------------------------------------------------------
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
DECLARE
    v_exists BOOLEAN := false;
    v_new_xp INT;
    v_talent_score INT;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.student_mocks
        WHERE student_id = p_student_id AND mock_id = p_mock_id
    ) INTO v_exists;

    INSERT INTO public.student_mocks (student_id, mock_id, score, feedback_summary, completed_at)
    VALUES (p_student_id, p_mock_id, p_score, p_feedback, now())
    ON CONFLICT (student_id, mock_id) DO UPDATE SET
        score = GREATEST(student_mocks.score, p_score),
        feedback_summary = p_feedback,
        completed_at = now();

    IF NOT v_exists THEN
        UPDATE public.student_profiles
        SET xp = xp + 50,
            readiness_m = LEAST(100, readiness_m + 5),
            updated_at = now()
        WHERE id = p_student_id
        RETURNING xp INTO v_new_xp;
    ELSE
        SELECT xp INTO v_new_xp FROM public.student_profiles WHERE id = p_student_id;
    END IF;

    PERFORM public.calculate_talent_score(p_student_id);
    SELECT talent_score INTO v_talent_score FROM public.student_profiles WHERE id = p_student_id;

    RETURN jsonb_build_object(
        'ok', true,
        'mock_id', p_mock_id,
        'score', p_score,
        'xp', v_new_xp,
        'talent_score', COALESCE(v_talent_score, 0)
    );
END;
$$;


-- -----------------------------------------------------------------------------
-- 6. Hardened Certificate Issuance RPC returning Authoritative XP & Talent Score
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.issue_student_certificate(
    p_student_id UUID,
    p_label TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_row_count INT := 0;
    v_new_xp INT;
    v_talent_score INT;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO public.student_certifications (student_id, label, issued_at)
    VALUES (p_student_id, p_label, now())
    ON CONFLICT (student_id, label) DO NOTHING;

    GET DIAGNOSTICS v_row_count = ROW_COUNT;

    IF v_row_count > 0 THEN
        UPDATE public.student_profiles
        SET xp = xp + 100,
            readiness_r = LEAST(100, readiness_r + 5),
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
        'label', p_label,
        'xp', v_new_xp,
        'talent_score', COALESCE(v_talent_score, 0)
    );
END;
$$;


-- -----------------------------------------------------------------------------
-- 7. Platform-wide Talent Score Recalculation Engine (Admin Only)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.recalculate_all_talent_scores()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_rec RECORD;
    v_count INT := 0;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Forbidden: Administrator privileges required';
    END IF;

    FOR v_rec IN 
        SELECT id FROM public.student_profiles WHERE status = 'active'
    LOOP
        PERFORM public.calculate_talent_score(v_rec.id);
        v_count := v_count + 1;
    END LOOP;

    RETURN jsonb_build_object('ok', true, 'recalculated_count', v_count, 'timestamp', now());
END;
$$;

REVOKE EXECUTE ON FUNCTION public.recalculate_all_talent_scores() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.recalculate_all_talent_scores() TO authenticated, service_role;


-- -----------------------------------------------------------------------------
-- 8. Authoritative Dual Completion Gate Evaluator
-- Business Rule:
-- Gate Unlocked = placement_day >= 90 AND technical_mastery_complete === true
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_student_completion_gate(p_student_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    v_profile RECORD;
    v_placement_days_completed INT;
    v_placement_complete BOOLEAN;
    v_completion_rule TEXT := 'primary-plus-minimum';
    v_secondary_min INT := 50;
    v_track RECORD;
    v_track_index INT := 0;
    v_track_pct NUMERIC;
    v_track_required NUMERIC;
    v_track_passed BOOLEAN;
    v_all_technical_passed BOOLEAN := true;
    v_has_tracks BOOLEAN := false;
    v_tracks_arr JSONB := '[]'::jsonb;
    v_gate_unlocked BOOLEAN := false;
    v_completed_skills_count INT;
    v_total_skills_count INT;
BEGIN
    -- Authorization check
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Fetch student profile
    SELECT id, placement_day, talent_score, status
    INTO v_profile
    FROM public.student_profiles
    WHERE id = p_student_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('ok', false, 'error', 'Student not found');
    END IF;

    -- Fetch platform settings rule
    SELECT 
        COALESCE(completion_rule, 'primary-plus-minimum'),
        COALESCE(secondary_minimum, 50)
    INTO v_completion_rule, v_secondary_min
    FROM public.platform_settings
    LIMIT 1;

    -- Placement Gate: 90/90 days completed
    SELECT COUNT(*) INTO v_placement_days_completed
    FROM public.placement_attendance
    WHERE student_id = p_student_id;

    v_placement_complete := (v_profile.placement_day >= 90 OR v_placement_days_completed >= 90);

    -- Technical Gate: evaluate assigned tracks
    FOR v_track IN
        SELECT st.track_id, st.position, ct.name AS track_name, COALESCE(ct.total_skills, 30) AS total_skills
        FROM public.student_tracks st
        LEFT JOIN public.curriculum_tracks ct ON ct.id = st.track_id
        WHERE st.student_id = p_student_id
        ORDER BY st.position ASC
    LOOP
        v_has_tracks := true;
        v_track_index := v_track_index + 1;

        -- Count completed skills for this track
        SELECT COUNT(DISTINCT skill_id) INTO v_completed_skills_count
        FROM public.student_skill_completions
        WHERE student_id = p_student_id AND track_id = v_track.track_id;

        v_total_skills_count := GREATEST(1, v_track.total_skills);
        v_track_pct := LEAST(100, ROUND((v_completed_skills_count::NUMERIC / v_total_skills_count::NUMERIC) * 100));

        IF v_track_index = 1 THEN
            v_track_required := 100;
        ELSIF v_completion_rule = 'all-tracks' THEN
            v_track_required := 100;
        ELSE
            v_track_required := v_secondary_min;
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

    -- AUTHORITATIVE DUAL GATE EVALUATION
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
-- 9. Notify PostgREST Schema Cache
-- -----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
