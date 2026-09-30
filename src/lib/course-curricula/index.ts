/**
 * SantoGe Talent Cloud — 90-Day Specialized Technical Learning System
 * Unified Master Curricula Accessor for all 6 Technical Tracks (540 Lessons Total)
 */

import type { TrackId } from "@/lib/tracks";
import type { CourseCurriculum, CourseDayLesson } from "./types";
import { JAVA_CURRICULUM } from "./java-curriculum";
import { AIML_CURRICULUM } from "./aiml-curriculum";
import { DATASCIENCE_CURRICULUM } from "./datascience-curriculum";
import { MEDICAL_CURRICULUM } from "./medical-curriculum";
import { MARKETING_CURRICULUM } from "./marketing-curriculum";
import { SAP_CURRICULUM } from "./sap-curriculum";

export * from "./types";
export * from "./builders";
export { JAVA_CURRICULUM } from "./java-curriculum";
export { AIML_CURRICULUM } from "./aiml-curriculum";
export { DATASCIENCE_CURRICULUM } from "./datascience-curriculum";
export { MEDICAL_CURRICULUM } from "./medical-curriculum";
export { MARKETING_CURRICULUM } from "./marketing-curriculum";
export { SAP_CURRICULUM } from "./sap-curriculum";

// Aliases for convenience
export const javaCurriculum = JAVA_CURRICULUM;
export const aimlCurriculum = AIML_CURRICULUM;
export const datascienceCurriculum = DATASCIENCE_CURRICULUM;
export const medicalCurriculum = MEDICAL_CURRICULUM;
export const marketingCurriculum = MARKETING_CURRICULUM;
export const sapCurriculum = SAP_CURRICULUM;

export const CURRICULA_MAP: Record<TrackId, CourseCurriculum> = {
  java: JAVA_CURRICULUM,
  aiml: AIML_CURRICULUM,
  datascience: DATASCIENCE_CURRICULUM,
  medical: MEDICAL_CURRICULUM,
  marketing: MARKETING_CURRICULUM,
  sap: SAP_CURRICULUM,
};

/**
 * Retrieve the full 90-day curriculum (Record<number, CourseDayLesson>) for a specified track.
 */
export function getCourseCurriculum(courseId: TrackId): CourseCurriculum {
  const curriculum = CURRICULA_MAP[courseId];
  if (!curriculum) {
    throw new Error(`Unknown technical track: ${courseId}`);
  }
  return curriculum;
}

/**
 * Retrieve a specific day's lesson (1 to 90) for a given course track.
 */
export function getLessonForDay(courseId: TrackId, day: number): CourseDayLesson | null {
  const curriculum = CURRICULA_MAP[courseId];
  if (!curriculum) return null;
  const clampedDay = Math.max(1, Math.min(90, Math.floor(day)));
  return curriculum[clampedDay] ?? null;
}

/**
 * Retrieve all 90 lessons for a course track in sequential array order.
 */
export function getAllLessonsForCourse(courseId: TrackId): CourseDayLesson[] {
  const curriculum = CURRICULA_MAP[courseId];
  if (!curriculum) return [];
  return Object.values(curriculum).sort((a, b) => a.day - b.day);
}

/**
 * Returns total count of unique daily lessons across all 6 courses (should equal 540).
 */
export function getTotalLessonCount(): number {
  return Object.values(CURRICULA_MAP).reduce((sum, c) => sum + Object.keys(c).length, 0);
}
