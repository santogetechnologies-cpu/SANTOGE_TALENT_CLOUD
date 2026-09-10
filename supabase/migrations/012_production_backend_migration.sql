-- ============================================================================
-- SantoGe Talent Cloud (STC) — Migration 012: Production Backend Hardening
--
-- 1. Dynamic Super Admin Bootstrap (Zero hardcoded UUIDs)
-- 2. Authoritative Batch Leaderboard RPC (Deterministic DENSE_RANK, privacy safe)
-- 3. Live Track Distribution RPC (SQL aggregated from student_tracks)
-- 4. Table Privilege & RLS Hardening (Revoke unsafe client-side mutations)
-- ============================================================================

-- 1. Dynamic Super Admin Bootstrap Function (Executed via service_role or SQL Editor)
CREATE OR REPLACE FUNCTION public.bootstrap_super_admin(p_email TEXT)
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
        VALUES (v_user_id, 'super_admin')
        ON CONFLICT (auth_user_id) DO UPDATE SET role = 'super_admin';
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.bootstrap_super_admin(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_super_admin(TEXT) TO service_role;

-- 2. Authoritative Batch Leaderboard RPC (Privacy-Preserving & Deterministic Ranking)
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

-- 3. Live Track Distribution RPC (Aggregated from student_tracks)
CREATE OR REPLACE FUNCTION public.get_track_distribution()
RETURNS TABLE (
    track_id TEXT,
    track_name TEXT,
    student_count BIGINT,
    percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
    v_total BIGINT;
BEGIN
    SELECT COUNT(*) INTO v_total FROM public.student_tracks;
    RETURN QUERY
    SELECT 
        st.track_id::TEXT,
        COALESCE(ct.name, st.track_id::TEXT) AS track_name,
        COUNT(st.student_id) AS student_count,
        CASE WHEN v_total > 0 THEN ROUND((COUNT(st.student_id)::NUMERIC / v_total::NUMERIC) * 100, 1) ELSE 0 END AS percentage
    FROM public.student_tracks st
    LEFT JOIN public.curriculum_tracks ct ON ct.id = st.track_id
    GROUP BY st.track_id, ct.name
    ORDER BY student_count DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_track_distribution() TO anon, authenticated, service_role;

-- 4. Harden Table Privileges on Sensitive Tables
-- Revoke direct arbitrary write privileges on user_roles and talent_scores for authenticated users
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.talent_scores FROM authenticated;

-- Allow authenticated users to read roles & talent scores via RLS
GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT ON public.talent_scores TO authenticated;

-- Ensure service_role maintains full administrative privileges
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- 5. Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
