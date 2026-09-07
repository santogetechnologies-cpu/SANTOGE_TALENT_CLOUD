export type TrackId =
  | "mern"
  | "java"
  | "aiml"
  | "datascience"
  | "cloud"
  | "cyber"
  | "sre"
  | "uiux"
  | "qa"
  | "mobile"
  | "medical"
  | "marketing"
  | "sap"
  | "hr"
  | "bianalytics";

export type Track = {
  id: TrackId;
  name: string;
  short: string;
  tagline: string;
  labTitle: string;
  accent: string;
};

export const TRACKS: Track[] = [
  {
    id: "mern",
    name: "MERN Stack Development",
    short: "MERN",
    tagline: "React, Node, Express, MongoDB",
    labTitle: "REST API Test Runner",
    accent: "var(--brand-cyan)",
  },
  {
    id: "java",
    name: "Java Full Stack",
    short: "Java FS",
    tagline: "Spring Boot, JPA, JUnit 5",
    labTitle: "Spring Boot + JUnit Runner",
    accent: "var(--brand-amber)",
  },
  {
    id: "aiml",
    name: "AI / ML & GenAI",
    short: "AI/ML",
    tagline: "LangChain, embeddings, RAG",
    labTitle: "Vector Similarity Search",
    accent: "var(--brand-purple)",
  },
  {
    id: "datascience",
    name: "Data Science",
    short: "Data Sci",
    tagline: "Pandas, NumPy, statistics",
    labTitle: "Dataframe Cleaner",
    accent: "var(--brand-emerald)",
  },
  {
    id: "cloud",
    name: "Cloud & DevOps (AWS)",
    short: "Cloud",
    tagline: "Terraform, EC2, IAM",
    labTitle: "Terraform Apply Console",
    accent: "var(--brand-blue)",
  },
  {
    id: "cyber",
    name: "Cybersecurity",
    short: "Cyber",
    tagline: "Recon, hardening, firewalls",
    labTitle: "Nmap Port Scanner",
    accent: "var(--brand-rose)",
  },
  {
    id: "sre",
    name: "DevOps & SRE",
    short: "SRE",
    tagline: "Kubernetes, scaling, SLOs",
    labTitle: "Kubernetes Scaling Terminal",
    accent: "var(--brand-cyan)",
  },
  {
    id: "uiux",
    name: "UI / UX Design",
    short: "UI/UX",
    tagline: "Design systems, accessibility",
    labTitle: "Viewport + WCAG Checker",
    accent: "var(--brand-purple)",
  },
  {
    id: "qa",
    name: "QA Automation",
    short: "QA",
    tagline: "Cypress, regression suites",
    labTitle: "Cypress Suite Runner",
    accent: "var(--brand-emerald)",
  },
  {
    id: "mobile",
    name: "Mobile App Development",
    short: "Mobile",
    tagline: "React Native, push, hot reload",
    labTitle: "Device Mock + Push",
    accent: "var(--brand-blue)",
  },
  {
    id: "medical",
    name: "Medical Coding",
    short: "Med Coding",
    tagline: "ICD-10, CPT, clean claims",
    labTitle: "ICD-10 / CPT Validator",
    accent: "var(--brand-rose)",
  },
  {
    id: "marketing",
    name: "Digital Marketing",
    short: "Marketing",
    tagline: "Paid media, ROAS modelling",
    labTitle: "ROAS Budget Reallocator",
    accent: "var(--brand-amber)",
  },
  {
    id: "sap",
    name: "SAP FICO",
    short: "SAP FICO",
    tagline: "GL postings, controlling",
    labTitle: "SAP GL Document Poster",
    accent: "var(--brand-blue)",
  },
  {
    id: "hr",
    name: "HR & Payroll",
    short: "HR",
    tagline: "CTC structuring, statutory",
    labTitle: "CTC Salary Calculator",
    accent: "var(--brand-emerald)",
  },
  {
    id: "bianalytics",
    name: "Business Analytics",
    short: "BI",
    tagline: "Excel, Power BI, DAX",
    labTitle: "DAX Formula Evaluator",
    accent: "var(--brand-purple)",
  },
];

export const trackById = (id: TrackId) => TRACKS.find((t) => t.id === id)!;
