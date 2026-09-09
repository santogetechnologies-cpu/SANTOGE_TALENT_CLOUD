# SANTOGE_TALENT_CLOUD

## SantoGe Talent Cloud (STC) — Interactive Technical Skill Engine & Placement Accelerator

---

### 1. CORE BRANDING, ROLES & ARCHITECTURAL FOUNDATION

1. **Brand & Identity:**

   - Application Name: **SantoGe Talent Cloud**

   - Tagline: _Intelligent Technical Skill Engine (ITSE) • Workflow & Placement Architecture_

   - Color Palette: Deep Slate Dark Base (`#0a0d14`, `#101624`), Glassmorphism Cards (`rgba(22, 31, 50, 0.82)`), Accents (Neon Cyan `#00d4ff`, Vibrant Purple `#8b5cf6`, Emerald Green `#10b981`, Amber Gold `#f59e0b`, Rose Red `#f43f5e`). Full Light Theme toggle support.

   - Fonts: Plus Jakarta Sans (body), Outfit (headings), JetBrains Mono (code/terminals).

2. **Strict 2-Tier Role System (No Other Roles):**

   - **Role 1: Platform Super Admin** (Global Platform Management, Bulk CSV Provisioning, 100–300 Batch Sizing, Batch Renaming, Telegram Sync, and Automated Cron Pipelines).

   - **Role 2: Student (e.g., Ajay)** (1–3 In-Browser Interactive Tech Tracks, 30m Daily Placement Accelerator, Dynamic Talent Score 0–1000, and Placement Guarantee Tracker).

3. **Stage 0: Institutional Onboarding & Bulk CSV Provisioning (Day 0):**

   - Colleges submit verified student lists and fee verification.

   - Platform Admin uploads a Bulk CSV with standard format:

     `student_name, email, password, roll_no, dept, course_1, course_2, course_3, batch_id`

   - Pre-assigns 1 to 3 chosen technical courses directly in CSV.

   - System auto-provisions logins with **NO Initial Assessment Test Needed**.

   - Batch capacity is constrained between **100 and 300 students max per batch**.

   - Batch Name can be renamed before and after uploading (e.g., `BATCH-2026-ABC-CSE-01`).

   - Automated instant sync to the batch’s dedicated Telegram channel.

4. **The 2-Phase Master Operating Architecture:**

   - **PHASE 1: DAYS 1 TO 90 — 100% PURE LEARNING**

     - Strictly **NO premature 1:1 mock interviews**, **NO early resume building**, and **NO recruiter access**.

     - **The Daily Twin 30-Minute Schedule (60 Mins/Day Total):**

       - **Engine 1: Technical Self-Study Engine (ITSE) (30 Mins Daily):** 100% in-app interactive sandboxes with ZERO passive video lectures. Students select 1 to 3 courses (in-app course switcher allows changing anytime). Breakdown: 5m Interactive Concept Card + 15m In-Browser Practical Sandbox / Tool Simulator + 10m Daily Practical Debug Challenge / Mini-Assignment.

       - **Engine 2: 90-Day Placement Accelerator (30 Mins Daily):** Synchronized batch cadence (100–300 students). Breakdown: 10m English & Communication video (via Telegram) + 10m Aptitude & Reasoning video (via Telegram) + 10m In-App Guided Practice (5 MCQs + 2 Puzzles + Voice Pitch Recording).

     - **5-Day Weekly Rhythm:** Mon–Thu (Daily Twin 30m routine), Fri (Weekly Practical Lab Challenge + Timed Placement Assessment + Weekly Analytics & Streak Review), Sat–Sun (Rest & Optional Revision).

     - **Milestones:** Days 1–30 Foundation, Days 31–60 Application, Days 61–90 Full Mastery.

   - **🔒 DUAL-TRACK COMPLETION GATE:**

     - Requires **100% verified completion** of BOTH Phase 1 tracks (Technical Sandboxes + 90-Day Placement Accelerator) before Phase 2 unlocks.

   - **PHASE 2: POST-90 DAYS — CAREER, ASSESSMENT & HIRING GATEWAY:**

     - 1. **Automated ATS Resume Builder:** Auto-populated with verified sandbox projects, GitHub commit records, and skill badges.

     - 2. **1:1 Mentor & AI Video Mocks:** Live industry mocks + AI STAR panels with scorecard feedback and remedial notes.

     - 3. **Final Certification Exams:** Full-length company pattern aptitude and practical coding benchmarks.

     - 4. **Recruiter Marketplace & Drives:** Direct verified campus drives and digital offer letters.

   - **Capability Unlock Gates (Talent Score 0–1000):**

     - `Score 450+`: Automated ATS Resume Builder Activated

     - `Score 600+`: 1:1 Mentor Mock & AI Video Panel Bookings Unlocked

     - `Score 700+`: Recruiter Marketplace Visibility Unlocked

     - `Score 800+`: Premium Tier Companies & Fast-Track Drives Unlocked

     - `Score 900+`: Direct Priority Interview Pool with Enterprise Partners

---

### 2. NAVIGATION & TAB SECTIONS BREAKDOWN

Include a sticky top navigation header (Brand logo, title, global search bar, theme toggle, and Live Demo Portals CTA) and 7 main interactive tab views:

#### TAB 1: System Overview & Core Engines (`#tab-overview`)

- Hero banner explaining the 2-phase architecture and dual-track gate.

- Master visual process diagram showing Stage 0 → Phase 1 (Twin 30m Engines) → Dual 100% Gate → Phase 2 (ATS Resume, 1:1 Mocks, Certs, Offers).

- Detail cards for Capability Threshold Gates (450+ to 900+), Daily Twin 30-Min Schedule breakdown, 5-Day Weekly Rhythm ladder, and 90-Day Milestones.

#### TAB 2: 15 Purely Interactive Technical Tracks (`#tab-itse`)

- Showcase grid for all 15 specialized tech courses (zero video uploads, 100% browser-based):

  1. MERN Full Stack

  2. Java Full Stack

  3. AI/ML & Generative AI Engineering

  4. Data Science & Data Analytics

  5. Cloud Computing & DevOps

  6. Cybersecurity & Ethical Hacking

  7. DevOps & SRE

  8. UI/UX Design

  9. Software Testing & QA Automation

  10. Mobile App Development

  11. Medical Coding & Billing

  12. Digital Marketing

  13. SAP FICO

  14. HR Management & Payroll

  15. Business Analytics (Excel & Power BI)

- Each card displaying track number, domain tag, summary, interactive modules, sandbox badge, and an "Open Interactive Sandbox" button linked directly to Tab 3.

#### TAB 3: 15 In-App Interactive Sandboxes & Tool Simulators (`#tab-labs`)

- A toolbar of 15 buttons to switch between the live interactive simulators:

  1. **MERN Full Stack:** Node/Express code editor with interactive "Run & Test API Endpoint" button and terminal output verifying JSON payloads (+50 XP).

  2. **Java Full Stack:** Spring Boot test controller with "Run JUnit 5 Test Suite" button and terminal output (+50 XP).

  3. **AI/ML & GenAI:** LangChain RAG pipeline simulator with "Execute RAG Retrieval" querying vector chunks in Pinecone (+50 XP).

  4. **Data Science:** Pandas/NumPy dataframe cleaner with "Execute EDA Script" updating data matrix and correlations (+50 XP).

  5. **Cloud Computing (AWS):** Terraform `main.tf` editor with "Run terraform apply" creating live EC2 instance with public IP (+50 XP).

  6. **Cybersecurity:** Interactive Nmap scanner with "Execute nmap Scan" checking open ports (22, 80, 443, 3306) and firewall rules (+50 XP).

  7. **DevOps & SRE:** Kubernetes terminal with "Scale Pods to 8 Replicas" balancing ingress traffic across nodes (+50 XP).

  8. **UI/UX Design:** Interactive canvas artboard with mobile/desktop view toggles and "Run WCAG Accessibility Test" verifying AAA 7.4:1 contrast (+50 XP).

  9. **QA Automation:** Cypress test suite runner with "Run Cypress E2E Suite" validating auth, checkout, and webhook (+50 XP).

  10. **Mobile App:** Device frame simulator with "Hot Reload Mobile View" broadcasting live push notifications and driver tracker (+50 XP).

  11. **Medical Coding:** ICD-10 (e.g., `M54.5`) & CPT (`22840`) validator with "Validate Clinical Claim" computing 100% clean claim rate (+50 XP).

  12. **Digital Marketing:** Campaign budget optimizer with "Optimize Budget Allocation" projecting 5.1x ROAS (+50 XP).

  13. **SAP FICO:** SAP GUI terminal with "Post General Ledger Document" posting Doc `100049202` (+50 XP).

  14. **HRMS & Payroll:** CTC / salary calculator with "Calculate Net Salary Slip" computing EPF, ESI, TDS, and net take-home pay (+50 XP).

  15. **Business Analytics:** Excel & Power BI DAX engine with "Evaluate DAX & Refresh KPI" recalculating revenue (+14%) and target metrics (+50 XP).

#### TAB 4: 90-Day Placement Accelerator (`#tab-placement`)

- 30-min daily batch-synchronized curriculum architecture (100–300 students).

- Detailed breakdown of 10m English (Telegram), 10m Aptitude (Telegram), and 10m In-App Guided Practice.

- Weekly milestone breakdown across Months 1, 2, and 3.

- Interactive Multi-Dimensional Batch Leaderboard (Rank, Student, Track, Talent Score, Daily Streak, 10m Accuracy, Sandbox XP).

#### TAB 5: 5 Flowcharts & DFD Hub (`#tab-diagrams`)

- Sub-navigation switching between 5 interactive architectural diagrams:

  1. **Master Process Flow:** 7-step horizontal timeline (College Onboarding & Fees → Bulk CSV Provisioning → Instant Auto-Enrolment → Phase 1 Days 1–90 → Dual Gate → Phase 2 Post-90 Days → Marketplace & Offers).

  2. **The Daily Twin 30-Minute Execution Workflow:** Dual-column comparison between Technical Self-Study Engine (30m) and Placement Accelerator (30m).

  3. **Platform Admin & Student Swimlane Flowchart:** Two clear swimlanes for _Platform Super Admin_ (Bulk CSV, 100-300 Sizing, Batch Naming, Telegram Sync) and _Student (Ajay)_ (Credentials login, 30m Placement, 30m Tech Sandbox, Dual 100% Career Gateway).

  4. **Daily Automation Engine & Scoring Flowchart:** Cron pipeline triggering morning Telegram video broadcast → In-app 10m practice unlock → Student 30m sandbox execution → Talent score recalculation and leaderboard refresh.

  5. **Data Flow Diagram (DFD Level 1):** External entity _Student (Ajay)_ on the left, _Platform Super Admin_ on the right, central processes 1.0 (CSV Provisioning), 2.0 (Daily Execution), 3.0 (Post-90d Gateway), and Data Stores D1 (Student DB), D2 (Sandboxes DB), D3 (Placement & Talent Scoring DB), D4 (Placement Guarantee & Metrics).

#### TAB 6: Bulk CSV Upload & Platform Governance (`#tab-governance`)

- Overview of how Platform Admin onboards colleges, sets batch sizes (100–300), and assigns courses.

- **2-Tier Architecture Tree:**

  ```text

  SantoGe Platform Architecture

  │

  ├── 1. Platform Super Admin (Global Control, Bulk CSV Upload, 100–300 Batch Sizing, Batch Renaming, Telegram Sync, Cron Pipelines)

  └── 2. Student (Ajay) (1–3 Interactive Tech Tracks, 30m Placement, Dynamic Talent Score 0–1000, Dual 100% Completion Gate)

  ```

- **CSV Template Specification:** Displays sample CSV format with columns `student_name, email, password, roll_no, dept, course_1, course_2, course_3, batch_id`.

#### TAB 7: Interactive Demo Logins (`#tab-demo-logins`)

- Role selector cards to test:

  1. **Student (Ajay):** Live student dashboard showing Phase 1 status (Day 26/90), active batch name, synced Telegram status, Talent Score (752), daily streak (🔥 26 days), assigned 1–3 courses with "Change My Courses (1–3)" modal launcher, today's schedule checklist, and post-90d job match preview.

  2. **SantoGe Super Admin:** Platform control panel with College selector, Batch sizing dropdown (100, 150, 200, 300), editable batch name input with "Upload CSV & Save Batch Name" button (updates active batch name across the app), Telegram sync button, total metrics (14,280 students, 54 batches, 48 partner institutions, 3,840 offers generated).

#### TAB 8: Placement Guarantee Tracker (`#tab-guarantee`)

- Real-time quantitative readiness model.

- **Mathematical Formula:**

  $$\text{Placement Readiness Index (\%)} = (T \times 0.25) + (C \times 0.20) + (A \times 0.15) + (E \times 0.15) + (R \times 0.15) + (M \times 0.10)$$

  Where:

  - $T$ (25%): Technical Courses Sandbox Progress (0–100%)

  - $C$ (20%): 90-Day Placement Attendance (0–100%)

  - $A$ (15%): Aptitude & Reasoning Consistency (0–100%)

  - $E$ (15%): English & Communication Practice (0–100%)

  - $R$ (15%): ATS Resume Quality Score (0–100%)

  - $M$ (10%): Post-90d Mock Interviews Completed ($(\text{Mocks} / 10) \times 100\%$)

- **Interactive Simulator Sliders:** 6 sliders for $T, C, A, E, R, M$ that dynamically recalculate the overall percentage badge and the live company matching formula:

  $$\text{Estimated Matching Companies} = \max(2, \text{round}((\text{Readiness} / 100) \times 26))$$

- Includes a "Reset Defaults" button and a dynamic list of matching enterprise hiring partners.

---

### 3. INTERACTIVE MODALS & JAVASCRIPT LOGIC

1. **Course Switcher Modal:** Allows students to select between 1 and 3 courses from the 15 standard courses with instant validation (alerts if 0 or >3 selected) and updates the student dashboard state.

2. **Batch Naming & Sizing Simulator:** Allows Platform Admin to input a custom batch name and sizing (100–300) and immediately reflects the changes across student dashboards and batch displays.

3. **Global Search Filter:** Real-time search across the entire page that auto-navigates to the relevant tab and scrolls/highlights the matched card.

4. **All 15 Interactive Lab Action Handlers:** Provide realistic simulated feedback, terminal logs, test runner passes, and XP rewards.

Ensure the entire application is contained in a single self-contained, beautifully styled, and bug-free file.

````

***

## SantoGe Talent Cloud (STC)

SantoGe Talent Cloud is an enterprise talent intelligence platform combining an Interactive Technical Skill Engine (ITSE) across 15 technical disciplines with a synchronized 90-day Batch Placement Accelerator.

### Core Architecture
- **Stage 0**: Institutional Onboarding & CSV Provisioning (100–300 learners per batch cohort).
- **Phase 1**: Dual 90-day journeys (Individual 1–3 technical tracks + Batch Placement Accelerator with Telegram cohort).
- **Dual Completion Gate**: Configurable technical competency threshold + 90-day placement attendance and assessment.
- **Phase 2**: ATS Resume Scanning, AI Mock Interviews, Skill Certifications, Unified Talent Score (0–1000), and Recruiter Talent Marketplace.

### Development

Run locally:
```sh
npm install
npm run dev
````
