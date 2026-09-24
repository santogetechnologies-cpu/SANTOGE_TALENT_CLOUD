-- ============================================================================
-- SantoGe Talent Cloud (STC) — Migration 019: Restore Student Profile Security
--
-- Security Fix #1: Protect privileged & derived fields on student_profiles.
--
-- Protected fields:
--   - xp
--   - talent_score
--   - placement_day
--   - status
--   - institution_id
--   - batch_id
--   - auth_user_id
--
-- Security Model:
-- 1. Admins (public.is_admin()) and service_role retain full update authority.
-- 2. Trusted backend RPC functions are allowed to mutate privileged fields
--    (complete_student_placement_day, complete_student_skill, complete_student_lab,
--     complete_student_daily_step, submit_student_assessment, complete_student_mock,
--     issue_student_certificate, complete_student_technical_day, calculate_talent_score,
--     claim_student_profile, recalculate_all_talent_scores).
-- 3. Non-admin / student direct client updates attempting to modify ANY of the
--    7 privileged fields are strictly REJECTED with an exception.
-- 4. Legitimate self-service fields (name, roll_no, dept, college, readiness_t,
--    readiness_c, readiness_a, readiness_e, readiness_r, readiness_m, streak,
--    updated_at) remain freely editable by students.
-- ============================================================================

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
    IF v_context ~* '\m(complete_student_placement_day|complete_student_skill|complete_student_lab|complete_student_daily_step|submit_student_assessment|complete_student_mock|issue_student_certificate|complete_student_technical_day|calculate_talent_score|claim_student_profile|recalculate_all_talent_scores)\M' THEN
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

    -- Legitimate self-service fields pass through
    RETURN NEW;
END;
$$;

-- Ensure trigger exists on public.student_profiles
DROP TRIGGER IF EXISTS trg_student_profile_security ON public.student_profiles;
CREATE TRIGGER trg_student_profile_security
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.check_student_profile_update();

-- Ensure execution privileges
GRANT EXECUTE ON FUNCTION public.check_student_profile_update() TO anon, authenticated, service_role;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
