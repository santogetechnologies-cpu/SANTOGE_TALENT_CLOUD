import * as fs from "fs";

const TRACK_METADATA = [
  { id: "java", name: "Enterprise Java & Spring Boot", short: "Java Spring", category: "Backend Engineering", keywords: ["Spring Boot", "JPA", "JUnit 5"], labTitle: "Spring Boot + JUnit Runner", accent: "#f59e0b" },
  { id: "aiml", name: "Applied AI & Machine Learning", short: "AI & ML", category: "Data & Intelligence", keywords: ["LangChain", "embeddings", "RAG"], labTitle: "Vector Similarity Search", accent: "#8b5cf6" },
  { id: "datascience", name: "Data Science & Big Data Engineering", short: "Data Science", category: "Data & Intelligence", keywords: ["Pandas", "NumPy", "statistics"], labTitle: "Dataframe Cleaner", accent: "#ec4899" },
  { id: "mern", name: "MERN Full-Stack Development", short: "MERN", category: "Web Development", keywords: ["React", "Node.js", "Express & MongoDB"], labTitle: "MERN API + UI Sandbox", accent: "#10b981" },
  { id: "cloud", name: "Cloud Architecture & DevOps", short: "Cloud & DevOps", category: "Cloud Infrastructure", keywords: ["AWS & Cloud", "Docker & Containers", "Kubernetes & CI/CD"], labTitle: "Cloud Cluster Deployer", accent: "#06b6d4" },
  { id: "python", name: "Python Systems & Microservices", short: "Python", category: "Backend Engineering", keywords: ["FastAPI", "PostgreSQL", "Microservices"], labTitle: "Async Microservice Engine", accent: "#3b82f6" },
  { id: "cyber", name: "Cybersecurity & Ethical Hacking", short: "Cybersecurity", category: "Security", keywords: ["Threat Modeling", "Penetration Testing", "SOC Analysis"], labTitle: "Security Vulnerability Scanner", accent: "#ef4444" },
  { id: "mobile", name: "Cross-Platform Mobile (React Native/Flutter)", short: "Mobile App", category: "Mobile Development", keywords: ["React Native", "Flutter", "State Management"], labTitle: "Mobile Navigation & Storage", accent: "#14b8a6" },
  { id: "blockchain", name: "Web3 & Decentralized Systems", short: "Web3", category: "Emerging Tech", keywords: ["Solidity", "Smart Contracts", "Web3 Integration"], labTitle: "Smart Contract Deployer", accent: "#6366f1" },
  { id: "embedded", name: "Embedded Systems & IoT Hardware", short: "IoT & Embedded", category: "Hardware", keywords: ["C/C++ Systems", "RTOS", "IoT Protocols"], labTitle: "Firmware Flash Simulator", accent: "#84cc16" },
  { id: "qa", name: "Automated QA & Reliability Engineering", short: "QA & SDET", category: "Software Quality", keywords: ["Playwright", "Test Automation", "CI/CD Testing"], labTitle: "E2E Test Suite Runner", accent: "#f97316" },
  { id: "uiux", name: "Product Design & Frontend Systems", short: "UI/UX Design", category: "Design & Product", keywords: ["Design Systems", "Figma Prototyping", "Accessibility"], labTitle: "Design Token Architecture", accent: "#d946ef" },
  { id: "gamedev", name: "Interactive Game Systems & 3D Engines", short: "Game Dev", category: "Interactive Media", keywords: ["Game Architecture", "Physics Engines", "Shader Pipelines"], labTitle: "3D Physics & Entity Engine", accent: "#a855f7" },
  { id: "network", name: "Enterprise Network Engineering", short: "Networking", category: "Infrastructure", keywords: ["Routing Protocols", "Subnetting & VLANs", "Network Automation"], labTitle: "Topology Route Simulator", accent: "#0ea5e9" },
  { id: "arvr", name: "Spatial Computing & XR Systems", short: "AR/VR & XR", category: "Emerging Tech", keywords: ["Spatial Math", "WebXR", "3D Scene Graphs"], labTitle: "Spatial Scene Builder", accent: "#f43f5e" },
  { id: "medical", name: "Medical Coding", short: "Med Coding", category: "Enterprise & Business", keywords: ["ICD-10", "CPT", "clean claims"], labTitle: "ICD-10 / CPT Validator", accent: "#f43f5e" },
  { id: "marketing", name: "Digital Marketing", short: "Marketing", category: "Enterprise & Business", keywords: ["Paid media", "ROAS modelling", "Attribution"], labTitle: "ROAS Budget Reallocator", accent: "#f59e0b" },
  { id: "sap", name: "SAP FICO", short: "SAP FICO", category: "Enterprise & Business", keywords: ["GL postings", "controlling", "Financial Reporting"], labTitle: "SAP GL Document Poster", accent: "#3b82f6" },
  { id: "sre", name: "Site Reliability Engineering", short: "SRE", category: "Cloud Infrastructure", keywords: ["SLO & SLI Design", "Incident Response", "Chaos Engineering"], labTitle: "Chaos & Latency Monitor", accent: "#06b6d4" },
  { id: "bianalytics", name: "Business Intelligence & Analytics", short: "BI & Analytics", category: "Data & Intelligence", keywords: ["Power BI", "Data Warehousing", "Executive Dashboards"], labTitle: "BI Metric Pipeline", accent: "#8b5cf6" },
];

function escapeSql(str) {
  return str.replace(/'/g, "''");
}

let sql = `-- ============================================================================
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
`;

const trackValues = TRACK_METADATA.map(t =>
  `    ('${t.id}', '${escapeSql(t.name)}', '${escapeSql(t.short)}', '${escapeSql(t.category)}', 30, '${t.accent}')`
).join(",\n");

sql += trackValues + `\nON CONFLICT (id) DO NOTHING;\n\n`;

sql += `-- -----------------------------------------------------------------------------
-- 2. Seed Authoritative Curriculum Skills
-- -----------------------------------------------------------------------------
INSERT INTO public.curriculum_skills (id, track_id, title, day, type, status)
VALUES
`;

const skillRows = [];
for (const t of TRACK_METADATA) {
  // Module 1: Foundations (video)
  skillRows.push(`    ('${t.id}-m1-s0', '${t.id}', '${escapeSql(t.keywords[0])} fundamentals', 1, 'video', 'published')`);
  skillRows.push(`    ('${t.id}-m1-s1', '${t.id}', '${escapeSql(t.keywords[1])} fundamentals', 2, 'video', 'published')`);
  skillRows.push(`    ('${t.id}-m1-s2', '${t.id}', '${escapeSql(t.keywords[2])} fundamentals', 3, 'video', 'published')`);

  // Module 2: Sandbox practice (lab)
  skillRows.push(`    ('${t.id}-m2-s0', '${t.id}', 'Guided sandbox drill', 4, 'lab', 'published')`);
  skillRows.push(`    ('${t.id}-m2-s1', '${t.id}', 'Debugging challenge', 5, 'lab', 'published')`);
  skillRows.push(`    ('${t.id}-m2-s2', '${t.id}', '${escapeSql(t.labTitle)} walkthrough', 6, 'lab', 'published')`);

  // Module 3: Applied build (project)
  skillRows.push(`    ('${t.id}-m3-s0', '${t.id}', 'Project scaffold', 7, 'project', 'published')`);
  skillRows.push(`    ('${t.id}-m3-s1', '${t.id}', 'Feature implementation', 8, 'project', 'published')`);
  skillRows.push(`    ('${t.id}-m3-s2', '${t.id}', 'Code review & refactor', 9, 'project', 'published')`);

  // Module 4: Competency evidence (quiz / project)
  skillRows.push(`    ('${t.id}-m4-s0', '${t.id}', '${escapeSql(t.labTitle)} validation', 10, 'quiz', 'published')`);
  skillRows.push(`    ('${t.id}-m4-s1', '${t.id}', 'Practical task submission', 11, 'project', 'published')`);
  skillRows.push(`    ('${t.id}-m4-s2', '${t.id}', 'Competency interview', 12, 'quiz', 'published')`);
}

sql += skillRows.join(",\n") + `\nON CONFLICT (id) DO UPDATE SET
    track_id = EXCLUDED.track_id,
    title = EXCLUDED.title,
    day = EXCLUDED.day,
    type = EXCLUDED.type,
    status = EXCLUDED.status,
    updated_at = now();\n\n`;

sql += `-- -----------------------------------------------------------------------------
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
`;

fs.writeFileSync("supabase/migrations/021_secure_student_skill_completion.sql", sql);
console.log("Written supabase/migrations/021_secure_student_skill_completion.sql successfully!");
