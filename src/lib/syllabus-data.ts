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
  trackId: TrackId;
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
   1. MEDICAL CODING & AI-ASSISTED RCM (User Standard Template)
   ========================================================================== */
export const MEDICAL_CODING_SYLLABUS: TrackSyllabus = {
  trackId: "medical",
  trackName: "Medical Coding & AI-Assisted RCM",
  targetRole: "AI Medical Coding & RCM Specialist",
  careerProgression: [
    "Junior Medical Coder",
    "Medical Coder (ICD-10/CPT)",
    "AI-Assisted Coder",
    "RCM & Denial Analyst",
    "AI Medical Coding Specialist",
  ],
  interviewPitch:
    "I can review clinical documentation, perform ICD-10-CM/CPT/HCPCS coding, validate AI-generated coding, prepare clean claims, analyze and appeal denials, perform coding audits, and work seamlessly within an AI-assisted RCM workflow.",
  phases: [
    { phaseNumber: 1, title: "Clinical & Healthcare Foundations", weeksRange: "Weeks 1–5", description: "RCM cycle, medical terminology, multi-system anatomy, and healthcare AI NLP." },
    { phaseNumber: 2, title: "ICD-10-CM Diagnostic Coding", weeksRange: "Weeks 6–10", description: "Alphabetic index, tabular list, coding guidelines, major diseases, and complex sequencing." },
    { phaseNumber: 3, title: "CPT, HCPCS & Procedural Coding", weeksRange: "Weeks 11–14", description: "CPT sections, E/M levels, surgical packages, modifiers, and HCPCS Level II." },
    { phaseNumber: 4, title: "AI-Driven Medical Coding & Quality Audit", weeksRange: "Weeks 15–16", description: "CAC workflows, AI hallucination detection, prompt engineering, and human-in-the-loop validation." },
    { phaseNumber: 5, title: "RCM, Denials, Compliance & Capstone", weeksRange: "Weeks 17–18", description: "Claim lifecycle, denial appeals, HIPAA security, fraud prevention, and end-to-end industry capstone." },
  ],
  weeks: [
    {
      week: 1,
      title: "Medical Coding & Revenue Cycle Foundations",
      theme: "Healthcare RCM Life Cycle",
      days: [
        { day: 1, topic: "Introduction to Medical Coding", practice: "Identify primary coding activities & classifications" },
        { day: 2, topic: "Healthcare Revenue Cycle Management", practice: "Map all 8 RCM stages from scheduling to reimbursement" },
        { day: 3, topic: "Medical Coder Roles & Responsibilities", practice: "Identify compliance, accuracy, and coder productivity benchmarks" },
        { day: 4, topic: "AI in Medical Coding & RCM", practice: "Identify computer-assisted coding and automated charge capture use cases" },
        { day: 5, topic: "PROJECT 1: Patient-to-Payment Workflow", practice: "Build complete RCM patient encounter lifecycle map", isProject: true, projectTitle: "Patient-to-Payment Workflow", workplaceSimulation: "A healthcare organization asks you to document how a patient moves from registration to final insurance payment.", deliverable: "Patient Revenue Cycle Workflow" },
      ],
      projectTitle: "Patient-to-Payment Workflow",
      deliverable: "Patient Revenue Cycle Workflow",
      workplaceSkill: "RCM Understanding",
    },
    {
      week: 2,
      title: "Medical Terminology for Coders",
      theme: "Clinical Vocabulary & Etymology",
      days: [
        { day: 6, topic: "Medical Word Roots", practice: "Break down clinical terms into anatomical roots" },
        { day: 7, topic: "Prefixes & Directional Terms", practice: "Identify surgical, temporal, and spatial clinical prefixes" },
        { day: 8, topic: "Suffixes & Diagnostic Endings", practice: "Decode procedural (-ectomy, -stomy) and pathology (-itis, -oma) suffixes" },
        { day: 9, topic: "Medical Abbreviations & Acronyms", practice: "Interpret hospital abbreviations (COPD, HTN, CHF, CABG, ORIF)" },
        { day: 10, topic: "PROJECT 2: Medical Terminology Reference Guide", practice: "Decode 30 complex inpatient discharge diagnoses", isProject: true, projectTitle: "Medical Terminology Reference", workplaceSimulation: "Create an authoritative rapid-lookup guide for junior coders joining a multispecialty clinic.", deliverable: "Medical Terminology Coding Reference Sheet" },
      ],
      projectTitle: "Medical Terminology Reference",
      deliverable: "Medical Terminology Coding Reference Sheet",
      workplaceSkill: "Clinical Vocabulary",
    },
    {
      week: 3,
      title: "Anatomy & Physiology I",
      theme: "Integumentary, Musculoskeletal & Cardiovascular",
      days: [
        { day: 11, topic: "Integumentary System & Lesion Mapping", practice: "Identify burns, lacerations, ulcers, and tissue depths" },
        { day: 12, topic: "Musculoskeletal System & Fracture Types", practice: "Differentiate closed vs open fractures and joint arthropathies" },
        { day: 13, topic: "Cardiovascular System & Valvular Pathologies", practice: "Identify CAD, MI types (STEMI/NSTEMI), and heart failure classes" },
        { day: 14, topic: "Anatomy in Clinical Documentation", practice: "Extract anatomical laterality and structural details from operative notes" },
        { day: 15, topic: "PROJECT 3: Clinical Anatomy Mapping", practice: "Map 20 clinical conditions to organ systems and body sites", isProject: true, projectTitle: "Clinical Anatomy Mapping", workplaceSimulation: "Audit a surgical clinic chart to ensure all anatomical sites match doctor operative notes.", deliverable: "Clinical Anatomy & Condition Map" },
      ],
      projectTitle: "Clinical Anatomy Mapping",
      deliverable: "Clinical Anatomy & Condition Map",
      workplaceSkill: "Anatomical Site Mapping",
    },
    {
      week: 4,
      title: "Anatomy & Physiology II",
      theme: "Respiratory, GI, Nervous & Endocrine Systems",
      days: [
        { day: 16, topic: "Respiratory System & Pulmonary Pathologies", practice: "Classify pneumonia organisms, COPD exacerbations, and asthma severity" },
        { day: 17, topic: "Digestive System & Gastrointestinal Disorders", practice: "Identify GERD, diverticulitis, Crohn's, and GI hemorrhage sites" },
        { day: 18, topic: "Nervous System & Neurological Pathologies", practice: "Identify stroke (CVA vs TIA), epilepsy, and neuropathy types" },
        { day: 19, topic: "Endocrine, Urinary & Reproductive Systems", practice: "Classify diabetes complications (CKD, retinopathy, neuropathy)" },
        { day: 20, topic: "PROJECT 4: Multi-System Chart Review", practice: "Analyze complex inpatient chart covering 4 organ systems", isProject: true, projectTitle: "Multi-System Chart Review", workplaceSimulation: "Review a 5-day inpatient stay with multiple comorbidities for coding completeness.", deliverable: "Clinical Chart Review Report" },
      ],
      projectTitle: "Multi-System Chart Review",
      deliverable: "Clinical Chart Review Report",
      workplaceSkill: "Documentation Review",
    },
    {
      week: 5,
      title: "Clinical Documentation & Healthcare AI",
      theme: "EHR Notes & NLP Extraction",
      days: [
        { day: 21, topic: "Clinical Documentation Note Types (H&P, Progress, OP)", practice: "Extract relevant coding data across SOAP notes and discharge summaries" },
        { day: 22, topic: "Structured vs Unstructured Healthcare Data", practice: "Classify discrete lab values vs free-text physician narratives" },
        { day: 23, topic: "AI, Machine Learning & Deep Learning in Healthcare", practice: "Identify medical NLP models and clinical ontology standards (SNOMED, UMLS)" },
        { day: 24, topic: "NLP for Clinical Note Analysis", practice: "Perform Named Entity Recognition on doctor discharge notes" },
        { day: 25, topic: "PROJECT 5: AI Clinical Note Analyzer", practice: "Compare AI NLP extracted entities against expert human coders", isProject: true, projectTitle: "AI Clinical Note Analyzer", workplaceSimulation: "Evaluate an AI clinical assistant pipeline against 10 doctor discharge summaries.", deliverable: "AI Clinical Entity Extraction Report" },
      ],
      projectTitle: "AI Clinical Note Analyzer",
      deliverable: "AI Clinical Entity Extraction Report",
      workplaceSkill: "Healthcare NLP & AI",
    },
    {
      week: 6,
      title: "ICD-10-CM Fundamentals",
      theme: "Diagnostic Code Navigation",
      days: [
        { day: 26, topic: "ICD-10-CM Structure & Characters 1–7", practice: "Deconstruct 7-character ICD-10 diagnostic codes" },
        { day: 27, topic: "Alphabetic Index Lookup Techniques", practice: "Navigate Main Terms, Essential Modifiers, and Non-Essential Modifiers" },
        { day: 28, topic: "Tabular List Verification & Code Blocks", practice: "Verify codes in Tabular List and check instructional notations" },
        { day: 29, topic: "ICD-10-CM Coding Conventions & Symbols", practice: "Apply 'Includes', 'Excludes1', 'Excludes2', and 'Code Also' rules" },
        { day: 30, topic: "PROJECT 6: ICD-10 Coding Lookup Challenge", practice: "Code 15 realistic outpatient diagnostic cases from raw notes", isProject: true, projectTitle: "ICD-10 Coding Worksheet", workplaceSimulation: "A primary care clinic provides 15 physician diagnosis statements requiring accurate ICD-10-CM assignment.", deliverable: "ICD-10-CM Coding Production Worksheet" },
      ],
      projectTitle: "ICD-10 Coding Lookup Challenge",
      deliverable: "ICD-10-CM Coding Production Worksheet",
      workplaceSkill: "ICD-10 Diagnostic Coding",
    },
    {
      week: 7,
      title: "ICD-10-CM Official Guidelines & Auditing",
      theme: "Coding Rules & Guidelines",
      days: [
        { day: 31, topic: "Inclusion & Exclusion Conventions Masterclass", practice: "Resolve Excludes1 vs Excludes2 conflicts in complex cases" },
        { day: 32, topic: "Signs, Symptoms & Definitive Diagnoses", practice: "Apply rules for when to code symptoms vs confirmed pathology" },
        { day: 33, topic: "Etiology, Manifestation & Combination Codes", practice: "Code underlying cause + secondary manifestation sequences" },
        { day: 34, topic: "Specificity, Laterality & 7th Character Extension", practice: "Assign right/left/bilateral specificity and initial/subsequent encounter extensions" },
        { day: 35, topic: "PROJECT 7: Diagnosis Validation Audit", practice: "Audit 12 incorrectly coded insurance claims and correct mistakes", isProject: true, projectTitle: "Diagnosis Validation Audit", workplaceSimulation: "A compliance officer assigns you 12 flagged claims with laterality and specificity errors.", deliverable: "ICD-10 Coding Validation & Audit Report" },
      ],
      projectTitle: "Diagnosis Validation Audit",
      deliverable: "ICD-10 Coding Validation & Audit Report",
      workplaceSkill: "Coding Quality Assurance",
    },
    {
      week: 8,
      title: "Major Disease Coding I",
      theme: "Infections, Neoplasms, Diabetes & Circulatory",
      days: [
        { day: 36, topic: "Infectious & Parasitic Diseases (Sepsis, HIV, COVID)", practice: "Sequence severe sepsis, septic shock, and causative organisms" },
        { day: 37, topic: "Neoplasms (Primary, Secondary, In Situ, Benign)", practice: "Navigate Neoplasm Table and sequence chemotherapy vs malignancy" },
        { day: 38, topic: "Endocrine, Nutritional & Metabolic Disorders (Type 1 & 2 DM)", practice: "Code multi-complication diabetes with insulin dependence" },
        { day: 39, topic: "Circulatory System (Hypertension, CAD, Stroke)", practice: "Apply causal relationship assumptions in hypertensive heart & kidney disease" },
        { day: 40, topic: "PROJECT 8: Chronic Disease Coding Batch", practice: "Code a high-volume batch of 20 complex chronic disease patient encounters", isProject: true, projectTitle: "Chronic Disease Coding Batch", workplaceSimulation: "Process an urgent backlog of internal medicine patient charts requiring exact risk-adjustment coding.", deliverable: "Chronic Disease Coding Production Batch" },
      ],
      projectTitle: "Chronic Disease Coding Batch",
      deliverable: "Chronic Disease Coding Production Batch",
      workplaceSkill: "Production Chronic Disease Coding",
    },
    {
      week: 9,
      title: "Major Disease Coding II",
      theme: "Respiratory, GI, Neurology & Orthopedics",
      days: [
        { day: 41, topic: "Respiratory Coding (Pneumonia, COPD, Respiratory Failure)", practice: "Sequence acute respiratory failure as principal diagnosis" },
        { day: 42, topic: "Digestive Coding (Ulcers, Hernias, Appendicitis, Cholecystitis)", practice: "Code acute appendicitis with perforation and localized peritonitis" },
        { day: 43, topic: "Nervous System & Sense Organs (Glaucoma, Neuropathy, Epilepsy)", practice: "Code bilateral glaucoma staging and intractable epilepsy" },
        { day: 44, topic: "Musculoskeletal System (Osteoarthritis, Spinal Stenosis, Pathological Fractures)", practice: "Distinguish traumatic vs pathological vs stress fractures" },
        { day: 45, topic: "PROJECT 9: Multi-Specialty Diagnosis Coding", practice: "Code specialty charts across Pulmonology, Gastroenterology, and Orthopedics", isProject: true, projectTitle: "Multi-Specialty Coding", workplaceSimulation: "A specialty hospital network assigns 15 mixed-specialty operative cases.", deliverable: "Multi-Specialty ICD-10 Report" },
      ],
      projectTitle: "Multi-Specialty Coding",
      deliverable: "Multi-Specialty ICD-10 Report",
      workplaceSkill: "Specialty Diagnostic Coding",
    },
    {
      week: 10,
      title: "Complex ICD-10-CM Coding Cases",
      theme: "Injuries, External Causes, Z-Codes & Sequencing",
      days: [
        { day: 46, topic: "Injury, Poisoning & Toxic Effects", practice: "Code traumatic open wounds with foreign body and 7th character tracking" },
        { day: 47, topic: "External Causes of Morbidity (V00–Y99)", practice: "Assign cause, place of occurrence, activity, and status codes" },
        { day: 48, topic: "Factors Influencing Health Status (Z-Codes)", practice: "Code prophylactic screenings, personal history, status, and social determinants (Z55-Z65)" },
        { day: 49, topic: "Principal Diagnosis Sequencing Rules (UHDDS)", practice: "Determine principal diagnosis when multiple conditions meet criteria" },
        { day: 50, topic: "PROJECT 10: Complex Patient Inpatient Case", practice: "Code a 10-day complex trauma ICU patient with 8 comorbid conditions", isProject: true, projectTitle: "Complex Patient Coding", workplaceSimulation: "Act as Senior Inpatient Coder assigning all principal, secondary, and external cause codes for a trauma ICU case.", deliverable: "Complex Patient Coding Case Report" },
      ],
      projectTitle: "Complex Patient Coding",
      deliverable: "Complex Patient Coding Case Report",
      workplaceSkill: "Advanced Inpatient Sequencing",
    },
    {
      week: 11,
      title: "CPT Procedural Coding Fundamentals",
      theme: "CPT Architecture & Navigation",
      days: [
        { day: 51, topic: "CPT Manual Architecture & Category I, II, III", practice: "Navigate 6 main CPT sections and understand indented code format" },
        { day: 52, topic: "CPT Alphabetic Index Search Techniques", practice: "Search by procedure, anatomical site, condition, or eponym" },
        { day: 53, topic: "CPT Section Guidelines & Parenthetical Notes", practice: "Interpret 'Do not report with' instructions and unlisted procedure codes" },
        { day: 54, topic: "Operative Report Procedural Extraction", practice: "Extract approach, technique, excision size, and closure type from surgeon notes" },
        { day: 55, topic: "PROJECT 11: CPT Production Coding Sheet", practice: "Code 15 surgical and diagnostic outpatient procedures", isProject: true, projectTitle: "CPT Production Coding", workplaceSimulation: "An ambulatory surgical center provides 15 operative notes for same-day procedural billing.", deliverable: "CPT Production Coding Worksheet" },
      ],
      projectTitle: "CPT Production Coding",
      deliverable: "CPT Production Coding Worksheet",
      workplaceSkill: "CPT Procedural Coding",
    },
    {
      week: 12,
      title: "Evaluation & Management (E/M) Coding",
      theme: "Office Visits, Inpatient & MDM Matrix",
      days: [
        { day: 56, topic: "E/M Categories (Office 99202–99215, Inpatient 99221–99233)", practice: "Distinguish new vs established patient encounter rules" },
        { day: 57, topic: "Medical Decision Making (MDM) 2021/2023 Guidelines", practice: "Score Problems Addressed, Data Analyzed, and Risk of Complications" },
        { day: 58, topic: "Time-Based E/M Coding Criteria", practice: "Calculate total face-to-face and non-face-to-face physician time" },
        { day: 59, topic: "E/M Documentation Auditing & Downcoding Prevention", practice: "Audit provider documentation to support chosen E/M level" },
        { day: 60, topic: "PROJECT 12: E/M Determination Audit", practice: "Determine and justify correct E/M levels for 10 outpatient and inpatient charts", isProject: true, projectTitle: "E/M Determination", workplaceSimulation: "A physician group audits 10 clinic encounters to ensure E/M levels comply with AMA/CMS MDM guidelines.", deliverable: "E/M Determination & MDM Scoring Report" },
      ],
      projectTitle: "E/M Determination",
      deliverable: "E/M Determination & MDM Scoring Report",
      workplaceSkill: "E/M Scoring & MDM Matrix",
    },
    {
      week: 13,
      title: "Surgery Coding & CPT Modifiers",
      theme: "Surgical Packages & Modifier Application",
      days: [
        { day: 61, topic: "Integumentary & Musculoskeletal Surgery Coding", practice: "Code lesion excisions with margins and complex wound closures" },
        { day: 62, topic: "Global Surgical Package (0, 10, 90-day rules)", practice: "Identify pre-op, intra-op, and normal post-op included services" },
        { day: 63, topic: "CPT Modifiers (25, 59, 50, 51, 52, 58, 78, 79, LT/RT)", practice: "Select and justify appropriate pricing and informational modifiers" },
        { day: 64, topic: "NCCI Edits, Bundling & Unbundling Detection", practice: "Check National Correct Coding Initiative (NCCI) PTP and MUE edit tables" },
        { day: 65, topic: "PROJECT 13: Surgical Coding Audit Case", practice: "Audit 8 complex operative cases for modifier accuracy and unbundling errors", isProject: true, projectTitle: "Surgical Coding Audit", workplaceSimulation: "A surgical center compliance team asks you to review 8 cases flagged for modifier 25 and 59 abuse.", deliverable: "Surgical Coding & NCCI Audit Report" },
      ],
      projectTitle: "Surgical Coding Audit",
      deliverable: "Surgical Coding & NCCI Audit Report",
      workplaceSkill: "Surgical Coding & Modifiers",
    },
    {
      week: 14,
      title: "Radiology, Pathology, Medicine & HCPCS Level II",
      theme: "Ancillary Services & Complete Claim Assembly",
      days: [
        { day: 66, topic: "Radiology Coding (Diagnostic, Ultrasound, CT/MRI, Interventional)", practice: "Code professional (26) vs technical (TC) radiology components" },
        { day: 67, topic: "Pathology & Laboratory Coding (Panels, Urinalysis, Surgical Path)", practice: "Apply organ disease panel bundling rules (e.g. CMP, BMP, Lipid)" },
        { day: 68, topic: "Medicine Section (Injections, Immunizations, Psych, Cardiology)", practice: "Code administration fees alongside vaccine/toxoid supply codes" },
        { day: 69, topic: "HCPCS Level II (DME, J-Codes, Supplies, A-Codes, G-Codes)", practice: "Assign HCPCS codes and unit dosages for injected chemotherapy drugs" },
        { day: 70, topic: "PROJECT 14: Complete Claim Coding Sheet", practice: "Assemble complete CMS-1500 coding dataset (ICD-10 + CPT + HCPCS + Modifiers)", isProject: true, projectTitle: "Complete Claim Coding", workplaceSimulation: "Code a complete multi-service outpatient clinic claim with labs, imaging, injections, and E/M.", deliverable: "Complete Superbill Claim Coding Sheet" },
      ],
      projectTitle: "Complete Claim Coding",
      deliverable: "Complete Superbill Claim Coding Sheet",
      workplaceSkill: "Full Claim Assembly (ICD+CPT+HCPCS)",
    },
    {
      week: 15,
      title: "AI-Driven Medical Coding & CAC Workflows",
      theme: "Computer-Assisted Coding & AI Engines",
      days: [
        { day: 71, topic: "Computer-Assisted Coding (CAC) System Workflows", practice: "Navigate CAC software interface and understand confidence score thresholds" },
        { day: 72, topic: "AI Clinical Entity Extraction & Terminology Mapping", practice: "Evaluate AI extracted clinical concepts mapped to SNOMED CT and ICD-10" },
        { day: 73, topic: "Automated Charge Capture & Ambient AI Scribes", practice: "Review ambient listening AI conversation transcripts for codeable items" },
        { day: 74, topic: "AI-Assisted ICD-10 & CPT Code Suggestion Engines", practice: "Review AI suggested code candidates and evaluate ranking logic" },
        { day: 75, topic: "PROJECT 15: AI vs Human Coding Benchmark", practice: "Benchmark AI coding suggestions against expert human gold standard across 15 charts", isProject: true, projectTitle: "AI vs Human Coding", workplaceSimulation: "Conduct an accuracy benchmark trial comparing an enterprise CAC AI engine with senior human coders.", deliverable: "AI vs Human Coding Benchmark Report" },
      ],
      projectTitle: "AI vs Human Coding",
      deliverable: "AI vs Human Coding Benchmark Report",
      workplaceSkill: "AI-Assisted Coding Benchmarking",
    },
    {
      week: 16,
      title: "AI Validation & Human-in-the-Loop Quality Audit",
      theme: "AI Safety, Hallucinations & Governance",
      days: [
        { day: 76, topic: "Prompt Engineering for Clinical Coding LLMs", practice: "Craft zero-shot and few-shot coding prompts with guideline constraints" },
        { day: 77, topic: "AI Hallucination & Upcoding Detection", practice: "Identify unsupported AI code recommendations that lack documentation proof" },
        { day: 78, topic: "AI Coding Error Taxonomy & Root Cause Analysis", practice: "Classify AI errors: Laterality misses, modifier omissions, unbundling" },
        { day: 79, topic: "Human-in-the-Loop (HITL) Validation Workflows", practice: "Implement coder accept, reject, and modify decision trees" },
        { day: 80, topic: "PROJECT 16: AI Coding Quality & Safety Audit", practice: "Audit 10 AI-generated patient code sets, correct errors, and calculate precision/recall", isProject: true, projectTitle: "AI Coding Quality Audit", workplaceSimulation: "Act as AI QA Lead auditing 10 AI-coded charts before transmission to the billing clearinghouse.", deliverable: "AI Coding Quality & Safety Audit Report" },
      ],
      projectTitle: "AI Coding Quality Audit",
      deliverable: "AI Coding Quality & Safety Audit Report",
      workplaceSkill: "AI Validation & Governance",
    },
    {
      week: 17,
      title: "RCM, Denials & Preventative Analytics",
      theme: "Reimbursement & Claim Resolution",
      days: [
        { day: 81, topic: "Claims Clearinghouse & Electronic Data Interchange (EDI 837/835)", practice: "Analyze ERA (835) explanation of benefits and CARC/RARC codes" },
        { day: 82, topic: "Healthcare Reimbursement Models (Fee-for-Service, DRG, VBP)", practice: "Calculate MS-DRG weights and payment impacts of CC/MCC conditions" },
        { day: 83, topic: "Claim Denial Taxonomy & Root-Cause Categorization", practice: "Classify denials: Medical necessity, timely filing, missing modifier, unbundling" },
        { day: 84, topic: "AI-Powered Predictive Denial Analytics", practice: "Use predictive rules to catch high-risk claims before clearinghouse submission" },
        { day: 85, topic: "PROJECT 17: Denial Management & Appeal Case", practice: "Analyze 8 rejected claims, identify CARC codes, draft appeal letters, and fix coding", isProject: true, projectTitle: "Denial Management Case", workplaceSimulation: "Work as an RCM Denial Specialist overturning $42,000 in rejected commercial and Medicare claims.", deliverable: "Denial Analysis & Appeal Resolution Packet" },
      ],
      projectTitle: "Denial Management Case",
      deliverable: "Denial Analysis & Appeal Resolution Packet",
      workplaceSkill: "RCM Denial Management & Appeals",
    },
    {
      week: 18,
      title: "Compliance, HIPAA & Final Industry Capstone",
      theme: "Industry Governance & End-to-End Master Project",
      days: [
        { day: 86, topic: "HIPAA Security, Privacy Rule & PHI Safeguards", practice: "Audit digital chart sharing protocols and identify de-identification violations" },
        { day: 87, topic: "Fraud, Waste & Abuse (FWA) and False Claims Act", practice: "Detect upcoding, unbundling, and phantom billing red flags" },
        { day: 88, topic: "Medical Coding Auditing Methodology", practice: "Calculate financial error rates and coder accuracy percentages" },
        { day: 89, topic: "AI Governance & Final Capstone Staging", practice: "Perform final pre-capstone checklist review across all coding systems" },
        { day: 90, topic: "DAY 90 FINAL INDUSTRY CAPSTONE: End-to-End AI Medical Coding & RCM Master Case", practice: "Execute complete 14-step simulated hospital encounter audit, coding, AI validation, claim generation, and denial risk defense", isProject: true, projectTitle: "End-to-End AI Medical Coding & RCM Capstone", workplaceSimulation: "A major healthcare health system provides a complete 7-day inpatient encounter package. You perform end-to-end extraction, ICD-10/CPT/HCPCS coding, AI validation, claim assembly, denial risk modeling, and executive presentation.", deliverable: "End-to-End Healthcare Encounter Coding & RCM Audit Dossier" },
      ],
      projectTitle: "End-to-End AI Medical Coding Capstone",
      deliverable: "End-to-End Healthcare Encounter Coding & RCM Audit Dossier",
      workplaceSkill: "End-to-End Industry Readiness",
    },
  ],
  day90Capstone: {
    title: "End-to-End AI Medical Coding & RCM Master Project",
    description: "The crown jewel capstone simulation representing a complete real-world healthcare case package from clinical documentation to final reimbursement.",
    flow: [
      "Patient Info",
      "Clinical Documentation",
      "Physician Notes",
      "Diagnoses & Procedures",
      "Insurance Data",
      "Claim Generation (CMS-1500 / UB-04)",
    ],
    steps: [
      { step: 1, title: "Clinical Record Review", description: "Read and understand the complete multi-page inpatient clinical chart." },
      { step: 2, title: "Documentation Extraction", description: "Identify principal diagnoses, secondary comorbidities, procedural details, and laterality." },
      { step: 3, title: "ICD-10-CM Coding", description: "Assign and sequence all primary and secondary diagnosis codes with guidelines." },
      { step: 4, title: "CPT Procedural Coding", description: "Assign surgical, diagnostic, and E/M procedural codes from operative notes." },
      { step: 5, title: "HCPCS Level II Coding", description: "Assign supply, drug (J-code), and DME codes with exact unit calculations." },
      { step: 6, title: "Modifier Justification", description: "Apply and legally justify all surgical and billing modifiers (e.g., 25, 59, 50, RT/LT)." },
      { step: 7, title: "AI-Assisted Coding Generation", description: "Run clinical documentation through ambient AI / CAC engine for recommendations." },
      { step: 8, title: "AI vs Human Dual Validation", description: "Conduct line-by-line comparison between human gold-standard coding and AI output." },
      { step: 9, title: "AI Error & Hallucination Elimination", description: "Detect and correct any hallucinated codes, unsupported levels, or unbundled items." },
      { step: 10, title: "Clean Claim Assembly", description: "Format complete electronic claim dataset (EDI 837P / 837I standard)." },
      { step: 11, title: "Denial Risk Prediction", description: "Predict payer rejection points and verify medical necessity LCD/NCD coverage." },
      { step: 12, title: "RCM Optimization Modeling", description: "Quantify clean claim rate improvement, revenue capture, and denial reductions." },
      { step: 13, title: "Compliance & Audit Certification", description: "Perform final HIPAA, OIG work plan, and Fraud/Abuse compliance checks." },
      { step: 14, title: "Executive Defense & Case Presentation", description: "Present the complete audited case as if reporting to hospital C-suite leadership." },
    ],
  },
  portfolio: [
    { num: 1, project: "Patient-to-Payment Workflow", workplaceSkill: "RCM Lifecycle Understanding", phase: "Phase 1" },
    { num: 2, project: "Medical Terminology Reference Guide", workplaceSkill: "Clinical Vocabulary & Decoding", phase: "Phase 1" },
    { num: 3, project: "Clinical Anatomy Condition Mapping", workplaceSkill: "Anatomical Site Mapping", phase: "Phase 1" },
    { num: 4, project: "Multi-System Clinical Chart Review", workplaceSkill: "EHR Documentation Review", phase: "Phase 1" },
    { num: 5, project: "AI Clinical Note Entity Analyzer", workplaceSkill: "Healthcare NLP & AI", phase: "Phase 1" },
    { num: 6, project: "ICD-10-CM Coding Production Sheet", workplaceSkill: "ICD-10 Diagnostic Lookup", phase: "Phase 2" },
    { num: 7, project: "Diagnosis Validation & Audit Report", workplaceSkill: "Coding Quality Assurance", phase: "Phase 2" },
    { num: 8, project: "Chronic Disease Coding Batch", workplaceSkill: "High-Volume Production Coding", phase: "Phase 2" },
    { num: 9, project: "Multi-Specialty ICD-10 Coding Dossier", workplaceSkill: "Specialty Diagnostic Coding", phase: "Phase 2" },
    { num: 10, project: "Complex Inpatient Trauma Case Report", workplaceSkill: "Advanced Inpatient Sequencing", phase: "Phase 2" },
    { num: 11, project: "CPT Production Coding Sheet", workplaceSkill: "CPT Procedural Coding", phase: "Phase 3" },
    { num: 12, project: "E/M Determination & MDM Scoring Report", workplaceSkill: "E/M Scoring & MDM Matrix", phase: "Phase 3" },
    { num: 13, project: "Surgical Coding & NCCI Audit Report", workplaceSkill: "Surgical Packages & Modifiers", phase: "Phase 3" },
    { num: 14, project: "Complete Superbill Claim Assembly", workplaceSkill: "Full Claim Assembly (ICD+CPT+HCPCS)", phase: "Phase 3" },
    { num: 15, project: "AI vs Human Coding Benchmark Report", workplaceSkill: "AI-Assisted Coding Benchmarking", phase: "Phase 4" },
    { num: 16, project: "AI Coding Quality & Safety Audit", workplaceSkill: "AI Validation & Governance", phase: "Phase 4" },
    { num: 17, project: "RCM Denial Analysis & Appeal Packet", workplaceSkill: "Denial Resolution & Appeals", phase: "Phase 5" },
    { num: 18, project: "End-to-End AI Medical Coding & RCM Capstone", workplaceSkill: "Full Industry Work Readiness", phase: "Phase 5" },
  ],
};

/* ==========================================================================
   2. MERN FULL STACK WEB DEVELOPMENT
   ========================================================================== */
export const MERN_SYLLABUS: TrackSyllabus = {
  trackId: "mern",
  trackName: "MERN Full Stack Web Development",
  targetRole: "Full Stack Software Engineer (MERN / Next.js)",
  careerProgression: [
    "Junior Frontend / UI Developer",
    "Full Stack JavaScript Developer",
    "API & Microservices Engineer",
    "Cloud-Native MERN Specialist",
    "Senior Full Stack Software Engineer",
  ],
  interviewPitch:
    "I can architect scalable full-stack applications with React 19, Next.js, Node.js, and MongoDB, design resilient REST & GraphQL APIs, implement JWT/OAuth security, optimize Redis caching, write automated test suites (Jest/Cypress), and deploy Dockerized microservices on AWS.",
  phases: [
    { phaseNumber: 1, title: "Modern JavaScript, TypeScript & DOM Engineering", weeksRange: "Weeks 1–5", description: "ES6+, Async JS, TypeScript generics, DOM mechanics, and initial frontend architecture." },
    { phaseNumber: 2, title: "React 19, State Architecture & Modern UI", weeksRange: "Weeks 6–10", description: "Hooks, custom hooks, TanStack Query, state management (Zustand/Redux), and component systems." },
    { phaseNumber: 3, title: "Node.js, Express & Scalable REST API Design", weeksRange: "Weeks 11–14", description: "Express middleware, REST patterns, MongoDB modeling with Mongoose, indexing, and authentication." },
    { phaseNumber: 4, title: "Advanced Full Stack, Redis Caching & Microservices", weeksRange: "Weeks 15–16", description: "Real-time WebSockets, Redis caching, rate limiting, and AI Copilot integration." },
    { phaseNumber: 5, title: "Testing, CI/CD, Production Deployment & Master Capstone", weeksRange: "Weeks 17–18", description: "Unit/E2E testing, Docker containerization, AWS deployment, and end-to-end enterprise SaaS capstone." },
  ],
  weeks: [
    {
      week: 1,
      title: "Modern JavaScript & Async Engine",
      theme: "Core JS Engine & Asynchronous Architecture",
      days: [
        { day: 1, topic: "V8 Engine, Event Loop & Execution Context", practice: "Trace call stack, microtask vs macrotask queues" },
        { day: 2, topic: "ES6+ Deep Dive (Destructuring, Modules, Proxies)", practice: "Implement custom reactive state store using JS Proxies" },
        { day: 3, topic: "Promises, Async/Await & Error Propagation", practice: "Build resilient promise retry wrapper with exponential backoff" },
        { day: 4, topic: "Functional Programming & Immutability", practice: "Refactor nested data transformers using pipe, map, reduce" },
        { day: 5, topic: "PROJECT 1: Async Data Pipeline Engine", practice: "Build a multi-source rate-limited API aggregator engine", isProject: true, projectTitle: "Async Data Pipeline Engine", workplaceSimulation: "A financial fintech needs a fault-tolerant async market data consumer with fallback endpoints.", deliverable: "Async Pipeline & Rate Limiter Package" },
      ],
      projectTitle: "Async Data Pipeline Engine",
      deliverable: "Async Pipeline & Rate Limiter Package",
      workplaceSkill: "Async JS Architecture",
    },
    {
      week: 2,
      title: "TypeScript for Enterprise Applications",
      theme: "Type Safety, Generics & Utility Types",
      days: [
        { day: 6, topic: "TypeScript System, Narrowing & Discriminated Unions", practice: "Model complex polymorphic API response types" },
        { day: 7, topic: "Generics, Type Constraints & Keyof", practice: "Write generic repository and CRUD helper interfaces" },
        { day: 8, topic: "Utility Types (Partial, Record, Pick, Omit, ReturnType)", practice: "Construct safe schema transformer types" },
        { day: 9, topic: "Type Guards & Runtime Validation with Zod", practice: "Validate incoming external payloads with Zod schemas" },
        { day: 10, topic: "PROJECT 2: Enterprise Schema & Type SDK", practice: "Build an end-to-end typed SDK with runtime validation", isProject: true, projectTitle: "Enterprise Type & Validation SDK", workplaceSimulation: "An API platform needs a client SDK enforcing strict request/response type validation.", deliverable: "TypeScript SDK & Zod Schema Package" },
      ],
      projectTitle: "Enterprise Schema & Type SDK",
      deliverable: "TypeScript SDK & Zod Schema Package",
      workplaceSkill: "Enterprise TypeScript",
    },
    {
      week: 3,
      title: "Frontend DOM Architecture & Component Design",
      theme: "UI Architecture & Performance",
      days: [
        { day: 11, topic: "DOM Tree, Event Bubbling & Delegation", practice: "Build virtualized data list handler with event delegation" },
        { day: 12, topic: "Browser Rendering Lifecycle, Repaint & Reflow", practice: "Eliminate layout thrashing in dynamic dashboard widgets" },
        { day: 13, topic: "Modern CSS Grid, Flexbox & Container Queries", practice: "Build responsive multi-column SaaS portal layout" },
        { day: 14, topic: "Web Storage, IndexedDB & Cache API", practice: "Implement offline-first client storage sync manager" },
        { day: 15, topic: "PROJECT 3: High-Performance Data Grid Component", practice: "Build a zero-dependency virtual scrolling data table", isProject: true, projectTitle: "Virtual Data Grid Component", workplaceSimulation: "An analytics client requires a data table rendering 50,000 rows without UI stutter.", deliverable: "High-Performance Data Grid Component" },
      ],
      projectTitle: "Virtual Data Grid Component",
      deliverable: "High-Performance Data Grid Component",
      workplaceSkill: "DOM & Performance Engineering",
    },
    {
      week: 4,
      title: "React 19 Foundations & Rendering Mechanics",
      theme: "Virtual DOM, Fiber & React Compiler",
      days: [
        { day: 16, topic: "React 19 Architecture, JSX & Reconciliation", practice: "Deconstruct Virtual DOM diffing algorithm" },
        { day: 17, topic: "useState, useEffect & Lifecycle Pitfalls", practice: "Debug memory leaks and infinite render loops" },
        { day: 18, topic: "useCallback, useMemo & React.memo Optimization", practice: "Profile and optimize expensive charting components" },
        { day: 19, topic: "useRef, forwardRef & Imperative Handle", practice: "Build accessible modal and dropdown controls with focus traps" },
        { day: 20, topic: "PROJECT 4: Interactive Analytics Dashboard", practice: "Build a real-time reactive telemetry dashboard in React", isProject: true, projectTitle: "Interactive Analytics Dashboard", workplaceSimulation: "A cloud provider needs an interactive metrics dashboard with dynamic filters and live counters.", deliverable: "Interactive React Metrics Dashboard" },
      ],
      projectTitle: "Interactive Analytics Dashboard",
      deliverable: "Interactive React Metrics Dashboard",
      workplaceSkill: "React Component Architecture",
    },
    {
      week: 5,
      title: "Advanced React Hooks & Custom Hook Design",
      theme: "Reusability & State Composition",
      days: [
        { day: 21, topic: "Custom Hooks Architecture & Encapsulation", practice: "Build useDebounce, useThrottle, and useLocalStorage hooks" },
        { day: 22, topic: "useReducer for Complex Finite State Machines", practice: "Model checkout & payment state transitions with useReducer" },
        { day: 23, topic: "useContext & Scalable Compound Components", practice: "Construct compound Tabs and Accordion UI components" },
        { day: 24, topic: "React 19 useActionState, useFormStatus & Server Actions", practice: "Build optimistic form submission flow with pending states" },
        { day: 25, topic: "PROJECT 5: Reusable UI Component Library", practice: "Build a production-grade accessible Design System library", isProject: true, projectTitle: "Custom Component & Hooks Library", workplaceSimulation: "A startup needs an in-house accessible design system with documented custom hooks.", deliverable: "Component & Custom Hooks Library" },
      ],
      projectTitle: "Custom Component & Hooks Library",
      deliverable: "Component & Custom Hooks Library",
      workplaceSkill: "Custom Hooks & Design Systems",
    },
    {
      week: 6,
      title: "Server State Management & TanStack Query",
      theme: "Data Fetching, Caching & Invalidation",
      days: [
        { day: 26, topic: "TanStack Query (React Query) Architecture", practice: "Configure QueryClient with retry, staleTime, and cacheTime" },
        { day: 27, topic: "Mutations, Optimistic Updates & Rollbacks", practice: "Implement instant UI feedback with rollback on network failure" },
        { day: 28, topic: "Infinite Queries & Pagination Strategies", practice: "Build infinite scroll feed with bidirectional cursor pagination" },
        { day: 29, topic: "Query Invalidation, Prefetching & Hydration", practice: "Prefetch modal details on mouse hover for zero-latency UX" },
        { day: 30, topic: "PROJECT 6: Real-Time Collaborative Feed", practice: "Build an optimistic task board with server state sync", isProject: true, projectTitle: "Server-State Collaborative Kanban", workplaceSimulation: "A project management tool needs an instant-sync Kanban board with optimistic drag-and-drop.", deliverable: "TanStack Query Kanban Application" },
      ],
      projectTitle: "Server-State Collaborative Kanban",
      deliverable: "TanStack Query Kanban Application",
      workplaceSkill: "Server State & Optimistic UI",
    },
    {
      week: 7,
      title: "Client State Management (Zustand & Redux Toolkit)",
      theme: "Global Store Architecture",
      days: [
        { day: 31, topic: "Global vs Local State Architecture Guidelines", practice: "Structure enterprise state tree separating UI and server cache" },
        { day: 32, topic: "Zustand Store Slices & Middleware (Persist, Immer)", practice: "Build multi-slice global shopping cart store with persistence" },
        { day: 33, topic: "Redux Toolkit (RTK) Slices, Thunks & ExtraReducers", practice: "Implement complex auth and user entitlement state slice" },
        { day: 34, topic: "Selectors, Reselect & Memoized State Access", practice: "Optimize state selectors to prevent unnecessary re-renders" },
        { day: 35, topic: "PROJECT 7: Multi-Step SaaS Onboarding Funnel", practice: "Build a persistent 5-step wizard with complex conditional validation", isProject: true, projectTitle: "Enterprise SaaS Onboarding Wizard", workplaceSimulation: "A B2B platform needs a robust 5-step signup wizard that preserves state across refreshes.", deliverable: "Multi-Step Onboarding Funnel Application" },
      ],
      projectTitle: "Enterprise SaaS Onboarding Wizard",
      deliverable: "Multi-Step Onboarding Funnel Application",
      workplaceSkill: "Global State Management",
    },
    {
      week: 8,
      title: "Next.js App Router & Full Stack React",
      theme: "SSR, SSG, ISR & Server Components",
      days: [
        { day: 36, topic: "Next.js App Router, Layouts & Route Groups", practice: "Structure multi-tenant route hierarchy with nested layouts" },
        { day: 37, topic: "React Server Components (RSC) vs Client Components", practice: "Optimize bundle size by streaming static content via RSC" },
        { day: 38, topic: "Server-Side Rendering (SSR) & Dynamic Data Fetching", practice: "Implement dynamic SEO metadata and server-rendered product pages" },
        { day: 39, topic: "Incremental Static Regeneration (ISR) & Route Handlers", practice: "Configure on-demand tag revalidation for high-traffic pages" },
        { day: 40, topic: "PROJECT 8: Full Stack Next.js E-Commerce Platform", practice: "Build an SEO-optimized SSR e-commerce catalog with search filters", isProject: true, projectTitle: "Full Stack Next.js E-Commerce Platform", workplaceSimulation: "A retail client needs a sub-second loading product catalog with ISR and dynamic filtering.", deliverable: "Next.js E-Commerce Web Application" },
      ],
      projectTitle: "Full Stack Next.js E-Commerce Platform",
      deliverable: "Next.js E-Commerce Web Application",
      workplaceSkill: "Next.js & Server Components",
    },
    {
      week: 9,
      title: "Node.js Core & Backend Architecture",
      theme: "Node Runtime, Streams & File Systems",
      days: [
        { day: 41, topic: "Node.js Architecture, Libuv & Worker Threads", practice: "Spawn worker threads for CPU-heavy image resizing operations" },
        { day: 42, topic: "Event Emitter & Custom Event Pipelines", practice: "Build custom pub-sub event dispatcher for audit logging" },
        { day: 43, topic: "Node Streams, Buffers & File System (fs/promises)", practice: "Process 500MB CSV files via chunked transform streams" },
        { day: 44, topic: "HTTP Module & Building a Lightweight Server", practice: "Implement custom routing and JSON parsing from scratch" },
        { day: 45, topic: "PROJECT 9: High-Throughput Log Ingestion Microservice", practice: "Build a streaming file and log processor in Node.js", isProject: true, projectTitle: "Streaming Log Ingestion Service", workplaceSimulation: "Build an internal log aggregation service that streams and indexes server access logs in real-time.", deliverable: "Node.js Stream Ingestion Microservice" },
      ],
      projectTitle: "Streaming Log Ingestion Service",
      deliverable: "Node.js Stream Ingestion Microservice",
      workplaceSkill: "Node.js Core & Streams",
    },
    {
      week: 10,
      title: "Express.js RESTful API Architecture",
      theme: "Middleware, Controllers & Validation",
      days: [
        { day: 46, topic: "Express App Structure, Router & Clean Architecture", practice: "Implement Controller-Service-Repository design pattern" },
        { day: 47, topic: "Custom Middleware, Logging (Winston) & Error Handling", practice: "Build global error handling middleware with custom ApiError classes" },
        { day: 48, topic: "Request Validation with Zod & Joi", practice: "Validate request params, queries, and bodies automatically" },
        { day: 49, topic: "API Security (Helmet, CORS, Rate Limiting, Sanitization)", practice: "Harden Express API against XSS, NoSQL injection, and brute force" },
        { day: 50, topic: "PROJECT 10: Production-Ready REST API Gateway", practice: "Build a structured modular REST API with Swagger/OpenAPI docs", isProject: true, projectTitle: "Production REST API Gateway", workplaceSimulation: "A SaaS company needs a hardened REST API microservice with OpenAPI specs and validation.", deliverable: "Documented Production REST API" },
      ],
      projectTitle: "Production REST API Gateway",
      deliverable: "Documented Production REST API",
      workplaceSkill: "RESTful API Engineering",
    },
    {
      week: 11,
      title: "MongoDB & Mongoose Data Modeling",
      theme: "NoSQL Schemas, Indexing & Aggregations",
      days: [
        { day: 51, topic: "MongoDB Document Model & Schema Design Patterns", practice: "Model 1-to-N and N-to-N relationships (Embedding vs Referencing)" },
        { day: 52, topic: "Mongoose Schemas, Virtuals, Pre/Post Hooks & Validation", practice: "Implement password hashing hook and auto-calculating virtuals" },
        { day: 53, topic: "MongoDB Indexing Strategies & Query Optimization (explain())", practice: "Create compound indexes and resolve slow query bottlenecks" },
        { day: 54, topic: "MongoDB Aggregation Pipeline ($match, $group, $lookup, $unwind)", practice: "Build multi-stage analytics aggregation query for sales reports" },
        { day: 55, topic: "PROJECT 11: Enterprise Data Modeling & Analytics Engine", practice: "Build a multi-entity MongoDB database with aggregation pipelines", isProject: true, projectTitle: "MongoDB Analytics & Reporting Engine", workplaceSimulation: "An e-commerce company needs monthly revenue, cohort retention, and inventory aggregation queries.", deliverable: "MongoDB Schema & Aggregation Pipeline Suite" },
      ],
      projectTitle: "MongoDB Analytics & Reporting Engine",
      deliverable: "MongoDB Schema & Aggregation Pipeline Suite",
      workplaceSkill: "MongoDB & Aggregations",
    },
    {
      week: 12,
      title: "Authentication, Authorization & Security",
      theme: "JWT, OAuth2, RBAC & Session Security",
      days: [
        { day: 56, topic: "Password Hashing (Argon2 / Bcrypt) & Salt Rounds", practice: "Implement secure registration flow with timing attack resistance" },
        { day: 57, topic: "JWT Tokens (Access vs Refresh Token Rotation)", practice: "Build silent token refresh with secure HttpOnly cookies" },
        { day: 58, topic: "Role-Based Access Control (RBAC) & Permissions Matrix", practice: "Write middleware guarding routes by role (Admin, Manager, User)" },
        { day: 59, topic: "OAuth2 & Social Logins (Google, GitHub)", practice: "Integrate OAuth 2.0 authorization code flow with Passport/Auth.js" },
        { day: 60, topic: "PROJECT 12: Enterprise Authentication Microservice", practice: "Build a secure auth server with 2FA, OTP verification, and RBAC", isProject: true, projectTitle: "Enterprise Auth & RBAC Microservice", workplaceSimulation: "A banking app needs a multi-factor authentication service with refresh token rotation and session revocation.", deliverable: "Secure Authentication & RBAC Service" },
      ],
      projectTitle: "Enterprise Auth & RBAC Microservice",
      deliverable: "Secure Authentication & RBAC Service",
      workplaceSkill: "Full Stack Security & Auth",
    },
    {
      week: 13,
      title: "Real-Time WebSockets & Event-Driven Systems",
      theme: "Socket.IO, Rooms & Real-Time Sync",
      days: [
        { day: 61, topic: "WebSockets vs Long Polling vs Server-Sent Events (SSE)", practice: "Benchmark latency and connection overhead across protocols" },
        { day: 62, topic: "Socket.IO Architecture, Namespaces & Rooms", practice: "Implement multi-room chat server with user presence tracking" },
        { day: 63, topic: "Real-Time State Synchronization & Reconnection Logic", practice: "Handle socket disconnections and replay missed message queues" },
        { day: 64, topic: "Scaling WebSockets with Redis Adapter", practice: "Scale WebSocket cluster across multiple Node.js instances with Redis Pub/Sub" },
        { day: 65, topic: "PROJECT 13: Real-Time Collaborative Workspace", practice: "Build a real-time collaborative document editor with live presence", isProject: true, projectTitle: "Real-Time Collaborative Workspace", workplaceSimulation: "A remote collaboration app needs a real-time document editor with active cursor indicators.", deliverable: "Real-Time WebSockets Application" },
      ],
      projectTitle: "Real-Time Collaborative Workspace",
      deliverable: "Real-Time WebSockets Application",
      workplaceSkill: "Real-Time WebSockets & Scaling",
    },
    {
      week: 14,
      title: "Redis Caching & Background Queues",
      theme: "In-Memory Caching & Asynchronous Jobs",
      days: [
        { day: 66, topic: "Redis Fundamentals (Strings, Hashes, Lists, Sets, TTL)", practice: "Implement cache-aside pattern for expensive database queries" },
        { day: 67, topic: "Distributed Locking with Redlock", practice: "Prevent race conditions in inventory checkout with Redis locks" },
        { day: 68, topic: "Background Job Queues with BullMQ & Redis", practice: "Build asynchronous email and PDF invoice generation workers" },
        { day: 69, topic: "Redis Rate Limiting & Session Management", practice: "Implement sliding-window API rate limiter in Redis" },
        { day: 70, topic: "PROJECT 14: Distributed Background Job Processing System", practice: "Build an asynchronous video/PDF processing pipeline with BullMQ", isProject: true, projectTitle: "Distributed Job Processing Engine", workplaceSimulation: "An edtech platform needs a resilient background worker system to generate completion certificates and send email notifications.", deliverable: "Redis & BullMQ Job Queue System" },
      ],
      projectTitle: "Distributed Job Processing Engine",
      deliverable: "Redis & BullMQ Job Queue System",
      workplaceSkill: "Redis Caching & Queues",
    },
    {
      week: 15,
      title: "AI Integration & LLM APIs in MERN Apps",
      theme: "OpenAI, LangChain & Vector Embeddings in Full Stack",
      days: [
        { day: 71, topic: "Integrating LLM APIs (OpenAI / Anthropic) in Node.js", practice: "Build streaming AI chat completion endpoint with Server-Sent Events" },
        { day: 72, topic: "Prompt Engineering & Structured JSON Output (Zod Schema)", practice: "Extract structured data from user inputs via OpenAI Function Calling" },
        { day: 73, topic: "Vector Search & Retrieval Augmented Generation (RAG) with MongoDB Atlas Vector Search", practice: "Generate text embeddings and perform cosine similarity search" },
        { day: 74, topic: "AI-Assisted Full Stack Code Review & Telemetry", practice: "Integrate LangSmith tracing and token cost monitoring" },
        { day: 75, topic: "PROJECT 15: AI-Powered Customer Support Copilot", practice: "Build a full stack RAG AI support assistant with semantic documentation search", isProject: true, projectTitle: "Full Stack AI Support Copilot", workplaceSimulation: "A SaaS company wants an AI knowledge base assistant embedded in their web app that answers customer queries from documentation.", deliverable: "AI Copilot & Vector Search Application" },
      ],
      projectTitle: "Full Stack AI Support Copilot",
      deliverable: "AI Copilot & Vector Search Application",
      workplaceSkill: "AI & Full Stack LLM Integration",
    },
    {
      week: 16,
      title: "Automated Testing & Quality Engineering",
      theme: "Unit, Integration & End-to-End Testing",
      days: [
        { day: 76, topic: "Unit Testing with Vitest / Jest & Mocking", practice: "Write unit tests for complex business services with mocked DB calls" },
        { day: 77, topic: "React Testing Library (RTL) Component Testing", practice: "Test user interaction, accessibility roles, and async state changes" },
        { day: 78, topic: "API Integration Testing with Supertest & Testcontainers", practice: "Run automated API tests against an ephemeral MongoDB container" },
        { day: 79, topic: "End-to-End (E2E) Testing with Cypress / Playwright", practice: "Automate full user journey (Signup -> Browse -> Checkout -> Payment)" },
        { day: 80, topic: "PROJECT 16: Automated Quality & CI Test Suite", practice: "Implement 85%+ test coverage across frontend, backend, and E2E flows", isProject: true, projectTitle: "Complete Testing & QA Suite", workplaceSimulation: "An enterprise client requires a comprehensive automated test suite with CI pipeline integration before launch.", deliverable: "Full Stack Automated Test Suite" },
      ],
      projectTitle: "Complete Testing & QA Suite",
      deliverable: "Full Stack Automated Test Suite",
      workplaceSkill: "Test-Driven Development (TDD)",
    },
    {
      week: 17,
      title: "Docker Containerization, CI/CD & Cloud Deployment",
      theme: "DevOps & Infrastructure for Full Stack",
      days: [
        { day: 81, topic: "Dockerizing MERN (Multi-Stage Builds for Node & Next.js)", practice: "Optimize Docker images from 1.2GB down to 85MB using Alpine" },
        { day: 82, topic: "Docker Compose for Multi-Container Environments (Web, API, Mongo, Redis)", practice: "Spin up complete development and testing stacks with single command" },
        { day: 83, topic: "GitHub Actions CI/CD Pipeline Configuration", practice: "Automate linting, unit tests, Docker build, and container registry push" },
        { day: 84, topic: "Deploying to AWS (ECS / EC2 / S3 / CloudFront)", practice: "Configure SSL, custom domains, and reverse proxy with NGINX" },
        { day: 85, topic: "PROJECT 17: Production CI/CD & Cloud Deployment Pipeline", practice: "Deploy a containerized full-stack application to AWS with automated GitHub Actions", isProject: true, projectTitle: "Production Cloud CI/CD Deployment", workplaceSimulation: "Deploy an enterprise SaaS platform with automated staging and production zero-downtime releases.", deliverable: "AWS Cloud Deployment & CI/CD Pipeline" },
      ],
      projectTitle: "Production Cloud CI/CD Deployment",
      deliverable: "AWS Cloud Deployment & CI/CD Pipeline",
      workplaceSkill: "Docker, CI/CD & Cloud Deployment",
    },
    {
      week: 18,
      title: "System Architecture, Observability & Final Master Capstone",
      theme: "Enterprise Architecture & Capstone Execution",
      days: [
        { day: 86, topic: "Application Monitoring & Observability (Sentry, Prometheus, Grafana)", practice: "Configure error alerting and latency tracing across backend routes" },
        { day: 87, topic: "Web Performance Tuning & Core Web Vitals (LCP, FID, CLS)", practice: "Score 95+ on Google Lighthouse across mobile and desktop" },
        { day: 88, topic: "System Design for High Scale (Sharding, Load Balancing, CDN)", practice: "Design microservices architecture handling 100k requests/minute" },
        { day: 89, topic: "Code Refactoring, Security Audit & Final Capstone Staging", practice: "Perform static code analysis (SonarQube) and audit dependencies" },
        { day: 90, topic: "DAY 90 FINAL INDUSTRY CAPSTONE: Scalable Enterprise B2B SaaS Platform", practice: "Execute complete end-to-end multi-tenant SaaS application with real-time sync, Redis caching, AI Copilot, automated tests, and AWS deployment", isProject: true, projectTitle: "Enterprise Multi-Tenant SaaS Capstone", workplaceSimulation: "A venture-backed startup needs a production-ready B2B project management and workspace SaaS with team billing, real-time collaboration, AI assistant, and microservices architecture.", deliverable: "Enterprise Multi-Tenant SaaS Platform Repository & Live URL" },
      ],
      projectTitle: "Enterprise Multi-Tenant SaaS Capstone",
      deliverable: "Enterprise Multi-Tenant SaaS Platform Repository & Live URL",
      workplaceSkill: "Enterprise Full Stack Mastery",
    },
  ],
  day90Capstone: {
    title: "Scalable Enterprise Multi-Tenant SaaS Platform",
    description: "An end-to-end production B2B SaaS application featuring Next.js frontend, microservices REST backend, MongoDB sharding, Redis caching, WebSockets real-time sync, AI Copilot, and automated CI/CD.",
    flow: [
      "Client UI (Next.js / React 19)",
      "API Gateway & Auth (JWT/OAuth)",
      "Business Microservices",
      "MongoDB & Redis Cache",
      "Real-time WebSockets Cluster",
      "AWS Cloud Infrastructure",
    ],
    steps: [
      { step: 1, title: "System Architecture & Domain Modeling", description: "Design multi-tenant database schemas, clean architecture boundaries, and API contracts." },
      { step: 2, title: "Next.js 15 UI & Responsive Design System", description: "Build modern accessible dashboard with Server Components and optimistic mutations." },
      { step: 3, title: "Secure Authentication & Entitlements Engine", description: "Implement JWT refresh rotation, OAuth2 logins, and granular team RBAC permissions." },
      { step: 4, title: "High-Performance REST & GraphQL API", description: "Develop Express/Nest services with input validation, Winston logging, and OpenAPI docs." },
      { step: 5, title: "MongoDB Optimization & Aggregations", description: "Configure indexing, replica sets, and analytics aggregations for tenant data." },
      { step: 6, title: "Redis Caching & Lock Layer", description: "Integrate cache-aside, distributed locking, and rate limiting middleware." },
      { step: 7, title: "Real-Time WebSocket Sync", description: "Build real-time presence, chat, and collaborative document editing channels." },
      { step: 8, title: "AI-Powered Smart Assistant & Vector Search", description: "Integrate RAG assistant for semantic workspace search and AI summarization." },
      { step: 9, title: "Background Job Processing", description: "Configure BullMQ queues for automated email digests, invoice PDF generation, and webhooks." },
      { step: 10, title: "Automated Testing Suite", description: "Achieve 85%+ code coverage with Vitest unit tests, Supertest API tests, and Playwright E2E tests." },
      { step: 11, title: "Dockerization & Multi-Stage Builds", description: "Package frontend and microservices into lean production Docker images." },
      { step: 12, title: "CI/CD Pipeline with GitHub Actions", description: "Automate test execution, linting, security vulnerability scans, and container deployments." },
      { step: 13, title: "Cloud Provisioning & Production Hardening", description: "Deploy on AWS with NGINX reverse proxy, SSL certificates, and Sentry error tracking." },
      { step: 14, title: "Technical Defense & Architecture Presentation", description: "Present the platform architecture, trade-off decisions, and benchmark metrics to technical hiring managers." },
    ],
  },
  portfolio: [
    { num: 1, project: "Async Data Pipeline Engine", workplaceSkill: "Async JS & Rate Limiting", phase: "Phase 1" },
    { num: 2, project: "Enterprise Type & Validation SDK", workplaceSkill: "TypeScript Generics & Zod", phase: "Phase 1" },
    { num: 3, project: "Virtual Data Grid Component", workplaceSkill: "DOM Performance & Virtualization", phase: "Phase 1" },
    { num: 4, project: "Interactive React Metrics Dashboard", workplaceSkill: "React 19 Rendering Mechanics", phase: "Phase 1" },
    { num: 5, project: "Custom Component & Hooks Library", workplaceSkill: "Custom Hooks & Design Systems", phase: "Phase 1" },
    { num: 6, project: "Server-State Collaborative Kanban", workplaceSkill: "TanStack Query & Optimistic UI", phase: "Phase 2" },
    { num: 7, project: "Enterprise SaaS Onboarding Wizard", workplaceSkill: "Zustand & Global State", phase: "Phase 2" },
    { num: 8, project: "Full Stack Next.js E-Commerce Platform", workplaceSkill: "Next.js SSR & Server Components", phase: "Phase 2" },
    { num: 9, project: "Streaming Log Ingestion Service", workplaceSkill: "Node.js Streams & File Systems", phase: "Phase 2" },
    { num: 10, project: "Production REST API Gateway", workplaceSkill: "Express Clean Architecture & Security", phase: "Phase 2" },
    { num: 11, project: "MongoDB Analytics & Reporting Engine", workplaceSkill: "MongoDB Aggregations & Indexing", phase: "Phase 3" },
    { num: 12, project: "Enterprise Auth & RBAC Microservice", workplaceSkill: "JWT Security & OAuth2", phase: "Phase 3" },
    { num: 13, project: "Real-Time Collaborative Workspace", workplaceSkill: "Socket.IO & Distributed WebSockets", phase: "Phase 3" },
    { num: 14, project: "Distributed Job Processing Engine", workplaceSkill: "Redis Caching & BullMQ Queues", phase: "Phase 3" },
    { num: 15, project: "Full Stack AI Support Copilot", workplaceSkill: "LLM APIs & Vector Search RAG", phase: "Phase 4" },
    { num: 16, project: "Complete Testing & QA Suite", workplaceSkill: "Vitest, RTL & Playwright E2E", phase: "Phase 4" },
    { num: 17, project: "Production Cloud CI/CD Deployment", workplaceSkill: "Docker & AWS GitHub Actions", phase: "Phase 5" },
    { num: 18, project: "Enterprise Multi-Tenant SaaS Capstone", workplaceSkill: "End-to-End Enterprise Full Stack Mastery", phase: "Phase 5" },
  ],
};

/* ==========================================================================
   3. TRACK SYLLABUS FACTORY (All 15 Specialized Tracks)
   ========================================================================== */
export function getTrackSyllabus(trackId: TrackId): TrackSyllabus {
  if (trackId === "medical") return MEDICAL_CODING_SYLLABUS;
  if (trackId === "mern") return MERN_SYLLABUS;
  return generateTrackSyllabus(trackId);
}

export function generateTrackSyllabus(trackId: TrackId): TrackSyllabus {
  // curriculum is optional — tracks without it fall back to the genericCurriculum below
  type CurriculumWeek = { w: number; title: string; theme: string; p: string; s: string; d: string[] };
  const CONFIGS: Record<TrackId, {
    name: string;
    role: string;
    progression: string[];
    pitch: string;
    phases: [string, string, string, string, string];
    skills: string[];
    curriculum?: CurriculumWeek[];
  }> = {
    mern: { name: "", role: "", progression: [], pitch: "", phases: ["", "", "", "", ""], skills: [] },
    medical: { name: "", role: "", progression: [], pitch: "", phases: ["", "", "", "", ""], skills: [] },
    datascience: {
      name: "Data Science & Advanced Analytics",
      role: "Data Scientist & Analytics Engineer",
      progression: ["Junior Data Analyst", "Data Scientist", "Statistical Modeling Specialist", "Predictive Analytics Engineer", "Senior Data Scientist"],
      pitch: "I can extract actionable business insights from complex data, perform hypothesis testing, build predictive statistical models, design automated ETL pipelines, and create executive dashboards using Python, SQL, and Tableau.",
      phases: ["Python & Advanced SQL for Analytics", "Exploratory Data Analysis & Statistics", "Supervised & Unsupervised Modeling", "Time Series, NLP & Big Data", "Model Deployment & Business Capstone"],
      skills: ["Python", "SQL", "Pandas", "Statistical Modeling", "Hypothesis Testing", "Regression/Classification", "Clustering", "Time Series", "Tableau", "Power BI", "Data Storytelling"],
      curriculum: [
        { w: 1, title: "Advanced Python & Vectorized Operations", theme: "NumPy & Data Manipulation", p: "Vectorized Financial Return Calculator", s: "Data Wrangling", d: ["NumPy Array Broadcasting & Slicing", "Memory Optimization & Matrix Math", "Custom Vectorized Vector Math", "Handling Missing & Corrupted Data", "PROJECT 1: Vectorized Return Engine"] },
        { w: 2, title: "Data Cleaning & Manipulation with Pandas", theme: "Pandas DataFrames & Indexing", p: "Multi-Source Healthcare Data Cleaner", s: "Pandas Mastery", d: ["Multi-Index Indexing & Reshaping", "DateTime & Time Zone Calculations", "Groupby & Aggregations", "Merging, Joining & Concat", "PROJECT 2: Automated Data Cleanser"] },
        { w: 3, title: "Advanced SQL for Data Engineering & Analytics", theme: "Window Functions & CTEs", p: "Enterprise Retention SQL Engine", s: "Advanced SQL", d: ["Window Functions (Rank, DenseRank, Lead/Lag)", "Common Table Expressions (CTEs) & Subqueries", "Complex Aggregations & Pivot Queries", "Query Performance & Index Tuning", "PROJECT 3: Cohort & Churn SQL Pipeline"] },
        { w: 4, title: "Exploratory Data Analysis (EDA) & Visualization", theme: "Seaborn, Matplotlib & Plotly", p: "Interactive Market EDA Dashboard", s: "Data Visualization", d: ["Distribution Analysis & Outlier Detection", "Correlation Matrices & Heatmaps", "Interactive Plots with Plotly", "Geospatial & Trend Mapping", "PROJECT 4: Market Telemetry EDA Package"] },
        { w: 5, title: "Probability & Inferential Statistics", theme: "Hypothesis Testing & Confidence Intervals", p: "E-Commerce A/B Testing Engine", s: "Statistical Inference", d: ["Probability Distributions (Normal, Binomial, Poisson)", "Central Limit Theorem & Sampling", "Z-Tests, T-Tests & ANOVA", "Chi-Square & Non-Parametric Tests", "PROJECT 5: Enterprise A/B Test Evaluator"] },
        { w: 6, title: "Feature Engineering & Data Preprocessing", theme: "Encoding, Scaling & Selection", p: "Automated Feature Engineering Pipeline", s: "Feature Engineering", d: ["Categorical Encoding (Target, One-Hot)", "Numerical Scaling & Power Transforms", "Handling Imbalanced Data (SMOTE)", "Feature Importance & Dimensionality Reduction", "PROJECT 6: Production Feature Pipeline"] },
        { w: 7, title: "Supervised Learning: Regression Models", theme: "Linear, Ridge, Lasso & Polynomial", p: "Real Estate Valuation Predictor", s: "Regression Modeling", d: ["Ordinary Least Squares & Cost Functions", "Regularization (L1 Lasso, L2 Ridge, ElasticNet)", "Polynomial Features & Multi-Collinearity (VIF)", "Evaluation Metrics (RMSE, MAE, R-Squared)", "PROJECT 7: Pricing Forecast Model"] },
        { w: 8, title: "Supervised Learning: Classification Models", theme: "Logistic Regression, SVM & KNN", p: "Customer Loan Default Classifier", s: "Classification Modeling", d: ["Logistic Regression & Decision Boundaries", "Support Vector Machines (Linear & RBF)", "K-Nearest Neighbors & Distance Metrics", "ROC-AUC, Precision, Recall & F1-Score", "PROJECT 8: Credit Risk Classification System"] },
        { w: 9, title: "Tree-Based Models & Ensemble Learning", theme: "Random Forest & Gradient Boosting", p: "Customer Churn Prediction Engine", s: "Ensemble Modeling", d: ["Decision Trees & Gini/Entropy Splitting", "Random Forests & Bagging Ensembles", "Gradient Boosting (XGBoost, LightGBM, CatBoost)", "Hyperparameter Tuning with Optuna", "PROJECT 9: Enterprise Churn Predictor"] },
        { w: 10, title: "Unsupervised Learning & Clustering", theme: "K-Means, Hierarchical & PCA", p: "Customer Segmentation Engine", s: "Clustering & Segmentation", d: ["K-Means & Elbow Method", "Hierarchical Clustering & Dendrograms", "DBSCAN Density-Based Clustering", "Principal Component Analysis (PCA)", "PROJECT 10: Multi-Dimensional Persona Segmenter"] },
        { w: 11, title: "Time Series Analysis & Forecasting", theme: "ARIMA, Prophet & Decomposition", p: "Retail Demand Forecasting System", s: "Time Series Forecasting", d: ["Trend, Seasonality & Stationarity Tests (ADF)", "ARIMA & SARIMA Modeling", "Facebook Prophet for Business Trends", "LSTM Deep Learning for Time Series", "PROJECT 11: Inventory Demand Forecaster"] },
        { w: 12, title: "Natural Language Processing (NLP) for Data Science", theme: "Text Mining & Sentiment Analysis", p: "Product Review Sentiment Analyzer", s: "Text Analytics", d: ["Text Preprocessing & Tokenization", "TF-IDF & Word Embeddings (Word2Vec)", "Sentiment Analysis with VADER & TextBlob", "Topic Modeling with LDA", "PROJECT 12: Voice-of-Customer NLP Engine"] },
        { w: 13, title: "Big Data Processing with PySpark", theme: "Spark DataFrames & RDDs", p: "Petabyte Log ETL Pipeline", s: "Big Data Processing", d: ["PySpark Architecture & Distributed Computing", "Spark DataFrame Operations & Transformations", "Spark SQL for Big Data Analytics", "Spark MLlib for Distributed Machine Learning", "PROJECT 13: Distributed Log Analysis Engine"] },
        { w: 14, title: "Business Intelligence: Power BI & Tableau", theme: "Executive KPI Dashboards & DAX", p: "Executive C-Suite KPI Dashboard", s: "BI & Dashboards", d: ["Tableau Calculations & LOD Expressions", "Power BI Data Modeling & Star Schema", "Advanced DAX Measures & Time Intelligence", "Executive Storytelling & Data Storyboards", "PROJECT 14: Omnichannel Sales Performance Suite"] },
        { w: 15, title: "AI-Assisted Data Science & AutoML", theme: "Automated Modeling & LLM Analytics", p: "AutoML Benchmark & Code Assistant", s: "AutoML & GenAI", d: ["AutoML Frameworks (PyCaret, AutoKeras)", "LLMs for Automated SQL & Data Insights", "Prompt Engineering for Analytics Pipelines", "AI Model Explainability (SHAP & LIME)", "PROJECT 15: AI-Powered Analytics Copilot"] },
        { w: 16, title: "Model Validation, Drift & Governance", theme: "Data Drift & Fair AI Auditing", p: "Production Model Monitoring Suite", s: "Model Governance", d: ["Concept Drift & Data Drift Detection (Evidently)", "Model Fairness, Bias & Ethical AI", "Automated Validation & Unit Testing for Data", "Model Card Documentation & Compliance", "PROJECT 16: Automated Data & Model Drift Guard"] },
        { w: 17, title: "Model Deployment & Production APIs", theme: "FastAPI, Docker & Streamlit", p: "Production Inference API & Web App", s: "Model Deployment", d: ["FastAPI REST Microservice for Model Serving", "Dockerizing Data Science Applications", "Interactive Dashboards with Streamlit", "Cloud Deployment on AWS ECS / Render", "PROJECT 17: Production Prediction Web Platform"] },
        { w: 18, title: "Master Data Science Capstone & Defense", theme: "End-to-End Enterprise Solution", p: "Enterprise End-to-End Predictive Platform", s: "Full Data Science Readiness", d: ["Full Pipeline Architecture & Data Contract", "Exploratory & Statistical Modeling", "Production Deployment & Caching", "Model Drift & Security Compliance", "DAY 90 MASTER CAPSTONE: Enterprise Predictive Intelligence Platform"] },
      ],
    },
    cloud: {
      name: "Cloud & DevOps (AWS)",
      role: "Cloud & DevOps Solutions Engineer",
      progression: ["Associate Cloud Admin", "DevOps Engineer", "Infrastructure Automation Engineer", "Cloud Security & SRE", "Senior Cloud Solutions Architect"],
      pitch: "I can architect highly available, secure AWS cloud environments using Infrastructure as Code (Terraform), containerize microservices with Docker and Kubernetes (EKS), build automated CI/CD pipelines in GitHub Actions, and implement multi-region disaster recovery.",
      phases: ["Linux, Networking & AWS Core", "Terraform & Infrastructure as Code", "Docker & Kubernetes (EKS)", "CI/CD, Monitoring & Observability", "Security, Multi-Cloud & Enterprise Capstone"],
      skills: ["AWS Core", "Linux", "Networking", "Terraform", "Docker", "Kubernetes", "GitHub Actions", "Prometheus", "IAM Hardening", "VPC Peering", "Cost Optimization"],
      curriculum: [
        { w: 1, title: "Linux Administration & Bash Automation", theme: "OS Core & Shell Scripting", p: "Automated Linux Server Provisioner", s: "Linux Automation", d: ["Linux File Hierarchy & Permissions", "Process Management, Systemd & Cron", "Bash Scripting & Error Traps", "SSH Keys & Hardened Bastion Access", "PROJECT 1: Linux System Automation Suite"] },
        { w: 2, title: "Networking & VPC Architecture on AWS", theme: "CIDR, Subnets & Routing", p: "Multi-Tier High Availability VPC", s: "Cloud Networking", d: ["IPv4 CIDR Blocks, Public & Private Subnets", "Internet Gateways & NAT Gateways", "Route Tables, Security Groups & NACLs", "VPC Peering & Transit Gateway", "PROJECT 2: Production VPC Network Infrastructure"] },
        { w: 3, title: "AWS Compute: EC2, Auto-Scaling & Load Balancing", theme: "Elastic Compute & Traffic Routing", p: "Auto-Scaling Fault-Tolerant Web Cluster", s: "AWS Compute", d: ["EC2 Instances, AMI Creation & EBS Volumes", "Application Load Balancer (ALB) Routing", "Auto Scaling Groups & Target Tracking", "Launch Templates & User Data Bootstrapping", "PROJECT 3: Highly Available Scalable Web Tier"] },
        { w: 4, title: "AWS Storage & Databases (S3, RDS, DynamoDB)", theme: "Object Storage & Managed Databases", p: "Secure Multi-Tier Data Storage Architecture", s: "Cloud Databases", d: ["S3 Buckets, Policies, Versioning & Lifecycle", "RDS PostgreSQL Multi-AZ & Read Replicas", "DynamoDB NoSQL Partitioning & TTL", "ElastiCache Redis for Fast Query Invalidation", "PROJECT 4: Production Cloud Data Store"] },
        { w: 5, title: "IAM, Security & Cloud Compliance", theme: "Least Privilege & Secrets Management", p: "Enterprise IAM & Secret Vault", s: "Cloud Security", d: ["IAM Users, Groups, Roles & AssumeRole Policies", "AWS KMS Key Management & Encryption", "AWS Secrets Manager & Parameter Store", "AWS Shield, WAF & GuardDuty", "PROJECT 5: Enterprise IAM Governance & Secrets Matrix"] },
        { w: 6, title: "Infrastructure as Code: Terraform I", theme: "HCL, Providers & State Management", p: "Automated AWS VPC & EC2 Terraform Module", s: "Terraform IaC", d: ["Terraform Architecture, HCL Syntax & Init/Plan/Apply", "Variables, Outputs & Local Values", "Remote State in S3 & DynamoDB Locking", "Terraform Modules & Reusability", "PROJECT 6: Modularized Multi-Environment IaC"] },
        { w: 7, title: "Infrastructure as Code: Terraform II", theme: "Advanced Modules & State Refactoring", p: "Full Production Infrastructure Terraform Pipeline", s: "Advanced IaC", d: ["Dynamic Blocks & For-Each Iterations", "Terraform Workspaces & Multi-Account Setup", "Importing Existing Cloud Resources", "Terraform Cloud & Automated Policy Checks", "PROJECT 7: Complete Multi-Tier Infrastructure Pipeline"] },
        { w: 8, title: "Docker Containerization Mastery", theme: "Images, Multi-Stage Builds & Networks", p: "Production Microservice Docker Suite", s: "Docker Containerization", d: ["Docker Engine Architecture & Dockerfiles", "Multi-Stage Builds for Minimal Footprints", "Docker Compose Multi-Container Stacks", "Docker Volumes & Custom Bridge Networks", "PROJECT 8: Production Optimized Containerized Application"] },
        { w: 9, title: "Kubernetes Foundations & Pod Lifecycle", theme: "K8s Architecture & Declarative YAML", p: "High-Availability K8s Application Deployment", s: "Kubernetes Core", d: ["Control Plane & Worker Node Components", "Pods, Deployments & ReplicaSets", "Services (ClusterIP, NodePort, LoadBalancer)", "ConfigMaps, Secrets & Environment Injection", "PROJECT 9: Resilient Kubernetes Application Stack"] },
        { w: 10, title: "AWS EKS & Advanced Kubernetes", theme: "Managed K8s, Ingress & Helm", p: "AWS EKS Cluster with Helm & Ingress-NGINX", s: "AWS EKS & Helm", d: ["Provisioning EKS with Terraform & eksctl", "Ingress Controllers & SSL Termination (Cert-Manager)", "Helm Package Manager & Custom Charts", "Horizontal Pod Autoscaler (HPA) & Metrics Server", "PROJECT 10: Production EKS Cluster Deployment"] },
        { w: 11, title: "CI/CD Automation with GitHub Actions", theme: "Workflows, Triggers & Runners", p: "Automated Build, Test & Deploy CI/CD Pipeline", s: "CI/CD Pipelines", d: ["GitHub Actions Workflow Syntax & Matrix Builds", "Automated Linting, Unit Testing & Security Scans", "Building & Pushing Images to AWS ECR", "Deploying to EKS via GitOps / Actions", "PROJECT 11: Zero-Downtime CI/CD Pipeline"] },
        { w: 12, title: "Serverless Architecture (Lambda & API Gateway)", theme: "Event-Driven Computing & SAM", p: "Event-Driven Serverless Microservice", s: "AWS Serverless", d: ["AWS Lambda Functions & Concurrency Limits", "API Gateway REST & HTTP APIs", "EventBridge & SQS/SNS Queue Processing", "Serverless Framework & AWS SAM", "PROJECT 12: Event-Driven Serverless Ingestion Engine"] },
        { w: 13, title: "Monitoring & Observability (Prometheus & Grafana)", theme: "Metrics, Dashboards & Alerts", p: "Full-Stack Cloud Telemetry Dashboard", s: "Observability", d: ["Prometheus Server, Exporters & PromQL", "Grafana Dashboards & Dynamic Alerting", "AWS CloudWatch Alarms & Metric Filters", "Log Aggregation with Grafana Loki / CloudWatch", "PROJECT 13: Real-Time Infrastructure Monitoring Suite"] },
        { w: 14, title: "Site Reliability & Disaster Recovery", theme: "RTO/RPO & Multi-Region Backup", p: "Automated Multi-Region Failover Architecture", s: "Disaster Recovery", d: ["Defining SLA, SLO & Error Budgets", "Route 53 DNS Failover & Health Checks", "Cross-Region S3 Replication & RDS Snapshots", "Chaos Testing & Node Failure Drills", "PROJECT 14: Disaster Recovery & Automated Failover Runbook"] },
        { w: 15, title: "AI & GenAI Cloud Infrastructure", theme: "GPU Provisioning & Model Serving", p: "AWS SageMaker Inference Endpoint with Auto-Scaling", s: "Cloud AI Infrastructure", d: ["AWS SageMaker Architecture & Endpoints", "GPU EC2 Instances (G5/P4) Configuration", "Deploying LLMs with vLLM & Triton Server", "Cloud Cost Optimization for AI Workloads", "PROJECT 15: Scalable AI Model Serving Pipeline"] },
        { w: 16, title: "Cloud Security, Compliance & DevSecOps", theme: "SAST/DAST & Container Scanning", p: "Automated DevSecOps Security Scanner Pipeline", s: "DevSecOps", d: ["Trivy & Snyk Container Vulnerability Scanning", "SonarQube Static Code Analysis in CI/CD", "AWS Security Hub, GuardDuty & Config Rules", "CIS Benchmark Hardening for K8s & Linux", "PROJECT 16: DevSecOps Automated Guardrail Suite"] },
        { w: 17, title: "Cloud Cost Optimization & FinOps", theme: "Savings Plans, Spot Instances & Budgets", p: "AWS FinOps Cost Governance Framework", s: "FinOps", d: ["AWS Cost Explorer & Resource Tagging Strategies", "Spot Instances & Savings Plans vs On-Demand", "S3 Storage Tiering & CloudWatch Cost Reductions", "Automated Idle Resource Cleanup Scripts", "PROJECT 17: Enterprise Cloud Cost Optimization Audit"] },
        { w: 18, title: "Master Cloud & DevOps Capstone & Defense", theme: "End-to-End Enterprise Architecture", p: "Enterprise Multi-Tenant Cloud Platform", s: "Full Cloud Solutions Readiness", d: ["Terraform Multi-Tier Cloud Deployment", "EKS Microservices & Helm Deployment", "Automated CI/CD & DevSecOps Gateways", "Disaster Recovery & Executive Presentation", "DAY 90 MASTER CAPSTONE: Enterprise Cloud Architecture & GitOps Infrastructure Platform"] },
      ],
    },
    java: {
      name: "Java Enterprise Full Stack",
      role: "Java Backend / Full Stack Engineer",
      progression: ["Junior Java Developer", "Java Spring Boot Developer", "Microservices Engineer", "Cloud-Native Java Architect", "Senior Java Engineer"],
      pitch: "I can design enterprise-grade distributed backends using Java 21, Spring Boot 3, Spring Security, Hibernate/JPA, Kafka event streams, Docker, and PostgreSQL with full JUnit 5 test coverage.",
      phases: ["Core Java 21, OOP & Concurrency", "Spring Boot 3, Hibernate & REST", "Microservices, Kafka & Docker", "Spring Security, JWT & Cloud AWS", "Testing, CI/CD & Enterprise Capstone"],
      skills: ["Java OOP", "Concurrency", "Spring Boot", "JPA/Hibernate", "REST APIs", "Microservices", "Kafka", "PostgreSQL", "Docker", "AWS", "JUnit 5", "CI/CD"],
      curriculum: [
        { w: 1, title: "Java 21 Syntax, Memory Model & Streams", theme: "JVM Architecture & Functional Streams", p: "High-Throughput Record Processing Engine", s: "Java 21 Fundamentals", d: ["JVM Architecture (Heap, Stack, Metaspace)", "Java Records, Pattern Matching & Sealed Classes", "Functional Interfaces & Lambdas", "Streams API (map, filter, reduce, collect)", "PROJECT 1: High-Performance Data Processing Utility"] },
        { w: 2, title: "OOP, SOLID Principles & Design Patterns", theme: "Enterprise Clean Architecture", p: "Extensible Banking Transaction Engine", s: "OOP & Design Patterns", d: ["SOLID Principles in Production Java", "Creational Patterns (Factory, Builder, Singleton)", "Structural Patterns (Adapter, Decorator, Proxy)", "Behavioral Patterns (Strategy, Observer, Command)", "PROJECT 2: Enterprise Transaction Engine"] },
        { w: 3, title: "Multi-Threading, Virtual Threads & Concurrency", theme: "Executors & Virtual Threads", p: "Distributed Concurrent Task Dispatcher", s: "Java Concurrency", d: ["Thread Lifecycle, Synchronization & Locks", "Executors, ThreadPoolExecutor & Futures", "Java 21 Virtual Threads & Structured Concurrency", "Atomic Variables & Concurrent Collections", "PROJECT 3: High-Concurrency Job Scheduler"] },
        { w: 4, title: "Collections, Generics & Custom Data Structures", theme: "Memory Efficiency & Data Structures", p: "In-Memory LRU Caching Engine", s: "Collections & Algorithms", d: ["List, Set, Map Internals (HashMap Rehashing)", "Generics, Wildcards & Type Erasure", "Comparable vs Comparator", "Custom LRU Cache Implementation", "PROJECT 4: In-Memory Cache with TTL & Eviction"] },
        { w: 5, title: "Database Connectivity: JDBC & HikariCP", theme: "Connection Pooling & Transactions", p: "High-Throughput JDBC Data Access Layer", s: "Database Access", d: ["JDBC Architecture, PreparedStatement & Batching", "Connection Pooling with HikariCP", "ACID Transactions & Isolation Levels", "DAO Design Pattern & SQL Tuning", "PROJECT 5: Production-Grade JDBC Repository Layer"] },
        { w: 6, title: "Spring Boot 3 Core & Dependency Injection", theme: "IoC Container & Auto-Configuration", p: "Modular Spring Boot Microservice Scaffold", s: "Spring Boot Core", d: ["Inversion of Control (IoC) & Bean Lifecycle", "Stereotype Annotations (@Service, @Repository)", "Spring Boot Starters & Auto-Configuration", "Application Properties & Profile Environments", "PROJECT 6: Multi-Profile Spring Boot Service"] },
        { w: 7, title: "Spring Data JPA & Hibernate ORM", theme: "Entities, Relationships & Queries", p: "Enterprise E-Commerce Data Layer", s: "JPA & Hibernate", d: ["Entity Mapping (@OneToMany, @ManyToMany)", "JPQL, Native Queries & Spring Data Specifications", "Hibernate 1st & 2nd Level Caching", "Lazy Loading & N+1 Query Optimization", "PROJECT 7: High-Performance JPA Repository Layer"] },
        { w: 8, title: "Building Scalable RESTful Web APIs", theme: "Controllers, DTOs & Validation", p: "Production E-Commerce REST API", s: "REST API Design", d: ["@RestController, Request Mappings & Status Codes", "DTO Pattern, MapStruct & Jakarta Validation", "Global Exception Handling with @ControllerAdvice", "OpenAPI 3 / Swagger Documentation", "PROJECT 8: Production RESTful API Gateway"] },
        { w: 9, title: "Spring Security 6 & JWT Authentication", theme: "Security Filters, Auth & RBAC", p: "Enterprise Authentication & RBAC Microservice", s: "Spring Security & JWT", d: ["SecurityFilterChain & Custom Filter Chains", "UserDetailsService & Password Encoders (BCrypt)", "Stateless JWT Token Generation & Validation", "Role-Based Access Control (@PreAuthorize)", "PROJECT 9: Stateless Auth & Authorization Service"] },
        { w: 10, title: "Microservices with Spring Cloud", theme: "Service Discovery, Gateway & Config", p: "Distributed Microservices Architecture", s: "Microservices", d: ["Service Discovery with Netflix Eureka", "Spring Cloud Gateway & Routing Filters", "Centralized Configuration with Spring Cloud Config", "Distributed Tracing with Micrometer & Zipkin", "PROJECT 10: Spring Cloud Distributed Cluster"] },
        { w: 11, title: "Event-Driven Architecture with Apache Kafka", theme: "Producers, Consumers & Partitions", p: "Real-Time Order Processing Event Stream", s: "Apache Kafka", d: ["Kafka Architecture, Topics, Partitions & Offsets", "Spring Kafka Producers & Serializers", "Consumer Groups, Error Handlers & Dead Letter Queues", "Idempotent Processing & Event Sourcing", "PROJECT 11: Real-Time Event-Driven Order Pipeline"] },
        { w: 12, title: "Resilience & Fault Tolerance (Resilience4j)", theme: "Circuit Breakers, Rate Limiting & Retries", p: "Fault-Tolerant Payment Gateway Client", s: "Resilience & Reliability", d: ["Circuit Breaker Pattern & State Transitions", "Retry Strategies & Exponential Backoff", "Rate Limiter & Bulkhead Isolation", "Fallback Methods & Monitoring Metrics", "PROJECT 12: Resilient Payment Gateway Wrapper"] },
        { w: 13, title: "Docker Containerization & Kubernetes for Java", theme: "Jib, Multi-Stage Builds & Helm", p: "Cloud-Native Java K8s Microservice Stack", s: "Docker & Kubernetes", d: ["Dockerizing Spring Boot with Multi-Stage Builds", "Optimizing JVM Heap in Containers", "Kubernetes Deployments, Services & Ingress", "Health Checks (Liveness/Readiness Probes with Actuator)", "PROJECT 13: Containerized Microservices on Kubernetes"] },
        { w: 14, title: "Database Migrations & PostgreSQL Tuning", theme: "Flyway, Liquibase & Indexing", p: "Automated Database Versioning & Performance Suite", s: "Database Migrations", d: ["Database Migrations with Flyway & Liquibase", "PostgreSQL Execution Plans (EXPLAIN ANALYZE)", "Composite Indexing & Partitioning Strategies", "Connection Pool Tuning & Lock Contention", "PROJECT 14: Zero-Downtime Migration & Tuning Suite"] },
        { w: 15, title: "AI-Assisted Java Development & Spring AI", theme: "Spring AI, Embeddings & GenAI APIs", p: "AI Customer Support Assistant Microservice", s: "Spring AI & GenAI", d: ["Spring AI Starter & OpenAI / Anthropic Clients", "Prompt Templates & Structured Output Parsers", "Vector Stores (PgVector) & Semantic Search", "Building RAG Workflows in Spring Boot", "PROJECT 15: AI-Powered Knowledge Base Microservice"] },
        { w: 16, title: "Automated Testing: Unit, Mocking & Integration", theme: "JUnit 5, Mockito & Testcontainers", p: "Enterprise Automated Test Suite (90%+ Coverage)", s: "Automated Testing", d: ["Unit Testing with JUnit 5 Assertions & Parameterized Tests", "Mocking Dependencies with Mockito (@Mock, @InjectMocks)", "Testing Spring Boot Web Layer with @WebMvcTest", "Integration Testing with Real Databases via Testcontainers", "PROJECT 16: Comprehensive Test Suite & CI Verification"] },
        { w: 17, title: "CI/CD & Cloud Deployment (AWS ECS / RDS)", theme: "GitHub Actions, Terraform & ECS Fargate", p: "Automated Production AWS Deployment Pipeline", s: "Cloud Deployment", d: ["GitHub Actions Workflow for Maven Build & Tests", "Building & Pushing Images to AWS ECR", "Deploying Java Services to AWS ECS Fargate", "Configuring AWS RDS PostgreSQL & CloudWatch Alarms", "PROJECT 17: Production Cloud Deployment Pipeline"] },
        { w: 18, title: "Master Java Enterprise Capstone & Defense", theme: "Distributed SaaS Banking Platform", p: "Enterprise Distributed Core Banking Platform", s: "Full Java Enterprise Mastery", d: ["Microservices Architecture & Event Sourcing", "Spring Security, Kafka & JPA Performance", "Testcontainers Suite & 90%+ Code Coverage", "AWS ECS Deployment & Defense Presentation", "DAY 90 MASTER CAPSTONE: Enterprise Distributed SaaS Banking Platform"] },
      ],
    },
    aiml: {
      name: "AI / ML & Generative AI",
      role: "AI / Machine Learning Engineer",
      progression: ["Junior ML Developer", "Applied ML Engineer", "NLP / Deep Learning Engineer", "GenAI & LLM Solutions Engineer", "Senior AI Engineer"],
      pitch: "I can build and deploy end-to-end Machine Learning pipelines, fine-tune transformer models, design enterprise RAG systems using LangChain, Vector Databases (Pinecone/Milvus), and deploy scalable inference APIs on cloud GPUs.",
      phases: ["Math, Statistics & Python for AI", "Classical ML & Feature Engineering", "Deep Learning & PyTorch", "Generative AI, LLMs & LangChain", "MLOps, Vector DBs & Master Capstone"],
      skills: ["Python", "NumPy/Pandas", "Scikit-Learn", "PyTorch", "Transformers", "LangChain", "Vector DBs", "RAG", "Model Fine-tuning", "FastAPI", "MLflow", "MLOps"],
      curriculum: [
        { w: 1, title: "Linear Algebra & Calculus for Machine Learning", theme: "Vector Spaces, Matrices & Gradients", p: "Matrix Math & Gradient Descent Engine", s: "Math Foundations", d: ["Vectors, Dot Products & Cosine Similarity", "Matrix Multiplication & Eigenvalues/Eigenvectors", "Partial Derivatives, Gradients & Chain Rule", "Gradient Descent Optimization from Scratch", "PROJECT 1: Custom Gradient Descent Optimizer"] },
        { w: 2, title: "Data Ingestion & Preprocessing for ML", theme: "NumPy, Pandas & Scalers", p: "Production ML Data Preprocessing Pipeline", s: "Data Preprocessing", d: ["Data Normalization, Standardization & Robust Scaling", "Handling Outliers with IQR & Z-Score", "Encoding Categorical Features & Missing Value Imputation", "Feature Pipelines with Scikit-Learn ColumnTransformer", "PROJECT 2: Automated ML Preprocessing Package"] },
        { w: 3, title: "Classical Machine Learning: Regression & Regularization", theme: "Linear Models & Optimization", p: "Predictive Housing Price Model", s: "Regression Analysis", d: ["Linear Regression Formulation & Cost Function (MSE)", "Lasso (L1) & Ridge (L2) Regularization", "ElasticNet & Multi-Collinearity Diagnostics", "Cross-Validation & Grid Search Optimization", "PROJECT 3: High-Accuracy Pricing Prediction Engine"] },
        { w: 4, title: "Classical ML: Classification & Evaluation Metrics", theme: "Classifiers & Decision Boundaries", p: "Fraud Detection Classification System", s: "Classification", d: ["Logistic Regression & Softmax Multi-Class", "Decision Trees & Information Gain (Gini)", "Support Vector Machines & Kernel Tricks", "Precision, Recall, F1, ROC-AUC & Confusion Matrix", "PROJECT 4: Production Fraud Detection Classifier"] },
        { w: 5, title: "Ensemble Methods & Gradient Boosting", theme: "Random Forests, XGBoost & LightGBM", p: "Customer Churn Prediction Engine", s: "Ensemble ML", d: ["Bagging vs Boosting Principles", "Random Forests & Feature Importance Analysis", "XGBoost & LightGBM Gradient Boosted Trees", "Hyperparameter Optimization with Optuna", "PROJECT 5: Enterprise Churn Predictor with SHAP Analysis"] },
        { w: 6, title: "Unsupervised Learning & Dimensionality Reduction", theme: "Clustering & Matrix Decomposition", p: "Customer Persona Clustering Engine", s: "Unsupervised ML", d: ["K-Means Clustering & Silhouette Scoring", "Hierarchical & Density-Based (DBSCAN) Clustering", "Principal Component Analysis (PCA)", "t-SNE & UMAP for High-Dimensional Visualization", "PROJECT 6: Multi-Dimensional Customer Segmentation"] },
        { w: 7, title: "Deep Learning Foundations & Neural Networks", theme: "Perceptrons, Backprop & Activations", p: "Custom Neural Network from Scratch", s: "Neural Networks", d: ["Biological vs Artificial Neurons & Perceptrons", "Activation Functions (ReLU, Sigmoid, GELU)", "Backpropagation & Computation Graphs", "Vanishing & Exploding Gradients Solutions", "PROJECT 7: Scratch Multi-Layer Perceptron (MLP)"] },
        { w: 8, title: "PyTorch Framework Mastery", theme: "Tensors, Autograd & Custom Datasets", p: "PyTorch Deep Learning Training Pipeline", s: "PyTorch", d: ["PyTorch Tensors, CUDA Acceleration & Autograd", "Building Custom nn.Module Architectures", "Dataset & DataLoader for Efficient Mini-Batching", "Loss Functions & Optimizers (AdamW, SGD)", "PROJECT 8: Production PyTorch Training Pipeline"] },
        { w: 9, title: "Computer Vision & Convolutional Neural Networks (CNN)", theme: "Convolutions, Pooling & ResNet", p: "Medical Image Diagnostic Classifier", s: "Computer Vision", d: ["Convolution Operations, Kernels & Padding", "CNN Architectures (VGG, ResNet, EfficientNet)", "Transfer Learning & Fine-Tuning Pretrained Models", "Data Augmentation with Albumentations", "PROJECT 9: Automated X-Ray Diagnostic Classifier"] },
        { w: 10, title: "Natural Language Processing & Recurrent Architectures", theme: "Embeddings, LSTMs & GRUs", p: "Real-Time Sentiment Analysis Engine", s: "NLP Foundations", d: ["Tokenization, BPE & Word2Vec Embeddings", "RNN, LSTM & GRU Recurrent Cells", "Seq2Seq Models & Attention Mechanism", "Evaluating NLP Models (BLEU, ROUGE)", "PROJECT 10: Financial News Sentiment Classifier"] },
        { w: 11, title: "Transformers & Attention Architecture", theme: "Self-Attention, BERT & GPT", p: "Document Classifier with HuggingFace BERT", s: "Transformers", d: ["Scaled Dot-Product & Multi-Head Self-Attention", "Transformer Encoder vs Decoder Architecture", "HuggingFace Transformers Library & Tokenizers", "Fine-Tuning BERT for Sequence Classification", "PROJECT 11: Enterprise Document Classification Model"] },
        { w: 12, title: "Generative AI & Large Language Models (LLMs)", theme: "Prompt Engineering & Few-Shot", p: "LLM-Powered Code & Summary Assistant", s: "Generative AI", d: ["Autoregressive LLM Mechanics & Decoding (Temperature, Top-p)", "Zero-Shot, Few-Shot & Chain-of-Thought Prompting", "OpenAI & Anthropic API Integration", "Structured Output Parsing & Function Calling", "PROJECT 12: Automated Code & Document Intelligence Assistant"] },
        { w: 13, title: "Retrieval-Augmented Generation (RAG) & Vector DBs", theme: "Embeddings, Vector Search & LangChain", p: "Enterprise RAG Knowledge Base Engine", s: "RAG & Vector Search", d: ["Text Chunking Strategies & Overlap", "Dense Embeddings (OpenAI, HuggingFace)", "Vector Databases (Pinecone, Chroma, Milvus)", "LangChain Chains, Memory & Document Loaders", "PROJECT 13: Production Enterprise Documentation RAG System"] },
        { w: 14, title: "Advanced RAG & Autonomous AI Agents", theme: "ReAct, Tool Use & Multi-Agent", p: "Autonomous AI Research & Analysis Agent", s: "AI Agents", d: ["ReAct Framework (Reasoning + Acting)", "Building Custom Agent Tools & Web Browsing", "Multi-Agent Coordination with LangGraph", "Evaluating RAG Quality with Ragas (Faithfulness, Recall)", "PROJECT 14: Multi-Agent Market Intelligence System"] },
        { w: 15, title: "Fine-Tuning LLMs with LoRA & PEFT", theme: "Quantization, QLoRA & SFT", p: "Fine-Tuned Domain-Specific LLM Model", s: "LLM Fine-Tuning", d: ["Parameter-Efficient Fine-Tuning (PEFT) & LoRA", "Quantization (BitsAndBytes 4-bit / 8-bit)", "Instruction Fine-Tuning with Unsloth / HuggingFace SFT", "Model Evaluation & Preventing Catastrophic Forgetting", "PROJECT 15: Fine-Tuned Domain Specialist LLM"] },
        { w: 16, title: "Model Serving & High-Performance Inference APIs", theme: "FastAPI, vLLM & Triton", p: "High-Throughput Model Inference Microservice", s: "Model Serving", d: ["FastAPI REST Endpoints for ML & Streaming Responses", "High-Throughput LLM Serving with vLLM", "Batching, PagedAttention & Latency Benchmarking", "Dockerizing GPU-Accelerated Applications", "PROJECT 16: Production High-Throughput Inference Service"] },
        { w: 17, title: "MLOps, Experiment Tracking & Drift Monitoring", theme: "MLflow, DVC & Evidentily", p: "Automated MLOps Pipeline & Drift Guard", s: "MLOps", d: ["Experiment Tracking & Model Registry with MLflow", "Data & Model Versioning with DVC", "Continuous Integration for ML (CML)", "Data Drift & Concept Drift Monitoring in Production", "PROJECT 17: End-to-End MLOps Pipeline"] },
        { w: 18, title: "Master AI / ML Capstone & Defense", theme: "Enterprise GenAI Platform", p: "Enterprise Multimodal GenAI Platform", s: "Full AI/ML Mastery", d: ["End-to-End RAG Architecture & Vector Indexing", "Fine-Tuned Specialized LLM & Agent Tools", "FastAPI Inference API & MLOps Monitoring", "Executive AI Defense & Benchmark Presentation", "DAY 90 MASTER CAPSTONE: Enterprise Multimodal Generative AI Intelligence Platform"] },
      ],
    },
    cyber: {
      name: "Cybersecurity & SOC Operations",
      role: "Cybersecurity & SOC Analyst",
      progression: ["Junior Security Analyst", "SOC Tier 1/2 Analyst", "Penetration Tester", "Incident Response Specialist", "Senior Information Security Engineer"],
      pitch: "I can monitor and triage security alerts in SIEM platforms (Splunk/Wazuh), conduct network vulnerability scanning (Nmap/Nessus), perform threat hunting, analyze malware traffic (Wireshark), and enforce ISO 27001 / NIST cybersecurity controls.",
      phases: ["Network Security & Threat Landscape", "Security Operations, SIEM & Splunk", "Vulnerability Assessment & Pentesting", "Incident Response & Digital Forensics", "Governance, Cloud Security & Capstone"],
      skills: ["Nmap", "Wireshark", "SIEM Splunk", "Firewalls", "Incident Response", "Malware Analysis", "OWASP Top 10", "Vulnerability Scanning", "SOC Operations", "Threat Hunting"],
    },
    sre: {
      name: "DevOps & Site Reliability Engineering",
      role: "Site Reliability Engineer (SRE)",
      progression: ["Junior DevOps Engineer", "SRE Associate", "Kubernetes Reliability Engineer", "Platform & Chaos Engineer", "Senior SRE Architect"],
      pitch: "I can design fault-tolerant Kubernetes platform infrastructure, establish SLO/SLI observability frameworks with Prometheus and Grafana, conduct chaos engineering drills, and automate zero-downtime deployment pipelines.",
      phases: ["Linux Internals, Networking & Scripting", "Kubernetes Cluster Architecture & Helm", "Observability (SLO, Prometheus, Grafana)", "Chaos Engineering & Incident Management", "Enterprise Platform & Resilience Capstone"],
      skills: ["Linux", "Bash/Python", "Kubernetes", "Helm", "Prometheus", "Grafana", "SLO/SLI", "Chaos Mesh", "Terraform", "Istio Service Mesh", "Post-Mortem Analysis"],
    },
    uiux: {
      name: "UI / UX Product Design",
      role: "Product & UI/UX Designer",
      progression: ["Junior UI Designer", "UX Researcher", "Product Designer", "Design System Architect", "Senior Lead Product Designer"],
      pitch: "I can lead the full product design lifecycle from user research, wireframing, and interactive prototyping in Figma to creating scalable design systems and conducting WCAG 2.2 accessibility audits that drive product conversions.",
      phases: ["UX Research & Information Architecture", "Wireframing & UI Foundations", "Advanced Figma & Design Systems", "Interactive Prototyping & Usability Testing", "Accessibility (WCAG) & Master Product Capstone"],
      skills: ["User Research", "Wireframing", "Figma", "Design Systems", "Interactive Prototyping", "WCAG Accessibility", "Usability Testing", "Micro-Interactions", "Design Hand-off"],
    },
    qa: {
      name: "QA Automation Engineering",
      role: "QA Automation Engineer (SDET)",
      progression: ["Manual QA Tester", "Automation QA Engineer", "API & Performance QA Specialist", "Lead SDET", "Principal QA Automation Architect"],
      pitch: "I can build enterprise test automation frameworks from scratch using Cypress, Playwright, Selenium, and Postman, integrate automated regression suites into CI/CD pipelines, and conduct load testing with k6 and JMeter.",
      phases: ["Manual Testing & Test Case Design", "JavaScript/TypeScript for Automation", "Cypress & Playwright Web Automation", "API Testing (Postman/RestAssured) & k6", "CI/CD Integration & Enterprise Test Capstone"],
      skills: ["Test Plans", "Cypress", "Playwright", "Selenium", "API Testing", "Postman", "k6 Load Testing", "CI/CD Test Runner", "Test Automation Frameworks", "Regression Testing"],
    },
    mobile: {
      name: "Mobile App Development",
      role: "Mobile Application Developer (React Native / iOS & Android)",
      progression: ["Junior Mobile Developer", "React Native Developer", "Cross-Platform Mobile Engineer", "Mobile Architecture Specialist", "Senior Mobile App Engineer"],
      pitch: "I can architect native-performance cross-platform mobile apps using React Native, Expo, Redux Toolkit, SQLite, background services, push notifications, and deploy automated release pipelines to Apple App Store and Google Play.",
      phases: ["Mobile UI & React Native Foundations", "Navigation, Gestures & Native Layouts", "State Management, Offline Sync & SQLite", "Native Modules, Camera & Push Notifications", "App Store Publishing & Mobile Capstone"],
      skills: ["React Native", "Expo", "TypeScript", "React Navigation", "Redux Toolkit", "SQLite", "Push Notifications", "Biometrics", "Native Device APIs", "App Store Deployment"],
    },
    marketing: {
      name: "Digital Marketing & Performance Growth",
      role: "Performance Marketer & Growth Strategist",
      progression: ["Junior Marketing Associate", "Paid Media Specialist", "SEO & Content Strategist", "Growth Marketing Lead", "Digital Marketing Director"],
      pitch: "I can scale multi-channel performance marketing funnels across Google Ads, Meta Ads, and programmatic networks, execute technical SEO strategies, conduct conversion rate optimization (CRO) split tests, and model ROAS attribution.",
      phases: ["Marketing Fundamentals & Audience Research", "Search Engine Optimization (Technical & On-Page)", "Paid Performance Advertising (Google & Meta)", "Conversion Optimization, Email & Funnels", "ROAS Analytics & Growth Capstone"],
      skills: ["Google Ads", "Meta Ads", "Technical SEO", "CRO", "Google Analytics 4", "ROAS Modeling", "Email Automation", "Content Strategy", "Attribution Modeling"],
    },
    sap: {
      name: "SAP FICO Financial Accounting & Controlling",
      role: "SAP FICO Functional Consultant",
      progression: ["Associate SAP Consultant", "SAP FI Consultant", "SAP CO Specialist", "Lead SAP Functional Architect", "Senior SAP Solution Architect"],
      pitch: "I can configure enterprise financial structures in SAP ERP / S/4HANA including General Ledger (GL), Accounts Payable (AP), Accounts Receivable (AR), Asset Accounting (AA), Cost Center Accounting (CO-CCA), and automated month-end financial closing.",
      phases: ["SAP Enterprise Structure & General Ledger", "Accounts Payable (AP) & Accounts Receivable (AR)", "Asset Accounting (AA) & Bank Accounting", "Controlling (CO): Cost Centers & Profit Centers", "Integration, Year-End Closing & SAP Capstone"],
      skills: ["SAP S/4HANA", "General Ledger", "Accounts Payable", "Accounts Receivable", "Asset Accounting", "Cost Center Accounting", "Financial Closing", "Document Posting", "Integration Testing"],
    },
    hr: {
      name: "Strategic HR & Payroll Analytics",
      role: "Strategic HR & Payroll Specialist",
      progression: ["HR Executive", "Talent Acquisition & Ops Specialist", "Payroll & Statutory Compliance Lead", "HR Business Partner (HRBP)", "Senior HR Operations Manager"],
      pitch: "I can manage full-lifecycle HR operations from talent acquisition and HRMS implementation to multi-tier CTC salary structuring, statutory payroll compliance (PF, ESI, Gratuity, TDS), and workforce analytics.",
      phases: ["HR Management Fundamentals & Talent Acquisition", "HRMS, Onboarding & Performance Management", "Compensation, CTC Structuring & Payroll Calculations", "Statutory Compliance (Labor Laws, PF, ESI, Tax)", "Workforce Analytics & Strategic HR Capstone"],
      skills: ["Talent Acquisition", "HRMS", "CTC Structuring", "Payroll Processing", "PF & ESI Compliance", "Labor Laws", "Employee Relations", "Performance Appraisals", "HR Analytics"],
    },
    bianalytics: {
      name: "Business Analytics & Power BI",
      role: "Business Intelligence & Data Analyst",
      progression: ["Junior BI Analyst", "Power BI Developer", "Data Modeling Specialist", "Enterprise BI Consultant", "Senior BI Architect"],
      pitch: "I can design enterprise dimensional data models (Star/Snowflake schema), write complex DAX formulas and Power Query M transformations in Power BI, execute analytical SQL queries, and deliver interactive executive dashboards.",
      phases: ["Data Analysis & Advanced SQL Foundations", "Power BI Desktop & Power Query Transformation", "Data Modeling & Star Schema Architecture", "Advanced DAX Formulas & Time Intelligence", "Enterprise Deployment & Master BI Capstone"],
      skills: ["Power BI", "DAX", "Power Query (M)", "SQL Server", "Dimensional Modeling", "Data Visualization", "KPI Dashboards", "Row-Level Security", "Business Intelligence"],
    },
  };

  const cfg = CONFIGS[trackId] || CONFIGS["java"];
  const tname = cfg.name || "Technical Track";

  const genericCurriculum = [
    { w: 1, title: `${tname} Foundations & Tooling`, theme: "Syntax & Core Architecture", p: `${tname} Foundational Architecture Suite`, s: "Core Architecture", d: ["Syntax & Basic Conventions", "Development Environment & Tooling", "Core Language/Domain Mechanics", "Error Handling & Debugging", `PROJECT 1: ${tname} Foundations Scaffold`] },
    { w: 2, title: `${tname} Applied Patterns & Principles`, theme: "Design Patterns & Modularity", p: `${tname} Clean Code Implementation`, s: "Design Patterns", d: ["Domain Abstraction & Modularity", "Standard Design Patterns", "State & Data Flow Management", "Unit Testing Fundamentals", `PROJECT 2: ${tname} Clean Pattern Suite`] },
    { w: 3, title: `${tname} Data Modeling & Structures`, theme: "Schemas & Data Architecture", p: `${tname} Data Modeling Engine`, s: "Data Modeling", d: ["Data Contract Design & Validation", "Entity Relational Modeling", "Optimizing Storage & Access", "CRUD & Transaction Management", `PROJECT 3: ${tname} Data Access Engine`] },
    { w: 4, title: `${tname} API & Service Architecture`, theme: "Inter-Service Communication", p: `${tname} High-Throughput Service Layer`, s: "Service Architecture", d: ["Protocol Standards & Request Handling", "Middleware & Request Pipelines", "Validation & Payload Sanitization", "Logging & Error Propagation", `PROJECT 4: ${tname} Service Gateway`] },
    { w: 5, title: `${tname} Security, Authentication & Access`, theme: "Identity & RBAC Governance", p: `${tname} Enterprise Security Layer`, s: "Security & Auth", d: ["Authentication Mechanisms (Tokens/Sessions)", "Role-Based Access Control (RBAC)", "Data Encryption & Secret Handling", "Security Audit & Vulnerability Triage", `PROJECT 5: ${tname} Hardened Security System`] },
    { w: 6, title: `${tname} Intermediate Production Implementation`, theme: "Component Integration & Scale", p: `${tname} Multi-Module System`, s: "Production Implementation", d: ["High-Volume Processing Techniques", "Decoupling Modules & Services", "Asynchronous Processing & Queues", "System Performance Profiling", `PROJECT 6: ${tname} Core Business Engine`] },
    { w: 7, title: `${tname} Quality Audit & Refactoring`, theme: "Code Quality & Performance Tuning", p: `${tname} Quality Audit & Optimization Suite`, s: "Quality Assurance", d: ["Static Code Analysis & Linting", "Eliminating Bottlenecks & Memory Leaks", "Code Review & Refactoring Best Practices", "Regression Test Coverage Expansion", `PROJECT 7: ${tname} Optimization Suite`] },
    { w: 8, title: `${tname} High-Volume Production Workflows`, theme: "Batch Processing & Caching", p: `${tname} High-Concurrency Engine`, s: "High-Volume Scaling", d: ["Caching Strategies & Invalidation", "Batch Processing & Stream Pipelines", "Fault Isolation & Fallbacks", "Benchmarking Throughput & Latency", `PROJECT 8: ${tname} High-Volume Worker`] },
    { w: 9, title: `${tname} Multi-Specialty & Domain Adaptation`, theme: "Specialized Industry Scenarios", p: `${tname} Multi-Domain Module Package`, s: "Domain Specialization", d: ["Complex Domain Workflows", "Integration with External APIs", "Compliance & Industry Regulations", "Custom Extensibility Hooks", `PROJECT 9: ${tname} Multi-Domain Service`] },
    { w: 10, title: `${tname} Complex Scenario & Edge Case Handling`, theme: "Fault Tolerance & Recovery", p: `${tname} Resilient Failover System`, s: "Resilience Engineering", d: ["Edge Case Detection & Recovery", "Circuit Breakers & Retries", "Distributed Transaction Rollbacks", "Post-Mortem Root Cause Analysis", `PROJECT 10: ${tname} Disaster Recovery Package`] },
    { w: 11, title: `${tname} Advanced Architecture & Microservices`, theme: "Distributed Systems & Event Streams", p: `${tname} Distributed Architecture Cluster`, s: "Distributed Architecture", d: ["Microservice Boundaries & Event Streams", "API Gateways & Service Discovery", "Distributed Tracing & Telemetry", "Contract Testing Across Services", `PROJECT 11: ${tname} Distributed Microservice Cluster`] },
    { w: 12, title: `${tname} Enterprise Governance & Compliance`, theme: "Audit Trails & Standards", p: `${tname} Regulatory Compliance Suite`, s: "Governance & Compliance", d: ["Audit Logging & Compliance Reporting", "Privacy Protections (GDPR/HIPAA)", "Policy Enforcement & Least Privilege", "Disaster Recovery Testing", `PROJECT 12: ${tname} Compliance Audit Suite`] },
    { w: 13, title: `${tname} Performance Engineering & Optimization`, theme: "Sub-Second Latency Tuning", p: `${tname} Low-Latency Performance Suite`, s: "Performance Tuning", d: ["Database Index & Query Tuning", "Network Payload Compression", "Profiling Hot Paths in Code", "Load Testing & Stress Testing", `PROJECT 13: ${tname} Latency Benchmark Package`] },
    { w: 14, title: `${tname} Full System Integration & Assembly`, theme: "End-to-End Workflow Wiring", p: `${tname} Integrated Production Platform`, s: "Full System Assembly", d: ["End-to-End Data Pipeline Wiring", "Integration Testing & Validation", "Cross-Service Authorization", "User Acceptance Test Flows", `PROJECT 14: ${tname} Unified Platform`] },
    { w: 15, title: `${tname} AI-Assisted Workflows & Automation`, theme: "AI Copilots & GenAI Integration", p: `${tname} AI-Powered Automation Engine`, s: "AI-Assisted Workflows", d: ["AI Copilot Prompt Engineering", "Automating Domain Workflows with LLMs", "AI Output Validation & Hallucination Elimination", "Semantic Search & Knowledge Assistants", `PROJECT 15: ${tname} AI Intelligence Integration`] },
    { w: 16, title: `${tname} Automated Quality Assurance & Testing`, theme: "Comprehensive Test Automation", p: `${tname} Automated QA Pipeline (85%+ Coverage)`, s: "Automated QA", d: ["Automated Unit & Component Tests", "API & Integration Test Automation", "End-to-End User Journey Tests", "CI Test Gates & Quality Badges", `PROJECT 16: ${tname} Enterprise QA Test Suite`] },
    { w: 17, title: `${tname} Cloud & Production Deployment`, theme: "CI/CD & Cloud Infrastructure", p: `${tname} Production Cloud Deployment Pipeline`, s: "Production Cloud", d: ["Containerization & Docker Packaging", "Cloud Provisioning & Infrastructure as Code", "Automated CI/CD Deployment Pipelines", "Live Monitoring, Alerts & Logging", `PROJECT 17: ${tname} Cloud Release Pipeline`] },
    { w: 18, title: `${tname} Master Industry Capstone & Defense`, theme: "End-to-End Enterprise Solution", p: `End-to-End ${tname} Master Enterprise Capstone`, s: "Full Industry Work Readiness", d: ["Complete Solution Architecture", "Full Business Logic & Security", "Automated Testing & Cloud Deploy", "Executive Presentation & Defense", `DAY 90 MASTER CAPSTONE: Complete ${tname} Enterprise Solution`] },
  ];

  const curr = cfg.curriculum || genericCurriculum;

  const weeks: WeekPlan[] = curr.map((c, wIdx) => {
    const wNum = wIdx + 1;
    const startDay = wIdx * 5 + 1;

    const days: DayPlan[] = [
      { day: startDay, topic: c.d[0] || `${tname} Day ${startDay} Core Concept`, practice: "20m Concept + 10m Hands-on Guided Drill" },
      { day: startDay + 1, topic: c.d[1] || `${tname} Day ${startDay + 1} Deep Dive`, practice: "20m Architecture + 10m Sandbox Task" },
      { day: startDay + 2, topic: c.d[2] || `${tname} Day ${startDay + 2} Applied Practice`, practice: "20m Implementation + 10m Debug Challenge" },
      { day: startDay + 3, topic: c.d[3] || `${tname} Day ${startDay + 3} Standards & Polish`, practice: "20m Code Review + 10m Optimization Task" },
      {
        day: startDay + 4,
        topic: c.d[4] || `PROJECT ${wNum}: ${c.p}`,
        practice: "30m Real-World Workplace Simulation Mini Project",
        isProject: true,
        projectTitle: c.p,
        workplaceSimulation: `An enterprise client issues an urgent workplace ticket: Deliver a production-grade ${c.p} meeting all technical specifications and test requirements.`,
        deliverable: `${c.p} Package & Deliverable`,
      },
    ];

    return {
      week: wNum,
      title: `Week ${wNum}: ${c.title}`,
      theme: c.theme,
      days,
      projectTitle: c.p,
      deliverable: `${c.p} Package & Deliverable`,
      workplaceSkill: c.s || cfg.skills[wIdx % cfg.skills.length] || "Domain Competency",
    };
  });

  const portfolio: PortfolioItem[] = weeks.map((w, idx) => ({
    num: idx + 1,
    project: w.projectTitle,
    workplaceSkill: w.workplaceSkill,
    phase: `Phase ${w.week <= 5 ? 1 : w.week <= 10 ? 2 : w.week <= 14 ? 3 : w.week <= 16 ? 4 : 5}`,
  }));

  const phases: PhasePlan[] = [
    { phaseNumber: 1, title: cfg.phases[0] || "Foundations", weeksRange: "Weeks 1–5", description: `Core concepts, syntax, tooling, and foundational architecture for ${tname}.` },
    { phaseNumber: 2, title: cfg.phases[1] || "Intermediate Competency", weeksRange: "Weeks 6–10", description: `Applied engineering, component modeling, and standard domain practices.` },
    { phaseNumber: 3, title: cfg.phases[2] || "Advanced Systems", weeksRange: "Weeks 11–14", description: `Enterprise patterns, security, performance, and multi-service workflows.` },
    { phaseNumber: 4, title: cfg.phases[3] || "AI-Assisted & Quality Engineering", weeksRange: "Weeks 15–16", description: `AI Copilot integration, automated testing, validation, and governance.` },
    { phaseNumber: 5, title: cfg.phases[4] || "Production & Capstone", weeksRange: "Weeks 17–18", description: `Cloud deployment, operational resilience, and the Day 90 Master Capstone.` },
  ];

  return {
    trackId,
    trackName: tname,
    targetRole: cfg.role,
    careerProgression: cfg.progression,
    interviewPitch: cfg.pitch,
    phases,
    weeks,
    day90Capstone: {
      title: `End-to-End ${tname} Master Industry Capstone`,
      description: `Comprehensive 14-step real-world enterprise project simulating an end-to-end commercial deployment with architectural defense.`,
      flow: ["Problem Analysis", "Architecture Design", "Core Engineering", "Data & Security", "AI Integration", "Production Cloud Deployment"],
      steps: [
        { step: 1, title: "Requirements & Architecture Scope", description: "Deconstruct business requirements and draft functional design specifications." },
        { step: 2, title: "Data & Domain Modeling", description: "Design scalable schemas, data contracts, and interface boundaries." },
        { step: 3, title: "Core Business Logic Engineering", description: "Implement primary features following clean architecture standards." },
        { step: 4, title: "Security, Auth & Compliance", description: "Implement authentication, role authorization, and data encryption." },
        { step: 5, title: "Performance & Caching Layer", description: "Optimize bottlenecks and introduce high-speed caching and query tuning." },
        { step: 6, title: "AI-Assisted Acceleration", description: "Integrate domain-specific AI workflows, automated parsing, or intelligence tools." },
        { step: 7, title: "Comprehensive Automated Testing", description: "Achieve 85%+ automated test coverage across unit, integration, and user journeys." },
        { step: 8, title: "Containerization & Cloud Infrastructure", description: "Package into containers and provision scalable cloud infrastructure." },
        { step: 9, title: "Automated CI/CD Pipeline", description: "Set up automated linting, test execution, and deployment triggers." },
        { step: 10, title: "Executive Capstone Defense", description: "Defend architecture decisions, benchmark metrics, and security audits to technical interviewers." },
      ],
    },
    portfolio,
  };
}

