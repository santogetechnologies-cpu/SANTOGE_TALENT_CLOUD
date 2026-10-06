import type { TrackId } from "./tracks";

export type DayPlan = {
  day: number;
  topic: string;
  practice: string;
  isProject?: boolean;
  projectTitle?: string;
  workplaceSimulation?: string;
  deliverable?: string;
};

export type WeekPlan = {
  week: number;
  title: string;
  theme: string;
  days: DayPlan[];
  projectTitle: string;
  deliverable: string;
  workplaceSkill: string;
};

export type PhasePlan = {
  phaseNumber: number;
  title: string;
  weeksRange: string;
  description: string;
};

export type CapstoneStep = {
  step: number;
  title: string;
  description: string;
};

export type PortfolioItem = {
  num: number;
  project: string;
  workplaceSkill: string;
  phase: string;
};

export type TrackSyllabus = {
  trackId: TrackId | string;
  trackName: string;
  targetRole: string;
  careerProgression: string[];
  interviewPitch: string;
  phases: PhasePlan[];
  weeks: WeekPlan[];
  day90Capstone: {
    title: string;
    description: string;
    flow: string[];
    steps: CapstoneStep[];
  };
  portfolio: PortfolioItem[];
};

/* ==========================================================================
   HELPER: Build 90 Days of Interactive Daily Learning (No Project-Only Days)
   ========================================================================== */
function buildInteractiveSyllabus(
  trackId: TrackId,
  trackName: string,
  targetRole: string,
  careerProgression: string[],
  interviewPitch: string,
  phases: PhasePlan[],
  weeksData: Array<{
    week: number;
    title: string;
    theme: string;
    workplaceSkill: string;
    deliverable: string;
    days: Array<{ topic: string; practice: string }>;
  }>,
): TrackSyllabus {
  const weeks: WeekPlan[] = weeksData.map((w) => ({
    week: w.week,
    title: w.title,
    theme: w.theme,
    projectTitle: `${w.title} Learning Module`,
    deliverable: w.deliverable,
    workplaceSkill: w.workplaceSkill,
    days: w.days.map((d, dIdx) => ({
      day: (w.week - 1) * 5 + dIdx + 1,
      topic: d.topic,
      practice: d.practice,
      isProject: false, // 100% learning on all days
      workplaceSimulation: `Interactive coding and practical exercise on ${d.topic}`,
      deliverable: `Verified practice lab completion (+50 XP)`,
    })),
  }));

  const portfolio: PortfolioItem[] = weeksData.map((w, idx) => ({
    num: idx + 1,
    project: w.title,
    workplaceSkill: w.workplaceSkill,
    phase: `Phase ${Math.min(5, Math.ceil(w.week / 3.6))}`,
  }));

  return {
    trackId,
    trackName,
    targetRole,
    careerProgression,
    interviewPitch,
    phases,
    weeks,
    day90Capstone: {
      title: `${trackName} Mastery Capstone`,
      description: `Comprehensive multi-component system demonstrating end-to-end industry proficiency.`,
      flow: ["Architecture Design", "Core Implementation", "Testing & Verification", "Production Cloud Deployment"],
      steps: [
        { step: 1, title: "System Architecture", description: "Design the domain models, data pipelines, and infrastructure." },
        { step: 2, title: "Core Implementation", description: "Develop and test the primary services and interactive features." },
        { step: 3, title: "Integration & Verification", description: "Perform unit, integration, and security verification." },
        { step: 4, title: "Production Deployment", description: "Deploy with containerization, cloud monitoring, and CI/CD pipelines." },
      ],
    },
    portfolio,
  };
}

/* ==========================================================================
   COURSE 1: FULL STACK & AI SOFTWARE ENGINEERING (90 Days Learning)
   HTML, CSS, JS, React, Node.js, Java, Spring Boot, REST APIs, MySQL, NoSQL,
   Python, AI/LLM APIs, LangChain, RAG, Git, Docker, AWS
   ========================================================================== */
export const FULLSTACK_SYLLABUS: TrackSyllabus = buildInteractiveSyllabus(
  "java",
  "Full Stack & AI Software Engineering",
  "Full Stack Software & AI Engineer",
  [
    "Junior Full Stack Developer",
    "Full Stack Software Engineer",
    "Senior Java / React Engineer",
    "Cloud & AI Systems Architect",
    "Principal Full Stack Engineer",
  ],
  "I build scalable enterprise full-stack applications and AI-augmented services with React 19, Java Spring Boot, Node.js, MySQL, NoSQL, LangChain RAG pipelines, Docker, and AWS cloud infrastructure.",
  [
    { phaseNumber: 1, title: "Web Foundations & Modern JavaScript", weeksRange: "Weeks 1–3", description: "HTML5 semantic web, responsive CSS3/Flexbox/Grid, ES6+ JavaScript, DOM, and async/await." },
    { phaseNumber: 2, title: "React 19 & Frontend Engineering", weeksRange: "Weeks 4–6", description: "Component architecture, hooks, state management, Tailwind CSS, API integration, and routing." },
    { phaseNumber: 3, title: "Node.js, Databases & Java Core", weeksRange: "Weeks 7–9", description: "Express.js REST APIs, MySQL relational modeling, MongoDB NoSQL, Java OOP, and Collections." },
    { phaseNumber: 4, title: "Spring Boot 3, Microservices & Python AI", weeksRange: "Weeks 10–13", description: "Spring Boot, JPA/Hibernate, Python scripting, OpenAI/Gemini APIs, LangChain, and RAG." },
    { phaseNumber: 5, title: "Git, Docker & AWS Cloud Infrastructure", weeksRange: "Weeks 14–18", description: "Git branching, Docker containers, multi-stage builds, AWS EC2/S3/RDS/Lambda, and production CI/CD." },
  ],
  [
    // Week 1
    {
      week: 1,
      title: "Semantic HTML5 & Modern Layouts",
      theme: "Web Structure & Semantic Standards",
      workplaceSkill: "Semantic Markup & Accessibility",
      deliverable: "Clean semantic web pages with proper accessibility attributes",
      days: [
        { topic: "HTML5 Document Structure, Doctype & Head Elements", practice: "Create standards-compliant HTML5 documents with metadata & SEO tags" },
        { topic: "Semantic Tags (header, nav, main, section, article, footer)", practice: "Restructure unstructured layouts into semantic document outlines" },
        { topic: "HTML5 Forms, Input Types, Validation & Attributes", practice: "Build accessible forms with client-side validation and pattern matching" },
        { topic: "Media Elements (picture, audio, video) & SVG Embedding", practice: "Implement responsive media elements and inline scalable vector graphics" },
        { topic: "Accessibility (a11y), ARIA Roles, and Screen Reader Standards", practice: "Audit web pages using accessibility checklists and ARIA labels" },
      ],
    },
    // Week 2
    {
      week: 2,
      title: "CSS3 Mastery, Flexbox & Responsive Grid",
      theme: "Styling & Responsive Design",
      workplaceSkill: "Modern CSS Architecture",
      deliverable: "Responsive mobile-first layouts across all device viewports",
      days: [
        { topic: "CSS Box Model, Selectors, Specificity & Custom Properties", practice: "Apply CSS custom property themes with clean selector hierarchy" },
        { topic: "Flexbox Layout (axes, alignment, wrapping & grow/shrink)", practice: "Construct complex multi-row responsive navigation and card decks with Flexbox" },
        { topic: "CSS Grid System (grid-template, auto-fit/minmax & grid areas)", practice: "Design asymmetric responsive dashboard grid layouts with zero media queries" },
        { topic: "Responsive Media Queries & Mobile-First Breakpoints", practice: "Implement fluid mobile-first responsive breakpoints across viewport widths" },
        { topic: "CSS Transitions, Keyframe Animations & Glassmorphism Effects", practice: "Build smooth micro-interactions, hover states, and glassmorphism styling" },
      ],
    },
    // Week 3
    {
      week: 3,
      title: "Modern JavaScript ES6+ & Asynchronous Programming",
      theme: "Core JavaScript Fundamentals",
      workplaceSkill: "ES6+ Logic & Async Handling",
      deliverable: "Interactive client-side apps with async REST data consumption",
      days: [
        { topic: "ES6+ Syntax (let/const, Arrow Functions, Destructuring & Spread)", practice: "Refactor legacy JavaScript code into concise modern ES6+ syntax" },
        { topic: "Array Transformations (map, filter, reduce, find, some, every)", practice: "Process and aggregate complex data arrays using pure functional methods" },
        { topic: "DOM Traversal, Event Delegation & Dynamic Element Creation", practice: "Build dynamic interactive lists with delegated event listeners" },
        { topic: "JavaScript Event Loop, Promises, and Microtask Queue", practice: "Trace synchronous vs asynchronous task execution and resolve Promise chains" },
        { topic: "Async/Await, Fetch API, Error Handling & Web Storage (localStorage)", practice: "Fetch remote JSON data, handle HTTP errors gracefully, and persist cache" },
      ],
    },
    // Week 4
    {
      week: 4,
      title: "React 19 Components, Props & State Hooks",
      theme: "React Fundamentals",
      workplaceSkill: "Declarative UI Architecture",
      deliverable: "Modular React components with controlled state flows",
      days: [
        { topic: "React Architecture, Virtual DOM & Vite Toolchain Setup", practice: "Initialize a high-performance React 19 project using Vite & TypeScript" },
        { topic: "Functional Components, JSX Expressions & Conditional Rendering", practice: "Compose reusable functional components with dynamic conditional UI" },
        { topic: "Props, Type Interfaces, and Parent-Child Component Hierarchy", practice: "Pass strongly-typed props and callback handlers between components" },
        { topic: "useState Hook, Immutability & Complex State Updates", practice: "Manage complex object/array states without direct mutation" },
        { topic: "Controlled Form Inputs, Formik/React Hook Form & Zod Validation", practice: "Implement robust multi-field forms with synchronous Zod schema validation" },
      ],
    },
    // Week 5
    {
      week: 5,
      title: "React Lifecycle, useEffect & Custom Hooks",
      theme: "Side Effects & Custom Reusable Logic",
      workplaceSkill: "React Hooks Architecture",
      deliverable: "Custom React hooks for API data fetching and browser listeners",
      days: [
        { topic: "useEffect Lifecycle Hook, Dependency Arrays & Cleanup Functions", practice: "Manage timer intervals and window resize listeners with clean teardowns" },
        { topic: "API Data Fetching Patterns, Loading States & Error Boundaries", practice: "Build resilient data-fetching UI with skeleton loaders and error catches" },
        { topic: "useRef Hook for DOM Access, Persistent Mutable Values & Timers", practice: "Control input auto-focus and persist timer references across renders" },
        { topic: "useMemo and useCallback for Performance Optimization", practice: "Prevent unnecessary re-renders in large lists using memoization hooks" },
        { topic: "Custom Hooks Development (useFetch, useLocalStorage, useDebounce)", practice: "Extract reusable stateful logic into modular custom React hooks" },
      ],
    },
    // Week 6
    {
      week: 6,
      title: "Global State, React Router & Tailwind CSS",
      theme: "Application Architecture & Navigation",
      workplaceSkill: "Single Page App Routing & Styling",
      deliverable: "Multi-page Single Page Application with client-side state",
      days: [
        { topic: "Context API (createContext, useContext) & State Providers", practice: "Build a global application auth and theme state provider" },
        { topic: "Tailwind CSS Utility-First Styling & Component Tokens", practice: "Style responsive dashboard cards and controls using Tailwind CSS utilities" },
        { topic: "React Router (Routes, Route, Link, useParams, useNavigate)", practice: "Configure nested routing with dynamic URL parameters and programmatic nav" },
        { topic: "Protected Routes, Auth Guard Middleware & Redirects", practice: "Implement authenticated route wrappers that redirect unauthorized users" },
        { topic: "React 19 Actions, Optimistic UI Updates & useTransition", practice: "Implement instant optimistic UI feedback while background requests resolve" },
      ],
    },
    // Week 7
    {
      week: 7,
      title: "Node.js Runtime, Express.js & RESTful APIs",
      theme: "Backend API Engineering",
      workplaceSkill: "Express API Architecture",
      deliverable: "Robust Express REST API with middleware validation",
      days: [
        { topic: "Node.js Architecture, CommonJS vs ES Modules, and npm Tooling", practice: "Build Node.js CLI utilities and configure package.json scripts" },
        { topic: "Express.js Server Setup, Routing & Request/Response Objects", practice: "Create modular Express route handlers for CRUD entity endpoints" },
        { topic: "Custom Middleware, Logging (Morgan), and CORS Configuration", practice: "Implement request logging, error middleware, and CORS policies" },
        { topic: "Request Validation (Zod/Joi) & Centralized Error Handling", practice: "Validate request body/query payloads and return standard error JSON" },
        { topic: "JWT Authentication, Password Hashing (bcrypt), and Protected Endpoints", practice: "Implement user signup, bcrypt hashing, JWT issuance, and auth middleware" },
      ],
    },
    // Week 8
    {
      week: 8,
      title: "MySQL Relational Database Design & SQL CRUD",
      theme: "Relational Data Modeling",
      workplaceSkill: "SQL Data Modeling & Querying",
      deliverable: "Normalized relational schemas with multi-table queries",
      days: [
        { topic: "Relational Database Concepts, Primary/Foreign Keys & Normalization (1NF-3NF)", practice: "Design normalized entity-relationship schemas for e-commerce/enterprise" },
        { topic: "SQL DDL (CREATE, ALTER, DROP) & Data Types in MySQL", practice: "Write SQL scripts to provision tables with constraints and default values" },
        { topic: "SQL DML (INSERT, SELECT, UPDATE, DELETE) & WHERE Clauses", practice: "Perform parameterized CRUD operations with filtering and pattern matching" },
        { topic: "Multi-Table JOINs (INNER, LEFT, RIGHT) & Aggregate Functions (GROUP BY, HAVING)", practice: "Execute complex financial aggregation queries joining across 3+ tables" },
        { topic: "Database Indexing (B-Tree), Query Optimization & EXPLAIN Plans", practice: "Analyze slow query execution plans and add targeted composite indexes" },
      ],
    },
    // Week 9
    {
      week: 9,
      title: "NoSQL (MongoDB / Redis) & Full Stack Integration",
      theme: "Document Stores & Caching",
      workplaceSkill: "NoSQL & Cache Integration",
      deliverable: "Hybrid SQL/NoSQL backend with Redis caching layer",
      days: [
        { topic: "NoSQL Document Concepts vs Relational & MongoDB Atlas Setup", practice: "Provision a MongoDB database and design JSON document collections" },
        { topic: "Mongoose ODM (Schemas, Models, Validation & Middleware)", practice: "Define Mongoose schemas with virtuals, pre-save hooks, and population" },
        { topic: "MongoDB Aggregation Pipeline ($match, $group, $lookup, $project)", practice: "Construct multi-stage aggregation pipelines for analytics reporting" },
        { topic: "Redis In-Memory Data Store, Key-Value Caching & TTL Expiry", practice: "Integrate Redis caching into Express endpoints to reduce database load" },
        { topic: "Connecting React Frontend to Express/MySQL/MongoDB Backend", practice: "Wire React axios/fetch calls to Node endpoints with full CORS & auth tokens" },
      ],
    },
    // Week 10
    {
      week: 10,
      title: "Java Core Foundations, OOP & Collections Framework",
      theme: "Java Core Language",
      workplaceSkill: "Enterprise Java Programming",
      deliverable: "Clean object-oriented Java modules using Collections & Generics",
      days: [
        { topic: "Java Syntax, JVM Architecture, Primitive Types & Memory Model", practice: "Compile and execute Java programs understanding Stack vs Heap allocation" },
        { topic: "Object-Oriented Programming (Encapsulation, Inheritance, Polymorphism, Abstraction)", practice: "Implement clean inheritance hierarchies using abstract classes and interfaces" },
        { topic: "Java Collections Framework (List, Set, Map, Queue implementations)", practice: "Select and use appropriate collections (ArrayList, HashSet, HashMap) for datasets" },
        { topic: "Java Generics, Custom Exceptions & Try-with-Resources", practice: "Write type-safe generic classes and robust exception handling with custom types" },
        { topic: "Java 8+ Features (Lambdas, Stream API, Optional & Method References)", practice: "Transform and filter collections using declarative Java Streams and Optionals" },
      ],
    },
    // Week 11
    {
      week: 11,
      title: "Spring Boot 3, Dependency Injection & REST Controllers",
      theme: "Enterprise Java Frameworks",
      workplaceSkill: "Spring Boot Microservice Development",
      deliverable: "Spring Boot REST service with automated dependency injection",
      days: [
        { topic: "Spring Framework Architecture, Inversion of Control & @Component Scanning", practice: "Configure Spring application contexts and manage bean lifecycles" },
        { topic: "Spring Boot 3 Initializer, Auto-Configuration & application.properties", practice: "Bootstrap a production-ready Spring Boot 3 service with Maven/Gradle" },
        { topic: "Spring MVC REST Controllers (@RestController, @RequestMapping, @PathVariable)", practice: "Expose REST endpoints handling GET, POST, PUT, DELETE with ResponseEntity" },
        { topic: "Request Validation (@Valid, @NotNull, @Size) & @RestControllerAdvice", practice: "Implement global exception handling and DTO validation with custom responses" },
        { topic: "Spring Service Layer Architecture, DTO Mapping (MapStruct) & Logging (SLF4J)", practice: "Structure enterprise layered architecture separating controllers, services & DTOs" },
      ],
    },
    // Week 12
    {
      week: 12,
      title: "Spring Data JPA, Hibernate ORM & Transaction Management",
      theme: "Enterprise Java Persistence",
      workplaceSkill: "ORM Persistence & Transactions",
      deliverable: "Spring Data JPA repositories with relational mappings",
      days: [
        { topic: "JPA Entities (@Entity, @Id, @GeneratedValue, @Column) & MySQL Connection", practice: "Map Java classes to MySQL database tables using JPA annotations" },
        { topic: "Entity Relationships (@OneToMany, @ManyToOne, @ManyToMany, Cascade Types)", practice: "Model complex bidirectional relational mappings with fetch strategies" },
        { topic: "Spring Data JpaRepository, Derived Queries & Custom JPQL / Native Queries", practice: "Write derived repository methods and custom JPQL queries with pagination" },
        { topic: "Transaction Management (@Transactional), Propagation & Rollback Rules", practice: "Ensure atomicity across multi-step database writes using @Transactional" },
        { topic: "Unit & Integration Testing with JUnit 5, Mockito & @SpringBootTest", practice: "Write unit tests with Mockito mocks and integration tests for Spring controllers" },
      ],
    },
    // Week 13
    {
      week: 13,
      title: "Python Scripting & AI / LLM API Integration",
      theme: "Python & Generative AI Foundations",
      workplaceSkill: "AI Model API Integration",
      deliverable: "Python services consuming OpenAI and Gemini LLM endpoints",
      days: [
        { topic: "Python Syntax, Data Structures (Lists, Dicts, Sets), and Virtual Environments", practice: "Write modular Python scripts and configure virtual environment dependencies" },
        { topic: "Python Type Hints, Pydantic Data Models & Requests HTTP Client", practice: "Validate incoming API data structures using Pydantic data schemas" },
        { topic: "LLM Fundamentals, Tokenization, OpenAI / Google Gemini API Setup", practice: "Configure API authentication and make streaming chat completion calls" },
        { topic: "Prompt Engineering Techniques (Few-shot, Chain-of-Thought, System Prompts)", practice: "Design structured system prompts enforcing strict JSON output formats" },
        { topic: "Building AI-Powered Backend Utilities (Summarizer, Code Reviewer, Classifier)", practice: "Construct an end-to-end Python microservice that analyzes code and returns diffs" },
      ],
    },
    // Week 14
    {
      week: 14,
      title: "LangChain Framework & Autonomous Tool Chains",
      theme: "AI Agent Engineering",
      workplaceSkill: "LangChain & Tool Orchestration",
      deliverable: "Autonomous LangChain agent connected to external tools",
      days: [
        { topic: "LangChain Architecture, PromptTemplates, and LLMChain Primitives", practice: "Build parameterized prompt pipelines with dynamic template substitution" },
        { topic: "Output Parsers (PydanticOutputParser, StructuredOutputParser)", practice: "Parse unstructured LLM output into strongly-typed application objects" },
        { topic: "LangChain Memory (ConversationBufferMemory, ConversationSummaryMemory)", practice: "Maintain conversational session context across multi-turn user interactions" },
        { topic: "LangChain Tools & Dynamic Tool Calling with Function Calling APIs", practice: "Equip LLMs with custom search and calculation tools to execute actions" },
        { topic: "Building Autonomous ReAct Agents with LangChain", practice: "Deploy a reasoning and acting agent that searches data and executes API calls" },
      ],
    },
    // Week 15
    {
      week: 15,
      title: "Vector Databases & Retrieval-Augmented Generation (RAG)",
      theme: "RAG Architecture & Knowledge Retrieval",
      workplaceSkill: "Enterprise RAG Pipeline Development",
      deliverable: "Production RAG system querying private documents",
      days: [
        { topic: "Vector Embeddings Theory, Similarity Metrics (Cosine, Dot Product, Euclidean)", practice: "Generate text embeddings using OpenAI/HuggingFace embedding models" },
        { topic: "Vector Database Setup (ChromaDB / FAISS / Pinecone)", practice: "Index document vector collections with metadata filtering capabilities" },
        { topic: "Document Loading, Chunking Strategies (RecursiveCharacterTextSplitter) & Overlap", practice: "Chunk technical PDF/Markdown documents for optimal semantic retrieval" },
        { topic: "Building the RAG Retrieval Pipeline (Retriever -> Context Injection -> LLM)", practice: "Construct an end-to-end question-answering pipeline over private documentation" },
        { topic: "RAG Evaluation (Faithfulness, Context Relevance) & Grounding", practice: "Evaluate RAG responses against source citations to prevent hallucinations" },
      ],
    },
    // Week 16
    {
      week: 16,
      title: "Git Workflows, Branching Strategies & Code Collaboration",
      theme: "Version Control & Team Workflows",
      workplaceSkill: "Git & Code Review Workflows",
      deliverable: "Feature-branch Git repository with PR review standards",
      days: [
        { topic: "Git Internals (Commits, Trees, Blobs, HEAD) & Repository Setup", practice: "Initialize repositories, configure .gitignore, and inspect Git object trees" },
        { topic: "Git Branching Strategies (GitFlow, GitHub Flow, Trunk-Based Development)", practice: "Manage feature branches, hotfixes, and release branch lifecycles" },
        { topic: "Merge vs Rebase, Resolving Merge Conflicts, and Interactive Rebasing", practice: "Rebase feature branches onto main and resolve complex multi-file conflicts" },
        { topic: "Git Stashing, Cherry-Picking, Tags, and Reset vs Revert Strategies", practice: "Safely revert erroneous commits and cherry-pick bugfixes across branches" },
        { topic: "GitHub Pull Request Workflows, Code Review Standards & Branch Protections", practice: "Open structured PRs with description templates and enforce review approvals" },
      ],
    },
    // Week 17
    {
      week: 17,
      title: "Docker Containerization & Multi-Container Environments",
      theme: "Containerization & DevOps",
      workplaceSkill: "Docker & Container Orchestration",
      deliverable: "Multi-container app orchestrated with Docker Compose",
      days: [
        { topic: "Containerization Concepts (Containers vs VMs) & Docker Engine Setup", practice: "Run, inspect, stop, and manage Docker container lifecycles from CLI" },
        { topic: "Writing Dockerfiles (FROM, WORKDIR, COPY, RUN, CMD, ENTRYPOINT)", practice: "Containerize Node.js and Spring Boot applications with optimized layers" },
        { topic: "Multi-Stage Docker Builds for React & Spring Boot Production Images", practice: "Reduce production image sizes from 1GB+ down to under 50MB using multi-stage" },
        { topic: "Docker Volumes, Data Persistence & Bridge Networking", practice: "Persist database storage with named volumes and configure container networks" },
        { topic: "Docker Compose (docker-compose.yml) Multi-Service Orchestration", practice: "Orchestrate React frontend, Spring Boot backend, and MySQL database in one command" },
      ],
    },
    // Week 18
    {
      week: 18,
      title: "AWS Cloud Deployment, Serverless & Production CI/CD",
      theme: "Cloud Architecture & Live Deployment",
      workplaceSkill: "AWS Cloud Architecture & CI/CD",
      deliverable: "Live cloud application deployed on AWS with CI/CD automation",
      days: [
        { topic: "AWS Cloud Fundamentals, IAM Users, Roles & Security Groups", practice: "Configure least-privilege IAM roles and network security group firewalls" },
        { topic: "AWS EC2 Instance Provisioning, SSH Access & Nginx Reverse Proxy Setup", practice: "Launch EC2 Linux instances and configure Nginx reverse proxy with SSL" },
        { topic: "AWS S3 Static Hosting, CloudFront CDN & AWS RDS Managed Database", practice: "Deploy React SPAs to S3/CloudFront and connect Spring Boot to AWS RDS MySQL" },
        { topic: "AWS Lambda Serverless Functions & API Gateway Integration", practice: "Deploy Python serverless microservices triggered by API Gateway HTTP events" },
        { topic: "GitHub Actions CI/CD Pipeline (Automated Testing, Build & AWS Deployment)", practice: "Automate build, test, Docker push, and AWS deployment on every git push" },
      ],
    },
  ],
);

/* ==========================================================================
   COURSE 2: DATA ANALYSIS (90 Days Learning)
   Excel + SQL/MySQL + Python + NumPy + Pandas + Matplotlib/Seaborn + Power BI + Tableau
   ========================================================================== */
export const DATA_ANALYSIS_SYLLABUS: TrackSyllabus = buildInteractiveSyllabus(
  "datascience",
  "Data Analysis",
  "Data Analyst & Business Intelligence Specialist",
  [
    "Junior Data Analyst",
    "Data Analyst (SQL / Python)",
    "Senior Business Intelligence Analyst",
    "Analytics Engineer",
    "Lead BI & Data Strategist",
  ],
  "I analyze large-scale business datasets, build automated SQL/Python ETL pipelines, perform exploratory data analysis with Pandas/NumPy/Seaborn, and deliver executive-grade interactive dashboards in Power BI and Tableau.",
  [
    { phaseNumber: 1, title: "Advanced Excel & Business Analytics", weeksRange: "Weeks 1–3", description: "VLOOKUP/XLOOKUP, INDEX/MATCH, Pivot Tables, Power Query ETL, and financial modeling." },
    { phaseNumber: 2, title: "SQL & MySQL for Data Analysts", weeksRange: "Weeks 4–6", description: "Complex joins, aggregations, subqueries, CTEs, window functions, and schema transformations." },
    { phaseNumber: 3, title: "Python, NumPy & Pandas Fundamentals", weeksRange: "Weeks 7–9", description: "Python scripting, NumPy array math, Pandas DataFrames, cleaning, and missing data handling." },
    { phaseNumber: 4, title: "Advanced Pandas, Matplotlib & Seaborn", weeksRange: "Weeks 10–12", description: "GroupBy, pivot tables, time-series, statistical distribution charts, and exploratory data analysis." },
    { phaseNumber: 5, title: "Power BI & Tableau Executive Dashboards", weeksRange: "Weeks 13–18", description: "DAX formulas, Power BI data models, Tableau LOD expressions, KPI pipelines, and automated reporting." },
  ],
  [
    // Week 1
    {
      week: 1,
      title: "Advanced Excel Formulas & Lookup Functions",
      theme: "Spreadsheet Analytics Foundations",
      workplaceSkill: "Lookup & Logical Formulas",
      deliverable: "Automated lookup and multi-criteria business spreadsheets",
      days: [
        { topic: "Excel Essentials: Absolute/Relative Referencing, Data Types & Named Ranges", practice: "Build structured financial models utilizing dynamic named ranges" },
        { topic: "Lookup Functions: VLOOKUP, HLOOKUP, XLOOKUP & Error Handling (IFERROR)", practice: "Merge disparate customer and transaction tables using modern XLOOKUP formulas" },
        { topic: "INDEX, MATCH & 2-Way Matrix Lookups", practice: "Construct dynamic 2-way matrix pricing lookups with INDEX & MATCH" },
        { topic: "Logical & Text Functions (IF, AND, OR, IFS, TEXTSPLIT, CONCAT, TRIM)", practice: "Clean messy customer address text and apply multi-tier commission rules" },
        { topic: "Statistical & Math Functions (SUMIFS, COUNTIFS, AVERAGEIFS, RANK)", practice: "Aggregate multi-criteria sales metrics across region, product, and quarter" },
      ],
    },
    // Week 2
    {
      week: 2,
      title: "Excel Pivot Tables, Slicers & Power Query ETL",
      theme: "Data Transformation & Summarization",
      workplaceSkill: "Data Cleansing & Pivot Analytics",
      deliverable: "Dynamic interactive Excel dashboards with automated Power Query refresh",
      days: [
        { topic: "Pivot Table Foundations: Field Lists, Grouping Dates & Value Calculations", practice: "Summarize 50,000+ transaction rows into monthly revenue and quantity tables" },
        { topic: "Calculated Fields, Calculated Items & Show Values As (% of Total, Running Total)", practice: "Compute year-over-year growth percentages and running totals in Pivot Tables" },
        { topic: "Interactive Slicers, Timelines & Multi-Pivot Dashboard Connections", practice: "Connect unified interactive slicers across multiple pivot charts" },
        { topic: "Power Query Basics: Ingesting CSVs, Unpivoting Columns & Data Type Parsing", practice: "Transform messy wide-format survey data into clean tabular tall-format" },
        { topic: "Power Query Advanced: Merging, Appending & Automating Daily Refresh Pipelines", practice: "Build an automated multi-file folder ingestion pipeline in Power Query" },
      ],
    },
    // Week 3
    {
      week: 3,
      title: "Data Visualization & Financial Modeling in Excel",
      theme: "Visual Storytelling in Spreadsheets",
      workplaceSkill: "Executive Excel Visuals",
      deliverable: "C-suite executive reporting dashboard in Excel",
      days: [
        { topic: "Chart Selection Principles (Bar, Line, Combo, Waterfall, Scatter)", practice: "Select and format the optimal chart type for comparative and trend metrics" },
        { topic: "Dynamic Charting with OFFSET, INDIRECT & Form Controls", practice: "Build interactive dynamic charts controlled by drop-down menu selections" },
        { topic: "Conditional Formatting (Data Bars, Color Scales, Icon Sets & Formula Rules)", practice: "Highlight KPI exceptions, outliers, and threshold breaches automatically" },
        { topic: "What-If Analysis (Goal Seek, Scenario Manager, Data Tables)", practice: "Perform sensitivity analysis on pricing and profit margins with 2-variable data tables" },
        { topic: "Designing Executive KPI Dashboards with Clean Grid Alignments", practice: "Construct a polished executive summary dashboard with KPI cards and sparklines" },
      ],
    },
    // Week 4
    {
      week: 4,
      title: "SQL Foundations, Filtering & Sorting in MySQL",
      theme: "Relational Querying Essentials",
      workplaceSkill: "SQL Data Extraction",
      deliverable: "Targeted data extraction scripts using SQL filtering and sorting",
      days: [
        { topic: "Relational Database Architecture, Schemas, Tables & MySQL Workbench Setup", practice: "Connect to MySQL databases, inspect schemas, and understand primary/foreign keys" },
        { topic: "Basic Querying (SELECT, DISTINCT, Column Aliases, LIMIT & OFFSET)", practice: "Query specific columns with clean aliases and handle pagination with LIMIT" },
        { topic: "Filtering with WHERE (Comparisons, AND, OR, NOT, IN, BETWEEN, LIKE Wildcards)", practice: "Filter customer cohorts by date ranges, geographic regions, and name patterns" },
        { topic: "Handling NULL Values (IS NULL, IS NOT NULL, COALESCE, IFNULL)", practice: "Handle missing transactional data gracefully using COALESCE fallbacks" },
        { topic: "Sorting & Ordering (ORDER BY ASC/DESC, Multi-Column Sorting)", practice: "Sort multi-level sales data by revenue descending and regional order" },
      ],
    },
    // Week 5
    {
      week: 5,
      title: "SQL Aggregations, Grouping & Multi-Table Joins",
      theme: "Data Aggregation & Relationships",
      workplaceSkill: "Multi-Table Data Joins",
      deliverable: "Cross-table relational analytics queries with aggregations",
      days: [
        { topic: "Aggregate Functions (COUNT, SUM, AVG, MIN, MAX) & Scalar Expressions", practice: "Calculate core financial metrics, total orders, and average ticket sizes" },
        { topic: "GROUP BY Clauses, Multi-Column Grouping & HAVING vs WHERE Filtering", practice: "Aggregate sales by store and product category, filtering by minimum thresholds" },
        { topic: "INNER JOIN: Combining Relational Tables on Primary/Foreign Keys", practice: "Join customer, order, and product tables to analyze customer purchase habits" },
        { topic: "LEFT JOIN, RIGHT JOIN & FULL OUTER JOIN Simulations", practice: "Identify churned customers with zero orders using LEFT JOIN and IS NULL checks" },
        { topic: "Self Joins, Cross Joins, and Multi-Table Relational Schema Traversals", practice: "Traverse employee-manager hierarchies using self joins and foreign keys" },
      ],
    },
    // Week 6
    {
      week: 6,
      title: "Advanced SQL: Subqueries, CTEs & Window Functions",
      theme: "Advanced Analytical SQL",
      workplaceSkill: "Analytical Window Queries",
      deliverable: "Complex analytical queries with CTEs and window partition functions",
      days: [
        { topic: "Subqueries in WHERE, FROM, and SELECT Clauses (Scalar & Correlated)", practice: "Write correlated subqueries comparing individual orders to category averages" },
        { topic: "Common Table Expressions (CTEs - WITH clause) & Recursive CTEs", practice: "Structure readable multi-step data transformation pipelines using chained CTEs" },
        { topic: "Window Functions: OVER (PARTITION BY, ORDER BY), ROW_NUMBER & RANK", practice: "Rank top 3 highest-spending customers within each state using DENSE_RANK" },
        { topic: "Navigational Window Functions: LEAD, LAG & Month-over-Month Growth Calculation", practice: "Calculate period-over-period sales growth and days between customer orders" },
        { topic: "Conditional Logic (CASE WHEN THEN ELSE END) & Pivot Transformations in SQL", practice: "Categorize customers into RFM tiers and pivot quarterly data into columns" },
      ],
    },
    // Week 7
    {
      week: 7,
      title: "Python for Data Analysts: Syntax, Collections & Scripts",
      theme: "Python Analytics Foundations",
      workplaceSkill: "Python Data Scripting",
      deliverable: "Automated Python scripts for reading and manipulating files",
      days: [
        { topic: "Python Setup, Jupyter Notebooks, Variables, Data Types & Type Conversion", practice: "Configure Jupyter environments and execute interactive exploratory notebooks" },
        { topic: "Control Flow: If-Else Conditionals, For Loops, While Loops & List Comprehensions", practice: "Transform and filter raw data lists using concise list comprehensions" },
        { topic: "Data Structures: Lists, Tuples, Dictionaries, Sets & Nested JSON Parsing", practice: "Parse nested JSON responses from web APIs into clean tabular structures" },
        { topic: "Functions, Default Arguments, Lambda Functions & Scope", practice: "Write reusable data cleaning functions with input validation" },
        { topic: "File I/O (CSV, JSON, Text Files), Exception Handling & Virtual Environments", practice: "Read and write large CSV files with try-except error handling" },
      ],
    },
    // Week 8
    {
      week: 8,
      title: "NumPy: Numerical Computing & Vectorized Array Math",
      theme: "Vectorized Computations",
      workplaceSkill: "NumPy Vectorized Calculations",
      deliverable: "High-speed array transformation and statistical scripts",
      days: [
        { topic: "NumPy ndarray Creation, Shapes, Dimensions & Data Types", practice: "Create multi-dimensional arrays from lists and built-in generators (arange, linspace)" },
        { topic: "Array Slicing, Indexing, Boolean Masking & Conditional Filtering", practice: "Filter outlier data values from matrices using vectorized boolean masks" },
        { topic: "Vectorized Arithmetic Operations, Broadcasting Rules & Performance Benchmarks", practice: "Perform element-wise financial calculations across millions of rows instantly" },
        { topic: "Mathematical & Statistical Functions (mean, median, std, var, percentile, sum)", practice: "Compute descriptive statistics and interquartile ranges across array axes" },
        { topic: "Matrix Operations (Dot Product, Reshaping, Transpose, Concatenate, Split)", practice: "Reshape and combine multi-feature matrices for analytics modeling" },
      ],
    },
    // Week 9
    {
      week: 9,
      title: "Pandas Foundations: Series, DataFrames & Ingestion",
      theme: "Tabular Data Structures",
      workplaceSkill: "Pandas Data Ingestion & Cleaning",
      deliverable: "Cleaned and validated DataFrames with normalized column types",
      days: [
        { topic: "Pandas Series & DataFrame Basics, Indexing, Slicing with .loc & .iloc", practice: "Load tabular data and extract specific rows and columns using loc/iloc indexers" },
        { topic: "Data Ingestion (read_csv, read_excel, read_sql, read_json) & Encoding Options", practice: "Ingest datasets from diverse file formats with custom delimiter and datetime parsing" },
        { topic: "Data Inspection (.info, .describe, .shape, .dtypes, .head, .value_counts)", practice: "Perform initial data quality audits checking column distributions and missing values" },
        { topic: "Data Cleansing: Handling Missing Values (.dropna, .fillna, interpolation)", practice: "Impute missing numeric values using group medians and flag missing categories" },
        { topic: "Data Type Conversions (.astype, pd.to_datetime, pd.to_numeric) & String Methods (.str)", practice: "Parse messy date strings and clean text columns with vectorized string functions" },
      ],
    },
    // Week 10
    {
      week: 10,
      title: "Advanced Pandas: GroupBy, Merging & Reshaping",
      theme: "Data Aggregation & Merging",
      workplaceSkill: "Pandas Multi-Table Aggregation",
      deliverable: "Aggregated reporting datasets with multi-index pivots",
      days: [
        { topic: "Pandas GroupBy (.groupby, .agg with custom functions, named aggregations)", practice: "Group transactional data by customer cohort and compute multi-metric summaries" },
        { topic: "Merging & Joining DataFrames (pd.merge with inner/left/right/outer, pd.concat)", practice: "Merge customer demographic data with purchase logs on composite keys" },
        { topic: "Reshaping Data: .pivot_table, .melt, .stack, and .unstack", practice: "Reshape cross-tabulated survey tables between long and wide formats" },
        { topic: "Time-Series Analysis in Pandas (DatetimeIndex, .resample, rolling windows, shift)", practice: "Calculate 7-day rolling revenue averages and month-over-month percent change" },
        { topic: "Custom Transformations (.apply, .map, .transform) & Vectorized Operations", practice: "Categorize user loyalty tiers based on multi-column rule criteria using apply" },
      ],
    },
    // Week 11
    {
      week: 11,
      title: "Matplotlib & Seaborn: Statistical Data Visualization",
      theme: "Visual Exploratory Analysis",
      workplaceSkill: "Statistical Visual Storytelling",
      deliverable: "Publication-quality statistical charts and correlation heatmaps",
      days: [
        { topic: "Matplotlib Architecture (Figure, Axes, Subplots, Custom Styling & Colors)", practice: "Construct multi-panel comparison figures with customized styling and legends" },
        { topic: "Distribution Visualizations: Histograms, KDE Plots & Box/Violin Plots", practice: "Visualize continuous variable distributions and detect statistical outliers" },
        { topic: "Categorical Visualizations: Bar Charts, Count Plots & Point Plots in Seaborn", practice: "Compare categorical group performance with error bars in Seaborn" },
        { topic: "Relational & Correlation Visualizations: Scatter Plots, Pairplots & Heatmaps", practice: "Generate Pearson correlation heatmaps with masked upper triangles" },
        { topic: "Exploratory Data Analysis (EDA) Workflow: Univariate & Bivariate Analysis", practice: "Execute end-to-end EDA on an e-commerce customer churn dataset" },
      ],
    },
    // Week 12
    {
      week: 12,
      title: "Advanced Exploratory Data Analysis & Business Storytelling",
      theme: "Insights & Storytelling",
      workplaceSkill: "Data Insights Communication",
      deliverable: "Executive EDA presentation summarizing core revenue drivers",
      days: [
        { topic: "Feature Engineering for Analysts (Binning, Ratios, Interaction Terms)", practice: "Create customer lifetime value (CLV) and recency-frequency feature indicators" },
        { topic: "Hypothesis Testing Basics (T-Tests, Chi-Square, A/B Testing Significance)", practice: "Calculate p-values and confidence intervals to evaluate conversion rate lift" },
        { topic: "Cohort Analysis & Customer Retention Heatmaps in Pandas", practice: "Build triangular monthly cohort retention rate matrices in Pandas and Seaborn" },
        { topic: "RFM (Recency, Frequency, Monetary) Customer Segmentation Modeling", practice: "Segment customers into VIP, At-Risk, and Churned tiers using RFM scoring" },
        { topic: "Synthesizing Analytics Findings into Actionable Business Recommendations", practice: "Draft an executive summary memo translating statistical findings into ROI actions" },
      ],
    },
    // Week 13
    {
      week: 13,
      title: "Power BI Foundations, Power Query & Star Schema Modeling",
      theme: "Business Intelligence Architecture",
      workplaceSkill: "Power BI Data Modeling",
      deliverable: "Normalized Star Schema data model in Power BI Desktop",
      days: [
        { topic: "Power BI Desktop Architecture, Interface & End-to-End Workflow Overview", practice: "Install Power BI Desktop, connect to data sources, and explore report views" },
        { topic: "Power Query in Power BI: M Code, Transformations, Data Types & Merges", practice: "Clean and shape raw enterprise data tables using Power Query transformations" },
        { topic: "Dimensional Modeling: Star Schema vs Snowflake Schema (Facts & Dimensions)", practice: "Design a high-performance Star Schema model with 1 Fact and 4 Dimension tables" },
        { topic: "Managing Relationships: Cardinality (1:*, 1:1), Cross-Filter Direction & Inactive", practice: "Configure active/inactive relationships with USERELATIONSHIP modeling" },
        { topic: "Creating a Dedicated Date Dimension / Calendar Table in Power BI", practice: "Generate an automated date dimension table supporting fiscal calendar periods" },
      ],
    },
    // Week 14
    {
      week: 14,
      title: "DAX Mastery: Measures, Context & CALCULATE",
      theme: "Data Analysis Expressions (DAX)",
      workplaceSkill: "DAX Analytical Calculations",
      deliverable: "Calculated measures for dynamic business KPI tracking",
      days: [
        { topic: "DAX Fundamentals: Calculated Columns vs Calculated Measures & Best Practices", practice: "Write clean DAX measures for Total Revenue, Total Margin, and Units Sold" },
        { topic: "Evaluation Context in DAX: Row Context vs Filter Context", practice: "Trace how filter context from slicers and matrix visuals affects measure outputs" },
        { topic: "The CALCULATE Function: Modifying & Overriding Filter Context", practice: "Compute regional market shares and filtered category subtotals with CALCULATE" },
        { topic: "Table Functions (FILTER, ALL, ALLEXCEPT, VALUES, DISTINCT)", practice: "Calculate % of Total Sales across product categories using ALL and ALLEXCEPT" },
        { topic: "Iterator Functions (SUMX, AVERAGEX, COUNTX, RANKX)", practice: "Compute dynamic weighted average margin percentages using SUMX" },
      ],
    },
    // Week 15
    {
      week: 15,
      title: "Time Intelligence DAX & Power BI Interactive Visuals",
      theme: "Time Intelligence & Dashboard UX",
      workplaceSkill: "Interactive Power BI Dashboards",
      deliverable: "Multi-page interactive Power BI dashboard with drill-throughs",
      days: [
        { topic: "Time Intelligence DAX (YTD, QTD, MTD, SAMEPERIODLASTYEAR, DATEADD)", practice: "Calculate Year-to-Date revenue and Year-over-Year growth percentage measures" },
        { topic: "Core Power BI Visuals (Card, Matrix, Bar, Line, Decomposition Tree, Gauge)", practice: "Design interactive visual cards, decomposition trees, and trend matrices" },
        { topic: "Dashboard Interactivity: Slicers, Sync Slicers, Edit Interactions, Drill-Down", practice: "Configure cross-report slicer syncing and custom visual interaction filters" },
        { topic: "Drill-Through Pages, Tooltip Pages & Dynamic Measure Formats", practice: "Create dedicated customer drill-through pages and custom visual tooltips" },
        { topic: "Bookmarks, Selection Panes, and Dynamic View Toggles in Power BI", practice: "Implement button-driven view toggles between chart views and data table views" },
      ],
    },
    // Week 16
    {
      week: 16,
      title: "Tableau Fundamentals: Dimensions, Measures & Visuals",
      theme: "Tableau Visual Analytics",
      workplaceSkill: "Tableau Visual Encoding",
      deliverable: "Interactive Tableau worksheets with custom chart types",
      days: [
        { topic: "Tableau Architecture, Connecting to Excel/SQL Data & Live vs Extract Connections", practice: "Connect Tableau to PostgreSQL and configure optimized data extracts (.hyper)" },
        { topic: "Dimensions vs Measures, Discrete (Blue) vs Continuous (Green) Fields", practice: "Differentiate discrete headers from continuous axes to build custom views" },
        { topic: "The Marks Card: Color, Size, Label, Detail, Tooltip & Shape Encodings", practice: "Apply multi-variable visual encodings to scatter plots and bubble charts" },
        { topic: "Core Visual Types: Bar Charts, Line Charts, Dual-Axis Charts & Area Charts", practice: "Construct synchronized dual-axis charts combining revenue bars and margin lines" },
        { topic: "Geographic Mapping: Filled Maps, Symbol Maps, Map Layers & Custom Geocoding", practice: "Build interactive regional sales maps with state-level density gradients" },
      ],
    },
    // Week 17
    {
      week: 17,
      title: "Tableau Calculations, Parameters & Level of Detail (LOD)",
      theme: "Tableau Analytical Formulas",
      workplaceSkill: "Tableau LOD Calculations",
      deliverable: "Advanced analytical Tableau dashboards with LOD metrics",
      days: [
        { topic: "Calculated Fields: Basic String, Date, and Conditional Calculations in Tableau", practice: "Create custom profit margin formulas and categorical tier groupings" },
        { topic: "Table Calculations (Running Total, % of Total, Rank, Difference, Moving Average)", practice: "Compute customer rank and moving 3-month rolling revenue averages" },
        { topic: "Parameters in Tableau: Dynamic Dimension/Measure Switching & Top N Filters", practice: "Build parameter controls that let users dynamically switch chart metrics" },
        { topic: "Level of Detail (LOD) Expressions: FIXED Expressions", practice: "Calculate customer acquisition cohort date and lifetime spend using FIXED LOD" },
        { topic: "LOD Expressions: INCLUDE & EXCLUDE & Tableau Order of Operations", practice: "Compute regional averages without altering view granularity using INCLUDE" },
      ],
    },
    // Week 18
    {
      week: 18,
      title: "Tableau Dashboards, Story Points & Automated BI Pipelines",
      theme: "Executive BI Delivery",
      workplaceSkill: "Executive BI Delivery & Storytelling",
      deliverable: "Production executive BI portfolio in Tableau and Power BI",
      days: [
        { topic: "Tableau Dashboard Layouts: Tiled vs Floating Containers & Visual Hierarchy", practice: "Assemble structured executive dashboard layouts with KPI headers" },
        { topic: "Dashboard Actions: Filter Actions, Highlight Actions, and URL Actions", practice: "Configure bidirectional filter actions across all worksheet charts" },
        { topic: "Story Points in Tableau: Structuring Data Narratives for Stakeholders", practice: "Create a 5-step interactive Story Point deck presenting quarterly business review" },
        { topic: "Tableau Cloud / Server Publishing, Scheduled Refresh & Permissions", practice: "Publish dashboards to Tableau Cloud and configure scheduled data refreshes" },
        { topic: "End-to-End Enterprise Analytics Project: Ingestion -> SQL -> Python -> BI Dashboard", practice: "Deliver a complete cross-tool business intelligence pipeline with executive summary" },
      ],
    },
  ],
);

/* ==========================================================================
   COURSE 3: AI & ML ENGINEER (90 Days Learning)
   Python + SQL + NumPy + Pandas + Scikit-learn + PyTorch/TensorFlow + NLP +
   Transformers + GenAI/LLMs + RAG + LangChain + FastAPI + PostgreSQL + Git + AWS
   ========================================================================== */
export const AIML_SYLLABUS: TrackSyllabus = buildInteractiveSyllabus(
  "aiml",
  "AI & ML Engineer",
  "Machine Learning & GenAI Engineer",
  [
    "Junior Machine Learning Engineer",
    "ML & GenAI Engineer",
    "Senior AI Systems Engineer",
    "Lead MLOps & LLM Architect",
    "Principal AI Research & Systems Engineer",
  ],
  "I develop and deploy end-to-end Machine Learning systems, deep neural networks in PyTorch, Transformer-based NLP models, GenAI/LLM pipelines with LangChain & RAG, and production inference APIs with FastAPI, PostgreSQL, Docker, and AWS.",
  [
    { phaseNumber: 1, title: "Scientific Python, SQL & Data Foundations", weeksRange: "Weeks 1–3", description: "Python OOP, SQL for ML, vectorized NumPy computations, and Pandas feature engineering." },
    { phaseNumber: 2, title: "Classical Machine Learning (Scikit-learn)", weeksRange: "Weeks 4–6", description: "Supervised/unsupervised algorithms, tree ensembles, evaluation metrics, and hyperparameter tuning." },
    { phaseNumber: 3, title: "Deep Learning (PyTorch & Neural Networks)", weeksRange: "Weeks 7–9", description: "Tensors, autograd, backpropagation, MLP architectures, CNNs, and GPU training pipelines." },
    { phaseNumber: 4, title: "NLP, Transformers & Large Language Models", weeksRange: "Weeks 10–13", description: "Attention mechanisms, HuggingFace Transformers, BERT, LLM fine-tuning, LangChain, and RAG." },
    { phaseNumber: 5, title: "FastAPI, Vector DBs, MLOps & AWS Deployment", weeksRange: "Weeks 14–18", description: "FastAPI async endpoints, PostgreSQL pgvector, Git MLOps, Docker, AWS SageMaker, and production CI/CD." },
  ],
  [
    // Week 1
    {
      week: 1,
      title: "Python for AI/ML & Scientific Computing",
      theme: "Python Foundations for AI",
      workplaceSkill: "Scientific Python Architecture",
      deliverable: "Modular Python modules for ML preprocessing pipelines",
      days: [
        { topic: "Python Object-Oriented Programming for ML (Classes, Inheritance, Dunder Methods)", practice: "Build custom data loader classes implementing iterator and generator protocols" },
        { topic: "Python Typing, Dataclasses, and Pydantic for Data Validation", practice: "Define strict data schema models for feature ingestion pipelines" },
        { topic: "Exception Handling, Logging, and Debugging in Machine Learning Pipelines", practice: "Implement structured JSON logging and assertion checks in data preprocessing" },
        { topic: "File Systems, OS Utilities, and Managing Large Datasets with Pathlib", practice: "Traverse and batch-process nested image and text directories with Pathlib" },
        { topic: "Virtual Environments, Dependency Management (poetry/pip), and Project Structuring", practice: "Structure a production AI project repository with clean dependency lockfiles" },
      ],
    },
    // Week 2
    {
      week: 2,
      title: "SQL & Relational Feature Extraction for AI Engineers",
      theme: "SQL Data Extraction for ML",
      workplaceSkill: "Feature Query Engineering",
      deliverable: "SQL feature extraction scripts for training datasets",
      days: [
        { topic: "Relational Queries for ML: SELECT, Filtering, Aggregations & Joins in PostgreSQL", practice: "Query high-volume transactional tables to construct training feature sets" },
        { topic: "Window Functions for Feature Engineering (Running Totals, Lags, Moving Averages)", practice: "Extract historical customer usage features using window partitioning in SQL" },
        { topic: "Handling Missing Data, Type Casting & JSONB Querying in PostgreSQL", practice: "Query semi-structured metadata from JSONB columns for downstream modeling" },
        { topic: "Exporting SQL Queries into Python/Pandas Efficiently (SQLAlchemy, psycopg3)", practice: "Stream large query result sets directly into Pandas DataFrames in memory" },
        { topic: "Database Indexing & Query Optimization for Large Training Datasets", practice: "Optimize multi-table feature queries with composite indexes and explain plans" },
      ],
    },
    // Week 3
    {
      week: 3,
      title: "NumPy & Pandas for Machine Learning Feature Pipelines",
      theme: "Array & Tabular Data Processing",
      workplaceSkill: "Tensor & Feature Engineering",
      deliverable: "Vectorized data preprocessing and scaling pipelines",
      days: [
        { topic: "NumPy Multi-Dimensional Arrays, Vectorization & Matrix Math (Dot, Norms, SVD)", practice: "Implement matrix operations and cosine similarity directly in NumPy" },
        { topic: "Broadcasting, Array Reshaping, Slicing & Memory Strides in NumPy", practice: "Manipulate multi-channel tensor shapes without making unnecessary data copies" },
        { topic: "Pandas DataFrame Feature Transformations (One-Hot Encoding, Ordinal Mapping)", practice: "Encode high-cardinality categorical variables into numerical matrices" },
        { topic: "Missing Value Imputation, Outlier Handling (IQR/Z-Score) & Scaling (MinMax, Standard)", practice: "Build custom scikit-learn compatible transformers for data normalization" },
        { topic: "Train/Validation/Test Data Splitting & Stratification Strategies", practice: "Implement stratified time-series and class-balanced dataset splitters" },
      ],
    },
    // Week 4
    {
      week: 4,
      title: "Supervised Learning: Regression & Classification (Scikit-learn)",
      theme: "Classical Machine Learning",
      workplaceSkill: "Supervised ML Modeling",
      deliverable: "Trained and evaluated regression and classification models",
      days: [
        { topic: "Linear Regression, Cost Functions (MSE), and Gradient Descent Optimization", practice: "Train linear regression models and evaluate R-squared and RMSE metrics" },
        { topic: "Regularization Techniques: Ridge (L2), Lasso (L1) & ElasticNet", practice: "Apply L1 regularization to perform automated feature selection on sparse data" },
        { topic: "Logistic Regression, Sigmoid Activation, Log-Loss & Binary Classification", practice: "Train binary classification models and analyze feature odds ratios" },
        { topic: "Classification Metrics: Confusion Matrix, Precision, Recall, F1-Score & ROC-AUC", practice: "Evaluate imbalanced classification models using precision-recall curves" },
        { topic: "K-Nearest Neighbors (KNN), Decision Boundaries & Distance Metrics", practice: "Implement KNN classification and analyze decision boundary changes with k" },
      ],
    },
    // Week 5
    {
      week: 5,
      title: "Tree Ensembles: Random Forests, XGBoost & LightGBM",
      theme: "Ensemble Learning",
      workplaceSkill: "Gradient Boosted Tree Systems",
      deliverable: "Tuned XGBoost / LightGBM models with SHAP feature explanations",
      days: [
        { topic: "Decision Trees, Impurity Measures (Gini, Entropy) & Pruning Strategies", practice: "Train decision trees and visualize split criteria and maximum depth pruning" },
        { topic: "Ensemble Principles: Bagging vs Boosting & Random Forest Classifiers", practice: "Train Random Forest ensembles with feature bagging and out-of-bag evaluation" },
        { topic: "Gradient Boosting Theory & XGBoost Algorithm Implementation", practice: "Train XGBoost models for structured tabular prediction with early stopping" },
        { topic: "LightGBM & CatBoost for High-Speed Tabular Feature Processing", practice: "Benchmark LightGBM training speeds on categorical feature datasets" },
        { topic: "Model Interpretability: Feature Importance, Partial Dependence & SHAP Values", practice: "Explain individual tree model predictions using SHAP force plots" },
      ],
    },
    // Week 6
    {
      week: 6,
      title: "Unsupervised Learning, Dimensionality Reduction & ML Pipelines",
      theme: "Unsupervised Modeling & Pipelines",
      workplaceSkill: "Scikit-learn Production Pipelines",
      deliverable: "Production-ready scikit-learn pipeline with hyperparameter search",
      days: [
        { topic: "K-Means Clustering, Inertia, Elbow Method & Silhouette Scores", practice: "Cluster customer segments using K-Means and evaluate cluster separation" },
        { topic: "Hierarchical Clustering & DBSCAN Density-Based Outlier Detection", practice: "Identify spatial anomaly outliers using DBSCAN density clustering" },
        { topic: "Principal Component Analysis (PCA) & Dimensionality Reduction", practice: "Reduce high-dimensional feature spaces while preserving 95% variance" },
        { topic: "Scikit-learn Pipelines (Pipeline, ColumnTransformer, FeatureUnion)", practice: "Assemble end-to-end preprocessing and modeling into a single Pipeline object" },
        { topic: "Hyperparameter Optimization: GridSearchCV, RandomizedSearchCV & Optuna", practice: "Optimize ensemble model hyperparameters using Bayesian search in Optuna" },
      ],
    },
    // Week 7
    {
      week: 7,
      title: "Deep Learning Foundations: PyTorch Tensors & Autograd",
      theme: "Neural Network Primitives",
      workplaceSkill: "PyTorch Tensor Operations",
      deliverable: "Custom neural network training loop built in PyTorch",
      days: [
        { topic: "Deep Learning Fundamentals: Perceptrons, Multi-Layer Perceptrons & Non-Linearity", practice: "Build single and multi-layer neural networks from mathematical scratch" },
        { topic: "PyTorch Tensors, GPU Acceleration (CUDA/MPS), and Device Management", practice: "Transfer tensors to GPU devices and perform accelerated batch matrix math" },
        { topic: "Automatic Differentiation with PyTorch Autograd (backward, grad, grad_fn)", practice: "Compute gradient vectors through computational graphs with autograd" },
        { topic: "Activation Functions (ReLU, LeakyReLU, Sigmoid, Tanh, GELU, Softmax)", practice: "Analyze gradient flow and vanishing gradient behavior across activation functions" },
        { topic: "Loss Functions (CrossEntropyLoss, MSELoss, BCEWithLogitsLoss) & Optimizers (SGD, Adam, AdamW)", practice: "Implement custom PyTorch training and validation loops with AdamW" },
      ],
    },
    // Week 8
    {
      week: 8,
      title: "Neural Network Architecture & Training Optimization",
      theme: "Deep Learning Optimization",
      workplaceSkill: "PyTorch Network Regularization",
      deliverable: "Regularized deep neural network model with learning rate scheduling",
      days: [
        { topic: "PyTorch nn.Module, nn.Sequential & Building Custom Layer Architectures", practice: "Construct modular deep neural network architectures inheriting from nn.Module" },
        { topic: "PyTorch Dataset & DataLoader (Batching, Shuffling, Parallel Workers)", practice: "Write custom PyTorch Dataset classes for streaming custom data batches" },
        { topic: "Regularization: Dropout, Batch Normalization & Layer Normalization", practice: "Incorporate BatchNorm and Dropout layers to mitigate model overfitting" },
        { topic: "Learning Rate Schedulers (StepLR, CosineAnnealingLR, ReduceLROnPlateau)", practice: "Implement learning rate warmup and cosine annealing schedules" },
        { topic: "Model Checkpointing, Early Stopping & PyTorch Model Serialization (.pt / .pth)", practice: "Save and load model checkpoints based on validation loss thresholds" },
      ],
    },
    // Week 9
    {
      week: 9,
      title: "Convolutional Neural Networks (CNNs) & Computer Vision",
      theme: "Computer Vision with PyTorch",
      workplaceSkill: "Computer Vision & Transfer Learning",
      deliverable: "Fine-tuned transfer learning vision model in PyTorch",
      days: [
        { topic: "Convolution Operations, Filters, Kernels, Stride & Padding", practice: "Implement 2D convolution and pooling operations on image tensors" },
        { topic: "CNN Architectures (Conv2d, MaxPool2d, Flatten, Linear) in PyTorch", practice: "Build a custom CNN image classifier for handwritten digits / objects" },
        { topic: "Image Data Augmentation (torchvision.transforms / Albumentations)", practice: "Apply random crops, flips, rotations, and color jitter to training data" },
        { topic: "Transfer Learning: Pretrained Models (ResNet, EfficientNet, MobileNet)", practice: "Freeze backbone layers and fine-tune classifier heads on custom vision datasets" },
        { topic: "Feature Map Visualization & Model Explainability (Grad-CAM)", practice: "Generate Grad-CAM heatmaps highlighting visual attention regions in images" },
      ],
    },
    // Week 10
    {
      week: 10,
      title: "Natural Language Processing (NLP) & Word Embeddings",
      theme: "NLP Foundations & Embeddings",
      workplaceSkill: "NLP Preprocessing & Embeddings",
      deliverable: "NLP text classification pipeline using word embeddings",
      days: [
        { topic: "Text Preprocessing: Tokenization, Stopwords, Stemming & Lemmatization", practice: "Clean and normalize raw text corpora for natural language modeling" },
        { topic: "Classical NLP: Bag of Words (BoW), TF-IDF Vectorization & N-Grams", practice: "Train baseline text classifiers using TF-IDF feature matrices" },
        { topic: "Word Embeddings: Word2Vec (CBOW vs Skip-Gram) & GloVe Embeddings", practice: "Train Word2Vec embeddings and compute semantic vector analogies" },
        { topic: "PyTorch nn.Embedding Layer & Recurrent Neural Networks (RNN / LSTM / GRU)", practice: "Build an LSTM text classifier processing variable-length sequences" },
        { topic: "Bidirectional LSTMs, Sequence-to-Sequence & The Limitations of RNNs", practice: "Evaluate bidirectional LSTM architectures and analyze long-range gradient decay" },
      ],
    },
    // Week 11
    {
      week: 11,
      title: "The Transformer Architecture & Self-Attention Mechanisms",
      theme: "Transformer Deep Learning",
      workplaceSkill: "Transformer Attention Architecture",
      deliverable: "Custom Multi-Head Self-Attention module implemented in PyTorch",
      days: [
        { topic: "The Attention Mechanism: Query, Key, Value & Scaled Dot-Product Attention", practice: "Implement scaled dot-product attention mathematically in PyTorch" },
        { topic: "Multi-Head Attention (MHA) & Parallel Representation Subspaces", practice: "Construct a multi-head attention module with linear projection heads" },
        { topic: "Positional Encoding (Sinusoidal vs Learned) in Transformers", practice: "Add positional encodings to token embeddings to preserve sequence order" },
        { topic: "Transformer Encoder & Decoder Blocks (Feed-Forward, Residuals, LayerNorm)", practice: "Assemble a full Transformer encoder block with residual connections" },
        { topic: "Encoder-Only (BERT) vs Decoder-Only (GPT) vs Encoder-Decoder (T5) Models", practice: "Compare architectural differences and use cases across Transformer families" },
      ],
    },
    // Week 12
    {
      week: 12,
      title: "Hugging Face Transformers: Fine-Tuning & Model Hub",
      theme: "Hugging Face Ecosystem",
      workplaceSkill: "HuggingFace Transformer Fine-Tuning",
      deliverable: "Fine-tuned Hugging Face BERT model deployed for text classification",
      days: [
        { topic: "Hugging Face Ecosystem: AutoTokenizer, AutoModel, and Pipeline Primitives", practice: "Tokenize input text using Byte-Pair Encoding (BPE) with HuggingFace AutoTokenizer" },
        { topic: "Fine-Tuning BERT / RoBERTa for Sequence Classification with PyTorch", practice: "Fine-tune pretrained BERT models on domain-specific sentiment classification" },
        { topic: "The Hugging Face Trainer API & Evaluation Metrics (accuracy, f1, precision)", practice: "Configure TrainingArguments and train models using the HuggingFace Trainer" },
        { topic: "Hugging Face Datasets Library (streaming, mapping, batching)", practice: "Load and preprocess multi-gigabyte datasets with memory mapping" },
        { topic: "Model Compression: Quantization (INT8/INT4), Pruning & ONNX Runtime Export", practice: "Quantize Transformer models to INT8 and export to ONNX for 3x faster inference" },
      ],
    },
    // Week 13
    {
      week: 13,
      title: "Generative AI & Large Language Models (LLMs)",
      theme: "GenAI & LLM Integration",
      workplaceSkill: "LLM System Integration",
      deliverable: "Streaming GenAI application with structured schema outputs",
      days: [
        { topic: "LLM Architectures (GPT-4, Claude, Llama 3, Mistral, Gemini) & Context Windows", practice: "Compare open-weight vs proprietary model trade-offs, token limits, and costs" },
        { topic: "LLM APIs: Structured Outputs, JSON Mode & Tool Calling / Function Calling", practice: "Enforce strict JSON schema validation on LLM responses using function calling" },
        { topic: "Advanced Prompt Engineering (Few-Shot, Chain-of-Thought, ReAct, Self-Consistency)", practice: "Construct multi-step reasoning prompt templates with automatic error correction" },
        { topic: "Parameter-Efficient Fine-Tuning (PEFT) & LoRA / QLoRA Fundamentals", practice: "Configure LoRA adapter configurations to fine-tune open-source LLMs on consumer GPUs" },
        { topic: "LLM Safety, Alignment (RLHF, DPO) & Guardrails (NeMo Guardrails, Llama Guard)", practice: "Implement input/output moderation guardrails to filter harmful or out-of-domain queries" },
      ],
    },
    // Week 14
    {
      week: 14,
      title: "LangChain, LlamaIndex & Vector Databases (RAG)",
      theme: "RAG & Vector Retrieval",
      workplaceSkill: "Vector RAG Architecture",
      deliverable: "Production RAG pipeline with ChromaDB and hybrid search",
      days: [
        { topic: "Vector Embeddings & Semantic Search (Sentence-Transformers, OpenAI Text-Embedding)", practice: "Generate normalized dense embeddings across multi-domain technical documents" },
        { topic: "Vector Databases (ChromaDB, Pinecone, FAISS, Weaviate) Setup & Indexing", practice: "Index document chunks with metadata filtering in ChromaDB and FAISS" },
        { topic: "Document Loaders & Advanced Chunking (Semantic Chunking, Markdown Chunking)", practice: "Chunk technical manuals preserving hierarchical section headers and tables" },
        { topic: "Retrieval-Augmented Generation (RAG) Architecture (Retriever + Context + LLM)", practice: "Construct a complete RAG question-answering system over private company data" },
        { topic: "Advanced RAG: Re-ranking (Cohere Rerank), Hybrid Search (BM25 + Dense) & Query Expansion", practice: "Implement hybrid keyword + semantic search with cross-encoder re-ranking" },
      ],
    },
    // Week 15
    {
      week: 15,
      title: "Autonomous AI Agents & Multi-Agent Orchestration",
      theme: "Autonomous Agent Systems",
      workplaceSkill: "Autonomous AI Agent Orchestration",
      deliverable: "Multi-step autonomous agent with custom tools and persistent memory",
      days: [
        { topic: "AI Agent Architecture: Planning, Memory, Tools & Action Execution Loops", practice: "Build an agent that breaks down user goals into sequential sub-tasks" },
        { topic: "LangChain Tools & Dynamic Tool Calling with Web Search and Python REPL", practice: "Equip an AI agent with Python code execution and web browsing tools" },
        { topic: "LangGraph Foundations: State Graphs, Nodes, Edges & Conditional Routing", practice: "Construct cyclical stateful agent workflows using LangGraph state graphs" },
        { topic: "Multi-Agent Collaboration (Supervisor-Worker & Peer-to-Peer Agent Networks)", practice: "Implement a researcher-writer multi-agent system collaborating on reports" },
        { topic: "Agent Memory: Short-Term Buffer vs Long-Term Vector Memory (Zep / Mem0)", practice: "Integrate long-term episodic memory allowing agents to recall past user sessions" },
      ],
    },
    // Week 16
    {
      week: 16,
      title: "FastAPI for Machine Learning & Vector Search APIs",
      theme: "High-Performance AI Microservices",
      workplaceSkill: "FastAPI AI Microservices",
      deliverable: "Asynchronous FastAPI microservice serving ML predictions",
      days: [
        { topic: "FastAPI Architecture, Async/Await Endpoints, and Pydantic Request/Response Models", practice: "Build asynchronous REST endpoints validating ML input payloads with Pydantic" },
        { topic: "Loading ML Models in FastAPI (Lifespan Handlers, Global In-Memory Caching)", practice: "Load PyTorch and scikit-learn models once on startup in memory for sub-10ms inference" },
        { topic: "Streaming LLM Responses via Server-Sent Events (SSE) in FastAPI", practice: "Implement token-by-token streaming endpoints for real-time AI chat generation" },
        { topic: "Background Tasks, Batch Prediction Queues & Concurrency in FastAPI", practice: "Queue long-running inference jobs to background workers while returning task IDs" },
        { topic: "API Security: API Key Authentication, Rate Limiting, and CORS Policies", practice: "Secure AI inference endpoints with token authentication and rate limiters" },
      ],
    },
    // Week 17
    {
      week: 17,
      title: "PostgreSQL with pgvector, Git & MLOps Versioning",
      theme: "Vector Relational Storage & MLOps",
      workplaceSkill: "pgvector & MLOps Pipelines",
      deliverable: "PostgreSQL pgvector storage with DVC/MLflow experiment tracking",
      days: [
        { topic: "PostgreSQL pgvector Extension: Vector Data Types & Similarity Operators (<->, <=>, <#>)", practice: "Install pgvector and store high-dimensional embeddings in relational tables" },
        { topic: "pgvector Indexing: HNSW (Hierarchical Navigable Small World) & IVFFlat Indexes", practice: "Create HNSW indexes for sub-millisecond vector similarity search in PostgreSQL" },
        { topic: "Hybrid SQL + Vector Queries (Filtering on Relational Columns + Vector Similarity)", practice: "Execute combined SQL queries filtering by user_id and ranking by embedding distance" },
        { topic: "ML Experiment Tracking with MLflow & Weights & Biases (W&B)", practice: "Log hyperparameters, loss curves, and artifact metrics during training runs" },
        { topic: "Data & Model Versioning with DVC (Data Version Control) & Git Integration", practice: "Track multi-gigabyte dataset versions connected to Git commit hashes" },
      ],
    },
    // Week 18
    {
      week: 18,
      title: "Docker for AI, AWS SageMaker & Cloud Deployment",
      theme: "Cloud ML Deployment & MLOps",
      workplaceSkill: "AWS Cloud ML Deployment",
      deliverable: "Containerized AI microservice deployed on AWS cloud infrastructure",
      days: [
        { topic: "Dockerizing AI Applications: CUDA Base Images & Multi-Stage Lightweight Builds", practice: "Write production Dockerfiles containerizing FastAPI and PyTorch models" },
        { topic: "AWS Cloud Fundamentals for ML: IAM Roles, S3 Model Storage & Security Groups", practice: "Store model weights in encrypted AWS S3 buckets and configure IAM access" },
        { topic: "Deploying AI Containers on AWS EC2 & AWS Elastic Container Service (ECS)", practice: "Deploy containerized FastAPI AI microservices on AWS with health check probes" },
        { topic: "AWS SageMaker Endpoint Deployment & Serverless Inference", practice: "Deploy HuggingFace models to AWS SageMaker for auto-scaling serverless inference" },
        { topic: "Continuous Deployment (CI/CD) for AI Systems with GitHub Actions", practice: "Build end-to-end GitHub Actions workflows testing and deploying AI services to AWS" },
      ],
    },
  ],
);

/* ==========================================================================
   GET TRACK SYLLABUS DISPATCHER
   ========================================================================== */
export function getTrackSyllabus(trackId: TrackId | string): TrackSyllabus {
  if (trackId === "datascience") return DATA_ANALYSIS_SYLLABUS;
  if (trackId === "aiml") return AIML_SYLLABUS;
  return FULLSTACK_SYLLABUS; // default / java
}
