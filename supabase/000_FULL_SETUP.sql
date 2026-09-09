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

CREATE POLICY "Students can read their own tracks" ON public.student_tracks FOR SELECT TO authenticated USING (student_id = public.current_student_id() OR public.is_admin());
CREATE POLICY "Students can manage their own tracks" ON public.student_tracks FOR ALL TO authenticated USING (student_id = public.current_student_id() OR public.is_admin()) WITH CHECK (student_id = public.current_student_id() OR public.is_admin());

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
BEGIN
    IF NOT public.is_admin() THEN
        IF NEW.status IS DISTINCT FROM OLD.status OR
           NEW.institution_id IS DISTINCT FROM OLD.institution_id OR
           NEW.batch_id IS DISTINCT FROM OLD.batch_id OR
           NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id THEN
            RAISE EXCEPTION 'Students cannot directly modify institutional batch identity or auth link';
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

-- Seed Super Admin Role explicitly for designated bootstrap user
INSERT INTO public.user_roles (auth_user_id, role)
VALUES ('e6c4e39c-b521-4c37-96a1-be3720e57cb8', 'super_admin')
ON CONFLICT (auth_user_id) DO UPDATE SET role = 'super_admin';

-- Auto-sync remaining users as students if not already present
INSERT INTO public.user_roles (auth_user_id, role)
SELECT id, 'student'
FROM auth.users
WHERE id NOT IN (SELECT auth_user_id FROM public.user_roles)
ON CONFLICT (auth_user_id) DO NOTHING;

-- Reload Schema Cache in PostgREST
NOTIFY pgrst, 'reload schema';

