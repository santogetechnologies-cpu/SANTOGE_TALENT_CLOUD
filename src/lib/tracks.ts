export type TrackId =
  | "java"
  | "datascience"
  | "aiml";

export type Domain = {
  id: string;
  label: string;
};

export const DOMAINS: Domain[] = [
  { id: "fullstack", label: "Full Stack & Cloud Development" },
  { id: "data_analytics", label: "Data Analysis & Business Intelligence" },
  { id: "ai_ml", label: "AI & Machine Learning Engineering" },
];

export type Track = {
  id: TrackId;
  name: string;
  short: string;
  tagline: string;
  labTitle: string;
  accent: string;
  domain: string;
  topics: string[];
};

export const TRACKS: Track[] = [
  {
    id: "java",
    name: "Full Stack & AI Software Engineering",
    short: "Full Stack",
    tagline:
      "HTML, CSS, JavaScript, React, Node.js, Java, Spring Boot, REST APIs, MySQL, NoSQL, Python, AI/LLM APIs, LangChain, RAG, Git, Docker, AWS",
    labTitle: "Full Stack & Microservices Simulator",
    accent: "var(--brand-indigo)",
    domain: "fullstack",
    topics: [
      "HTML5 & Modern Semantic Web",
      "CSS3, Responsive Grid & Flexbox",
      "Modern JavaScript ES6+ & Async/Await",
      "React 19, Components & State Hooks",
      "Node.js & Express REST API Architecture",
      "Java Core, OOP & Collections Framework",
      "Spring Boot 3, Dependency Injection & JPA",
      "RESTful API Design & OpenAPI Documentation",
      "MySQL Relational Modeling & Complex Joins",
      "NoSQL (MongoDB / Redis) Document Caching",
      "Python Scripting & Automation",
      "AI / LLM APIs (OpenAI / Gemini Integration)",
      "LangChain Tool Chains & Prompt Engineering",
      "Retrieval-Augmented Generation (RAG) Architecture",
      "Git Branching, PR Workflows & Merge Strategies",
      "Docker Containerization & Multi-stage Builds",
      "AWS Cloud Deployment (EC2, S3, RDS, Lambda)",
    ],
  },
  {
    id: "datascience",
    name: "Data Analysis",
    short: "Data Analytics",
    tagline:
      "Excel + SQL/MySQL + Python + NumPy + Pandas + Matplotlib/Seaborn + Power BI + Tableau",
    labTitle: "Interactive Data Analysis & BI Workbench",
    accent: "var(--brand-emerald)",
    domain: "data_analytics",
    topics: [
      "Advanced Excel (VLOOKUP, INDEX/MATCH, Pivot Tables & Power Query)",
      "SQL & MySQL (Aggregations, Subqueries, Window Functions & CTEs)",
      "Python for Data Analysts (Control Flow, Functions & Virtual Envs)",
      "NumPy (Vectorized Operations, Slicing & Mathematical Computation)",
      "Pandas (DataFrames, GroupBy, Merges, Transformations & Time-Series)",
      "Matplotlib & Seaborn (Statistical Visualizations & Storytelling)",
      "Power BI (DAX Formulas, Power Query ETL, Interactive Dashboards)",
      "Tableau (LOD Expressions, Calculated Fields & Executive Visuals)",
      "Automated Business Reporting & KPI Pipeline Workflows",
    ],
  },
  {
    id: "aiml",
    name: "AI & ML Engineer",
    short: "AI / ML",
    tagline:
      "Python + SQL + NumPy + Pandas + Scikit-learn + PyTorch/TensorFlow + NLP + Transformers + GenAI/LLMs + RAG + LangChain + FastAPI + PostgreSQL + Git + AWS",
    labTitle: "AI/ML & Vector RAG Pipeline Workbench",
    accent: "var(--brand-purple)",
    domain: "ai_ml",
    topics: [
      "Python for Machine Learning & Scientific Computing",
      "SQL for AI Engineers (Feature Queries, Vector Embeddings)",
      "NumPy (Tensor Operations, Slicing & Matrix Math)",
      "Pandas (Feature Engineering, Outlier Imputation & Scaling)",
      "Scikit-learn (Supervised, Unsupervised ML & Cross-Validation)",
      "PyTorch & TensorFlow (Neural Networks, Backprop & GPU Training)",
      "Natural Language Processing (Tokenization, TF-IDF, Word2Vec)",
      "Transformers & HuggingFace Models (BERT, RoBERTa, T5)",
      "GenAI & Large Language Models (Fine-Tuning, Quantization)",
      "Vector Databases & RAG Pipelines (ChromaDB, Pinecone, FAISS)",
      "LangChain & LlamaIndex Autonomous Agent Frameworks",
      "FastAPI (Asynchronous AI Model Microservice Endpoints)",
      "PostgreSQL + pgvector (Vector Storage & Hybrid Search)",
      "Git & MLOps Versioning (Model Cards & Experiments)",
      "AWS Cloud ML Deployment (SageMaker, S3, ECS, Lambda)",
    ],
  },
];

export const trackById = (id: TrackId): Track =>
  TRACKS.find((t) => t.id === id) || TRACKS[0]!;

export const isStudentTrackAssigned = (
  assignedTracks: TrackId[],
  trackId: TrackId,
): boolean => {
  if (!assignedTracks || assignedTracks.length === 0) return true;
  return assignedTracks.includes(trackId);
};
