-- ============================================================================
-- File: seed.sql (Optional Manual Seed Script — NEVER executed automatically)
-- Description: Initial seed data for the 15 technical curriculum tracks.
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
