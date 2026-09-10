-- ============================================================================
-- SantoGe Talent Cloud (STC) — Migration 015: Admin-Assigned Student Tracks Enforcement
--
-- 1. Strict RLS on student_tracks:
--    - Students: SELECT ONLY on their own assigned tracks
--    - Students: Direct INSERT, UPDATE, DELETE strictly DENIED
--    - Admins / Super Admins: Full CRUD management access
--    - Service Role: Full controlled access for Edge Functions
-- 2. Sensitive RPC Hardening:
--    - complete_student_skill: Verifies student is assigned to track before granting XP
--    - complete_student_lab: Verifies student is assigned to track before granting XP
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 1. Replace student_tracks RLS Policies
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Students can manage their own tracks" ON public.student_tracks;
DROP POLICY IF EXISTS "Students can read their own tracks" ON public.student_tracks;
DROP POLICY IF EXISTS "Students can read own assigned tracks" ON public.student_tracks;
DROP POLICY IF EXISTS "Admins can manage student tracks" ON public.student_tracks;

-- Student SELECT: Own assigned tracks only (or admin)
CREATE POLICY "Students can read own assigned tracks"
    ON public.student_tracks FOR SELECT
    TO authenticated
    USING (student_id = public.current_student_id() OR public.is_admin());

-- Admin CRUD: Full management permission for admins only
CREATE POLICY "Admins can manage student tracks"
    ON public.student_tracks FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- Table-level privileges: Revoke direct client write privileges from authenticated
REVOKE INSERT, UPDATE, DELETE ON public.student_tracks FROM authenticated;
GRANT SELECT ON public.student_tracks TO authenticated;
GRANT ALL ON public.student_tracks TO service_role;

-- -----------------------------------------------------------------------------
-- 2. Hardened RPC: complete_student_skill (Track Assignment Enforcement)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_student_skill(p_student_id UUID, p_skill_id TEXT, p_track_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_xp INT; v_row_count INT := 0;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Enforce track assignment for non-admins
    IF NOT public.is_admin() THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.student_tracks
            WHERE student_id = p_student_id AND track_id = p_track_id
        ) THEN
            RAISE EXCEPTION 'Access Denied: Student is not assigned to course track %', p_track_id;
        END IF;
    END IF;

    INSERT INTO public.student_skill_completions (student_id, skill_id, track_id, completed_at)
    VALUES (p_student_id, p_skill_id, p_track_id, now())
    ON CONFLICT (student_id, skill_id) DO NOTHING;

    GET DIAGNOSTICS v_row_count = ROW_COUNT;

    IF v_row_count > 0 THEN
        UPDATE public.student_profiles
        SET xp = xp + 30, readiness_t = LEAST(100, readiness_t + 2), updated_at = now()
        WHERE id = p_student_id
        RETURNING xp INTO v_new_xp;

        PERFORM public.calculate_talent_score(p_student_id);
    ELSE
        SELECT xp INTO v_new_xp FROM public.student_profiles WHERE id = p_student_id;
    END IF;

    RETURN jsonb_build_object('ok', true, 'student_id', p_student_id, 'skill_id', p_skill_id, 'xp', v_new_xp);
END;
$$;

-- -----------------------------------------------------------------------------
-- 3. Hardened RPC: complete_student_lab (Track Assignment Enforcement)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_student_lab(p_student_id UUID, p_lab_id TEXT, p_label TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_xp INT; v_row_count INT := 0;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Enforce track assignment for non-admins
    IF NOT public.is_admin() THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.student_tracks
            WHERE student_id = p_student_id AND track_id = p_lab_id
        ) THEN
            RAISE EXCEPTION 'Access Denied: Student is not assigned to course lab %', p_lab_id;
        END IF;
    END IF;

    INSERT INTO public.student_lab_completions (student_id, lab_id, label, completed_at)
    VALUES (p_student_id, p_lab_id, p_label, now())
    ON CONFLICT (student_id, lab_id) DO NOTHING;

    GET DIAGNOSTICS v_row_count = ROW_COUNT;

    IF v_row_count > 0 THEN
        UPDATE public.student_profiles
        SET xp = xp + 50, readiness_t = LEAST(100, readiness_t + 3), updated_at = now()
        WHERE id = p_student_id
        RETURNING xp INTO v_new_xp;

        PERFORM public.calculate_talent_score(p_student_id);
    ELSE
        SELECT xp INTO v_new_xp FROM public.student_profiles WHERE id = p_student_id;
    END IF;

    RETURN jsonb_build_object('ok', true, 'student_id', p_student_id, 'lab_id', p_lab_id, 'xp', v_new_xp);
END;
$$;

NOTIFY pgrst, 'reload schema';
