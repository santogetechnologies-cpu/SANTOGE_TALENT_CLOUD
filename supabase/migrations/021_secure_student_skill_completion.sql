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
