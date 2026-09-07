# SantoGe Talent Cloud (STC) Developer & Agent Guidelines

## Core System Architecture
1. **Separation of Batch vs Technical Identity**:
   - A **Batch** is exclusively the **Placement Accelerator cohort** (English, Aptitude, Communication, Telegram cohort, 90-day synchronized calendar, and cohort leaderboards).
   - **Technical Learning** is individual, self-paced, and evidence-based (1 to 3 selected courses out of 15 available technical tracks).
2. **Dual Completion Gate**:
   - Requires both Placement Accelerator completion (90-day attendance + Day 90 assessment) and Technical Mastery on assigned tracks.
3. **Phase 2 Career & Hiring**:
   - Unlocks ATS Resume Scoring, AI Mock Interviews, Skill Certifications, Unified Talent Score calculation (0–1000), and the Recruiter Talent Marketplace.

## Codebase Standards
- Maintain clean TypeScript types, Radix UI components, Tailwind CSS styling, and TanStack Router flows.
- Preserve persistent state in `src/lib/app-store.tsx` and Supabase Live Auth in `src/lib/supabase.ts`.
