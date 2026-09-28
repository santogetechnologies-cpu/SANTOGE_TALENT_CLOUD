-- Migration 023: Default readiness dimensions to 0 instead of 50
-- Ensures student scores are purely real activity-based backend data with zero mock defaults

ALTER TABLE public.student_profiles
  ALTER COLUMN readiness_t SET DEFAULT 0,
  ALTER COLUMN readiness_c SET DEFAULT 0,
  ALTER COLUMN readiness_a SET DEFAULT 0,
  ALTER COLUMN readiness_e SET DEFAULT 0,
  ALTER COLUMN readiness_r SET DEFAULT 0,
  ALTER COLUMN readiness_m SET DEFAULT 0;
