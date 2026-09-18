-- =============================================================================
-- Migration 017: Grant Role Helpers to Anon
-- 
-- Ensures get_my_role() and is_admin() remain executable by anon, authenticated,
-- and service_role. Because get_my_role() safely uses COALESCE(..., 'student')
-- when auth.uid() is NULL, granting execute to anon prevents PostgREST from
-- throwing 401 Unauthorized errors during initial boot or when tokens expire.
-- =============================================================================

GRANT EXECUTE ON FUNCTION public.get_my_role() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
