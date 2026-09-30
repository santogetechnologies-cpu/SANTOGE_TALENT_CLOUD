/**
 * SantoGe Talent Cloud — Master Placement Accelerator Curricula Registry
 * 
 * Unifies the 6 Authoritative Courses (90 Days each = 540 Days = 1,620 Activities):
 * - java: Java Full Stack
 * - aiml: AI / ML & GenAI
 * - datascience: Data Science
 * - medical: Medical Coding
 * - marketing: Digital Marketing
 * - sap: SAP FICO
 */

import type { AcceleratorDay } from "@/lib/placement-accelerator-data";
import type { CoursePlacementCurriculum } from "./types";

import { JAVA_PLACEMENT_CURRICULUM } from "./java-placement";
import { AIML_PLACEMENT_CURRICULUM } from "./aiml-placement";
import { DATASCIENCE_PLACEMENT_CURRICULUM } from "./datascience-placement";
import { MEDICAL_PLACEMENT_CURRICULUM } from "./medical-placement";
import { MARKETING_PLACEMENT_CURRICULUM } from "./marketing-placement";
import { SAP_PLACEMENT_CURRICULUM } from "./sap-placement";

export * from "./types";
export * from "./builders";
export {
  JAVA_PLACEMENT_CURRICULUM,
  AIML_PLACEMENT_CURRICULUM,
  DATASCIENCE_PLACEMENT_CURRICULUM,
  MEDICAL_PLACEMENT_CURRICULUM,
  MARKETING_PLACEMENT_CURRICULUM,
  SAP_PLACEMENT_CURRICULUM,
};

export const AUTHORITATIVE_COURSES = [
  "java",
  "aiml",
  "datascience",
  "medical",
  "marketing",
  "sap",
] as const;

export type AuthoritativeCourseId = typeof AUTHORITATIVE_COURSES[number];

export const COURSE_PLACEMENT_MAP: Record<AuthoritativeCourseId, CoursePlacementCurriculum> = {
  java: JAVA_PLACEMENT_CURRICULUM,
  aiml: AIML_PLACEMENT_CURRICULUM,
  datascience: DATASCIENCE_PLACEMENT_CURRICULUM,
  medical: MEDICAL_PLACEMENT_CURRICULUM,
  marketing: MARKETING_PLACEMENT_CURRICULUM,
  sap: SAP_PLACEMENT_CURRICULUM,
};

/**
 * Normalizes an arbitrary course string or TrackId to one of the 6 authoritative tracks.
 */
export function normalizeCourseId(courseId?: string | null): AuthoritativeCourseId {
  if (!courseId) return "java";
  const normalized = courseId.toLowerCase().trim().replace(/[-_\s]/g, "");

  if (normalized.includes("aiml") || normalized.includes("genai") || normalized === "ai" || normalized === "ml") {
    return "aiml";
  }
  if (normalized.includes("datascience") || normalized.includes("data") || normalized === "ds") {
    return "datascience";
  }
  if (normalized.includes("medical") || normalized.includes("clinical") || normalized.includes("coding")) {
    return "medical";
  }
  if (normalized.includes("marketing") || normalized.includes("digital") || normalized === "dm") {
    return "marketing";
  }
  if (normalized.includes("sap") || normalized.includes("fico")) {
    return "sap";
  }
  // Default to java for java, fullstack, backend, or unrecognized
  return "java";
}

/**
 * Retrieves the course-specific, day-specific Placement Accelerator content.
 * 
 * Guaranteed non-null: defaults safely to day 1 or clamped day 1-90,
 * and falls back to Java if track is unrecognized.
 */
export function getCoursePlacementDay(
  courseId: string | null | undefined,
  dayNum: number
): AcceleratorDay {
  const authoritativeCourse = normalizeCourseId(courseId);
  const curriculum = COURSE_PLACEMENT_MAP[authoritativeCourse] || JAVA_PLACEMENT_CURRICULUM;
  const clampedDay = Math.max(1, Math.min(90, Math.floor(dayNum || 1)));

  const dayData = curriculum[clampedDay];
  if (dayData) {
    return dayData;
  }

  // Graceful fallback to Day 1 of course, or Day 1 of Java
  return (curriculum[1] || JAVA_PLACEMENT_CURRICULUM[1])!;
}

/**
 * Validates integrity across all 6 courses × 90 days = 540 placement sets (1,620 activities).
 */
export function validateAllPlacementCurricula(): {
  isValid: boolean;
  totalCourses: number;
  totalDays: number;
  totalActivities: number;
  errors: string[];
} {
  const errors: string[] = [];
  let totalDays = 0;
  let totalActivities = 0;

  for (const course of AUTHORITATIVE_COURSES) {
    const curriculum = COURSE_PLACEMENT_MAP[course];
    if (!curriculum) {
      errors.push(`Missing curriculum for course: ${course}`);
      continue;
    }

    for (let day = 1; day <= 90; day++) {
      totalDays++;
      const data = curriculum[day];
      if (!data) {
        errors.push(`Missing day ${day} for course: ${course}`);
        continue;
      }

      // Check Communication (Activity 1)
      totalActivities++;
      if (!data.english?.title || !data.english?.instructorBrief) {
        errors.push(`Invalid English communication for ${course} Day ${day}`);
      }

      // Check Quantitative Aptitude (Activity 2)
      totalActivities++;
      const aptitudeMcq = data.practice?.mcqs?.[0];
      if (!aptitudeMcq) {
        errors.push(`Missing Aptitude MCQ for ${course} Day ${day}`);
      } else {
        if (!aptitudeMcq.q || !aptitudeMcq.options || aptitudeMcq.options.length !== 4) {
          errors.push(`Aptitude MCQ options count !== 4 for ${course} Day ${day}`);
        }
        if (typeof aptitudeMcq.answer !== "number" || aptitudeMcq.answer < 0 || aptitudeMcq.answer > 3) {
          errors.push(`Invalid Aptitude answer for ${course} Day ${day}`);
        }
        if (!aptitudeMcq.explanation) {
          errors.push(`Missing Aptitude explanation for ${course} Day ${day}`);
        }
      }

      // Check Analytical Logic (Activity 3)
      totalActivities++;
      const puzzle = data.practice?.puzzle;
      if (!puzzle) {
        errors.push(`Missing Logic puzzle for ${course} Day ${day}`);
      } else {
        if (!puzzle.q || !puzzle.options || puzzle.options.length !== 4) {
          errors.push(`Logic puzzle options count !== 4 for ${course} Day ${day}`);
        }
        if (typeof puzzle.answer !== "number" || puzzle.answer < 0 || puzzle.answer > 3) {
          errors.push(`Invalid Logic answer index for ${course} Day ${day}`);
        }
        if (!puzzle.explanation) {
          errors.push(`Missing Logic explanation for ${course} Day ${day}`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    totalCourses: AUTHORITATIVE_COURSES.length,
    totalDays,
    totalActivities,
    errors,
  };
}
