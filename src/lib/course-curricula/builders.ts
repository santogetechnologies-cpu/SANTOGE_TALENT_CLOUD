/**
 * SantoGe Talent Cloud — Curriculum Builder Helpers
 *
 * Utility functions to construct CourseDayLesson objects with less boilerplate.
 * Used by each course curriculum file.
 */

import type { TrackId } from "@/lib/tracks";
import type {
  CourseDayLesson,
  PhaseNumber,
  DifficultyLevel,
  LessonStep,
  LessonStepType,
  AnimationPipeline,
  MiniGameConfig,
  LessonKnowledgeCheck,
  MiniGameType,
  MiniGameData,
} from "./types";
import { PHASE_NAMES, getPhaseForDay, STEP_PATTERNS, getStepPatternForDay } from "./types";

/* ------------------------------------------------------------------ */
/*  Step Builder                                                       */
/* ------------------------------------------------------------------ */

const STEP_DEFAULTS: Record<LessonStepType, Omit<LessonStep, "type">> = {
  "animated-intro":      { label: "Intro",             durationMinutes: 1, xpReward: 0  },
  "concept-explanation": { label: "Concept",           durationMinutes: 2, xpReward: 0  },
  "concept-visual":      { label: "Architecture",      durationMinutes: 2, xpReward: 0  },
  "real-world-example":  { label: "Real World",        durationMinutes: 2, xpReward: 5  },
  "mini-game":           { label: "Mini Game",         durationMinutes: 3, xpReward: 20 },
  "knowledge-check":     { label: "Knowledge Check",   durationMinutes: 2, xpReward: 15 },
  "practical-challenge": { label: "Practical",         durationMinutes: 4, xpReward: 25 },
  "guided-sandbox":      { label: "Guided Lab",        durationMinutes: 4, xpReward: 25 },
  "ai-tutor":            { label: "AI Tutor",          durationMinutes: 2, xpReward: 5  },
  "reveal-card":         { label: "Reveal",            durationMinutes: 1, xpReward: 0  },
  "xp-reward":           { label: "XP Reward",         durationMinutes: 0, xpReward: 0  },
  "daily-completion":    { label: "Complete",          durationMinutes: 0, xpReward: 0  },
};

export function buildSteps(pattern: LessonStepType[]): LessonStep[] {
  return pattern.map((type) => ({
    type,
    ...STEP_DEFAULTS[type],
  }));
}

/* ------------------------------------------------------------------ */
/*  Difficulty by Phase                                                */
/* ------------------------------------------------------------------ */

export function difficultyForPhase(phase: PhaseNumber): DifficultyLevel {
  if (phase <= 2) return "beginner";
  if (phase <= 3) return "intermediate";
  if (phase <= 5) return "advanced";
  return "expert";
}

/* ------------------------------------------------------------------ */
/*  Lesson Builder                                                     */
/* ------------------------------------------------------------------ */

export interface LessonInput {
  day: number;
  title: string;
  description: string;
  learningObjectives: string[];
  animationPipeline: AnimationPipeline;
  miniGame: MiniGameConfig | null;
  knowledgeCheck: LessonKnowledgeCheck;
  realWorldExample: { scenario: string; application: string; industry: string };
  projectConfig?: CourseDayLesson["projectConfig"];
}

export function buildLesson(courseId: TrackId, input: LessonInput): CourseDayLesson {
  const phase = getPhaseForDay(input.day);
  const patternIdx = getStepPatternForDay(input.day, phase);
  const stepPattern = STEP_PATTERNS[patternIdx]!;

  // Filter out mini-game step if no mini-game for this day
  const effectivePattern = input.miniGame
    ? stepPattern
    : stepPattern.filter((s) => s !== "mini-game");

  return {
    courseId,
    day: input.day,
    phase,
    phaseName: PHASE_NAMES[phase],
    title: input.title,
    description: input.description,
    learningObjectives: input.learningObjectives,
    estimatedMinutes: effectivePattern.reduce(
      (sum, type) => sum + (STEP_DEFAULTS[type]?.durationMinutes ?? 0),
      0,
    ),
    difficulty: difficultyForPhase(phase),
    steps: buildSteps(effectivePattern),
    animationPipeline: input.animationPipeline,
    miniGame: input.miniGame,
    knowledgeCheck: input.knowledgeCheck,
    realWorldExample: input.realWorldExample,
    isProjectDay: phase === 6,
    projectConfig: input.projectConfig,
  };
}

/* ------------------------------------------------------------------ */
/*  Quick MCQ Builder                                                  */
/* ------------------------------------------------------------------ */

export function mcq(
  question: string,
  correct: string,
  correctExplanation: string,
  wrong1: string,
  wrong1Explanation: string,
  wrong2: string,
  wrong2Explanation: string,
  wrong3: string,
  wrong3Explanation: string,
): LessonKnowledgeCheck {
  return {
    question,
    options: [
      { text: correct, isCorrect: true, explanation: correctExplanation },
      { text: wrong1, isCorrect: false, explanation: wrong1Explanation },
      { text: wrong2, isCorrect: false, explanation: wrong2Explanation },
      { text: wrong3, isCorrect: false, explanation: wrong3Explanation },
    ],
  };
}

/* ------------------------------------------------------------------ */
/*  Quick Mini-Game Builders                                           */
/* ------------------------------------------------------------------ */

export function matchGame(
  gameType: MiniGameType,
  title: string,
  instruction: string,
  difficulty: number,
  pairs: { left: string; right: string }[],
): MiniGameConfig {
  return {
    gameType,
    title,
    instruction,
    difficulty,
    timeLimitSeconds: 60 + difficulty * 15,
    perfectXpBonus: 10 + difficulty * 5,
    data: { kind: "match-pairs", pairs },
  };
}

export function predictGame(
  gameType: MiniGameType,
  title: string,
  code: string,
  options: string[],
  correctIndex: number,
  explanation: string,
  difficulty: number,
): MiniGameConfig {
  return {
    gameType,
    title,
    instruction: "Read the code and predict what the output will be.",
    difficulty,
    timeLimitSeconds: 45 + difficulty * 10,
    perfectXpBonus: 10 + difficulty * 5,
    data: { kind: "predict-output", code, options, correctIndex, explanation },
  };
}

export function arrangeGame(
  gameType: MiniGameType,
  title: string,
  description: string,
  blocks: { id: string; code: string; order: number }[],
  difficulty: number,
): MiniGameConfig {
  return {
    gameType,
    title,
    instruction: description,
    difficulty,
    timeLimitSeconds: 60 + difficulty * 15,
    perfectXpBonus: 10 + difficulty * 5,
    data: { kind: "arrange-blocks", blocks, description },
  };
}

export function mcqGame(
  gameType: MiniGameType,
  title: string,
  instruction: string,
  questions: { question: string; options: string[]; correctIndex: number; explanation: string }[],
  difficulty: number,
): MiniGameConfig {
  return {
    gameType,
    title,
    instruction,
    difficulty,
    timeLimitSeconds: 60 + difficulty * 20,
    perfectXpBonus: 10 + difficulty * 5,
    data: { kind: "mcq-challenge", questions },
  };
}

export function classifyGame(
  gameType: MiniGameType,
  title: string,
  instruction: string,
  items: { id: string; content: string; category: string }[],
  categories: string[],
  difficulty: number,
): MiniGameConfig {
  return {
    gameType,
    title,
    instruction,
    difficulty,
    timeLimitSeconds: 60 + difficulty * 15,
    perfectXpBonus: 10 + difficulty * 5,
    data: { kind: "drag-classify", items, categories },
  };
}

export function errorGame(
  gameType: MiniGameType,
  title: string,
  code: string,
  errors: { line: number; description: string }[],
  difficulty: number,
): MiniGameConfig {
  return {
    gameType,
    title,
    instruction: "Find and identify all the errors in the code below.",
    difficulty,
    timeLimitSeconds: 90 + difficulty * 15,
    perfectXpBonus: 15 + difficulty * 5,
    data: { kind: "find-errors", code, errors },
  };
}

export function pipelineGame(
  gameType: MiniGameType,
  title: string,
  description: string,
  stages: string[],
  correctOrder: number[],
  difficulty: number,
): MiniGameConfig {
  return {
    gameType,
    title,
    instruction: description,
    difficulty,
    timeLimitSeconds: 60 + difficulty * 15,
    perfectXpBonus: 10 + difficulty * 5,
    data: { kind: "pipeline-builder", stages, correctOrder, description },
  };
}

export function fillBlanksGame(
  gameType: MiniGameType,
  title: string,
  template: string,
  blanks: { placeholder: string; answer: string; options: string[] }[],
  difficulty: number,
): MiniGameConfig {
  return {
    gameType,
    title,
    instruction: "Fill in the blanks to complete the code or statement correctly.",
    difficulty,
    timeLimitSeconds: 60 + difficulty * 15,
    perfectXpBonus: 10 + difficulty * 5,
    data: { kind: "fill-blanks", template, blanks },
  };
}

/* ------------------------------------------------------------------ */
/*  Animation Pipeline Shortcuts                                       */
/* ------------------------------------------------------------------ */

export function pipeline(family: string, ...nodes: [string, string, string, string][]): AnimationPipeline {
  return {
    family,
    nodes: nodes.map(([id, label, sublabel, role], _i) => ({
      id,
      label,
      sublabel,
      iconName: "Cpu",
      role,
    })),
  };
}

export function realWorld(scenario: string, application: string, industry: string) {
  return { scenario, application, industry };
}
