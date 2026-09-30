/**
 * SantoGe Talent Cloud — 90-Day Specialized Technical Learning System
 * Types & Data Contracts for 6 Specialized Technical Tracks
 */

import type { TrackId } from "@/lib/tracks";

/* ------------------------------------------------------------------ */
/*  Phases & Structure                                                 */
/* ------------------------------------------------------------------ */

export type PhaseNumber = 1 | 2 | 3 | 4 | 5 | 6;

export const PHASE_NAMES: Record<PhaseNumber, string> = {
  1: "Foundation",
  2: "Core Skills",
  3: "Applied Learning",
  4: "Intermediate",
  5: "Advanced & Industry Readiness",
  6: "Capstone Project & Final Assessment",
};

export const PHASE_RANGES: Record<PhaseNumber, { start: number; end: number }> = {
  1: { start: 1, end: 15 },
  2: { start: 16, end: 30 },
  3: { start: 31, end: 45 },
  4: { start: 46, end: 60 },
  5: { start: 61, end: 75 },
  6: { start: 76, end: 90 },
};

export function getPhaseForDay(day: number): PhaseNumber {
  if (day <= 15) return 1;
  if (day <= 30) return 2;
  if (day <= 45) return 3;
  if (day <= 60) return 4;
  if (day <= 75) return 5;
  return 6;
}

export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

/* ------------------------------------------------------------------ */
/*  Lesson Step Types & Rotation Patterns                              */
/* ------------------------------------------------------------------ */

export type LessonStepType =
  | "animated-intro"
  | "concept-explanation"
  | "concept-visual"
  | "real-world-example"
  | "mini-game"
  | "knowledge-check"
  | "practical-challenge"
  | "guided-sandbox"
  | "ai-tutor"
  | "reveal-card"
  | "xp-reward"
  | "daily-completion";

export interface LessonStep {
  type: LessonStepType;
  label: string;
  durationMinutes: number;
  xpReward: number;
}

/** 8 distinct step sequence patterns to prevent repetitive journeys */
export const STEP_PATTERNS: LessonStepType[][] = [
  // Pattern 0: Concept -> Visual -> Mini-Game -> Knowledge Check -> Lab -> XP
  ["concept-explanation", "concept-visual", "mini-game", "knowledge-check", "guided-sandbox", "xp-reward", "daily-completion"],
  // Pattern 1: Intro -> Real-World -> Concept -> Mini-Game -> Practical Challenge -> XP
  ["animated-intro", "real-world-example", "concept-explanation", "mini-game", "practical-challenge", "xp-reward", "daily-completion"],
  // Pattern 2: Visual Pipeline -> Mini-Game -> Concept -> AI Tutor -> Knowledge Check -> XP
  ["concept-visual", "mini-game", "concept-explanation", "ai-tutor", "knowledge-check", "xp-reward", "daily-completion"],
  // Pattern 3: Real-World Case -> Practical Lab -> Concept Visual -> Knowledge Check -> XP
  ["real-world-example", "guided-sandbox", "concept-visual", "knowledge-check", "ai-tutor", "xp-reward", "daily-completion"],
  // Pattern 4: Mini-Game Opener -> Deep Concept -> Sandbox Lab -> Knowledge Check -> XP
  ["mini-game", "concept-explanation", "guided-sandbox", "knowledge-check", "reveal-card", "xp-reward", "daily-completion"],
  // Pattern 5: Reveal Card -> Architecture Visual -> Mini-Game -> Knowledge Check -> XP
  ["reveal-card", "concept-visual", "mini-game", "knowledge-check", "guided-sandbox", "xp-reward", "daily-completion"],
  // Pattern 6: Capstone Project Pattern (Phase 6 Days 76-89)
  ["concept-explanation", "guided-sandbox", "practical-challenge", "ai-tutor", "xp-reward", "daily-completion"],
  // Pattern 7: Assessment Day Pattern (Day 90)
  ["animated-intro", "concept-explanation", "knowledge-check", "practical-challenge", "xp-reward", "daily-completion"],
];

export function getStepPatternForDay(day: number, phase: PhaseNumber): number {
  if (day === 90) return 7;
  if (phase === 6) return 6;
  return (day - 1) % 6; // Rotates through patterns 0-5
}

/* ------------------------------------------------------------------ */
/*  Mini-Game Definitions (54 games across 6 tracks)                   */
/* ------------------------------------------------------------------ */

export type JavaGameType =
  | "syntax-scramble"
  | "bug-hunter"
  | "oop-architecture-match"
  | "spring-boot-route-builder"
  | "sql-query-constructor"
  | "memory-leak-detective"
  | "microservice-flow-connect"
  | "thread-race-predictor"
  | "cicd-deployment-runner";

export type AIMLGameType =
  | "prompt-engineering-sandbox"
  | "neural-architecture-connect"
  | "loss-function-optimizer"
  | "tokenization-visualizer"
  | "bias-fairness-auditor"
  | "rag-pipeline-constructor"
  | "fine-tuning-parameter-tuner"
  | "model-evaluation-benchmarker"
  | "ai-agent-workflow-builder";

export type DataScienceGameType =
  | "data-cleaning-pipeline"
  | "feature-engineering-match"
  | "statistical-distribution-matcher"
  | "regression-line-fitter"
  | "sql-window-function-builder"
  | "confusion-matrix-diagnostic"
  | "ab-testing-simulator"
  | "time-series-anomaly-hunt"
  | "dashboard-metric-selector";

export type MedicalGameType =
  | "icd10-code-detective"
  | "cpt-modifier-matcher"
  | "anatomical-system-matcher"
  | "medical-chart-decoder"
  | "bundling-unbundling-audit"
  | "hcpcs-level-ii-finder"
  | "claim-denial-sleuth"
  | "hcc-risk-score-calculator"
  | "hipaa-compliance-checker";

export type MarketingGameType =
  | "ad-copy-hook-matcher"
  | "campaign-budget-allocator"
  | "keyword-match-type-sorter"
  | "conversion-funnel-fixer"
  | "email-subject-line-tester"
  | "seo-meta-tag-optimizer"
  | "audience-persona-matcher"
  | "roas-cac-calculator"
  | "attribution-modeling-lab";

export type SAPGameType =
  | "tcode-speed-match"
  | "gl-account-posting-simulator"
  | "document-split-diagnostic"
  | "fiscal-year-variant-configurator"
  | "cost-center-allocation-wheel"
  | "asset-depreciation-calculator"
  | "reconciliation-account-matcher"
  | "financial-statement-builder"
  | "period-end-closing-runner";

export type MiniGameType =
  | JavaGameType
  | AIMLGameType
  | DataScienceGameType
  | MedicalGameType
  | MarketingGameType
  | SAPGameType;

/* ------------------------------------------------------------------ */
/*  Mini-Game Data Payloads                                            */
/* ------------------------------------------------------------------ */

export interface MatchPairData {
  kind: "match-pairs";
  pairs: { left: string; right: string }[];
}

export interface PredictOutputData {
  kind: "predict-output";
  code: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ArrangeBlocksData {
  kind: "arrange-blocks";
  description: string;
  blocks: { id: string; code: string; order: number }[];
}

export interface MCQChallengeData {
  kind: "mcq-challenge";
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface DragClassifyData {
  kind: "drag-classify";
  categories: string[];
  items: { id: string; content: string; category: string }[];
}

export interface FindErrorsData {
  kind: "find-errors";
  code: string;
  errors: { line: number; description: string }[];
}

export interface PipelineBuilderData {
  kind: "pipeline-builder";
  description: string;
  stages: string[];
  correctOrder: number[];
}

export interface FillBlanksData {
  kind: "fill-blanks";
  template: string;
  blanks: { placeholder: string; answer: string; options: string[] }[];
}

export type MiniGameData =
  | MatchPairData
  | PredictOutputData
  | ArrangeBlocksData
  | MCQChallengeData
  | DragClassifyData
  | FindErrorsData
  | PipelineBuilderData
  | FillBlanksData;

export interface MiniGameConfig {
  gameType: MiniGameType;
  title: string;
  instruction: string;
  difficulty: number; // 1-5
  timeLimitSeconds: number;
  perfectXpBonus: number;
  data: MiniGameData;
}

/* ------------------------------------------------------------------ */
/*  Animation Pipeline Nodes                                           */
/* ------------------------------------------------------------------ */

export interface AnimationNode {
  id: string;
  label: string;
  sublabel: string;
  iconName: string;
  role: string;
}

export interface AnimationPipeline {
  family: string;
  nodes: AnimationNode[];
}

/* ------------------------------------------------------------------ */
/*  Knowledge Checks                                                   */
/* ------------------------------------------------------------------ */

export interface CheckOption {
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface LessonKnowledgeCheck {
  question: string;
  options: CheckOption[];
  explanation?: string | undefined;
}

/* ------------------------------------------------------------------ */
/*  Course Day Lesson                                                  */
/* ------------------------------------------------------------------ */

export interface ProjectMilestone {
  day: number;
  title: string;
  deliverable: string;
  acceptanceCriteria: string[];
}

export interface ProjectConfig {
  projectTitle: string;
  overview: string;
  techStack: string[];
  milestone: ProjectMilestone;
  starterCodeRepo?: string | undefined;
  evaluationRubric: { criteria: string; weight: number }[];
}

export interface CourseDayLesson {
  courseId: TrackId;
  day: number;
  phase: PhaseNumber;
  phaseName: string;
  title: string;
  description: string;
  learningObjectives: string[];
  estimatedMinutes: number;
  difficulty: DifficultyLevel;
  steps: LessonStep[];
  animationPipeline: AnimationPipeline;
  miniGame: MiniGameConfig | null;
  knowledgeCheck: LessonKnowledgeCheck;
  realWorldExample: {
    scenario: string;
    application: string;
    industry: string;
  };
  isProjectDay: boolean;
  projectConfig?: ProjectConfig | undefined;
}

export type CourseCurriculum = Record<number, CourseDayLesson>;
