-- ============================================================================
-- SantoGe Talent Cloud (STC) — Full Master Supabase Setup Script
--
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/ylofqmmbwgrqtsrclnww/sql/new
-- 2. Paste this ENTIRE file into the SQL Editor.
-- 3. Click "Run" (or press Ctrl+Enter / Cmd+Enter).
-- ============================================================================

-- ============================================================================
-- 1. CORE SCHEMA (Institutions, Batches, Roles, Profiles, Tracks, Settings)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    capacity INT NOT NULL DEFAULT 300 CHECK (capacity > 0),
    dept TEXT NOT NULL DEFAULT 'Engineering',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'super_admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE SET NULL,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    roll_no TEXT,
    dept TEXT NOT NULL DEFAULT 'CSE',
    college TEXT NOT NULL DEFAULT 'Partner Engineering College',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    xp INT NOT NULL DEFAULT 0 CHECK (xp >= 0),
    streak INT NOT NULL DEFAULT 0 CHECK (streak >= 0),
    placement_day INT NOT NULL DEFAULT 1 CHECK (placement_day BETWEEN 1 AND 90),
    talent_score INT NOT NULL DEFAULT 0 CHECK (talent_score BETWEEN 0 AND 1000),
    readiness_t INT NOT NULL DEFAULT 50 CHECK (readiness_t BETWEEN 0 AND 100),
    readiness_c INT NOT NULL DEFAULT 50 CHECK (readiness_c BETWEEN 0 AND 100),
    readiness_a INT NOT NULL DEFAULT 50 CHECK (readiness_a BETWEEN 0 AND 100),
    readiness_e INT NOT NULL DEFAULT 50 CHECK (readiness_e BETWEEN 0 AND 100),
    readiness_r INT NOT NULL DEFAULT 50 CHECK (readiness_r BETWEEN 0 AND 100),
    readiness_m INT NOT NULL DEFAULT 50 CHECK (readiness_m BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    track_id TEXT NOT NULL,
    position INT NOT NULL DEFAULT 1 CHECK (position BETWEEN 1 AND 3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_track UNIQUE (student_id, track_id)
);

CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. CURRICULUM SCHEMA
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.curriculum_tracks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    category TEXT NOT NULL,
    total_skills INT NOT NULL DEFAULT 30,
    accent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.curriculum_skills (
    id TEXT PRIMARY KEY,
    track_id TEXT NOT NULL REFERENCES public.curriculum_tracks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    day INT NOT NULL CHECK (day > 0),
    type TEXT NOT NULL CHECK (type IN ('video', 'lab', 'quiz', 'project')),
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.student_skill_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL,
    track_id TEXT NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_skill UNIQUE (student_id, skill_id)
);

CREATE TABLE IF NOT EXISTS public.student_lab_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    lab_id TEXT NOT NULL,
    label TEXT NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_lab UNIQUE (student_id, lab_id)
);

CREATE TABLE IF NOT EXISTS public.student_daily_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    english_completed BOOLEAN NOT NULL DEFAULT false,
    aptitude_completed BOOLEAN NOT NULL DEFAULT false,
    practice_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_daily UNIQUE (student_id, date)
);

-- ============================================================================
-- 3. PLACEMENT ACCELERATOR & TALENT SCHEMA
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.placement_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    day INT NOT NULL CHECK (day BETWEEN 1 AND 90),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_placement_day UNIQUE (student_id, day)
);

CREATE TABLE IF NOT EXISTS public.student_technical_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    day INT NOT NULL CHECK (day BETWEEN 1 AND 90),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_tech_day UNIQUE (student_id, day)
);

CREATE TABLE IF NOT EXISTS public.student_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    day INT NOT NULL CHECK (day IN (30, 60, 90)),
    score NUMERIC(5, 2) NOT NULL CHECK (score BETWEEN 0 AND 100),
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_assessment_day UNIQUE (student_id, day)
);

CREATE TABLE IF NOT EXISTS public.student_mocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    mock_id TEXT NOT NULL,
    score NUMERIC(5, 2) NOT NULL CHECK (score BETWEEN 0 AND 100),
    feedback_summary TEXT,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_mock UNIQUE (student_id, mock_id)
);

CREATE TABLE IF NOT EXISTS public.student_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_student_cert UNIQUE (student_id, label)
);

CREATE TABLE IF NOT EXISTS public.hiring_drives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company TEXT NOT NULL,
    roles TEXT NOT NULL,
    ctc TEXT NOT NULL,
    min_score INT NOT NULL DEFAULT 650 CHECK (min_score BETWEEN 0 AND 1000),
    open_slots INT NOT NULL DEFAULT 50 CHECK (open_slots > 0),
    status TEXT NOT NULL DEFAULT 'Active Drive' CHECK (status IN ('Active Drive', 'Shortlisting', 'Interviews Live', 'Closed')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    offer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    package_lpa NUMERIC(5, 2) NOT NULL CHECK (package_lpa > 0),
    status TEXT NOT NULL DEFAULT 'offered' CHECK (status IN ('offered', 'accepted', 'declined')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.talent_scores (
    student_id UUID PRIMARY KEY REFERENCES public.student_profiles(id) ON DELETE CASCADE,
    talent_score INT NOT NULL DEFAULT 0 CHECK (talent_score BETWEEN 0 AND 1000),
    readiness_t INT NOT NULL DEFAULT 50 CHECK (readiness_t BETWEEN 0 AND 100),
    readiness_c INT NOT NULL DEFAULT 50 CHECK (readiness_c BETWEEN 0 AND 100),
    readiness_a INT NOT NULL DEFAULT 50 CHECK (readiness_a BETWEEN 0 AND 100),
    readiness_e INT NOT NULL DEFAULT 50 CHECK (readiness_e BETWEEN 0 AND 100),
    readiness_r INT NOT NULL DEFAULT 50 CHECK (readiness_r BETWEEN 0 AND 100),
    readiness_m INT NOT NULL DEFAULT 50 CHECK (readiness_m BETWEEN 0 AND 100),
    calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 4. CONTENT CMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('English video', 'Aptitude video', 'Guided practice', 'Lab brief')),
    track TEXT NOT NULL DEFAULT 'All tracks',
    duration TEXT NOT NULL DEFAULT '10m',
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'draft', 'scheduled')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) & POLICIES
-- ============================================================================

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

GRANT EXECUTE ON FUNCTION public.current_student_id() TO anon, authenticated, service_role;

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skill_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_lab_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_technical_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_mocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hiring_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Institutions are readable by authenticated users" ON public.institutions;
    DROP POLICY IF EXISTS "Institutions are manageable by Admins" ON public.institutions;
    DROP POLICY IF EXISTS "Batches are readable by authenticated users" ON public.batches;
    DROP POLICY IF EXISTS "Batches are manageable by Admins" ON public.batches;
    DROP POLICY IF EXISTS "Users can read their own role" ON public.user_roles;
    DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
    DROP POLICY IF EXISTS "Students can read their own profile" ON public.student_profiles;
    DROP POLICY IF EXISTS "Students can update their own permitted profile fields" ON public.student_profiles;
    DROP POLICY IF EXISTS "Admins can manage all student profiles" ON public.student_profiles;
    DROP POLICY IF EXISTS "Students can read their own tracks" ON public.student_tracks;
    DROP POLICY IF EXISTS "Students can manage their own tracks" ON public.student_tracks;
    DROP POLICY IF EXISTS "Students can read own assigned tracks" ON public.student_tracks;
    DROP POLICY IF EXISTS "Admins can manage student tracks" ON public.student_tracks;
    DROP POLICY IF EXISTS "Settings readable by authenticated users" ON public.platform_settings;
    DROP POLICY IF EXISTS "Settings manageable by Admins" ON public.platform_settings;
    DROP POLICY IF EXISTS "Curriculum tracks readable by all authenticated" ON public.curriculum_tracks;
    DROP POLICY IF EXISTS "Curriculum tracks manageable by Admins" ON public.curriculum_tracks;
    DROP POLICY IF EXISTS "Curriculum skills readable by all authenticated" ON public.curriculum_skills;
    DROP POLICY IF EXISTS "Curriculum skills manageable by Admins" ON public.curriculum_skills;
    DROP POLICY IF EXISTS "Skill completions own or admin" ON public.student_skill_completions;
    DROP POLICY IF EXISTS "Lab completions own or admin" ON public.student_lab_completions;
    DROP POLICY IF EXISTS "Daily progress own or admin" ON public.student_daily_progress;
    DROP POLICY IF EXISTS "Placement attendance own or admin" ON public.placement_attendance;
    DROP POLICY IF EXISTS "Tech days own or admin" ON public.student_technical_days;
    DROP POLICY IF EXISTS "Assessments own or admin" ON public.student_assessments;
    DROP POLICY IF EXISTS "Mocks own or admin" ON public.student_mocks;
    DROP POLICY IF EXISTS "Certificates own or admin" ON public.student_certifications;
    DROP POLICY IF EXISTS "Hiring drives readable by authenticated" ON public.hiring_drives;
    DROP POLICY IF EXISTS "Hiring drives manageable by Admins" ON public.hiring_drives;
    DROP POLICY IF EXISTS "Placements readable by own student or admin" ON public.placements;
    DROP POLICY IF EXISTS "Placements manageable by Admins" ON public.placements;
    DROP POLICY IF EXISTS "Talent scores readable by authenticated" ON public.talent_scores;
    DROP POLICY IF EXISTS "Talent scores manageable by Admins or system" ON public.talent_scores;
    DROP POLICY IF EXISTS "Published content items readable by authenticated" ON public.content_items;
    DROP POLICY IF EXISTS "Content items manageable by Admins" ON public.content_items;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Institutions are readable by authenticated users" ON public.institutions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Institutions are manageable by Admins" ON public.institutions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Batches are readable by authenticated users" ON public.batches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Batches are manageable by Admins" ON public.batches FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Users can read their own role" ON public.user_roles FOR SELECT TO authenticated USING (auth_user_id = auth.uid());
CREATE POLICY "Admins can manage user roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Students can read their own profile" ON public.student_profiles FOR SELECT TO authenticated USING (auth_user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Students can update their own permitted profile fields" ON public.student_profiles FOR UPDATE TO authenticated USING (auth_user_id = auth.uid() OR public.is_admin()) WITH CHECK (auth_user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Admins can manage all student profiles" ON public.student_profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Students can read own assigned tracks" ON public.student_tracks FOR SELECT TO authenticated USING (student_id = public.current_student_id() OR public.is_admin());
CREATE POLICY "Admins can manage student tracks" ON public.student_tracks FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
REVOKE INSERT, UPDATE, DELETE ON public.student_tracks FROM authenticated;
GRANT SELECT ON public.student_tracks TO authenticated;
GRANT ALL ON public.student_tracks TO service_role;

CREATE POLICY "Settings readable by authenticated users" ON public.platform_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Settings manageable by Admins" ON public.platform_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Curriculum tracks readable by all authenticated" ON public.curriculum_tracks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Curriculum tracks manageable by Admins" ON public.curriculum_tracks FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Curriculum skills readable by all authenticated" ON public.curriculum_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Curriculum skills manageable by Admins" ON public.curriculum_skills FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Skill completions own or admin" ON public.student_skill_completions FOR ALL TO authenticated USING (student_id = public.current_student_id() OR public.is_admin()) WITH CHECK (student_id = public.current_student_id() OR public.is_admin());
CREATE POLICY "Lab completions own or admin" ON public.student_lab_completions FOR ALL TO authenticated USING (student_id = public.current_student_id() OR public.is_admin()) WITH CHECK (student_id = public.current_student_id() OR public.is_admin());
CREATE POLICY "Daily progress own or admin" ON public.student_daily_progress FOR ALL TO authenticated USING (student_id = public.current_student_id() OR public.is_admin()) WITH CHECK (student_id = public.current_student_id() OR public.is_admin());
CREATE POLICY "Placement attendance own or admin" ON public.placement_attendance FOR ALL TO authenticated USING (student_id = public.current_student_id() OR public.is_admin()) WITH CHECK (student_id = public.current_student_id() OR public.is_admin());
CREATE POLICY "Tech days own or admin" ON public.student_technical_days FOR ALL TO authenticated USING (student_id = public.current_student_id() OR public.is_admin()) WITH CHECK (student_id = public.current_student_id() OR public.is_admin());
CREATE POLICY "Assessments own or admin" ON public.student_assessments FOR ALL TO authenticated USING (student_id = public.current_student_id() OR public.is_admin()) WITH CHECK (student_id = public.current_student_id() OR public.is_admin());
CREATE POLICY "Mocks own or admin" ON public.student_mocks FOR ALL TO authenticated USING (student_id = public.current_student_id() OR public.is_admin()) WITH CHECK (student_id = public.current_student_id() OR public.is_admin());
CREATE POLICY "Certificates own or admin" ON public.student_certifications FOR ALL TO authenticated USING (student_id = public.current_student_id() OR public.is_admin()) WITH CHECK (student_id = public.current_student_id() OR public.is_admin());

CREATE POLICY "Hiring drives readable by authenticated" ON public.hiring_drives FOR SELECT TO authenticated USING (true);
CREATE POLICY "Hiring drives manageable by Admins" ON public.hiring_drives FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Placements readable by own student or admin" ON public.placements FOR SELECT TO authenticated USING (student_id = public.current_student_id() OR public.is_admin());
CREATE POLICY "Placements manageable by Admins" ON public.placements FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Talent scores readable by authenticated" ON public.talent_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Talent scores manageable by Admins or system" ON public.talent_scores FOR ALL TO authenticated USING (public.is_admin() OR student_id = public.current_student_id()) WITH CHECK (public.is_admin() OR student_id = public.current_student_id());

CREATE POLICY "Published content items readable by authenticated" ON public.content_items FOR SELECT TO authenticated USING (status = 'published' OR public.is_admin());
CREATE POLICY "Content items manageable by Admins" ON public.content_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

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

DROP TRIGGER IF EXISTS trg_student_profile_security ON public.student_profiles;
CREATE TRIGGER trg_student_profile_security
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.check_student_profile_update();

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

REVOKE EXECUTE ON FUNCTION public.grant_admin_role(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_admin_role(TEXT) TO service_role;

-- ============================================================================
-- 6. STORED PROCEDURES & ATOMIC RPCs
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calculate_talent_score(p_student_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_t INT; v_c INT; v_a INT; v_e INT; v_r INT; v_m INT;
    v_calculated_score INT;
    v_comp_count INT;
    v_bonus INT := 0;
BEGIN
    SELECT readiness_t, readiness_c, readiness_a, readiness_e, readiness_r, readiness_m
    INTO v_t, v_c, v_a, v_e, v_r, v_m
    FROM public.student_profiles
    WHERE id = p_student_id;

    IF v_t IS NULL THEN RETURN 0; END IF;

    SELECT COUNT(*) INTO v_comp_count
    FROM public.student_skill_completions
    WHERE student_id = p_student_id;

    v_bonus := LEAST(50, v_comp_count * 2);

    v_calculated_score := ROUND(
        (v_t * 0.25 + v_c * 0.20 + v_a * 0.15 + v_e * 0.15 + v_r * 0.15 + v_m * 0.10) * 9.5
    ) + v_bonus;

    v_calculated_score := GREATEST(0, LEAST(1000, v_calculated_score));

    UPDATE public.student_profiles
    SET talent_score = v_calculated_score, updated_at = now()
    WHERE id = p_student_id;

    INSERT INTO public.talent_scores (
        student_id, talent_score, readiness_t, readiness_c, readiness_a, readiness_e, readiness_r, readiness_m, calculated_at
    )
    VALUES (
        p_student_id, v_calculated_score, v_t, v_c, v_a, v_e, v_r, v_m, now()
    )
    ON CONFLICT (student_id) DO UPDATE SET
        talent_score = EXCLUDED.talent_score,
        readiness_t = EXCLUDED.readiness_t,
        readiness_c = EXCLUDED.readiness_c,
        readiness_a = EXCLUDED.readiness_a,
        readiness_e = EXCLUDED.readiness_e,
        readiness_r = EXCLUDED.readiness_r,
        readiness_m = EXCLUDED.readiness_m,
        calculated_at = now();

    RETURN v_calculated_score;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_student_placement_day(p_student_id UUID, p_day INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_updated_day INT; v_new_xp INT; v_row_count INT := 0;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO public.placement_attendance (student_id, day, completed_at)
    VALUES (p_student_id, p_day, now())
    ON CONFLICT (student_id, day) DO NOTHING;

    GET DIAGNOSTICS v_row_count = ROW_COUNT;

    IF v_row_count > 0 THEN
        UPDATE public.student_profiles
        SET placement_day = GREATEST(placement_day, LEAST(p_day + 1, 90)),
            xp = xp + 20,
            readiness_c = LEAST(100, readiness_c + 1),
            readiness_e = LEAST(100, readiness_e + 1),
            readiness_a = LEAST(100, readiness_a + 1),
            updated_at = now()
        WHERE id = p_student_id
        RETURNING placement_day, xp INTO v_updated_day, v_new_xp;

        PERFORM public.calculate_talent_score(p_student_id);
    ELSE
        SELECT placement_day, xp INTO v_updated_day, v_new_xp
        FROM public.student_profiles WHERE id = p_student_id;
    END IF;

    RETURN jsonb_build_object('ok', true, 'student_id', p_student_id, 'placement_day', v_updated_day, 'xp', v_new_xp);
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_student_skill(p_student_id UUID, p_skill_id TEXT, p_track_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_xp INT; v_row_count INT := 0;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Enforce track assignment for non-admins
    IF NOT public.is_admin() THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.student_tracks
            WHERE student_id = p_student_id AND track_id = p_track_id
        ) THEN
            RAISE EXCEPTION 'Access Denied: Student is not assigned to course track %', p_track_id;
        END IF;
    END IF;

    INSERT INTO public.student_skill_completions (student_id, skill_id, track_id, completed_at)
    VALUES (p_student_id, p_skill_id, p_track_id, now())
    ON CONFLICT (student_id, skill_id) DO NOTHING;

    GET DIAGNOSTICS v_row_count = ROW_COUNT;

    IF v_row_count > 0 THEN
        UPDATE public.student_profiles
        SET xp = xp + 30, readiness_t = LEAST(100, readiness_t + 2), updated_at = now()
        WHERE id = p_student_id
        RETURNING xp INTO v_new_xp;

        PERFORM public.calculate_talent_score(p_student_id);
    ELSE
        SELECT xp INTO v_new_xp FROM public.student_profiles WHERE id = p_student_id;
    END IF;

    RETURN jsonb_build_object('ok', true, 'student_id', p_student_id, 'skill_id', p_skill_id, 'xp', v_new_xp);
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_student_lab(p_student_id UUID, p_lab_id TEXT, p_label TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_xp INT; v_row_count INT := 0;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Enforce track assignment for non-admins
    IF NOT public.is_admin() THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.student_tracks
            WHERE student_id = p_student_id AND track_id = p_lab_id
        ) THEN
            RAISE EXCEPTION 'Access Denied: Student is not assigned to course lab %', p_lab_id;
        END IF;
    END IF;

    INSERT INTO public.student_lab_completions (student_id, lab_id, label, completed_at)
    VALUES (p_student_id, p_lab_id, p_label, now())
    ON CONFLICT (student_id, lab_id) DO NOTHING;

    GET DIAGNOSTICS v_row_count = ROW_COUNT;

    IF v_row_count > 0 THEN
        UPDATE public.student_profiles
        SET xp = xp + 50, readiness_t = LEAST(100, readiness_t + 3), updated_at = now()
        WHERE id = p_student_id
        RETURNING xp INTO v_new_xp;

        PERFORM public.calculate_talent_score(p_student_id);
    ELSE
        SELECT xp INTO v_new_xp FROM public.student_profiles WHERE id = p_student_id;
    END IF;

    RETURN jsonb_build_object('ok', true, 'student_id', p_student_id, 'lab_id', p_lab_id, 'xp', v_new_xp);
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_student_daily_step(p_student_id UUID, p_step TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_xp INT;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO public.student_daily_progress (student_id, date, english_completed, aptitude_completed, practice_completed)
    VALUES (
        p_student_id, CURRENT_DATE,
        CASE WHEN p_step = 'english' THEN true ELSE false END,
        CASE WHEN p_step = 'aptitude' THEN true ELSE false END,
        CASE WHEN p_step = 'practice' THEN true ELSE false END
    )
    ON CONFLICT (student_id, date) DO UPDATE SET
        english_completed = CASE WHEN p_step = 'english' THEN true ELSE public.student_daily_progress.english_completed END,
        aptitude_completed = CASE WHEN p_step = 'aptitude' THEN true ELSE public.student_daily_progress.aptitude_completed END,
        practice_completed = CASE WHEN p_step = 'practice' THEN true ELSE public.student_daily_progress.practice_completed END,
        updated_at = now();

    UPDATE public.student_profiles
    SET xp = xp + 10,
        readiness_e = CASE WHEN p_step = 'english' THEN LEAST(100, readiness_e + 1) ELSE readiness_e END,
        readiness_a = CASE WHEN p_step = 'aptitude' THEN LEAST(100, readiness_a + 1) ELSE readiness_a END,
        readiness_c = CASE WHEN p_step = 'practice' THEN LEAST(100, readiness_c + 1) ELSE readiness_c END,
        updated_at = now()
    WHERE id = p_student_id
    RETURNING xp INTO v_new_xp;

    RETURN jsonb_build_object('ok', true, 'student_id', p_student_id, 'step', p_step, 'xp', v_new_xp);
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_student_assessment(p_student_id UUID, p_day INT, p_score NUMERIC)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_xp INT;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO public.student_assessments (student_id, day, score, submitted_at)
    VALUES (p_student_id, p_day, p_score, now())
    ON CONFLICT (student_id, day) DO UPDATE SET score = p_score, submitted_at = now();

    UPDATE public.student_profiles
    SET xp = xp + 100,
        readiness_c = LEAST(100, readiness_c + 5),
        readiness_a = LEAST(100, readiness_a + 5),
        updated_at = now()
    WHERE id = p_student_id
    RETURNING xp INTO v_new_xp;

    PERFORM public.calculate_talent_score(p_student_id);

    RETURN jsonb_build_object('ok', true, 'student_id', p_student_id, 'day', p_day, 'score', p_score, 'xp', v_new_xp);
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_student_mock(p_student_id UUID, p_mock_id TEXT, p_score NUMERIC, p_feedback TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_xp INT;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO public.student_mocks (student_id, mock_id, score, feedback_summary, completed_at)
    VALUES (p_student_id, p_mock_id, p_score, p_feedback, now())
    ON CONFLICT (student_id, mock_id) DO UPDATE SET score = p_score, feedback_summary = p_feedback, completed_at = now();

    UPDATE public.student_profiles
    SET xp = xp + 75, readiness_m = LEAST(100, readiness_m + 10), updated_at = now()
    WHERE id = p_student_id
    RETURNING xp INTO v_new_xp;

    PERFORM public.calculate_talent_score(p_student_id);

    RETURN jsonb_build_object('ok', true, 'student_id', p_student_id, 'mock_id', p_mock_id, 'score', p_score, 'xp', v_new_xp);
END;
$$;

CREATE OR REPLACE FUNCTION public.issue_student_certificate(p_student_id UUID, p_label TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_xp INT;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    INSERT INTO public.student_certifications (student_id, label, issued_at)
    VALUES (p_student_id, p_label, now())
    ON CONFLICT (student_id, label) DO NOTHING;

    UPDATE public.student_profiles
    SET xp = xp + 150, readiness_r = LEAST(100, readiness_r + 15), updated_at = now()
    WHERE id = p_student_id
    RETURNING xp INTO v_new_xp;

    PERFORM public.calculate_talent_score(p_student_id);

    RETURN jsonb_build_object('ok', true, 'student_id', p_student_id, 'label', p_label, 'xp', v_new_xp);
END;
$$;

CREATE OR REPLACE FUNCTION public.set_student_active_tracks(p_student_id UUID, p_tracks TEXT[])
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    t TEXT;
    v_pos INT := 1;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    DELETE FROM public.student_tracks WHERE student_id = p_student_id;

    FOREACH t IN ARRAY p_tracks LOOP
        IF v_pos <= 3 THEN
            INSERT INTO public.student_tracks (student_id, track_id, position)
            VALUES (p_student_id, t, v_pos);
            v_pos := v_pos + 1;
        END IF;
    END LOOP;

    RETURN jsonb_build_object('ok', true, 'student_id', p_student_id, 'tracks', p_tracks);
END;
$$;

-- -----------------------------------------------------------------------------
-- Atomic Technical Day Completion RPC
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_student_technical_day(
    p_student_id UUID,
    p_day INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_xp INT;
    v_talent_score INT;
    v_row_count INT := 0;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    IF p_day < 1 OR p_day > 90 THEN
        RAISE EXCEPTION 'Invalid technical day: must be between 1 and 90';
    END IF;

    INSERT INTO public.student_technical_days (student_id, day, completed_at)
    VALUES (p_student_id, p_day, now())
    ON CONFLICT (student_id, day) DO NOTHING;

    GET DIAGNOSTICS v_row_count = ROW_COUNT;

    IF v_row_count > 0 THEN
        UPDATE public.student_profiles
        SET xp = xp + 50,
            readiness_t = LEAST(100, readiness_t + 2),
            updated_at = now()
        WHERE id = p_student_id
        RETURNING xp INTO v_new_xp;

        PERFORM public.calculate_talent_score(p_student_id);
    ELSE
        SELECT xp INTO v_new_xp FROM public.student_profiles WHERE id = p_student_id;
    END IF;

    SELECT talent_score INTO v_talent_score FROM public.student_profiles WHERE id = p_student_id;

    RETURN jsonb_build_object(
        'ok', true,
        'student_id', p_student_id,
        'day', p_day,
        'xp', v_new_xp,
        'talent_score', COALESCE(v_talent_score, 0)
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.complete_student_technical_day(UUID, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_student_technical_day(UUID, INT) TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Platform-wide Talent Score Recalculation Engine
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.recalculate_all_talent_scores()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_rec RECORD;
    v_count INT := 0;
BEGIN
    FOR v_rec IN 
        SELECT id FROM public.student_profiles WHERE status = 'active'
    LOOP
        PERFORM public.calculate_talent_score(v_rec.id);
        v_count := v_count + 1;
    END LOOP;

    RETURN jsonb_build_object('ok', true, 'recalculated_count', v_count, 'timestamp', now());
END;
$$;

REVOKE EXECUTE ON FUNCTION public.recalculate_all_talent_scores() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.recalculate_all_talent_scores() TO authenticated, service_role;

-- -----------------------------------------------------------------------------
-- Secure Student Profile Identity Claim RPC
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.claim_student_profile()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_auth_uid UUID := auth.uid();
    v_email TEXT;
    v_profile_id UUID;
    v_existing_auth_uid UUID;
BEGIN
    IF v_auth_uid IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User session required';
    END IF;

    SELECT email INTO v_email FROM auth.users WHERE id = v_auth_uid;
    IF v_email IS NULL THEN
        RAISE EXCEPTION 'No email associated with authenticated account';
    END IF;

    SELECT id INTO v_profile_id
    FROM public.student_profiles
    WHERE auth_user_id = v_auth_uid;

    IF v_profile_id IS NOT NULL THEN
        RETURN jsonb_build_object('ok', true, 'profile_id', v_profile_id, 'linked', true);
    END IF;

    SELECT id, auth_user_id INTO v_profile_id, v_existing_auth_uid
    FROM public.student_profiles
    WHERE LOWER(email) = LOWER(TRIM(v_email))
      AND status = 'active'
    LIMIT 1;

    IF v_profile_id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'No active student profile found matching account email');
    END IF;

    IF v_existing_auth_uid IS NOT NULL AND v_existing_auth_uid <> v_auth_uid THEN
        RAISE EXCEPTION 'Profile is already claimed by another authenticated account';
    END IF;

    UPDATE public.student_profiles
    SET auth_user_id = v_auth_uid,
        updated_at = now()
    WHERE id = v_profile_id;

    RETURN jsonb_build_object('ok', true, 'profile_id', v_profile_id, 'linked', true);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_student_profile() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_student_profile() TO authenticated, service_role;

-- ============================================================================
-- 7. PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_student_profiles_auth_user ON public.student_profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_batch ON public.student_profiles(batch_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_institution ON public.student_profiles(institution_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_status ON public.student_profiles(status);
CREATE INDEX IF NOT EXISTS idx_student_profiles_talent_score ON public.student_profiles(talent_score DESC);

CREATE INDEX IF NOT EXISTS idx_student_tracks_student ON public.student_tracks(student_id);
CREATE INDEX IF NOT EXISTS idx_student_tracks_track ON public.student_tracks(track_id);

CREATE INDEX IF NOT EXISTS idx_skill_completions_student ON public.student_skill_completions(student_id);
CREATE INDEX IF NOT EXISTS idx_lab_completions_student ON public.student_lab_completions(student_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_student_date ON public.student_daily_progress(student_id, date);
CREATE INDEX IF NOT EXISTS idx_placement_attendance_student ON public.placement_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_tech_days_student ON public.student_technical_days(student_id);
CREATE INDEX IF NOT EXISTS idx_assessments_student ON public.student_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_mocks_student ON public.student_mocks(student_id);
CREATE INDEX IF NOT EXISTS idx_certs_student ON public.student_certifications(student_id);

CREATE INDEX IF NOT EXISTS idx_hiring_drives_status ON public.hiring_drives(status);
CREATE INDEX IF NOT EXISTS idx_placements_student ON public.placements(student_id);
CREATE INDEX IF NOT EXISTS idx_content_items_status ON public.content_items(status);

-- ============================================================================
-- 8. INITIAL SEED DATA (Curriculum Tracks & Default Settings)
-- ============================================================================

INSERT INTO public.curriculum_tracks (id, name, short_name, category, total_skills, accent)
VALUES
    ('mern', 'MERN Full-Stack Development', 'MERN', 'Web Development', 30, '#10b981'),
    ('cloud', 'Cloud Architecture & DevOps', 'Cloud & DevOps', 'Cloud Infrastructure', 30, '#06b6d4'),
    ('aiml', 'Applied AI & Machine Learning', 'AI & ML', 'Data & Intelligence', 30, '#8b5cf6'),
    ('java', 'Enterprise Java & Spring Boot', 'Java Spring', 'Backend Engineering', 30, '#f59e0b'),
    ('python', 'Python Systems & Microservices', 'Python', 'Backend Engineering', 30, '#3b82f6'),
    ('cyber', 'Cybersecurity & Ethical Hacking', 'Cybersecurity', 'Security', 30, '#ef4444'),
    ('datascience', 'Data Science & Big Data Engineering', 'Data Science', 'Data & Intelligence', 30, '#ec4899'),
    ('mobile', 'Cross-Platform Mobile (React Native/Flutter)', 'Mobile App', 'Mobile Development', 30, '#14b8a6'),
    ('blockchain', 'Web3 & Decentralized Systems', 'Web3', 'Emerging Tech', 30, '#6366f1'),
    ('embedded', 'Embedded Systems & IoT Hardware', 'IoT & Embedded', 'Hardware', 30, '#84cc16'),
    ('qa', 'Automated QA & Reliability Engineering', 'QA & SDET', 'Software Quality', 30, '#f97316'),
    ('uiux', 'Product Design & Frontend Systems', 'UI/UX Design', 'Design & Product', 30, '#d946ef'),
    ('gamedev', 'Interactive Game Systems & 3D Engines', 'Game Dev', 'Interactive Media', 30, '#a855f7'),
    ('network', 'Enterprise Network Engineering', 'Networking', 'Infrastructure', 30, '#0ea5e9'),
    ('arvr', 'Spatial Computing & XR Systems', 'AR/VR & XR', 'Emerging Tech', 30, '#f43f5e')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.platform_settings (key, value)
VALUES
    ('completion_rules', '{"rule": "primary-plus-minimum", "secondary_minimum": 50}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 9. SCHEMA GRANTS, AUTH TRIGGERS & ROLES SYNC (Least Privilege)
-- ============================================================================

-- Ensure public schema usage
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

-- Auth trigger to automatically assign role to any newly created auth user (strictly student)
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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

-- Dynamic Super Admin Bootstrap Function (Zero hardcoded UUIDs)
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

-- Authoritative Batch Leaderboard RPC (Privacy-Preserving & Deterministic Ranking)
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

GRANT EXECUTE ON FUNCTION public.get_batch_leaderboard(UUID, INT) TO authenticated, service_role;

-- Live Track Distribution RPC (Aggregated from student_tracks)
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

GRANT EXECUTE ON FUNCTION public.get_track_distribution() TO authenticated, service_role;

-- Revoke anonymous execution across all custom routines
REVOKE EXECUTE ON FUNCTION public.get_batch_leaderboard(UUID, INT) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_track_distribution() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.bootstrap_super_admin(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_super_admin(TEXT) TO service_role;

-- Harden Table Privileges: Revoke direct client write operations on RPC-governed and sensitive tables
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

-- Default Privilege Strategy (Least Privilege for Future Objects)
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ROUTINES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

-- Administrative Privileges for Service Role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Auto-sync remaining users as students if not already present
INSERT INTO public.user_roles (auth_user_id, role)
SELECT id, 'student'
FROM auth.users
WHERE id NOT IN (SELECT auth_user_id FROM public.user_roles)
ON CONFLICT (auth_user_id) DO NOTHING;

-- Verification RPC for student lab access
CREATE OR REPLACE FUNCTION public.verify_student_lab_access(p_student_id UUID, p_lab_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_assigned BOOLEAN := false;
BEGIN
    IF NOT (public.is_admin() OR p_student_id = public.current_student_id()) THEN
        RETURN jsonb_build_object('allowed', false, 'error', 'Unauthorized');
    END IF;

    IF public.is_admin() THEN
        RETURN jsonb_build_object('allowed', true, 'is_admin', true);
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.student_tracks
        WHERE student_id = p_student_id AND track_id = p_lab_id
    ) INTO v_is_assigned;

    IF NOT v_is_assigned THEN
        RETURN jsonb_build_object('allowed', false, 'error', 'Access Denied: Student is not assigned to course lab ' || p_lab_id);
    END IF;

    RETURN jsonb_build_object('allowed', true, 'student_id', p_student_id, 'lab_id', p_lab_id);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.verify_student_lab_access(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.verify_student_lab_access(UUID, TEXT) TO authenticated, service_role;

-- Reload Schema Cache in PostgREST
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- 18. MIGRATION 019: RESTORE STUDENT PROFILE PRIVILEGED FIELD PROTECTION
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

DROP TRIGGER IF EXISTS trg_student_profile_security ON public.student_profiles;
CREATE TRIGGER trg_student_profile_security
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.check_student_profile_update();

GRANT EXECUTE ON FUNCTION public.check_student_profile_update() TO anon, authenticated, service_role;

NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- 19. MIGRATION 020: SECURE CALCULATE_TALENT_SCORE RPC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calculate_talent_score(p_student_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_t INT; v_c INT; v_a INT; v_e INT; v_r INT; v_m INT;
    v_calculated_score INT;
    v_comp_count INT;
    v_bonus INT := 0;
    v_is_authorized BOOLEAN := false;
BEGIN
    -- 1. Strict caller authorization: service_role, admin/super_admin, or student owner
    IF coalesce(auth.role(), '') = 'service_role'
       OR coalesce(current_setting('role', true), '') = 'service_role'
       OR coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role'
       OR coalesce(public.is_admin(), false) THEN
        v_is_authorized := true;
    ELSIF p_student_id IS NOT NULL AND p_student_id = public.current_student_id() THEN
        v_is_authorized := true;
    END IF;

    IF NOT v_is_authorized THEN
        RAISE EXCEPTION 'Access Denied: You are not authorized to calculate talent score for student %', p_student_id;
    END IF;

    -- 2. Fetch readiness snapshot from student_profiles
    SELECT readiness_t, readiness_c, readiness_a, readiness_e, readiness_r, readiness_m
    INTO v_t, v_c, v_a, v_e, v_r, v_m
    FROM public.student_profiles
    WHERE id = p_student_id;

    IF NOT FOUND OR v_t IS NULL THEN
        RAISE EXCEPTION 'Student profile not found for id %', p_student_id;
    END IF;

    -- 3. Exact existing scoring calculation (UNMODIFIED)
    SELECT COUNT(*) INTO v_comp_count
    FROM public.student_skill_completions
    WHERE student_id = p_student_id;

    v_bonus := LEAST(50, v_comp_count * 2);

    v_calculated_score := ROUND(
        (v_t * 0.25 + v_c * 0.20 + v_a * 0.15 + v_e * 0.15 + v_r * 0.15 + v_m * 0.10) * 9.5
    ) + v_bonus;

    v_calculated_score := GREATEST(0, LEAST(1000, v_calculated_score));

    -- Update student_profiles snapshot
    UPDATE public.student_profiles
    SET talent_score = v_calculated_score, updated_at = now()
    WHERE id = p_student_id;

    -- Upsert talent_scores table
    INSERT INTO public.talent_scores (
        student_id, talent_score, readiness_t, readiness_c, readiness_a, readiness_e, readiness_r, readiness_m, calculated_at
    )
    VALUES (
        p_student_id, v_calculated_score, v_t, v_c, v_a, v_e, v_r, v_m, now()
    )
    ON CONFLICT (student_id) DO UPDATE SET
        talent_score = EXCLUDED.talent_score,
        readiness_t = EXCLUDED.readiness_t,
        readiness_c = EXCLUDED.readiness_c,
        readiness_a = EXCLUDED.readiness_a,
        readiness_e = EXCLUDED.readiness_e,
        readiness_r = EXCLUDED.readiness_r,
        readiness_m = EXCLUDED.readiness_m,
        calculated_at = now();

    RETURN v_calculated_score;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.calculate_talent_score(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.calculate_talent_score(UUID) TO authenticated, service_role;

NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- APPENDED: Migration 021 (Security Fix #3 - Authoritative Curriculum Skill Validation)
-- ============================================================================

-- ============================================================================
-- Migration: 021_secure_student_skill_completion.sql
-- Description: Security Fix #3 — Authoritative Curriculum Skill Validation
--
-- Vulnerability Addressed:
--   The complete_student_skill() RPC allowed arbitrary/fake skill IDs to be
--   submitted by students and recorded into student_skill_completions, bypassing
--   curriculum authority and manufacturing unearned XP and progression gates.
--
-- Remediation:
--   1. Authoritative Curriculum Tracks: Ensure all active tracks exist in public.curriculum_tracks.
--   2. Authoritative Curriculum Skills: Seed public.curriculum_skills with authoritative
--      competency and practice skills per track.
--   3. Database-Level Constraint: Add composite UNIQUE(id, track_id) on curriculum_skills
--      and FOREIGN KEY on student_skill_completions(skill_id, track_id) for structural defense-in-depth.
--   4. Hardened RPC complete_student_skill():
--      - Validates caller authorization (admin, service_role, or own student ID)
--      - Validates student profile existence
--      - Validates track assignment in student_tracks for non-admins
--      - Validates skill existence in public.curriculum_skills AND track membership
--      - Idempotently records completion (ON CONFLICT DO NOTHING)
--      - Safely awards XP and triggers Talent Score calculation only on new completion
--   5. Retains 100% backward compatibility for legitimate student completions.
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 1. Ensure All Curriculum Tracks Exist
-- -----------------------------------------------------------------------------
INSERT INTO public.curriculum_tracks (id, name, short_name, category, total_skills, accent)
VALUES
    ('java', 'Enterprise Java & Spring Boot', 'Java Spring', 'Backend Engineering', 30, '#f59e0b'),
    ('aiml', 'Applied AI & Machine Learning', 'AI & ML', 'Data & Intelligence', 30, '#8b5cf6'),
    ('datascience', 'Data Science & Big Data Engineering', 'Data Science', 'Data & Intelligence', 30, '#ec4899'),
    ('mern', 'MERN Full-Stack Development', 'MERN', 'Web Development', 30, '#10b981'),
    ('cloud', 'Cloud Architecture & DevOps', 'Cloud & DevOps', 'Cloud Infrastructure', 30, '#06b6d4'),
    ('python', 'Python Systems & Microservices', 'Python', 'Backend Engineering', 30, '#3b82f6'),
    ('cyber', 'Cybersecurity & Ethical Hacking', 'Cybersecurity', 'Security', 30, '#ef4444'),
    ('mobile', 'Cross-Platform Mobile (React Native/Flutter)', 'Mobile App', 'Mobile Development', 30, '#14b8a6'),
    ('blockchain', 'Web3 & Decentralized Systems', 'Web3', 'Emerging Tech', 30, '#6366f1'),
    ('embedded', 'Embedded Systems & IoT Hardware', 'IoT & Embedded', 'Hardware', 30, '#84cc16'),
    ('qa', 'Automated QA & Reliability Engineering', 'QA & SDET', 'Software Quality', 30, '#f97316'),
    ('uiux', 'Product Design & Frontend Systems', 'UI/UX Design', 'Design & Product', 30, '#d946ef'),
    ('gamedev', 'Interactive Game Systems & 3D Engines', 'Game Dev', 'Interactive Media', 30, '#a855f7'),
    ('network', 'Enterprise Network Engineering', 'Networking', 'Infrastructure', 30, '#0ea5e9'),
    ('arvr', 'Spatial Computing & XR Systems', 'AR/VR & XR', 'Emerging Tech', 30, '#f43f5e'),
    ('medical', 'Medical Coding', 'Med Coding', 'Enterprise & Business', 30, '#f43f5e'),
    ('marketing', 'Digital Marketing', 'Marketing', 'Enterprise & Business', 30, '#f59e0b'),
    ('sap', 'SAP FICO', 'SAP FICO', 'Enterprise & Business', 30, '#3b82f6'),
    ('sre', 'Site Reliability Engineering', 'SRE', 'Cloud Infrastructure', 30, '#06b6d4'),
    ('bianalytics', 'Business Intelligence & Analytics', 'BI & Analytics', 'Data & Intelligence', 30, '#8b5cf6')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. Seed Authoritative Curriculum Skills
-- -----------------------------------------------------------------------------
INSERT INTO public.curriculum_skills (id, track_id, title, day, type, status)
VALUES
    ('java-m1-s0', 'java', 'Spring Boot fundamentals', 1, 'video', 'published'),
    ('java-m1-s1', 'java', 'JPA fundamentals', 2, 'video', 'published'),
    ('java-m1-s2', 'java', 'JUnit 5 fundamentals', 3, 'video', 'published'),
    ('java-m2-s0', 'java', 'Guided sandbox drill', 4, 'lab', 'published'),
    ('java-m2-s1', 'java', 'Debugging challenge', 5, 'lab', 'published'),
    ('java-m2-s2', 'java', 'Spring Boot + JUnit Runner walkthrough', 6, 'lab', 'published'),
    ('java-m3-s0', 'java', 'Project scaffold', 7, 'project', 'published'),
    ('java-m3-s1', 'java', 'Feature implementation', 8, 'project', 'published'),
    ('java-m3-s2', 'java', 'Code review & refactor', 9, 'project', 'published'),
    ('java-m4-s0', 'java', 'Spring Boot + JUnit Runner validation', 10, 'quiz', 'published'),
    ('java-m4-s1', 'java', 'Practical task submission', 11, 'project', 'published'),
    ('java-m4-s2', 'java', 'Competency interview', 12, 'quiz', 'published'),
    ('aiml-m1-s0', 'aiml', 'LangChain fundamentals', 1, 'video', 'published'),
    ('aiml-m1-s1', 'aiml', 'embeddings fundamentals', 2, 'video', 'published'),
    ('aiml-m1-s2', 'aiml', 'RAG fundamentals', 3, 'video', 'published'),
    ('aiml-m2-s0', 'aiml', 'Guided sandbox drill', 4, 'lab', 'published'),
    ('aiml-m2-s1', 'aiml', 'Debugging challenge', 5, 'lab', 'published'),
    ('aiml-m2-s2', 'aiml', 'Vector Similarity Search walkthrough', 6, 'lab', 'published'),
    ('aiml-m3-s0', 'aiml', 'Project scaffold', 7, 'project', 'published'),
    ('aiml-m3-s1', 'aiml', 'Feature implementation', 8, 'project', 'published'),
    ('aiml-m3-s2', 'aiml', 'Code review & refactor', 9, 'project', 'published'),
    ('aiml-m4-s0', 'aiml', 'Vector Similarity Search validation', 10, 'quiz', 'published'),
    ('aiml-m4-s1', 'aiml', 'Practical task submission', 11, 'project', 'published'),
    ('aiml-m4-s2', 'aiml', 'Competency interview', 12, 'quiz', 'published'),
    ('datascience-m1-s0', 'datascience', 'Pandas fundamentals', 1, 'video', 'published'),
    ('datascience-m1-s1', 'datascience', 'NumPy fundamentals', 2, 'video', 'published'),
    ('datascience-m1-s2', 'datascience', 'statistics fundamentals', 3, 'video', 'published'),
    ('datascience-m2-s0', 'datascience', 'Guided sandbox drill', 4, 'lab', 'published'),
    ('datascience-m2-s1', 'datascience', 'Debugging challenge', 5, 'lab', 'published'),
    ('datascience-m2-s2', 'datascience', 'Dataframe Cleaner walkthrough', 6, 'lab', 'published'),
    ('datascience-m3-s0', 'datascience', 'Project scaffold', 7, 'project', 'published'),
    ('datascience-m3-s1', 'datascience', 'Feature implementation', 8, 'project', 'published'),
    ('datascience-m3-s2', 'datascience', 'Code review & refactor', 9, 'project', 'published'),
    ('datascience-m4-s0', 'datascience', 'Dataframe Cleaner validation', 10, 'quiz', 'published'),
    ('datascience-m4-s1', 'datascience', 'Practical task submission', 11, 'project', 'published'),
    ('datascience-m4-s2', 'datascience', 'Competency interview', 12, 'quiz', 'published'),
    ('mern-m1-s0', 'mern', 'React fundamentals', 1, 'video', 'published'),
    ('mern-m1-s1', 'mern', 'Node.js fundamentals', 2, 'video', 'published'),
    ('mern-m1-s2', 'mern', 'Express & MongoDB fundamentals', 3, 'video', 'published'),
    ('mern-m2-s0', 'mern', 'Guided sandbox drill', 4, 'lab', 'published'),
    ('mern-m2-s1', 'mern', 'Debugging challenge', 5, 'lab', 'published'),
    ('mern-m2-s2', 'mern', 'MERN API + UI Sandbox walkthrough', 6, 'lab', 'published'),
    ('mern-m3-s0', 'mern', 'Project scaffold', 7, 'project', 'published'),
    ('mern-m3-s1', 'mern', 'Feature implementation', 8, 'project', 'published'),
    ('mern-m3-s2', 'mern', 'Code review & refactor', 9, 'project', 'published'),
    ('mern-m4-s0', 'mern', 'MERN API + UI Sandbox validation', 10, 'quiz', 'published'),
    ('mern-m4-s1', 'mern', 'Practical task submission', 11, 'project', 'published'),
    ('mern-m4-s2', 'mern', 'Competency interview', 12, 'quiz', 'published'),
    ('cloud-m1-s0', 'cloud', 'AWS & Cloud fundamentals', 1, 'video', 'published'),
    ('cloud-m1-s1', 'cloud', 'Docker & Containers fundamentals', 2, 'video', 'published'),
    ('cloud-m1-s2', 'cloud', 'Kubernetes & CI/CD fundamentals', 3, 'video', 'published'),
    ('cloud-m2-s0', 'cloud', 'Guided sandbox drill', 4, 'lab', 'published'),
    ('cloud-m2-s1', 'cloud', 'Debugging challenge', 5, 'lab', 'published'),
    ('cloud-m2-s2', 'cloud', 'Cloud Cluster Deployer walkthrough', 6, 'lab', 'published'),
    ('cloud-m3-s0', 'cloud', 'Project scaffold', 7, 'project', 'published'),
    ('cloud-m3-s1', 'cloud', 'Feature implementation', 8, 'project', 'published'),
    ('cloud-m3-s2', 'cloud', 'Code review & refactor', 9, 'project', 'published'),
    ('cloud-m4-s0', 'cloud', 'Cloud Cluster Deployer validation', 10, 'quiz', 'published'),
    ('cloud-m4-s1', 'cloud', 'Practical task submission', 11, 'project', 'published'),
    ('cloud-m4-s2', 'cloud', 'Competency interview', 12, 'quiz', 'published'),
    ('python-m1-s0', 'python', 'FastAPI fundamentals', 1, 'video', 'published'),
    ('python-m1-s1', 'python', 'PostgreSQL fundamentals', 2, 'video', 'published'),
    ('python-m1-s2', 'python', 'Microservices fundamentals', 3, 'video', 'published'),
    ('python-m2-s0', 'python', 'Guided sandbox drill', 4, 'lab', 'published'),
    ('python-m2-s1', 'python', 'Debugging challenge', 5, 'lab', 'published'),
    ('python-m2-s2', 'python', 'Async Microservice Engine walkthrough', 6, 'lab', 'published'),
    ('python-m3-s0', 'python', 'Project scaffold', 7, 'project', 'published'),
    ('python-m3-s1', 'python', 'Feature implementation', 8, 'project', 'published'),
    ('python-m3-s2', 'python', 'Code review & refactor', 9, 'project', 'published'),
    ('python-m4-s0', 'python', 'Async Microservice Engine validation', 10, 'quiz', 'published'),
    ('python-m4-s1', 'python', 'Practical task submission', 11, 'project', 'published'),
    ('python-m4-s2', 'python', 'Competency interview', 12, 'quiz', 'published'),
    ('cyber-m1-s0', 'cyber', 'Threat Modeling fundamentals', 1, 'video', 'published'),
    ('cyber-m1-s1', 'cyber', 'Penetration Testing fundamentals', 2, 'video', 'published'),
    ('cyber-m1-s2', 'cyber', 'SOC Analysis fundamentals', 3, 'video', 'published'),
    ('cyber-m2-s0', 'cyber', 'Guided sandbox drill', 4, 'lab', 'published'),
    ('cyber-m2-s1', 'cyber', 'Debugging challenge', 5, 'lab', 'published'),
    ('cyber-m2-s2', 'cyber', 'Security Vulnerability Scanner walkthrough', 6, 'lab', 'published'),
    ('cyber-m3-s0', 'cyber', 'Project scaffold', 7, 'project', 'published'),
    ('cyber-m3-s1', 'cyber', 'Feature implementation', 8, 'project', 'published'),
    ('cyber-m3-s2', 'cyber', 'Code review & refactor', 9, 'project', 'published'),
    ('cyber-m4-s0', 'cyber', 'Security Vulnerability Scanner validation', 10, 'quiz', 'published'),
    ('cyber-m4-s1', 'cyber', 'Practical task submission', 11, 'project', 'published'),
    ('cyber-m4-s2', 'cyber', 'Competency interview', 12, 'quiz', 'published'),
    ('mobile-m1-s0', 'mobile', 'React Native fundamentals', 1, 'video', 'published'),
    ('mobile-m1-s1', 'mobile', 'Flutter fundamentals', 2, 'video', 'published'),
    ('mobile-m1-s2', 'mobile', 'State Management fundamentals', 3, 'video', 'published'),
    ('mobile-m2-s0', 'mobile', 'Guided sandbox drill', 4, 'lab', 'published'),
    ('mobile-m2-s1', 'mobile', 'Debugging challenge', 5, 'lab', 'published'),
    ('mobile-m2-s2', 'mobile', 'Mobile Navigation & Storage walkthrough', 6, 'lab', 'published'),
    ('mobile-m3-s0', 'mobile', 'Project scaffold', 7, 'project', 'published'),
    ('mobile-m3-s1', 'mobile', 'Feature implementation', 8, 'project', 'published'),
    ('mobile-m3-s2', 'mobile', 'Code review & refactor', 9, 'project', 'published'),
    ('mobile-m4-s0', 'mobile', 'Mobile Navigation & Storage validation', 10, 'quiz', 'published'),
    ('mobile-m4-s1', 'mobile', 'Practical task submission', 11, 'project', 'published'),
    ('mobile-m4-s2', 'mobile', 'Competency interview', 12, 'quiz', 'published'),
    ('blockchain-m1-s0', 'blockchain', 'Solidity fundamentals', 1, 'video', 'published'),
    ('blockchain-m1-s1', 'blockchain', 'Smart Contracts fundamentals', 2, 'video', 'published'),
    ('blockchain-m1-s2', 'blockchain', 'Web3 Integration fundamentals', 3, 'video', 'published'),
    ('blockchain-m2-s0', 'blockchain', 'Guided sandbox drill', 4, 'lab', 'published'),
    ('blockchain-m2-s1', 'blockchain', 'Debugging challenge', 5, 'lab', 'published'),
    ('blockchain-m2-s2', 'blockchain', 'Smart Contract Deployer walkthrough', 6, 'lab', 'published'),
    ('blockchain-m3-s0', 'blockchain', 'Project scaffold', 7, 'project', 'published'),
    ('blockchain-m3-s1', 'blockchain', 'Feature implementation', 8, 'project', 'published'),
    ('blockchain-m3-s2', 'blockchain', 'Code review & refactor', 9, 'project', 'published'),
    ('blockchain-m4-s0', 'blockchain', 'Smart Contract Deployer validation', 10, 'quiz', 'published'),
    ('blockchain-m4-s1', 'blockchain', 'Practical task submission', 11, 'project', 'published'),
    ('blockchain-m4-s2', 'blockchain', 'Competency interview', 12, 'quiz', 'published'),
    ('embedded-m1-s0', 'embedded', 'C/C++ Systems fundamentals', 1, 'video', 'published'),
    ('embedded-m1-s1', 'embedded', 'RTOS fundamentals', 2, 'video', 'published'),
    ('embedded-m1-s2', 'embedded', 'IoT Protocols fundamentals', 3, 'video', 'published'),
    ('embedded-m2-s0', 'embedded', 'Guided sandbox drill', 4, 'lab', 'published'),
    ('embedded-m2-s1', 'embedded', 'Debugging challenge', 5, 'lab', 'published'),
    ('embedded-m2-s2', 'embedded', 'Firmware Flash Simulator walkthrough', 6, 'lab', 'published'),
    ('embedded-m3-s0', 'embedded', 'Project scaffold', 7, 'project', 'published'),
    ('embedded-m3-s1', 'embedded', 'Feature implementation', 8, 'project', 'published'),
    ('embedded-m3-s2', 'embedded', 'Code review & refactor', 9, 'project', 'published'),
    ('embedded-m4-s0', 'embedded', 'Firmware Flash Simulator validation', 10, 'quiz', 'published'),
    ('embedded-m4-s1', 'embedded', 'Practical task submission', 11, 'project', 'published'),
    ('embedded-m4-s2', 'embedded', 'Competency interview', 12, 'quiz', 'published'),
    ('qa-m1-s0', 'qa', 'Playwright fundamentals', 1, 'video', 'published'),
    ('qa-m1-s1', 'qa', 'Test Automation fundamentals', 2, 'video', 'published'),
    ('qa-m1-s2', 'qa', 'CI/CD Testing fundamentals', 3, 'video', 'published'),
    ('qa-m2-s0', 'qa', 'Guided sandbox drill', 4, 'lab', 'published'),
    ('qa-m2-s1', 'qa', 'Debugging challenge', 5, 'lab', 'published'),
    ('qa-m2-s2', 'qa', 'E2E Test Suite Runner walkthrough', 6, 'lab', 'published'),
    ('qa-m3-s0', 'qa', 'Project scaffold', 7, 'project', 'published'),
    ('qa-m3-s1', 'qa', 'Feature implementation', 8, 'project', 'published'),
    ('qa-m3-s2', 'qa', 'Code review & refactor', 9, 'project', 'published'),
    ('qa-m4-s0', 'qa', 'E2E Test Suite Runner validation', 10, 'quiz', 'published'),
    ('qa-m4-s1', 'qa', 'Practical task submission', 11, 'project', 'published'),
    ('qa-m4-s2', 'qa', 'Competency interview', 12, 'quiz', 'published'),
    ('uiux-m1-s0', 'uiux', 'Design Systems fundamentals', 1, 'video', 'published'),
    ('uiux-m1-s1', 'uiux', 'Figma Prototyping fundamentals', 2, 'video', 'published'),
    ('uiux-m1-s2', 'uiux', 'Accessibility fundamentals', 3, 'video', 'published'),
    ('uiux-m2-s0', 'uiux', 'Guided sandbox drill', 4, 'lab', 'published'),
    ('uiux-m2-s1', 'uiux', 'Debugging challenge', 5, 'lab', 'published'),
    ('uiux-m2-s2', 'uiux', 'Design Token Architecture walkthrough', 6, 'lab', 'published'),
    ('uiux-m3-s0', 'uiux', 'Project scaffold', 7, 'project', 'published'),
    ('uiux-m3-s1', 'uiux', 'Feature implementation', 8, 'project', 'published'),
    ('uiux-m3-s2', 'uiux', 'Code review & refactor', 9, 'project', 'published'),
    ('uiux-m4-s0', 'uiux', 'Design Token Architecture validation', 10, 'quiz', 'published'),
    ('uiux-m4-s1', 'uiux', 'Practical task submission', 11, 'project', 'published'),
    ('uiux-m4-s2', 'uiux', 'Competency interview', 12, 'quiz', 'published'),
    ('gamedev-m1-s0', 'gamedev', 'Game Architecture fundamentals', 1, 'video', 'published'),
    ('gamedev-m1-s1', 'gamedev', 'Physics Engines fundamentals', 2, 'video', 'published'),
    ('gamedev-m1-s2', 'gamedev', 'Shader Pipelines fundamentals', 3, 'video', 'published'),
    ('gamedev-m2-s0', 'gamedev', 'Guided sandbox drill', 4, 'lab', 'published'),
    ('gamedev-m2-s1', 'gamedev', 'Debugging challenge', 5, 'lab', 'published'),
    ('gamedev-m2-s2', 'gamedev', '3D Physics & Entity Engine walkthrough', 6, 'lab', 'published'),
    ('gamedev-m3-s0', 'gamedev', 'Project scaffold', 7, 'project', 'published'),
    ('gamedev-m3-s1', 'gamedev', 'Feature implementation', 8, 'project', 'published'),
    ('gamedev-m3-s2', 'gamedev', 'Code review & refactor', 9, 'project', 'published'),
    ('gamedev-m4-s0', 'gamedev', '3D Physics & Entity Engine validation', 10, 'quiz', 'published'),
    ('gamedev-m4-s1', 'gamedev', 'Practical task submission', 11, 'project', 'published'),
    ('gamedev-m4-s2', 'gamedev', 'Competency interview', 12, 'quiz', 'published'),
    ('network-m1-s0', 'network', 'Routing Protocols fundamentals', 1, 'video', 'published'),
    ('network-m1-s1', 'network', 'Subnetting & VLANs fundamentals', 2, 'video', 'published'),
    ('network-m1-s2', 'network', 'Network Automation fundamentals', 3, 'video', 'published'),
    ('network-m2-s0', 'network', 'Guided sandbox drill', 4, 'lab', 'published'),
    ('network-m2-s1', 'network', 'Debugging challenge', 5, 'lab', 'published'),
    ('network-m2-s2', 'network', 'Topology Route Simulator walkthrough', 6, 'lab', 'published'),
    ('network-m3-s0', 'network', 'Project scaffold', 7, 'project', 'published'),
    ('network-m3-s1', 'network', 'Feature implementation', 8, 'project', 'published'),
    ('network-m3-s2', 'network', 'Code review & refactor', 9, 'project', 'published'),
    ('network-m4-s0', 'network', 'Topology Route Simulator validation', 10, 'quiz', 'published'),
    ('network-m4-s1', 'network', 'Practical task submission', 11, 'project', 'published'),
    ('network-m4-s2', 'network', 'Competency interview', 12, 'quiz', 'published'),
    ('arvr-m1-s0', 'arvr', 'Spatial Math fundamentals', 1, 'video', 'published'),
    ('arvr-m1-s1', 'arvr', 'WebXR fundamentals', 2, 'video', 'published'),
    ('arvr-m1-s2', 'arvr', '3D Scene Graphs fundamentals', 3, 'video', 'published'),
    ('arvr-m2-s0', 'arvr', 'Guided sandbox drill', 4, 'lab', 'published'),
    ('arvr-m2-s1', 'arvr', 'Debugging challenge', 5, 'lab', 'published'),
    ('arvr-m2-s2', 'arvr', 'Spatial Scene Builder walkthrough', 6, 'lab', 'published'),
    ('arvr-m3-s0', 'arvr', 'Project scaffold', 7, 'project', 'published'),
    ('arvr-m3-s1', 'arvr', 'Feature implementation', 8, 'project', 'published'),
    ('arvr-m3-s2', 'arvr', 'Code review & refactor', 9, 'project', 'published'),
    ('arvr-m4-s0', 'arvr', 'Spatial Scene Builder validation', 10, 'quiz', 'published'),
    ('arvr-m4-s1', 'arvr', 'Practical task submission', 11, 'project', 'published'),
    ('arvr-m4-s2', 'arvr', 'Competency interview', 12, 'quiz', 'published'),
    ('medical-m1-s0', 'medical', 'ICD-10 fundamentals', 1, 'video', 'published'),
    ('medical-m1-s1', 'medical', 'CPT fundamentals', 2, 'video', 'published'),
    ('medical-m1-s2', 'medical', 'clean claims fundamentals', 3, 'video', 'published'),
    ('medical-m2-s0', 'medical', 'Guided sandbox drill', 4, 'lab', 'published'),
    ('medical-m2-s1', 'medical', 'Debugging challenge', 5, 'lab', 'published'),
    ('medical-m2-s2', 'medical', 'ICD-10 / CPT Validator walkthrough', 6, 'lab', 'published'),
    ('medical-m3-s0', 'medical', 'Project scaffold', 7, 'project', 'published'),
    ('medical-m3-s1', 'medical', 'Feature implementation', 8, 'project', 'published'),
    ('medical-m3-s2', 'medical', 'Code review & refactor', 9, 'project', 'published'),
    ('medical-m4-s0', 'medical', 'ICD-10 / CPT Validator validation', 10, 'quiz', 'published'),
    ('medical-m4-s1', 'medical', 'Practical task submission', 11, 'project', 'published'),
    ('medical-m4-s2', 'medical', 'Competency interview', 12, 'quiz', 'published'),
    ('marketing-m1-s0', 'marketing', 'Paid media fundamentals', 1, 'video', 'published'),
    ('marketing-m1-s1', 'marketing', 'ROAS modelling fundamentals', 2, 'video', 'published'),
    ('marketing-m1-s2', 'marketing', 'Attribution fundamentals', 3, 'video', 'published'),
    ('marketing-m2-s0', 'marketing', 'Guided sandbox drill', 4, 'lab', 'published'),
    ('marketing-m2-s1', 'marketing', 'Debugging challenge', 5, 'lab', 'published'),
    ('marketing-m2-s2', 'marketing', 'ROAS Budget Reallocator walkthrough', 6, 'lab', 'published'),
    ('marketing-m3-s0', 'marketing', 'Project scaffold', 7, 'project', 'published'),
    ('marketing-m3-s1', 'marketing', 'Feature implementation', 8, 'project', 'published'),
    ('marketing-m3-s2', 'marketing', 'Code review & refactor', 9, 'project', 'published'),
    ('marketing-m4-s0', 'marketing', 'ROAS Budget Reallocator validation', 10, 'quiz', 'published'),
    ('marketing-m4-s1', 'marketing', 'Practical task submission', 11, 'project', 'published'),
    ('marketing-m4-s2', 'marketing', 'Competency interview', 12, 'quiz', 'published'),
    ('sap-m1-s0', 'sap', 'GL postings fundamentals', 1, 'video', 'published'),
    ('sap-m1-s1', 'sap', 'controlling fundamentals', 2, 'video', 'published'),
    ('sap-m1-s2', 'sap', 'Financial Reporting fundamentals', 3, 'video', 'published'),
    ('sap-m2-s0', 'sap', 'Guided sandbox drill', 4, 'lab', 'published'),
    ('sap-m2-s1', 'sap', 'Debugging challenge', 5, 'lab', 'published'),
    ('sap-m2-s2', 'sap', 'SAP GL Document Poster walkthrough', 6, 'lab', 'published'),
    ('sap-m3-s0', 'sap', 'Project scaffold', 7, 'project', 'published'),
    ('sap-m3-s1', 'sap', 'Feature implementation', 8, 'project', 'published'),
    ('sap-m3-s2', 'sap', 'Code review & refactor', 9, 'project', 'published'),
    ('sap-m4-s0', 'sap', 'SAP GL Document Poster validation', 10, 'quiz', 'published'),
    ('sap-m4-s1', 'sap', 'Practical task submission', 11, 'project', 'published'),
    ('sap-m4-s2', 'sap', 'Competency interview', 12, 'quiz', 'published'),
    ('sre-m1-s0', 'sre', 'SLO & SLI Design fundamentals', 1, 'video', 'published'),
    ('sre-m1-s1', 'sre', 'Incident Response fundamentals', 2, 'video', 'published'),
    ('sre-m1-s2', 'sre', 'Chaos Engineering fundamentals', 3, 'video', 'published'),
    ('sre-m2-s0', 'sre', 'Guided sandbox drill', 4, 'lab', 'published'),
    ('sre-m2-s1', 'sre', 'Debugging challenge', 5, 'lab', 'published'),
    ('sre-m2-s2', 'sre', 'Chaos & Latency Monitor walkthrough', 6, 'lab', 'published'),
    ('sre-m3-s0', 'sre', 'Project scaffold', 7, 'project', 'published'),
    ('sre-m3-s1', 'sre', 'Feature implementation', 8, 'project', 'published'),
    ('sre-m3-s2', 'sre', 'Code review & refactor', 9, 'project', 'published'),
    ('sre-m4-s0', 'sre', 'Chaos & Latency Monitor validation', 10, 'quiz', 'published'),
    ('sre-m4-s1', 'sre', 'Practical task submission', 11, 'project', 'published'),
    ('sre-m4-s2', 'sre', 'Competency interview', 12, 'quiz', 'published'),
    ('bianalytics-m1-s0', 'bianalytics', 'Power BI fundamentals', 1, 'video', 'published'),
    ('bianalytics-m1-s1', 'bianalytics', 'Data Warehousing fundamentals', 2, 'video', 'published'),
    ('bianalytics-m1-s2', 'bianalytics', 'Executive Dashboards fundamentals', 3, 'video', 'published'),
    ('bianalytics-m2-s0', 'bianalytics', 'Guided sandbox drill', 4, 'lab', 'published'),
    ('bianalytics-m2-s1', 'bianalytics', 'Debugging challenge', 5, 'lab', 'published'),
    ('bianalytics-m2-s2', 'bianalytics', 'BI Metric Pipeline walkthrough', 6, 'lab', 'published'),
    ('bianalytics-m3-s0', 'bianalytics', 'Project scaffold', 7, 'project', 'published'),
    ('bianalytics-m3-s1', 'bianalytics', 'Feature implementation', 8, 'project', 'published'),
    ('bianalytics-m3-s2', 'bianalytics', 'Code review & refactor', 9, 'project', 'published'),
    ('bianalytics-m4-s0', 'bianalytics', 'BI Metric Pipeline validation', 10, 'quiz', 'published'),
    ('bianalytics-m4-s1', 'bianalytics', 'Practical task submission', 11, 'project', 'published'),
    ('bianalytics-m4-s2', 'bianalytics', 'Competency interview', 12, 'quiz', 'published')
ON CONFLICT (id) DO UPDATE SET
    track_id = EXCLUDED.track_id,
    title = EXCLUDED.title,
    day = EXCLUDED.day,
    type = EXCLUDED.type,
    status = EXCLUDED.status,
    updated_at = now();

-- -----------------------------------------------------------------------------
-- 3. Database Constraints (Structural Defense-in-Depth)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    -- Composite unique constraint on curriculum_skills(id, track_id)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_curriculum_skills_id_track'
    ) THEN
        ALTER TABLE public.curriculum_skills
        ADD CONSTRAINT uq_curriculum_skills_id_track UNIQUE (id, track_id);
    END IF;

    -- Composite foreign key constraint on student_skill_completions(skill_id, track_id)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_student_skill_completions_curriculum'
    ) THEN
        ALTER TABLE public.student_skill_completions
        ADD CONSTRAINT fk_student_skill_completions_curriculum
        FOREIGN KEY (skill_id, track_id)
        REFERENCES public.curriculum_skills(id, track_id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 4. Hardened RPC: complete_student_skill
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.complete_student_skill(
    p_student_id UUID,
    p_skill_id TEXT,
    p_track_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_trusted BOOLEAN;
    v_new_xp INT;
    v_row_count INT := 0;
BEGIN
    -- 1. Determine if caller is trusted (admin or service_role)
    v_is_trusted := (
        auth.role() = 'service_role'
        OR current_user = 'service_role'
        OR session_user = 'service_role'
        OR public.is_admin()
    );

    -- 2. Caller Authorization: Only authorized admin, service_role, or the student themselves
    IF NOT (v_is_trusted OR p_student_id = public.current_student_id()) THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- 3. Verify student profile exists
    IF NOT EXISTS (SELECT 1 FROM public.student_profiles WHERE id = p_student_id) THEN
        RAISE EXCEPTION 'Student profile not found: %', p_student_id;
    END IF;

    -- 4. Track Assignment Enforcement: Non-admins must be assigned to the track
    IF NOT v_is_trusted THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.student_tracks
            WHERE student_id = p_student_id AND track_id = p_track_id
        ) THEN
            RAISE EXCEPTION 'Access Denied: Student is not assigned to course track %', p_track_id;
        END IF;
    END IF;

    -- 5. Authoritative Curriculum Skill Validation:
    -- Verify that p_skill_id exists in public.curriculum_skills AND belongs to p_track_id
    IF NOT EXISTS (
        SELECT 1 FROM public.curriculum_skills
        WHERE id = p_skill_id AND track_id = p_track_id
    ) THEN
        RAISE EXCEPTION 'Skill not found or does not belong to the specified track';
    END IF;

    -- 6. Insert Completion (Idempotent: ON CONFLICT DO NOTHING prevents duplicate rows)
    INSERT INTO public.student_skill_completions (student_id, skill_id, track_id, completed_at)
    VALUES (p_student_id, p_skill_id, p_track_id, now())
    ON CONFLICT (student_id, skill_id) DO NOTHING;

    GET DIAGNOSTICS v_row_count = ROW_COUNT;

    -- 7. Progression Mutation: ONLY IF a new completion record was inserted
    IF v_row_count > 0 THEN
        UPDATE public.student_profiles
        SET xp = xp + 30, readiness_t = LEAST(100, readiness_t + 2), updated_at = now()
        WHERE id = p_student_id
        RETURNING xp INTO v_new_xp;

        PERFORM public.calculate_talent_score(p_student_id);
    ELSE
        -- Duplicate attempt: no XP awarded, return existing XP
        SELECT xp INTO v_new_xp FROM public.student_profiles WHERE id = p_student_id;
    END IF;

    RETURN jsonb_build_object(
        'ok', true,
        'student_id', p_student_id,
        'skill_id', p_skill_id,
        'xp', v_new_xp,
        'duplicate', (v_row_count = 0)
    );
END;
$$;

-- -----------------------------------------------------------------------------
-- 5. Permissions & Grants
-- -----------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.complete_student_skill(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_student_skill(UUID, TEXT, TEXT) TO authenticated, service_role;
