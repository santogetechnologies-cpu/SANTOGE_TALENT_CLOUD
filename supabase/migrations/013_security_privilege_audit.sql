-- ============================================================================
-- SantoGe Talent Cloud (STC) — Migration 013: Security & Privilege Audit
--
-- 1. Refine Leaderboard Ranking: DENSE_RANK strictly on talent_score DESC for correct tie handling
-- 2. Restrict Super Admin Bootstrap execution to service_role only
-- 3. Revoke unsafe client modifications on administrative tables
-- 4. Ensure PostgREST schema cache is reloaded
-- ============================================================================

-- 1. Authoritative Batch Leaderboard RPC with correct tie handling
CREATE OR REPLACE FUNCTION public.get_batch_leaderboard(
    p_batch_id UUID,
    p_limit INT DEFAULT 50
)
RETURNS TABLE (
    student_id UUID,
    name TEXT,
    talent_score INT,
    rank BIGINT,
    batch_id UUID
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT 
        sp.id AS student_id,
        sp.name,
        COALESCE(sp.talent_score, 0)::INT AS talent_score,
        DENSE_RANK() OVER (ORDER BY COALESCE(sp.talent_score, 0) DESC) AS rank,
        sp.batch_id
    FROM public.student_profiles sp
    WHERE sp.batch_id = p_batch_id
      AND sp.status = 'active'
    ORDER BY rank ASC, sp.name ASC
    LIMIT GREATEST(1, LEAST(p_limit, 200));
$$;

GRANT EXECUTE ON FUNCTION public.get_batch_leaderboard(UUID, INT) TO anon, authenticated, service_role;

-- 2. Ensure Super Admin Bootstrap is strictly service_role only
REVOKE EXECUTE ON FUNCTION public.bootstrap_super_admin(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_super_admin(TEXT) TO service_role;

-- 3. Hardening: Revoke direct anonymous writes across all public tables
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;

-- 4. Hardening: Ensure user_roles and talent_scores cannot be written directly by authenticated users
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.talent_scores FROM authenticated;

-- Authenticated users retain SELECT permissions governed by RLS
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.talent_scores TO authenticated;

-- Ensure service_role maintains full administrative privileges
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- 5. Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
