-- =====================================================================
-- SANTOGE TALENT CLOUD — ROW LEVEL SECURITY, FUNCTIONS & PROCEDURES
-- Migration: 0002_rls_and_functions.sql
-- =====================================================================

-- 1. Helper Functions
CREATE OR REPLACE FUNCTION public.auth_user_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_college_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT college_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_user_department_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT department_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
  );
$$;

-- 2. Trigger for Automatic Profile Creation on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, avatar_url, is_active, first_login)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'STUDENT'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
    TRUE,
    TRUE
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Enable RLS on ALL application tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_mission_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hack_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iri_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_drives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_crm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 4. Multi-Tenant RLS Policies

-- Profiles Policies
CREATE POLICY "Profiles select own or super admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_super_admin() OR public.current_user_role() IN ('OPERATIONS_MANAGER', 'COLLEGE_SUPER_ADMIN', 'MENTOR'));

CREATE POLICY "Profiles update own or super admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_super_admin());

CREATE POLICY "Super admins manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_super_admin());

-- Permissions & Role Permissions
CREATE POLICY "Permissions viewable by all authenticated"
  ON public.permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Role permissions viewable by all authenticated"
  ON public.role_permissions FOR SELECT
  TO authenticated
  USING (true);

-- Colleges Policies
CREATE POLICY "Colleges viewable by authenticated users"
  ON public.colleges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Colleges manage by super admin and college admin"
  ON public.colleges FOR ALL
  TO authenticated
  USING (public.is_super_admin() OR (public.current_user_role() = 'COLLEGE_SUPER_ADMIN' AND id = public.current_user_college_id()));

-- Departments Policies
CREATE POLICY "Departments viewable for own college or super admin"
  ON public.departments FOR SELECT
  TO authenticated
  USING (public.is_super_admin() OR college_id = public.current_user_college_id() OR public.current_user_role() IN ('STUDENT', 'RECRUITER'));

CREATE POLICY "Departments manage by college admin or super admin"
  ON public.departments FOR ALL
  TO authenticated
  USING (public.is_super_admin() OR (public.current_user_role() = 'COLLEGE_SUPER_ADMIN' AND college_id = public.current_user_college_id()));

-- Batches Policies
CREATE POLICY "Batches view policy"
  ON public.batches FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin() OR
    public.current_user_role() IN ('OPERATIONS_MANAGER', 'CONTENT_MANAGER', 'FINANCE_ADMIN') OR
    college_id = public.current_user_college_id() OR
    mentor_id = auth.uid() OR
    coordinator_id = auth.uid() OR
    public.current_user_role() = 'STUDENT'
  );

CREATE POLICY "Batches manage policy"
  ON public.batches FOR ALL
  TO authenticated
  USING (
    public.is_super_admin() OR
    public.current_user_role() IN ('OPERATIONS_MANAGER', 'COLLEGE_SUPER_ADMIN')
  );

-- Students Policies (Multi-Tenant Isolation)
CREATE POLICY "Students select policy"
  ON public.students FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin() OR
    public.current_user_role() IN ('OPERATIONS_MANAGER', 'CONTENT_MANAGER', 'FINANCE_ADMIN') OR
    (public.current_user_role() IN ('COLLEGE_SUPER_ADMIN', 'COLLEGE_PLACEMENT_OFFICER') AND college_id = public.current_user_college_id()) OR
    (public.current_user_role() = 'DEPARTMENT_COORDINATOR' AND college_id = public.current_user_college_id() AND department_id = public.current_user_department_id()) OR
    (public.current_user_role() = 'STUDENT' AND user_id = auth.uid()) OR
    (public.current_user_role() IN ('MENTOR', 'BATCH_COORDINATOR')) OR
    (public.current_user_role() = 'RECRUITER' AND is_active = true)
  );

CREATE POLICY "Students insert/update policy"
  ON public.students FOR ALL
  TO authenticated
  USING (
    public.is_super_admin() OR
    public.current_user_role() IN ('OPERATIONS_MANAGER', 'COLLEGE_SUPER_ADMIN', 'COLLEGE_PLACEMENT_OFFICER') OR
    (public.current_user_role() = 'STUDENT' AND user_id = auth.uid())
  );

-- Career Tracks, Modules & Content
CREATE POLICY "Career tracks viewable by all authenticated"
  ON public.career_tracks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Learning modules viewable by all authenticated"
  ON public.learning_modules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Content items viewable by all or author"
  ON public.content_items FOR SELECT
  TO authenticated
  USING (public.is_super_admin() OR public.current_user_role() = 'CONTENT_MANAGER' OR status = 'PUBLISHED');

CREATE POLICY "Content items manage by content managers"
  ON public.content_items FOR ALL
  TO authenticated
  USING (public.is_super_admin() OR public.current_user_role() = 'CONTENT_MANAGER');

-- Daily Missions & Student Progress
CREATE POLICY "Daily missions viewable by all authenticated"
  ON public.daily_missions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Student mission progress select"
  ON public.student_mission_progress FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin() OR
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) OR
    public.current_user_role() IN ('MENTOR', 'BATCH_COORDINATOR', 'OPERATIONS_MANAGER')
  );

CREATE POLICY "Student mission progress insert/update"
  ON public.student_mission_progress FOR ALL
  TO authenticated
  USING (
    public.is_super_admin() OR
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  );

-- Projects & Hack missions
CREATE POLICY "Projects viewable by all authenticated"
  ON public.projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Projects manage by creator or mentor"
  ON public.projects FOR ALL
  TO authenticated
  USING (
    public.is_super_admin() OR
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) OR
    public.current_user_role() IN ('MENTOR', 'CONTENT_MANAGER')
  );

CREATE POLICY "Hack missions viewable by all authenticated"
  ON public.hack_missions FOR SELECT
  TO authenticated
  USING (true);

-- Placement Schedules & Submissions
CREATE POLICY "Placement schedules viewable by all authenticated"
  ON public.placement_schedules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Placement task submissions select"
  ON public.placement_task_submissions FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin() OR
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) OR
    public.current_user_role() IN ('MENTOR', 'BATCH_COORDINATOR', 'COLLEGE_PLACEMENT_OFFICER')
  );

CREATE POLICY "Placement task submissions insert/update"
  ON public.placement_task_submissions FOR ALL
  TO authenticated
  USING (
    public.is_super_admin() OR
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  );

-- Score History & XP
CREATE POLICY "Talent score history select"
  ON public.talent_score_history FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin() OR
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) OR
    public.current_user_role() IN ('MENTOR', 'COLLEGE_PLACEMENT_OFFICER', 'RECRUITER')
  );

CREATE POLICY "IRI score history select"
  ON public.iri_score_history FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin() OR
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) OR
    public.current_user_role() IN ('MENTOR', 'COLLEGE_PLACEMENT_OFFICER', 'RECRUITER')
  );

CREATE POLICY "XP transactions select"
  ON public.xp_transactions FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin() OR
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) OR
    public.current_user_role() IN ('MENTOR', 'BATCH_COORDINATOR')
  );

-- Attendance
CREATE POLICY "Attendance select policy"
  ON public.attendance FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin() OR
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) OR
    public.current_user_role() IN ('BATCH_COORDINATOR', 'MENTOR', 'OPERATIONS_MANAGER')
  );

CREATE POLICY "Attendance manage policy"
  ON public.attendance FOR ALL
  TO authenticated
  USING (
    public.is_super_admin() OR
    public.current_user_role() IN ('BATCH_COORDINATOR', 'OPERATIONS_MANAGER')
  );

-- Campus Drives
CREATE POLICY "Campus drives select policy"
  ON public.campus_drives FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin() OR
    college_id = public.current_user_college_id() OR
    public.current_user_role() = 'STUDENT'
  );

CREATE POLICY "Campus drives manage policy"
  ON public.campus_drives FOR ALL
  TO authenticated
  USING (
    public.is_super_admin() OR
    (public.current_user_role() IN ('COLLEGE_SUPER_ADMIN', 'COLLEGE_PLACEMENT_OFFICER') AND college_id = public.current_user_college_id())
  );

-- Company CRM
CREATE POLICY "Company CRM select policy"
  ON public.company_crm FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin() OR
    college_id = public.current_user_college_id()
  );

CREATE POLICY "Company CRM manage policy"
  ON public.company_crm FOR ALL
  TO authenticated
  USING (
    public.is_super_admin() OR
    (public.current_user_role() IN ('COLLEGE_SUPER_ADMIN', 'COLLEGE_PLACEMENT_OFFICER') AND college_id = public.current_user_college_id())
  );

-- Job Postings & Candidate Applications
CREATE POLICY "Job postings viewable by all authenticated"
  ON public.job_postings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Job postings manage by recruiter"
  ON public.job_postings FOR ALL
  TO authenticated
  USING (public.is_super_admin() OR recruiter_id = auth.uid());

CREATE POLICY "Candidate applications select"
  ON public.candidate_applications FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin() OR
    public.current_user_role() = 'RECRUITER' OR
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()) OR
    public.current_user_role() IN ('COLLEGE_PLACEMENT_OFFICER', 'COLLEGE_SUPER_ADMIN')
  );

CREATE POLICY "Candidate applications manage"
  ON public.candidate_applications FOR ALL
  TO authenticated
  USING (
    public.is_super_admin() OR
    public.current_user_role() = 'RECRUITER' OR
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  );

-- Mentor Interventions & Announcements
CREATE POLICY "Mentor interventions policy"
  ON public.mentor_interventions FOR ALL
  TO authenticated
  USING (
    public.is_super_admin() OR
    mentor_id = auth.uid() OR
    public.current_user_role() IN ('OPERATIONS_MANAGER', 'MENTOR') OR
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  );

CREATE POLICY "Batch announcements policy"
  ON public.batch_announcements FOR ALL
  TO authenticated
  USING (true);

-- Payments & Subscriptions
CREATE POLICY "Payments view policy"
  ON public.payments FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin() OR
    public.current_user_role() = 'FINANCE_ADMIN' OR
    student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid())
  );

CREATE POLICY "Payments manage policy"
  ON public.payments FOR ALL
  TO authenticated
  USING (
    public.is_super_admin() OR
    public.current_user_role() = 'FINANCE_ADMIN'
  );

CREATE POLICY "Subscriptions policy"
  ON public.subscriptions FOR ALL
  TO authenticated
  USING (
    public.is_super_admin() OR
    public.current_user_role() = 'FINANCE_ADMIN' OR
    college_id = public.current_user_college_id()
  );

-- Notifications
CREATE POLICY "Notifications select and update own"
  ON public.notifications FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

-- Audit Logs
CREATE POLICY "Audit logs select for super admin"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Audit logs insert for authenticated"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- System Settings
CREATE POLICY "System settings select"
  ON public.system_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System settings manage by super admin"
  ON public.system_settings FOR ALL
  TO authenticated
  USING (public.is_super_admin());

-- 5. RPC Procedures & Transactional Functions

-- Atomic Mission Task Completion
CREATE OR REPLACE FUNCTION public.complete_mission_task(
  p_task_id TEXT,
  p_student_id UUID,
  p_mission_id UUID,
  p_xp INT
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_xp INT;
  v_streak INT;
BEGIN
  -- Insert mission progress
  INSERT INTO public.student_mission_progress (student_id, mission_id, task_id, status, xp_earned)
  VALUES (p_student_id, p_mission_id, p_task_id, 'COMPLETED', p_xp)
  ON CONFLICT (student_id, mission_id, task_id) DO NOTHING;

  -- Record XP transaction
  INSERT INTO public.xp_transactions (student_id, amount, reason, entity_type, entity_id)
  VALUES (p_student_id, p_xp, 'MISSION_TASK_COMPLETED', 'DAILY_MISSION', p_task_id);

  -- Update student XP and streak
  UPDATE public.students
  SET total_xp = total_xp + p_xp,
      streak_days = streak_days + 1,
      updated_at = NOW()
  WHERE id = p_student_id
  RETURNING total_xp, streak_days INTO v_new_xp, v_streak;

  RETURN jsonb_build_object(
    'success', true,
    'taskId', p_task_id,
    'totalXp', v_new_xp,
    'streakDays', v_streak
  );
END;
$$;

-- Atomic Payment Verification
CREATE OR REPLACE FUNCTION public.verify_payment_and_activate(
  p_payment_id UUID,
  p_verifier_name TEXT
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id UUID;
BEGIN
  -- Update payment status
  UPDATE public.payments
  SET status = 'VERIFIED_ACTIVE',
      verified_by = p_verifier_name,
      verified_at = NOW()
  WHERE id = p_payment_id
  RETURNING student_id INTO v_student_id;

  -- Activate student account if linked
  IF v_student_id IS NOT NULL THEN
    UPDATE public.students
    SET is_active = TRUE,
        updated_at = NOW()
    WHERE id = v_student_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'paymentId', p_payment_id, 'studentId', v_student_id);
END;
$$;

-- Enable Realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.candidate_applications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.batch_announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentor_interventions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.campus_drives;
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
