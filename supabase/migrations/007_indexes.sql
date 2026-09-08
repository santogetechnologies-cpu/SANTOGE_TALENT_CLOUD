-- ============================================================================
-- Migration: 007_indexes.sql
-- Description: Optimized B-Tree indexes for fast filtered lookups and sorting.
-- ============================================================================

-- Core lookups
CREATE INDEX IF NOT EXISTS idx_student_profiles_auth_user_id ON public.student_profiles (auth_user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_batch_id ON public.student_profiles (batch_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_institution_id ON public.student_profiles (institution_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_email ON public.student_profiles (email);
CREATE INDEX IF NOT EXISTS idx_student_profiles_talent_score ON public.student_profiles (talent_score DESC);
CREATE INDEX IF NOT EXISTS idx_student_profiles_status ON public.student_profiles (status);

CREATE INDEX IF NOT EXISTS idx_student_tracks_student_id ON public.student_tracks (student_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_auth_user_id ON public.user_roles (auth_user_id);
CREATE INDEX IF NOT EXISTS idx_batches_institution_id ON public.batches (institution_id);

-- Learning progress lookups
CREATE INDEX IF NOT EXISTS idx_skill_completions_student_id ON public.student_skill_completions (student_id);
CREATE INDEX IF NOT EXISTS idx_lab_completions_student_id ON public.student_lab_completions (student_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_student_date ON public.student_daily_progress (student_id, date);

-- Placement lookups
CREATE INDEX IF NOT EXISTS idx_placement_attendance_student ON public.placement_attendance (student_id, day);
CREATE INDEX IF NOT EXISTS idx_student_tech_days_student ON public.student_technical_days (student_id, day);
CREATE INDEX IF NOT EXISTS idx_student_assessments_student ON public.student_assessments (student_id, day);
CREATE INDEX IF NOT EXISTS idx_student_mocks_student ON public.student_mocks (student_id);
CREATE INDEX IF NOT EXISTS idx_student_certs_student ON public.student_certifications (student_id);

CREATE INDEX IF NOT EXISTS idx_hiring_drives_status ON public.hiring_drives (status);
CREATE INDEX IF NOT EXISTS idx_placements_student_id ON public.placements (student_id);
CREATE INDEX IF NOT EXISTS idx_content_items_status ON public.content_items (status);
