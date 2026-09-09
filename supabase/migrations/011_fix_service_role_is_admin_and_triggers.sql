-- ============================================================================
-- SantoGe Talent Cloud (STC) — Migration 011: Allow service_role in is_admin and profile triggers
-- ============================================================================

-- 1. Update is_admin() to recognize service_role / server-side Edge Functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT coalesce(
    coalesce(auth.role(), '') = 'service_role'
    OR coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
    OR coalesce(current_setting('role', true), '') = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE auth_user_id = auth.uid()
        AND role IN ('admin', 'super_admin')
    ),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

-- 2. Update check_student_profile_update() to allow service_role and admins to update institutional fields
CREATE OR REPLACE FUNCTION public.check_student_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If caller is admin or service_role, allow all updates (including auth_user_id and batch_id)
    IF coalesce(public.is_admin(), false) OR coalesce(auth.role(), '') = 'service_role' OR coalesce(current_setting('role', true), '') = 'service_role' THEN
        RETURN NEW;
    END IF;

    -- Students / non-admins cannot alter institutional batch identity, status, or auth link
    IF NEW.status IS DISTINCT FROM OLD.status OR
       NEW.institution_id IS DISTINCT FROM OLD.institution_id OR
       NEW.batch_id IS DISTINCT FROM OLD.batch_id OR
       NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id THEN
        RAISE EXCEPTION 'Students cannot directly modify institutional batch identity or auth link';
    END IF;

    RETURN NEW;
END;
$$;

-- 3. Ensure student_profiles.auth_user_id is nullable
ALTER TABLE public.student_profiles ALTER COLUMN auth_user_id DROP NOT NULL;

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
