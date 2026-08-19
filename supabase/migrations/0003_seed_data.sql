-- ==============================================================================
-- 0003_SEED_DATA.SQL — CLEAN DDL INITIALIZATION
-- Pure Schema & Structure Setup (No Insert Data)
-- ==============================================================================

-- 1. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_students_college_id ON public.students(college_id);
CREATE INDEX IF NOT EXISTS idx_students_department_id ON public.students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_batch_id ON public.students(batch_id);
CREATE INDEX IF NOT EXISTS idx_students_talent_score ON public.students(talent_score DESC);
CREATE INDEX IF NOT EXISTS idx_students_risk_status ON public.students(risk_status);

-- 2. Materialized Views & Summary Structures
CREATE OR REPLACE VIEW public.vw_college_placement_summaries AS
SELECT 
    c.id AS college_id,
    c.name AS college_name,
    c.code AS college_code,
    COUNT(s.id) AS total_enrolled_students,
    COALESCE(AVG(s.talent_score), 0)::NUMERIC(5,2) AS avg_talent_score,
    COALESCE(AVG(s.iri_score), 0)::NUMERIC(5,2) AS avg_iri_score
FROM public.colleges c
LEFT JOIN public.students s ON s.college_id = c.id
GROUP BY c.id, c.name, c.code;

-- 3. Notify PostgREST
NOTIFY pgrst, 'reload schema';
