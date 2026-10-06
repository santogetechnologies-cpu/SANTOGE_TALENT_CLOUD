/**
 * SantoGe Talent Cloud — 90-Day Specialized Technical Learning System
 * Unified Master Curricula Accessor for the 3 Core Technical Tracks (270 Interactive Lessons Total)
 *
 * 1. Full Stack & AI Software Engineering (HTML, CSS, JS, React, Node, Java, Spring Boot, REST, MySQL, NoSQL, Python, LLMs, RAG, Docker, AWS)
 * 2. Data Analysis (Excel, SQL, Python, NumPy, Pandas, Matplotlib, Seaborn, Power BI, Tableau)
 * 3. AI & ML Engineer (Python, SQL, NumPy, Pandas, Scikit-learn, PyTorch/TensorFlow, NLP, Transformers, GenAI/LLMs, RAG, LangChain, FastAPI, PostgreSQL, Git, AWS)
 */

import type { TrackId } from "@/lib/tracks";
import type { CourseCurriculum, CourseDayLesson } from "./types";
import { JAVA_CURRICULUM } from "./java-curriculum";
import { AIML_CURRICULUM } from "./aiml-curriculum";
import { DATASCIENCE_CURRICULUM } from "./datascience-curriculum";

export * from "./types";
export * from "./builders";
export { JAVA_CURRICULUM } from "./java-curriculum";
export { AIML_CURRICULUM } from "./aiml-curriculum";
export { DATASCIENCE_CURRICULUM } from "./datascience-curriculum";

// Aliases for convenience
export const javaCurriculum = JAVA_CURRICULUM;
export const aimlCurriculum = AIML_CURRICULUM;
export const datascienceCurriculum = DATASCIENCE_CURRICULUM;

export const CURRICULA_MAP: Record<TrackId, CourseCurriculum> = {
  java: JAVA_CURRICULUM,
  datascience: DATASCIENCE_CURRICULUM,
  aiml: AIML_CURRICULUM,
};

/**
 * Retrieve the full 90-day curriculum (Record<number, CourseDayLesson>) for a specified track.
 */
export function getCourseCurriculum(courseId: TrackId): CourseCurriculum {
  const curriculum = CURRICULA_MAP[courseId] || CURRICULA_MAP.java;
  return curriculum;
}

/**
 * Retrieve a specific day's lesson (1 to 90) for a given course track.
 * All 90 days are active interactive learning sessions.
 */
export function getLessonForDay(courseId: TrackId, day: number): CourseDayLesson | null {
  const curriculum = CURRICULA_MAP[courseId] || CURRICULA_MAP.java;
  if (!curriculum) return null;
  const clampedDay = Math.max(1, Math.min(90, Math.floor(day)));
  return curriculum[clampedDay] ?? null;
}
