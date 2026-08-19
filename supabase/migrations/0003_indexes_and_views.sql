-- ==============================================================================
-- 0003_INDEXES_AND_VIEWS.SQL — PERFORMANCE INDEXES, ANALYTICAL VIEWS & EXTENSIONS
-- Pure Schema & Structure Setup (No Insert Data)
-- ==============================================================================

-- 1. Performance Indexes for High-Concurrency Queries
CREATE INDEX IF NOT EXISTS idx_students_college_id ON public.students(college_id);
CREATE INDEX IF NOT EXISTS idx_students_department_id ON public.students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_batch_id ON public.students(batch_id);
CREATE INDEX IF NOT EXISTS idx_students_talent_score ON public.students(talent_score DESC);
CREATE INDEX IF NOT EXISTS idx_students_risk_status ON public.students(risk_status);

CREATE INDEX IF NOT EXISTS idx_batches_college_id ON public.batches(college_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON public.batches(status);

CREATE INDEX IF NOT EXISTS idx_campus_drives_college_id ON public.campus_drives(college_id);
CREATE INDEX IF NOT EXISTS idx_campus_drives_status ON public.campus_drives(status);

CREATE INDEX IF NOT EXISTS idx_candidate_applications_job_id ON public.candidate_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_candidate_applications_student_id ON public.candidate_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_candidate_applications_stage ON public.candidate_applications(stage);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

CREATE INDEX IF NOT EXISTS idx_mentor_interventions_student_id ON public.mentor_interventions(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_interventions_mentor_id ON public.mentor_interventions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_interventions_resolved ON public.mentor_interventions(resolved);

-- 2. Analytical Materialized Views & Summary Views
CREATE OR REPLACE VIEW public.vw_college_placement_summaries AS
SELECT 
    c.id AS college_id,
    c.name AS college_name,
    c.code AS college_code,
    c.city,
    c.state,
    COUNT(s.id) AS total_enrolled_students,
    COALESCE(AVG(s.talent_score), 0)::NUMERIC(5,2) AS avg_talent_score,
    COALESCE(AVG(s.iri_score), 0)::NUMERIC(5,2) AS avg_iri_score,
    COUNT(CASE WHEN s.risk_status = 'ON_TRACK' THEN 1 END) AS on_track_count,
    COUNT(CASE WHEN s.risk_status = 'STRUGGLING' THEN 1 END) AS struggling_count
FROM public.colleges c
LEFT JOIN public.students s ON s.college_id = c.id
GROUP BY c.id, c.name, c.code, c.city, c.state;

CREATE OR REPLACE VIEW public.vw_department_analytics AS
SELECT 
    d.id AS department_id,
    d.college_id,
    d.name AS department_name,
    d.code AS department_code,
    d.coordinator_name,
    COUNT(s.id) AS active_students,
    COALESCE(AVG(s.talent_score), 0)::NUMERIC(5,2) AS department_avg_score
FROM public.departments d
LEFT JOIN public.students s ON s.department_id = d.id
GROUP BY d.id, d.college_id, d.name, d.code, d.coordinator_name;

-- 3. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
