-- ============================================================================
-- SantoGe Talent Cloud (STC) — Migration 009: Permissions, Roles & Grants Fix
--
-- Secure, Least-Privilege & Non-Recursive RLS
-- ============================================================================

-- 1. Secure Schema Grants (Least Privilege)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Authenticated application users get standard CRUD on RLS-governed tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- Anon gets only read access to public curriculum metadata
GRANT SELECT ON public.curriculum_tracks TO anon;
GRANT SELECT ON public.curriculum_skills TO anon;
GRANT SELECT ON public.content_items TO anon;

-- Default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated, service_role;

-- 2. Security Definer Helper Functions with explicit search_path
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

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles WHERE auth_user_id = auth.uid() LIMIT 1),
    'student'
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_my_role() TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.current_student_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT id FROM public.student_profiles
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.current_student_id() TO authenticated, service_role;

-- 3. Non-Recursive RLS Policies on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

CREATE POLICY "Users can read their own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Admins can manage user roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Secure Auth Trigger: Public signup ALWAYS creates role = 'student'
-- Admin roles must be explicitly granted through secure admin bootstrap or user_roles table.
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Default all new registrations strictly to student role
  INSERT INTO public.user_roles (auth_user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (auth_user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 5. Seed Super Admin Role explicitly for designated bootstrap user
INSERT INTO public.user_roles (auth_user_id, role)
VALUES ('e6c4e39c-b521-4c37-96a1-be3720e57cb8', 'super_admin')
ON CONFLICT (auth_user_id) DO UPDATE SET role = 'super_admin';

-- Ensure all other existing auth users have a role record (default to student)
INSERT INTO public.user_roles (auth_user_id, role)
SELECT id, 'student'
FROM auth.users
WHERE id NOT IN (SELECT auth_user_id FROM public.user_roles)
ON CONFLICT (auth_user_id) DO NOTHING;

-- 6. Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
