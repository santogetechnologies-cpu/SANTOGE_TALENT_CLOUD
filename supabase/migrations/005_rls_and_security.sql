-- ============================================================================
-- Migration: 005_rls_and_security.sql
-- Description: Row Level Security (RLS) policies and security helper functions.
-- ============================================================================

-- Helper: Check if the current authenticated user is an authorized Admin
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
      AND role = 'admin'
  ) OR (
    -- Also allow if auth.jwt() claims contain role = 'admin'
    (auth.jwt() ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
$$;

-- Helper: Get the current student_profiles.id for the authenticated user
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

-- Enable RLS on all public tables
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

-- ----------------------------------------------------------------------------
-- 1. Institutions Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Institutions are readable by authenticated users"
    ON public.institutions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Institutions are manageable by Admins"
    ON public.institutions FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 2. Batches Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Batches are readable by authenticated users"
    ON public.batches FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Batches are manageable by Admins"
    ON public.batches FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. User Roles Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can read their own role"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (auth_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage user roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 4. Student Profiles Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Students can read their own profile"
    ON public.student_profiles FOR SELECT
    TO authenticated
    USING (auth_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Students can update their own permitted profile fields"
    ON public.student_profiles FOR UPDATE
    TO authenticated
    USING (auth_user_id = auth.uid() OR public.is_admin())
    WITH CHECK (auth_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage all student profiles"
    ON public.student_profiles FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. Student Tracks Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Students can read their own tracks"
    ON public.student_tracks FOR SELECT
    TO authenticated
    USING (student_id = public.current_student_id() OR public.is_admin());

CREATE POLICY "Students can manage their own tracks"
    ON public.student_tracks FOR ALL
    TO authenticated
    USING (student_id = public.current_student_id() OR public.is_admin())
    WITH CHECK (student_id = public.current_student_id() OR public.is_admin());

-- ----------------------------------------------------------------------------
-- 6. Platform Settings Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Settings readable by authenticated users"
    ON public.platform_settings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Settings manageable by Admins"
    ON public.platform_settings FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 7. Curriculum Tracks & Skills (Public / Authenticated Read, Admin Write)
-- ----------------------------------------------------------------------------
CREATE POLICY "Curriculum tracks readable by all authenticated"
    ON public.curriculum_tracks FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Curriculum tracks manageable by Admins"
    ON public.curriculum_tracks FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Curriculum skills readable by all authenticated"
    ON public.curriculum_skills FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Curriculum skills manageable by Admins"
    ON public.curriculum_skills FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 8. Student Progress Policies (Own Rows Only, Admins Read All)
-- ----------------------------------------------------------------------------
CREATE POLICY "Skill completions own or admin"
    ON public.student_skill_completions FOR ALL
    TO authenticated
    USING (student_id = public.current_student_id() OR public.is_admin())
    WITH CHECK (student_id = public.current_student_id() OR public.is_admin());

CREATE POLICY "Lab completions own or admin"
    ON public.student_lab_completions FOR ALL
    TO authenticated
    USING (student_id = public.current_student_id() OR public.is_admin())
    WITH CHECK (student_id = public.current_student_id() OR public.is_admin());

CREATE POLICY "Daily progress own or admin"
    ON public.student_daily_progress FOR ALL
    TO authenticated
    USING (student_id = public.current_student_id() OR public.is_admin())
    WITH CHECK (student_id = public.current_student_id() OR public.is_admin());

CREATE POLICY "Placement attendance own or admin"
    ON public.placement_attendance FOR ALL
    TO authenticated
    USING (student_id = public.current_student_id() OR public.is_admin())
    WITH CHECK (student_id = public.current_student_id() OR public.is_admin());

CREATE POLICY "Tech days own or admin"
    ON public.student_technical_days FOR ALL
    TO authenticated
    USING (student_id = public.current_student_id() OR public.is_admin())
    WITH CHECK (student_id = public.current_student_id() OR public.is_admin());

CREATE POLICY "Assessments own or admin"
    ON public.student_assessments FOR ALL
    TO authenticated
    USING (student_id = public.current_student_id() OR public.is_admin())
    WITH CHECK (student_id = public.current_student_id() OR public.is_admin());

CREATE POLICY "Mocks own or admin"
    ON public.student_mocks FOR ALL
    TO authenticated
    USING (student_id = public.current_student_id() OR public.is_admin())
    WITH CHECK (student_id = public.current_student_id() OR public.is_admin());

CREATE POLICY "Certificates own or admin"
    ON public.student_certifications FOR ALL
    TO authenticated
    USING (student_id = public.current_student_id() OR public.is_admin())
    WITH CHECK (student_id = public.current_student_id() OR public.is_admin());

-- ----------------------------------------------------------------------------
-- 9. Hiring Drives & Placements Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Hiring drives readable by authenticated"
    ON public.hiring_drives FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Hiring drives manageable by Admins"
    ON public.hiring_drives FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Placements readable by own student or admin"
    ON public.placements FOR SELECT
    TO authenticated
    USING (student_id = public.current_student_id() OR public.is_admin());

CREATE POLICY "Placements manageable by Admins"
    ON public.placements FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 10. Talent Scores & Content Items Policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Talent scores readable by authenticated"
    ON public.talent_scores FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Talent scores manageable by Admins or system"
    ON public.talent_scores FOR ALL
    TO authenticated
    USING (public.is_admin() OR student_id = public.current_student_id())
    WITH CHECK (public.is_admin() OR student_id = public.current_student_id());

CREATE POLICY "Published content items readable by authenticated"
    ON public.content_items FOR SELECT
    TO authenticated
    USING (status = 'published' OR public.is_admin());

CREATE POLICY "Content items manageable by Admins"
    ON public.content_items FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
