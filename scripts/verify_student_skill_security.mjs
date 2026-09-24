import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ylofqmmbwgrqtsrclnww.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bIuZOdaZ_m3jp6s6cyoV_A_P8mKwqXf";

async function runStudentSkillSecurityTests() {
  console.log("===============================================================================");
  console.log("SantoGe Talent Cloud (STC) — Fix #3 Security Verification Suite");
  console.log("RPC under test: public.complete_student_skill(p_student_id, p_skill_id, p_track_id)");
  console.log("===============================================================================\n");

  const results = [];

  // Client 1: Student A (Ajay Kumar)
  const studentClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: studentAuth, error: studentAuthErr } = await studentClient.auth.signInWithPassword({
    email: "ajay@college.edu",
    password: "ajay@college.edu",
  });

  if (studentAuthErr || !studentAuth.user) {
    console.error("FATAL: Failed to authenticate student Ajay:", studentAuthErr);
    process.exit(1);
  }

  // Fetch Student A profile
  const { data: studentAProfile } = await studentClient
    .from("student_profiles")
    .select("id, name, email, xp, talent_score")
    .eq("auth_user_id", studentAuth.user.id)
    .single();

  const studentAId = studentAProfile.id;
  console.log(`Student A (Ajay Kumar): id=${studentAId}, current XP=${studentAProfile.xp}, score=${studentAProfile.talent_score}`);

  // Fetch Student A assigned tracks
  const { data: studentATracks } = await studentClient
    .from("student_tracks")
    .select("track_id")
    .eq("student_id", studentAId);

  const assignedTrack = studentATracks?.[0]?.track_id || "java";
  console.log(`Student A Assigned Tracks:`, studentATracks?.map(t => t.track_id), `(Primary: ${assignedTrack})`);

  // Client 2: Admin (admin@gmail.com)
  const adminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: adminAuth, error: adminAuthErr } = await adminClient.auth.signInWithPassword({
    email: "admin@gmail.com",
    password: "admin123",
  });

  if (adminAuthErr || !adminAuth.user) {
    console.error("FATAL: Failed to authenticate admin:", adminAuthErr);
    process.exit(1);
  }

  // Fetch Student B
  const { data: otherStudents } = await adminClient
    .from("student_profiles")
    .select("id, name, email, xp, talent_score")
    .neq("id", studentAId)
    .limit(1);

  const studentB = otherStudents[0];
  console.log(`Student B (Target: ${studentB.name}): id=${studentB.id}, XP=${studentB.xp}\n`);

  // Helper to re-fetch student A profile
  async function getFreshStudentA() {
    const { data } = await adminClient
      .from("student_profiles")
      .select("id, xp, talent_score")
      .eq("id", studentAId)
      .single();
    return data;
  }

  // Helper to count student A completions
  async function countStudentACompletions() {
    const { count } = await adminClient
      .from("student_skill_completions")
      .select("*", { count: "exact", head: true })
      .eq("student_id", studentAId);
    return count || 0;
  }

  // Clean slate before starting tests: ensure no existing completion for java-m1-s0 or java-m1-s1
  await adminClient
    .from("student_skill_completions")
    .delete()
    .eq("student_id", studentAId);

  // -------------------------------------------------------------------------
  // TEST 1: Valid skill completion (Real student + assigned track + real skill)
  // -------------------------------------------------------------------------
  console.log("[TEST 1] Legitimate Student Skill Completion");
  console.log(`  Calling complete_student_skill(${studentAId}, '${assignedTrack}-m1-s0', '${assignedTrack}')`);
  const beforeT1 = await getFreshStudentA();
  const completionsBeforeT1 = await countStudentACompletions();

  const { data: t1Data, error: t1Err } = await studentClient.rpc("complete_student_skill", {
    p_student_id: studentAId,
    p_skill_id: `${assignedTrack}-m1-s0`,
    p_track_id: assignedTrack,
  });

  const freshAfterT1 = await getFreshStudentA();
  const completionsAfterT1 = await countStudentACompletions();

  if (!t1Err && t1Data?.ok && freshAfterT1.xp === beforeT1.xp + 30 && completionsAfterT1 === completionsBeforeT1 + 1) {
    results.push({
      test: "TEST 1: Valid skill completion",
      expected: "Allowed, +30 XP, completion recorded",
      actual: `Success (XP: ${beforeT1.xp} -> ${freshAfterT1.xp}, completions: ${completionsAfterT1})`,
      status: "PASSED",
    });
    console.log(`  -> PASSED: Valid skill completed, XP increased by 30 to ${freshAfterT1.xp}\n`);
  } else {
    results.push({
      test: "TEST 1: Valid skill completion",
      expected: "Allowed, +30 XP, completion recorded",
      actual: t1Err ? `Error: ${t1Err.message}` : `Data: ${JSON.stringify(t1Data)}, XP: ${freshAfterT1?.xp}`,
      status: "FAILED",
    });
    console.log(`  -> FAILED:`, t1Err || t1Data, "\n");
  }

  // -------------------------------------------------------------------------
  // TEST 2: Fake / Nonexistent Skill ID
  // -------------------------------------------------------------------------
  console.log("[TEST 2] Fake / Nonexistent Skill ID Submission");
  const fakeSkillId = "fake-skill-uuid-nonexistent-9999";
  console.log(`  Student A calls complete_student_skill with skill_id='${fakeSkillId}', track_id='${assignedTrack}'`);
  const beforeT2 = await getFreshStudentA();
  const completionsBeforeT2 = await countStudentACompletions();

  const { data: t2Data, error: t2Err } = await studentClient.rpc("complete_student_skill", {
    p_student_id: studentAId,
    p_skill_id: fakeSkillId,
    p_track_id: assignedTrack,
  });

  const freshAfterT2 = await getFreshStudentA();
  const completionsAfterT2 = await countStudentACompletions();
  const xpUnchangedT2 = freshAfterT2.xp === beforeT2.xp;
  const completionsUnchangedT2 = completionsAfterT2 === completionsBeforeT2;

  if (t2Err && t2Err.message.includes("Skill not found or does not belong to the specified track") && xpUnchangedT2 && completionsUnchangedT2) {
    results.push({
      test: "TEST 2: Fake/nonexistent skill ID",
      expected: "Rejected (Skill not found...), no XP/row mutation",
      actual: `REJECTED: "${t2Err.message}". Zero state mutations.`,
      status: "PASSED",
    });
    console.log(`  -> PASSED: Fake skill rejected with expected error. XP and completions unchanged.\n`);
  } else {
    results.push({
      test: "TEST 2: Fake/nonexistent skill ID",
      expected: "Rejected (Skill not found...), no XP/row mutation",
      actual: t2Err ? `Error: "${t2Err.message}"` : `UNAUTHORIZED SUCCESS: ${JSON.stringify(t2Data)}`,
      status: "FAILED",
    });
    console.log(`  -> FAILED:`, t2Err || t2Data, "\n");
  }

  // -------------------------------------------------------------------------
  // TEST 3: Skill from Another Track (e.g. aiml skill submitted with track 'java')
  // -------------------------------------------------------------------------
  console.log("[TEST 3] Skill from Another Track with mismatched track_id");
  const crossSkillId = assignedTrack === "java" ? "aiml-m1-s0" : "java-m1-s0";
  console.log(`  Student A calls complete_student_skill with skill_id='${crossSkillId}', track_id='${assignedTrack}'`);
  const beforeT3 = await getFreshStudentA();
  const completionsBeforeT3 = await countStudentACompletions();

  const { data: t3Data, error: t3Err } = await studentClient.rpc("complete_student_skill", {
    p_student_id: studentAId,
    p_skill_id: crossSkillId,
    p_track_id: assignedTrack,
  });

  const freshAfterT3 = await getFreshStudentA();
  const completionsAfterT3 = await countStudentACompletions();
  const xpUnchangedT3 = freshAfterT3.xp === beforeT3.xp;
  const completionsUnchangedT3 = completionsAfterT3 === completionsBeforeT3;

  if (t3Err && t3Err.message.includes("Skill not found or does not belong to the specified track") && xpUnchangedT3 && completionsUnchangedT3) {
    results.push({
      test: "TEST 3: Skill from another track",
      expected: "Rejected (Skill not found or does not belong...), no XP/row mutation",
      actual: `REJECTED: "${t3Err.message}". Zero state mutations.`,
      status: "PASSED",
    });
    console.log(`  -> PASSED: Cross-track skill rejected as expected.\n`);
  } else {
    results.push({
      test: "TEST 3: Skill from another track",
      expected: "Rejected (Skill not found or does not belong...), no XP/row mutation",
      actual: t3Err ? `Error: "${t3Err.message}"` : `UNAUTHORIZED SUCCESS: ${JSON.stringify(t3Data)}`,
      status: "FAILED",
    });
    console.log(`  -> FAILED:`, t3Err || t3Data, "\n");
  }

  // -------------------------------------------------------------------------
  // TEST 4: Student Attempts Another Student's Completion
  // -------------------------------------------------------------------------
  console.log("[TEST 4] Student A attempts to complete a skill for Student B");
  console.log(`  Student A calls complete_student_skill for student_id=${studentB.id}`);

  const { data: t4Data, error: t4Err } = await studentClient.rpc("complete_student_skill", {
    p_student_id: studentB.id,
    p_skill_id: `${assignedTrack}-m1-s1`,
    p_track_id: assignedTrack,
  });

  const { data: freshStudentB } = await adminClient
    .from("student_profiles")
    .select("xp")
    .eq("id", studentB.id)
    .single();

  if (t4Err && t4Err.message.includes("Unauthorized") && freshStudentB.xp === studentB.xp) {
    results.push({
      test: "TEST 4: Student attempts another student's completion",
      expected: "Rejected ('Unauthorized'), Student B unchanged",
      actual: `REJECTED: "${t4Err.message}". Student B XP unchanged.`,
      status: "PASSED",
    });
    console.log(`  -> PASSED: Unauthorized cross-student attempt rejected.\n`);
  } else {
    results.push({
      test: "TEST 4: Student attempts another student's completion",
      expected: "Rejected ('Unauthorized'), Student B unchanged",
      actual: t4Err ? `Error: "${t4Err.message}"` : `UNAUTHORIZED SUCCESS: ${JSON.stringify(t4Data)}`,
      status: "FAILED",
    });
    console.log(`  -> FAILED:`, t4Err || t4Data, "\n");
  }

  // -------------------------------------------------------------------------
  // TEST 5: Student Attempts to Use an Unassigned Track ID
  // -------------------------------------------------------------------------
  console.log("[TEST 5] Student attempts to use an unassigned track ID");
  const unassignedTrack = assignedTrack === "java" ? "aiml" : "java";
  console.log(`  Student A calls complete_student_skill with skill_id='${unassignedTrack}-m1-s0', track_id='${unassignedTrack}'`);
  const beforeT5 = await getFreshStudentA();
  const completionsBeforeT5 = await countStudentACompletions();

  const { data: t5Data, error: t5Err } = await studentClient.rpc("complete_student_skill", {
    p_student_id: studentAId,
    p_skill_id: `${unassignedTrack}-m1-s0`,
    p_track_id: unassignedTrack,
  });

  const freshAfterT5 = await getFreshStudentA();
  const completionsAfterT5 = await countStudentACompletions();
  const xpUnchangedT5 = freshAfterT5.xp === beforeT5.xp;
  const completionsUnchangedT5 = completionsAfterT5 === completionsBeforeT5;

  if (t5Err && t5Err.message.includes("Access Denied: Student is not assigned to course track") && xpUnchangedT5 && completionsUnchangedT5) {
    results.push({
      test: "TEST 5: Student attempts unassigned track ID",
      expected: "Rejected ('Access Denied: Student is not assigned...'), no mutation",
      actual: `REJECTED: "${t5Err.message}". Zero state mutations.`,
      status: "PASSED",
    });
    console.log(`  -> PASSED: Unassigned track rejected by track authorization.\n`);
  } else {
    results.push({
      test: "TEST 5: Student attempts unassigned track ID",
      expected: "Rejected ('Access Denied: Student is not assigned...'), no mutation",
      actual: t5Err ? `Error: "${t5Err.message}"` : `UNAUTHORIZED SUCCESS: ${JSON.stringify(t5Data)}`,
      status: "FAILED",
    });
    console.log(`  -> FAILED:`, t5Err || t5Data, "\n");
  }

  // -------------------------------------------------------------------------
  // TEST 6: Duplicate Completion Idempotency
  // -------------------------------------------------------------------------
  console.log("[TEST 6] Duplicate Completion Handling");
  console.log(`  Re-completing '${assignedTrack}-m1-s0' for Student A (already completed in Test 1)`);
  const beforeT6 = await getFreshStudentA();
  const completionsBeforeT6 = await countStudentACompletions();

  const { data: t6Data, error: t6Err } = await studentClient.rpc("complete_student_skill", {
    p_student_id: studentAId,
    p_skill_id: `${assignedTrack}-m1-s0`,
    p_track_id: assignedTrack,
  });

  const freshAfterT6 = await getFreshStudentA();
  const completionsAfterT6 = await countStudentACompletions();
  const xpUnchangedT6 = freshAfterT6.xp === beforeT6.xp;
  const completionsUnchangedT6 = completionsAfterT6 === completionsBeforeT6;

  if (!t6Err && t6Data?.ok && xpUnchangedT6 && completionsUnchangedT6) {
    results.push({
      test: "TEST 6: Duplicate completion idempotency",
      expected: "Safe return ok=true, duplicate=true, ZERO extra XP",
      actual: `Returned ok=true (duplicate: ${t6Data.duplicate}). XP maintained at ${freshAfterT6.xp}. Completions: ${completionsAfterT6}.`,
      status: "PASSED",
    });
    console.log(`  -> PASSED: Duplicate handled idempotently. Zero extra XP awarded.\n`);
  } else {
    results.push({
      test: "TEST 6: Duplicate completion idempotency",
      expected: "Safe return ok=true, duplicate=true, ZERO extra XP",
      actual: t6Err ? `Error: "${t6Err.message}"` : `Data: ${JSON.stringify(t6Data)}, XP: ${freshAfterT6.xp}`,
      status: "FAILED",
    });
    console.log(`  -> FAILED:`, t6Err || t6Data, "\n");
  }

  // -------------------------------------------------------------------------
  // TEST 7: Multiple Fake / Arbitrary Skill Formats
  // -------------------------------------------------------------------------
  console.log("[TEST 7] Multiple Arbitrary/Fake Skill IDs Batch Attack");
  const fakeSkillsToTest = [
    "00000000-0000-0000-0000-000000000000",
    "java-m99-s99",
    "hack_skill_auto_complete",
    "<script>alert('xss')</script>",
    "'; DROP TABLE student_profiles; --",
  ];

  const beforeT7 = await getFreshStudentA();
  const completionsBeforeT7 = await countStudentACompletions();

  let allFakeRejected = true;
  for (const fakeId of fakeSkillsToTest) {
    const { data: fakeData, error: fakeErr } = await studentClient.rpc("complete_student_skill", {
      p_student_id: studentAId,
      p_skill_id: fakeId,
      p_track_id: assignedTrack,
    });
    if (!fakeErr || !fakeErr.message.includes("Skill not found or does not belong to the specified track")) {
      allFakeRejected = false;
      console.log(`    Failed to reject fakeId '${fakeId}':`, fakeErr || fakeData);
      break;
    }
  }

  const freshAfterT7 = await getFreshStudentA();
  const completionsAfterT7 = await countStudentACompletions();

  if (allFakeRejected && freshAfterT7.xp === beforeT7.xp && completionsAfterT7 === completionsBeforeT7) {
    results.push({
      test: "TEST 7: Multiple fake skills rejection",
      expected: "All 5 arbitrary/injection patterns REJECTED, zero mutation",
      actual: "All 5 attack vectors rejected with 'Skill not found...'. Zero state mutations.",
      status: "PASSED",
    });
    console.log(`  -> PASSED: All 5 arbitrary/injection skill attempts safely rejected.\n`);
  } else {
    results.push({
      test: "TEST 7: Multiple fake skills rejection",
      expected: "All 5 arbitrary/injection patterns REJECTED, zero mutation",
      actual: "One or more fake skill IDs was not rejected properly",
      status: "FAILED",
    });
    console.log(`  -> FAILED multiple fake test\n`);
  }

  // -------------------------------------------------------------------------
  // TEST 8: Trusted / Admin Workflow Verification
  // -------------------------------------------------------------------------
  console.log("[TEST 8] Trusted Admin Flow: Admin completing a legitimate skill for student");
  const adminSkillId = `${assignedTrack}-m1-s1`;
  console.log(`  Admin calls complete_student_skill for Student A (skill: '${adminSkillId}', track: '${assignedTrack}')`);
  const beforeT8 = await getFreshStudentA();
  const completionsBeforeT8 = await countStudentACompletions();

  const { data: t8Data, error: t8Err } = await adminClient.rpc("complete_student_skill", {
    p_student_id: studentAId,
    p_skill_id: adminSkillId,
    p_track_id: assignedTrack,
  });

  const freshAfterT8 = await getFreshStudentA();
  const completionsAfterT8 = await countStudentACompletions();

  if (!t8Err && t8Data?.ok && freshAfterT8.xp === beforeT8.xp + 30 && completionsAfterT8 === completionsBeforeT8 + 1) {
    results.push({
      test: "TEST 8: Trusted / Admin workflow",
      expected: "Admin authorized, legitimate skill completed (+30 XP)",
      actual: `Success (XP: ${beforeT8.xp} -> ${freshAfterT8.xp}, completions: ${completionsAfterT8})`,
      status: "PASSED",
    });
    console.log(`  -> PASSED: Admin flow succeeded, valid skill completed for student (+30 XP).\n`);
  } else {
    results.push({
      test: "TEST 8: Trusted / Admin workflow",
      expected: "Admin authorized, legitimate skill completed (+30 XP)",
      actual: t8Err ? `Error: "${t8Err.message}"` : `Data: ${JSON.stringify(t8Data)}`,
      status: "FAILED",
    });
    console.log(`  -> FAILED:`, t8Err || t8Data, "\n");
  }

  // -------------------------------------------------------------------------
  // Summary Table
  // -------------------------------------------------------------------------
  console.log("===============================================================================");
  console.log("FINAL RESULTS SUMMARY — SECURITY FIX #3");
  console.log("===============================================================================");
  console.table(results);

  const allPassed = results.every(r => r.status === "PASSED");
  if (allPassed) {
    console.log("\n>>> ALL 8 SECURITY TESTS PASSED! Database authorization & curriculum validation is airtight. <<<\n");
  } else {
    console.log("\n>>> ONE OR MORE TESTS FAILED. Migration may need to be applied to remote database. <<<\n");
  }

  return allPassed;
}

runStudentSkillSecurityTests();
