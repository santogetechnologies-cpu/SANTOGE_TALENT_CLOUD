-- ============================================================================
-- SantoGe Talent Cloud (STC) — Migration 009: Fix Permissions, Roles & Grants
--
-- This migration fixes:
-- 1. Explicit GRANT permissions on all public schema tables to authenticated & anon
-- 2. Non-recursive RLS policy on public.user_roles
-- 3. Security Definer RPC function public.get_my_role()
-- 4. Automatic user role sync trigger for auth.users
-- 5. Upsert super_admin role for known admin users and e6c4e39c-b521-4c37-96a1-be3720e57cb8
-- ============================================================================

-- 1. Ensure public schema usage and table grants for PostgREST
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 2. Helper functions with SECURITY DEFINER
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

GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;

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

-- 3. Fix user_roles RLS policies to prevent recursive loops
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

-- 4. Auth trigger to automatically assign role to any newly created auth user
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT := 'student';
BEGIN
  IF NEW.raw_user_meta_data->>'role' IN ('admin', 'super_admin') 
     OR NEW.email ILIKE '%admin%' THEN
    v_role := 'super_admin';
  END IF;

  INSERT INTO public.user_roles (auth_user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (auth_user_id) DO UPDATE SET role = EXCLUDED.role;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 5. Auto-sync existing auth.users to public.user_roles
INSERT INTO public.user_roles (auth_user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email ILIKE '%admin%' 
   OR raw_user_meta_data->>'role' IN ('admin', 'super_admin')
   OR id = 'e6c4e39c-b521-4c37-96a1-be3720e57cb8'
ON CONFLICT (auth_user_id) DO UPDATE SET role = 'super_admin';

-- Auto-sync remaining users as students if not already present
INSERT INTO public.user_roles (auth_user_id, role)
SELECT id, 'student'
FROM auth.users
WHERE id NOT IN (SELECT auth_user_id FROM public.user_roles)
ON CONFLICT (auth_user_id) DO NOTHING;

-- 6. Reload schema cache in PostgREST
NOTIFY pgrst, 'reload schema';
