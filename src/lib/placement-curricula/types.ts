/**
 * SantoGe Talent Cloud — 90-Day Course-Specific Placement Accelerator Types
 * 
 * Defines schemas for the 6 authoritative technical courses:
 * - java: Java Full Stack
 * - aiml: AI / ML & GenAI
 * - datascience: Data Science
 * - medical: Medical Coding
 * - marketing: Digital Marketing
 * - sap: SAP FICO
 */

import type { TrackId } from "@/lib/tracks";
import type { AcceleratorDay } from "@/lib/placement-accelerator-data";

export type PlacementDifficulty = "beginner" | "intermediate" | "advanced" | "expert";

export type CommunicationActivityType =
  | "interview-question"
  | "technical-explanation"
  | "client-conversation"
  | "team-communication"
  | "workplace-scenario"
  | "problem-explanation"
  | "project-explanation"
  | "technical-presentation"
  | "email-response"
  | "manager-conversation"
  | "hr-question"
  | "conflict-resolution"
  | "requirement-clarification"
  | "technical-to-nontechnical";

export type AptitudeTopic =
  | "Percentages & Growth"
  | "Ratios & Proportions"
  | "Averages & Distributions"
  | "Profit, Margin & ROI"
  | "Time, Work & Capacity"
  | "Speed, Latency & Distance"
  | "Probability & Reliability"
  | "Combinatorics & Permutations"
  | "Number Systems & Units"
  | "Data Interpretation & Metrics"
  | "Statistics & Dispersion"
  | "Financial & Business Math";

export type LogicType =
  | "Sequence Reasoning"
  | "Workflow Ordering"
  | "Deductive Analysis"
  | "Constraint Solving"
  | "Debugging Logic"
  | "Process Flow"
  | "Cause & Effect"
  | "Decision Architecture";

export interface PlacementDaySpec {
  day: number;
  // Communication
  commType: CommunicationActivityType;
  commTitle: string;
  commScenario: string;
  commPrompt: string;
  commVocab: [string, string] | [string, string, string];
  commRule: string;
  commWeakResponse: string;
  commWeakCritique: string;
  commStrongResponse: string;
  commStrongCritique: string;
  commCoachTip: string;

  // Quantitative Aptitude
  aptTopic: AptitudeTopic;
  aptTitle: string;
  aptQuestion: string;
  aptOptions: [string, string, string, string];
  aptAnswer: number; // 0, 1, 2, or 3
  aptExplanation: string;
  aptFormula: string;

  // Analytical Logic
  logicType: LogicType;
  logicTitle: string;
  logicQuestion: string;
  logicOptions: [string, string, string, string];
  logicAnswer: number; // 0, 1, 2, or 3
  logicExplanation: string;
}

export type CoursePlacementCurriculum = Record<number, AcceleratorDay>;
