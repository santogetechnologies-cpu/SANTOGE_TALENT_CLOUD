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

function generateSkills(t) {
  return [
    // Module 1: Foundations (video)
    { id: `${t.id}-m1-s0`, track_id: t.id, title: `${t.keywords[0]} fundamentals`, day: 1, type: "video" },
    { id: `${t.id}-m1-s1`, track_id: t.id, title: `${t.keywords[1]} fundamentals`, day: 2, type: "video" },
    { id: `${t.id}-m1-s2`, track_id: t.id, title: `${t.keywords[2]} fundamentals`, day: 3, type: "video" },
    // Module 2: Sandbox practice (lab)
    { id: `${t.id}-m2-s0`, track_id: t.id, title: "Guided sandbox drill", day: 4, type: "lab" },
    { id: `${t.id}-m2-s1`, track_id: t.id, title: "Debugging challenge", day: 5, type: "lab" },
    { id: `${t.id}-m2-s2`, track_id: t.id, title: `${t.labTitle} walkthrough`, day: 6, type: "lab" },
    // Module 3: Applied build (project)
    { id: `${t.id}-m3-s0`, track_id: t.id, title: "Project scaffold", day: 7, type: "project" },
    { id: `${t.id}-m3-s1`, track_id: t.id, title: "Feature implementation", day: 8, type: "project" },
    { id: `${t.id}-m3-s2`, track_id: t.id, title: "Code review & refactor", day: 9, type: "project" },
    // Module 4: Competency evidence (quiz / project)
    { id: `${t.id}-m4-s0`, track_id: t.id, title: `${t.labTitle} validation`, day: 10, type: "quiz" },
    { id: `${t.id}-m4-s1`, track_id: t.id, title: "Practical task submission", day: 11, type: "project" },
    { id: `${t.id}-m4-s2`, track_id: t.id, title: "Competency interview", day: 12, type: "quiz" },
  ];
}

const allSkills = TRACK_METADATA.flatMap(generateSkills);
console.log(`Generated ${allSkills.length} skills across ${TRACK_METADATA.length} tracks.`);
console.log("Sample java skills:", allSkills.slice(0, 12));
