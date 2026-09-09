-- ============================================================================
-- SantoGe Talent Cloud (STC) — Migration 010: Admin Security & Edge Functions
-- ============================================================================

-- 1. Secure grant_admin_role: NEVER expose to anon or authenticated users
REVOKE EXECUTE ON FUNCTION public.grant_admin_role(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_admin_role(text) TO service_role;

-- 2. Ensure get_my_role and is_admin remain accessible for RLS evaluation
GRANT EXECUTE ON FUNCTION public.get_my_role() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_student_id() TO authenticated, service_role;

-- 3. Strict least privilege grants on public tables
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT SELECT ON public.curriculum_tracks TO anon;
GRANT SELECT ON public.curriculum_skills TO anon;
GRANT SELECT ON public.content_items TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- 4. Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
