-- SantoGe Talent Cloud — Migration 010: Make student_profiles.auth_user_id nullable
-- Enables bulk student provisioning and onboarding before initial auth user account creation.

ALTER TABLE public.student_profiles ALTER COLUMN auth_user_id DROP NOT NULL;

-- Ensure foreign key sets NULL on auth user deletion without deleting learner progress history
ALTER TABLE public.student_profiles DROP CONSTRAINT IF EXISTS student_profiles_auth_user_id_fkey;
ALTER TABLE public.student_profiles 
    ADD CONSTRAINT student_profiles_auth_user_id_fkey 
    FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
