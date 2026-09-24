-- ============================================================================
-- SantoGe Talent Cloud (STC) — Migration 020: Secure calculate_talent_score RPC
--
-- Security Fix #2: Enforce strict caller authorization in calculate_talent_score
--
-- Authorization Model:
-- 1. service_role / background processes: ALLOW
-- 2. Admin / Super Admin (public.is_admin()): ALLOW
-- 3. Normal Student: ALLOW ONLY if p_student_id = public.current_student_id()
--    (i.e. student_profiles.auth_user_id = auth.uid())
-- 4. Otherwise: REJECT with controlled exception:
--    'Access Denied: You are not authorized to calculate talent score for student %'
-- 5. Non-existent student: REJECT with controlled exception:
--    'Student profile not found for id %'
--
-- Scoring algorithm, weighting index, bonus points, and table updates
-- remain 100% UNCHANGED.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calculate_talent_score(p_student_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_t INT; v_c INT; v_a INT; v_e INT; v_r INT; v_m INT;
    v_calculated_score INT;
    v_comp_count INT;
    v_bonus INT := 0;
    v_is_authorized BOOLEAN := false;
BEGIN
    -- 1. Strict caller authorization: service_role, admin/super_admin, or student owner
    IF coalesce(auth.role(), '') = 'service_role'
       OR coalesce(current_setting('role', true), '') = 'service_role'
       OR coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
       OR coalesce(public.is_admin(), false) THEN
        v_is_authorized := true;
    ELSIF p_student_id IS NOT NULL AND p_student_id = public.current_student_id() THEN
        v_is_authorized := true;
    END IF;

    IF NOT v_is_authorized THEN
        RAISE EXCEPTION 'Access Denied: You are not authorized to calculate talent score for student %', p_student_id;
    END IF;

    -- 2. Fetch readiness snapshot from student_profiles
    SELECT readiness_t, readiness_c, readiness_a, readiness_e, readiness_r, readiness_m
    INTO v_t, v_c, v_a, v_e, v_r, v_m
    FROM public.student_profiles
    WHERE id = p_student_id;

    IF NOT FOUND OR v_t IS NULL THEN
        RAISE EXCEPTION 'Student profile not found for id %', p_student_id;
    END IF;

    -- 3. Exact existing scoring calculation (UNMODIFIED)
    SELECT COUNT(*) INTO v_comp_count
    FROM public.student_skill_completions
    WHERE student_id = p_student_id;

    v_bonus := LEAST(50, v_comp_count * 2);

    v_calculated_score := ROUND(
        (v_t * 0.25 + v_c * 0.20 + v_a * 0.15 + v_e * 0.15 + v_r * 0.15 + v_m * 0.10) * 9.5
    ) + v_bonus;

    v_calculated_score := GREATEST(0, LEAST(1000, v_calculated_score));

    -- Update student_profiles snapshot
    UPDATE public.student_profiles
    SET talent_score = v_calculated_score, updated_at = now()
    WHERE id = p_student_id;

    -- Upsert talent_scores table
    INSERT INTO public.talent_scores (
        student_id, talent_score, readiness_t, readiness_c, readiness_a, readiness_e, readiness_r, readiness_m, calculated_at
    )
    VALUES (
        p_student_id, v_calculated_score, v_t, v_c, v_a, v_e, v_r, v_m, now()
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

    RETURN v_calculated_score;
END;
$$;

-- Ensure execution privileges
REVOKE EXECUTE ON FUNCTION public.calculate_talent_score(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.calculate_talent_score(UUID) TO authenticated, service_role;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
