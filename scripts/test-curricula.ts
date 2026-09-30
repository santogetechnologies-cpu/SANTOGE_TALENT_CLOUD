import {
  CURRICULA_MAP,
  getTotalLessonCount,
  getLessonForDay,
  getAllLessonsForCourse,
} from "../src/lib/course-curricula";
import type { TrackId } from "../src/lib/tracks";

const tracks: TrackId[] = ["java", "aiml", "datascience", "medical", "marketing", "sap"];

console.log("=== SANTOGE TALENT CLOUD: 90-DAY TECHNICAL CURRICULUM VERIFICATION ===");

const totalCount = getTotalLessonCount();
console.log(`Total Lessons Across All Tracks: ${totalCount} (Expected: 540)`);
if (totalCount !== 540) {
  console.error(`FAILED: Expected 540 lessons, found ${totalCount}`);
  process.exit(1);
}

for (const track of tracks) {
  const lessons = getAllLessonsForCourse(track);
  console.log(`Track [${track}]: ${lessons.length} lessons`);
  if (lessons.length !== 90) {
    console.error(`FAILED: Track ${track} has ${lessons.length} lessons instead of 90`);
    process.exit(1);
  }

  for (let day = 1; day <= 90; day++) {
    const lesson = getLessonForDay(track, day);
    if (!lesson) {
      console.error(`FAILED: Missing lesson for ${track} day ${day}`);
      process.exit(1);
    }
    if (!lesson.title || lesson.title.trim().length === 0) {
      console.error(`FAILED: Empty title for ${track} day ${day}`);
      process.exit(1);
    }
    if (!lesson.description || lesson.description.trim().length === 0) {
      console.error(`FAILED: Empty description for ${track} day ${day}`);
      process.exit(1);
    }
    if (!lesson.learningObjectives || lesson.learningObjectives.length < 3) {
      console.error(`FAILED: Insufficient objectives for ${track} day ${day}`);
      process.exit(1);
    }
    if (!lesson.animationPipeline?.nodes || lesson.animationPipeline.nodes.length !== 4) {
      console.error(`FAILED: Pipeline nodes count not 4 for ${track} day ${day}`);
      process.exit(1);
    }
    if (!lesson.knowledgeCheck?.options || lesson.knowledgeCheck.options.length !== 4) {
      console.error(`FAILED: MCQ options count not 4 for ${track} day ${day}`);
      process.exit(1);
    }
    if (!lesson.realWorldExample?.scenario || !lesson.realWorldExample?.application) {
      console.error(`FAILED: Missing real world example for ${track} day ${day}`);
      process.exit(1);
    }
    if (day >= 76) {
      if (!lesson.isProjectDay || !lesson.projectConfig) {
        console.error(`FAILED: Day ${day} in ${track} is missing projectConfig`);
        process.exit(1);
      }
    }
  }
}

console.log("SUCCESS: All 540 specialized daily lessons across 6 tracks verified with 100% data integrity!");
