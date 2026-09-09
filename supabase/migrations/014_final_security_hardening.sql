-- ============================================================================
-- SantoGe Talent Cloud (STC) — Migration 014: Final Security & Privilege Hardening
--
-- 1. Leaderboard & Analytics RPC Security: Revoke anonymous execute permissions
-- 2. Security Definer Audit: Enforce minimum execution roles & secure search_path
-- 3. Sensitive Table CRUD Hardening: Revoke direct client writes on RPC-governed tables
-- 4. Default Privilege Hardening: Least-privilege defaults for future objects
-- 5. Service Role Exclusivity: Administrative guarantees & schema cache reload
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 1. Leaderboard & Analytics RPC Security (Authenticated & Service Role Only)
-- -----------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.get_batch_leaderboard(UUID, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_batch_leaderboard(UUID, INT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_track_distribution() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_track_distribution() TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 2. Security Definer Authorization & Search Path Audit
-- -----------------------------------------------------------------------------
-- Super Admin Bootstrap: Service Role and Postgres execution ONLY
REVOKE EXECUTE ON FUNCTION public.bootstrap_super_admin(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_super_admin(TEXT) TO service_role;

-- Role resolution and admin check helpers
REVOKE EXECUTE ON FUNCTION public.get_my_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.current_student_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_student_id() TO authenticated, service_role;

-- Talent Score calculation: Authorized users and service role only
REVOKE EXECUTE ON FUNCTION public.calculate_talent_score(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.calculate_talent_score(UUID) TO authenticated, service_role;

-- Student Progress & Completion RPCs: Revoke from anon, grant to authenticated & service_role
REVOKE EXECUTE ON FUNCTION public.complete_student_placement_day(UUID, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_student_placement_day(UUID, INT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.complete_student_skill(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_student_skill(UUID, TEXT, TEXT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.complete_student_lab(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_student_lab(UUID, TEXT, TEXT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.complete_student_daily_step(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_student_daily_step(UUID, TEXT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.submit_student_assessment(UUID, INT, NUMERIC) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_student_assessment(UUID, INT, NUMERIC) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.complete_student_mock(UUID, TEXT, NUMERIC, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_student_mock(UUID, TEXT, NUMERIC, TEXT) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.issue_student_certificate(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.issue_student_certificate(UUID, TEXT) TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 3. Sensitive & RPC-Governed Table Privilege Hardening
--
-- Direct arbitrary writes (INSERT, UPDATE, DELETE) are revoked from authenticated
-- on tables whose lifecycle is strictly governed by authoritative RPCs or Edge Functions.
-- Authenticated users retain SELECT permissions governed by Row Level Security (RLS).
-- -----------------------------------------------------------------------------
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.talent_scores FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.student_certifications FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.student_assessments FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.student_mocks FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.student_skill_completions FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.student_lab_completions FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.student_daily_progress FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.placement_attendance FROM authenticated;

-- Ensure SELECT is permitted under RLS for authenticated clients
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.talent_scores TO authenticated;
GRANT SELECT ON public.student_certifications TO authenticated;
GRANT SELECT ON public.student_assessments TO authenticated;
GRANT SELECT ON public.student_mocks TO authenticated;
GRANT SELECT ON public.student_skill_completions TO authenticated;
GRANT SELECT ON public.student_lab_completions TO authenticated;
GRANT SELECT ON public.student_daily_progress TO authenticated;
GRANT SELECT ON public.placement_attendance TO authenticated;

-- Revoke all write privileges across public schema from anon
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;

-- -----------------------------------------------------------------------------
-- 4. Default Privilege Strategy (Least Privilege for Future Objects)
-- -----------------------------------------------------------------------------
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ROUTINES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

-- -----------------------------------------------------------------------------
-- 5. Service Role Administrative Privileges & Schema Cache Notification
-- -----------------------------------------------------------------------------
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

NOTIFY pgrst, 'reload schema';
