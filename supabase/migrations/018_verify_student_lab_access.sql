-- ============================================================================
-- SantoGe Talent Cloud (STC) — Migration 018: Verify Student Lab Access RPC
--
-- Authoritatively checks if a student is assigned to a specific course lab/sandbox
-- environment before granting access or returning execution capabilities.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.verify_student_lab_access(p_student_id UUID, p_lab_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_assigned BOOLEAN := false;
BEGIN
    -- Verify caller authorization: caller must be an admin or the student themselves
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RETURN jsonb_build_object('allowed', false, 'error', 'Unauthorized');
    END IF;

    -- Admins have platform-wide access
    IF public.is_admin() THEN
        RETURN jsonb_build_object('allowed', true, 'is_admin', true);
    END IF;

    -- Check if student is assigned to this track/lab
    SELECT EXISTS (
        SELECT 1 FROM public.student_tracks
        WHERE student_id = p_student_id AND track_id = p_lab_id
    ) INTO v_is_assigned;

    IF NOT v_is_assigned THEN
        RETURN jsonb_build_object('allowed', false, 'error', 'Access Denied: Student is not assigned to course lab ' || p_lab_id);
    END IF;

    RETURN jsonb_build_object('allowed', true, 'student_id', p_student_id, 'lab_id', p_lab_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.verify_student_lab_access(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.verify_student_lab_access(UUID, TEXT) TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';
