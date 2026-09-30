/**
 * SantoGe Talent Cloud — Placement Accelerator Builders
 *
 * Constructs full AcceleratorDay instances from PlacementDaySpec definitions.
 */

import type { TrackId } from "@/lib/tracks";
import type { AcceleratorDay } from "@/lib/placement-accelerator-data";
import type { PlacementDaySpec, PlacementDifficulty } from "./types";

export function getDifficultyForDay(day: number): PlacementDifficulty {
  if (day <= 15) return "beginner";
  if (day <= 30) return "beginner";
  if (day <= 45) return "intermediate";
  if (day <= 60) return "intermediate";
  if (day <= 75) return "advanced";
  return "expert";
}

const DAYS_OF_WEEK: Array<AcceleratorDay["dayOfWeek"]> = [
  "Day 1 (Mon)",
  "Day 2 (Tue)",
  "Day 3 (Wed)",
  "Day 4 (Thu)",
  "Day 5 (Fri)",
];

export function buildPlacementDay(courseId: TrackId, spec: PlacementDaySpec): AcceleratorDay {
  const week = Math.max(1, Math.ceil(spec.day / 5));
  const dayIdx = (spec.day - 1) % 5;
  const dayOfWeek = DAYS_OF_WEEK[dayIdx] || "Day 1 (Mon)";
  const isFriday = dayIdx === 4;
  const isFinalChallenge = spec.day === 90;

  const difficulty = getDifficultyForDay(spec.day);

  // Extended scenario object for CommunicationInteraction
  const communicationScenario = {
    activityType: spec.commType,
    context: `[${spec.commType.toUpperCase().replace(/-/g, " ")}] ${spec.commScenario}`,
    prompt: spec.commPrompt,
    optionA: {
      text: spec.commWeakResponse,
      isStrong: false,
      critique: spec.commWeakCritique,
    },
    optionB: {
      text: spec.commStrongResponse,
      isStrong: true,
      critique: spec.commStrongCritique,
    },
    coachTip: spec.commCoachTip,
  };

  return {
    day: spec.day,
    week,
    dayOfWeek,
    theme: `${spec.commTitle} & ${spec.aptTopic}`,
    isFridayAssessment: isFriday,

    // 10 Mins English / Communication Instructor Plan
    english: {
      title: spec.commTitle,
      instructorBrief: `${spec.commPrompt} Context: ${spec.commScenario}`,
      keyVocabulary: [...spec.commVocab],
      grammarRule: spec.commRule,
      deliveryTimeline: "00:00-03:00 Context & Framing | 03:00-07:00 Model Response Drill | 07:00-10:00 Student Delivery",
      // Attached scenario for rich course-specific interaction
      ...( { scenario: communicationScenario } as any ),
    },

    // 10 Mins Aptitude Instructor Plan
    aptitude: {
      title: `${spec.aptTopic}: ${spec.aptTitle}`,
      instructorBrief: spec.aptQuestion,
      formulaShortcut: spec.aptFormula,
      solvedExample: `Q: ${spec.aptQuestion}\nCorrect: ${spec.aptOptions[spec.aptAnswer]}\nExplanation: ${spec.aptExplanation}`,
      deliveryTimeline: "00:00-03:00 Concept Model | 03:00-07:00 Step-by-Step Calculation | 07:00-10:00 Verification Drill",
    },

    // 10 Mins In-App Guided Practice
    practice: {
      duration: "10 Mins",
      instructions: "Execute today's quantitative aptitude question and analytical logic challenge.",
      mcqs: [
        {
          q: spec.aptQuestion,
          options: [...spec.aptOptions],
          answer: spec.aptAnswer,
          explanation: spec.aptExplanation,
          category: "Aptitude",
        },
      ],
      puzzle: {
        q: spec.logicQuestion,
        options: [...spec.logicOptions],
        answer: spec.logicAnswer,
        explanation: spec.logicExplanation,
      },
      voicePrompt: {
        prompt: spec.commPrompt,
        targetKeywords: [...spec.commVocab],
        starCategory: "Full STAR",
      },
    },

    // Extended course-specific metadata
    ...( {
      courseId,
      difficulty,
      isFinalChallenge,
      communicationScenario,
    } as any ),
  };
}
