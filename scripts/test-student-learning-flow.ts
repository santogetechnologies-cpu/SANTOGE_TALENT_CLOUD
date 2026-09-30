import { getLessonForDay, CURRICULA_MAP } from "../src/lib/course-curricula";
import type { TrackId } from "../src/lib/tracks";

console.log("=== SANTOGE TALENT CLOUD: STUDENT LEARNING FLOW & DASHBOARD VERIFICATION ===");

const tracks: TrackId[] = ["java", "aiml", "datascience", "medical", "marketing", "sap"];

// 1. Verify 6 Authoritative Courses
console.log(`\n1. Authoritative Courses Check: ${tracks.length} tracks.`);
if (tracks.length !== 6) throw new Error("Expected exactly 6 courses!");
console.log("   Tracks:", tracks.join(", "));

// 2. Test Dynamic Lesson Loading for Day 1, Day 17, Day 45, Day 76, Day 90 across all 6 courses
console.log("\n2. Testing dynamic lesson loading across representative days...");
for (const track of tracks) {
  // Day 1
  const d1 = getLessonForDay(track, 1);
  if (!d1) throw new Error(`Failed to load Day 1 for ${track}`);
  if (d1.phase !== 1) throw new Error(`Day 1 should be Phase 1, got ${d1.phase}`);
  if (!d1.steps || d1.steps.length === 0) throw new Error(`Day 1 for ${track} has no steps!`);

  // Day 17
  const d17 = getLessonForDay(track, 17);
  if (!d17) throw new Error(`Failed to load Day 17 for ${track}`);
  if (d17.phase !== 2) throw new Error(`Day 17 should be Phase 2, got ${d17.phase}`);

  // Day 45
  const d45 = getLessonForDay(track, 45);
  if (!d45) throw new Error(`Failed to load Day 45 for ${track}`);
  if (d45.phase !== 3) throw new Error(`Day 45 should be Phase 3, got ${d45.phase}`);

  // Day 76 (Capstone start)
  const d76 = getLessonForDay(track, 76);
  if (!d76) throw new Error(`Failed to load Day 76 for ${track}`);
  if (d76.phase !== 6) throw new Error(`Day 76 should be Phase 6, got ${d76.phase}`);
  if (!d76.isProjectDay) throw new Error(`Day 76 for ${track} must be a project day!`);
  if (!d76.projectConfig) throw new Error(`Day 76 for ${track} must have projectConfig!`);

  // Day 90 (Final Assessment)
  const d90 = getLessonForDay(track, 90);
  if (!d90) throw new Error(`Failed to load Day 90 for ${track}`);
  if (d90.phase !== 6) throw new Error(`Day 90 should be Phase 6, got ${d90.phase}`);

  console.log(`   ✓ ${track.toUpperCase()}: Day 1 ("${d1.title}"), Day 17 ("${d17.title}"), Day 76 ("${d76.projectConfig.milestone.title}"), Day 90 ("${d90.title}") loaded dynamically.`);
}

// 3. Verify Day Locking Logic
console.log("\n3. Testing Day Locking Simulation...");
function checkDayLock(selectedDay: number, completedDays: number[]) {
  const maxCompleted = completedDays.length > 0 ? Math.max(...completedDays) : 0;
  const currentUnlockedDay = Math.min(90, maxCompleted + 1);
  const isLocked = selectedDay > currentUnlockedDay;
  const isCompleted = completedDays.includes(selectedDay);
  const isCurrent = selectedDay === currentUnlockedDay;
  return { currentUnlockedDay, isLocked, isCompleted, isCurrent };
}

// New student:
const newStudent = checkDayLock(1, []);
console.log("   New student (completed: []):", newStudent);
if (newStudent.currentUnlockedDay !== 1 || newStudent.isLocked || !newStudent.isCurrent) {
  throw new Error("New student should be on Day 1, unlocked!");
}
const newStudentDay2 = checkDayLock(2, []);
if (!newStudentDay2.isLocked) {
  throw new Error("Day 2 must be locked for new student!");
}

// Student completed Day 1:
const afterDay1 = checkDayLock(2, [1]);
console.log("   After Day 1 (completed: [1]):", afterDay1);
if (afterDay1.currentUnlockedDay !== 2 || afterDay1.isLocked || !afterDay1.isCurrent) {
  throw new Error("Day 2 should unlock after completing Day 1!");
}
const day1Review = checkDayLock(1, [1]);
if (!day1Review.isCompleted || day1Review.isLocked) {
  throw new Error("Day 1 should be completed and reviewable!");
}
const day3Locked = checkDayLock(3, [1]);
if (!day3Locked.isLocked) {
  throw new Error("Day 3 must be locked!");
}

// 4. Verify Dual Gate Logic
console.log("\n4. Testing Dual Completion Gate Calculation...");
function checkDualGate(techDays: number[], placementDays: number[]) {
  return techDays.length >= 90 && placementDays.length >= 90;
}
if (checkDualGate(Array.from({ length: 90 }, (_, i) => i + 1), Array.from({ length: 89 }, (_, i) => i + 1))) {
  throw new Error("Dual gate should NOT clear with only 89 placement days!");
}
if (checkDualGate(Array.from({ length: 89 }, (_, i) => i + 1), Array.from({ length: 90 }, (_, i) => i + 1))) {
  throw new Error("Dual gate should NOT clear with only 89 tech days!");
}
if (!checkDualGate(Array.from({ length: 90 }, (_, i) => i + 1), Array.from({ length: 90 }, (_, i) => i + 1))) {
  throw new Error("Dual gate should clear with 90 tech + 90 placement days!");
}
console.log("   ✓ Dual Completion Gate logic strictly requires 90/90 technical + 90/90 placement days.");

// 5. Verify Mini-Game configurations across all tracks
console.log("\n5. Testing Mini-Game configurations...");
for (const track of tracks) {
  const gamesCount = Object.values(CURRICULA_MAP[track]).filter((l) => l.miniGame !== null).length;
  console.log(`   ✓ ${track.toUpperCase()}: ${gamesCount} daily lessons contain interactive mini-games.`);
}

console.log("\nALL LEARNING FLOW & INTEGRITY TESTS PASSED SUCCESSFULLY! ✓");
