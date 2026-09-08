-- ============================================================================
-- Migration: 008_security_and_idempotency_fixes.sql
-- Description: Applies updated is_admin() role security, student profile update
--              privilege protection trigger, and idempotent RPC replacements.
-- ============================================================================

-- 1. Hardened is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE auth_user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
  );
$$;

-- 2. Profile Privilege Escalation Protection Trigger
CREATE OR REPLACE FUNCTION public.check_student_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        IF NEW.talent_score IS DISTINCT FROM OLD.talent_score OR
           NEW.xp IS DISTINCT FROM OLD.xp OR
           NEW.placement_day IS DISTINCT FROM OLD.placement_day OR
           NEW.status IS DISTINCT FROM OLD.status OR
           NEW.institution_id IS DISTINCT FROM OLD.institution_id OR
           NEW.batch_id IS DISTINCT FROM OLD.batch_id OR
           NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id THEN
            RAISE EXCEPTION 'Students cannot directly modify privileged profile attributes';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_student_profile_security ON public.student_profiles;
CREATE TRIGGER trg_student_profile_security
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.check_student_profile_update();

-- 3. Super Admin Bootstrap Helper
CREATE OR REPLACE FUNCTION public.grant_admin_role(p_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = LOWER(TRIM(p_email));
    IF v_user_id IS NOT NULL THEN
        INSERT INTO public.user_roles (auth_user_id, role)
        VALUES (v_user_id, 'admin')
        ON CONFLICT (auth_user_id) DO UPDATE SET role = 'admin';
    END IF;
END;
$$;
