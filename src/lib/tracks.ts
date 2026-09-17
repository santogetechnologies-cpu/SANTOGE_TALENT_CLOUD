export type TrackId =
  | "java"
  | "aiml"
  | "datascience"
  | "medical"
  | "marketing"
  | "sap";

export type Domain = {
  id: string;
  label: string;
};

export const DOMAINS: Domain[] = [
  { id: "fullstack", label: "Full Stack Development" },
  { id: "ai_data", label: "AI, Data & Analytics" },
  { id: "enterprise", label: "Enterprise & Business" },
];

export type Track = {
  id: TrackId;
  name: string;
  short: string;
  tagline: string;
  labTitle: string;
  accent: string;
  domain: string;
};

export const TRACKS: Track[] = [
  {
    id: "java",
    name: "Java Full Stack",
    short: "Java FS",
    tagline: "Spring Boot, JPA, JUnit 5",
    labTitle: "Spring Boot + JUnit Runner",
    accent: "var(--brand-amber)",
    domain: "fullstack",
  },
  {
    id: "aiml",
    name: "AI / ML & GenAI",
    short: "AI/ML",
    tagline: "LangChain, embeddings, RAG",
    labTitle: "Vector Similarity Search",
    accent: "var(--brand-purple)",
    domain: "ai_data",
  },
  {
    id: "datascience",
    name: "Data Science",
    short: "Data Sci",
    tagline: "Pandas, NumPy, statistics",
    labTitle: "Dataframe Cleaner",
    accent: "var(--brand-emerald)",
    domain: "ai_data",
  },
  {
    id: "medical",
    name: "Medical Coding",
    short: "Med Coding",
    tagline: "ICD-10, CPT, clean claims",
    labTitle: "ICD-10 / CPT Validator",
    accent: "var(--brand-rose)",
    domain: "enterprise",
  },
  {
    id: "marketing",
    name: "Digital Marketing",
    short: "Marketing",
    tagline: "Paid media, ROAS modelling",
    labTitle: "ROAS Budget Reallocator",
    accent: "var(--brand-amber)",
    domain: "enterprise",
  },
  {
    id: "sap",
    name: "SAP FICO",
    short: "SAP FICO",
    tagline: "GL postings, controlling",
    labTitle: "SAP GL Document Poster",
    accent: "var(--brand-blue)",
    domain: "enterprise",
  },
];

export const trackById = (id: TrackId): Track => TRACKS.find((t) => t.id === id) || TRACKS[0]!;
