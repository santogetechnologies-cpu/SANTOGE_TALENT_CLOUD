import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ylofqmmbwgrqtsrclnww.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bIuZOdaZ_m3jp6s6cyoV_A_P8mKwqXf";

async function runTalentScoreSecurityTests() {
  console.log("===============================================================================");
  console.log("SantoGe Talent Cloud (STC) — Fix #2 Security Verification Suite");
  console.log("Function under test: public.calculate_talent_score(p_student_id UUID)");
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
    .select("id, name, email, talent_score, xp")
    .eq("auth_user_id", studentAuth.user.id)
    .single();

  const studentAId = studentAProfile.id;
  console.log(`Student A (Ajay Kumar): id=${studentAId}, current score=${studentAProfile.talent_score}`);

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

  // Fetch Student B (Siddharth N) and other target students via Admin
  const { data: otherStudents } = await adminClient
    .from("student_profiles")
    .select("id, name, email, talent_score, xp, readiness_t, readiness_c")
    .neq("id", studentAId)
    .limit(4);

  const studentB = otherStudents[0];
  console.log(`Student B (Target: ${studentB.name}): id=${studentB.id}, score=${studentB.talent_score}\n`);

  // -------------------------------------------------------------------------
  // TEST 1: Student calculates own score
  // -------------------------------------------------------------------------
  console.log("Running TEST 1: Student A calculates own score...");
  const t1 = await studentClient.rpc("calculate_talent_score", {
    p_student_id: studentAId,
  });

  const t1Success = !t1.error && typeof t1.data === "number";
  results.push({
    test: "Test 1 — Student calculates own score",
    target: `Own ID (${studentAProfile.name})`,
    expected: "SUCCESS",
    actual: t1Success ? `SUCCESS (Score: ${t1.data})` : `FAILED (${t1.error?.message})`,
    status: t1Success ? "PASSED" : "FAILED",
  });
  console.log(`Result: ${t1Success ? "SUCCESS [PASS]" : "FAILED [FAIL]"}: score=${t1.data}, error=${t1.error?.message || "none"}\n`);

  // -------------------------------------------------------------------------
  // TEST 2: Student attempts another student's score + Data Integrity Check
  // -------------------------------------------------------------------------
  console.log(`Running TEST 2: Student A attempts to calculate Student B's score (${studentB.name})...`);
  
  // Capture Student B state BEFORE unauthorized attempt
  const { data: bBefore } = await adminClient
    .from("student_profiles")
    .select("talent_score, xp, readiness_t, readiness_c, readiness_a, readiness_e, readiness_r, readiness_m, updated_at")
    .eq("id", studentB.id)
    .single();

  const { data: bScoreRowBefore } = await adminClient
    .from("talent_scores")
    .select("*")
    .eq("student_id", studentB.id)
    .maybeSingle();

  const t2 = await studentClient.rpc("calculate_talent_score", {
    p_student_id: studentB.id,
  });

  // Capture Student B state AFTER unauthorized attempt
  const { data: bAfter } = await adminClient
    .from("student_profiles")
    .select("talent_score, xp, readiness_t, readiness_c, readiness_a, readiness_e, readiness_r, readiness_m, updated_at")
    .eq("id", studentB.id)
    .single();

  const { data: bScoreRowAfter } = await adminClient
    .from("talent_scores")
    .select("*")
    .eq("student_id", studentB.id)
    .maybeSingle();

  const t2Rejected = !!t2.error;
  const integrityIntact =
    bBefore.talent_score === bAfter.talent_score &&
    bBefore.xp === bAfter.xp &&
    bBefore.readiness_t === bAfter.readiness_t &&
    bBefore.updated_at === bAfter.updated_at &&
    JSON.stringify(bScoreRowBefore) === JSON.stringify(bScoreRowAfter);

  results.push({
    test: "Test 2 — Student attempts another student's score",
    target: `Student B (${studentB.name})`,
    expected: "REJECTED",
    actual: t2Rejected ? `REJECTED (${t2.error?.message})` : "ALLOWED (Vulnerable!)",
    status: t2Rejected && integrityIntact ? "PASSED" : "FAILED",
  });
  console.log(`Result: ${t2Rejected ? "REJECTED [PASS]" : "ACCEPTED [FAIL]"}: error=${t2.error?.message || "none"}`);
  console.log(`Data Integrity Verified: ${integrityIntact ? "INTACT (No unauthorized changes)" : "CORRUPTED!"}\n`);

  // -------------------------------------------------------------------------
  // TEST 3: Admin calculates another student's score
  // -------------------------------------------------------------------------
  console.log(`Running TEST 3: Admin calculates Student B's score (${studentB.name})...`);
  const t3 = await adminClient.rpc("calculate_talent_score", {
    p_student_id: studentB.id,
  });

  const t3Success = !t3.error && typeof t3.data === "number";
  results.push({
    test: "Test 3 — Admin calculates another student's score",
    target: `Student B (${studentB.name})`,
    expected: "SUCCESS",
    actual: t3Success ? `SUCCESS (Score: ${t3.data})` : `FAILED (${t3.error?.message})`,
    status: t3Success ? "PASSED" : "FAILED",
  });
  console.log(`Result: ${t3Success ? "SUCCESS [PASS]" : "FAILED [FAIL]"}: score=${t3.data}, error=${t3.error?.message || "none"}\n`);

  // -------------------------------------------------------------------------
  // TEST 4: Trusted backend flow (recalculate_all_talent_scores batch RPC)
  // -------------------------------------------------------------------------
  console.log("Running TEST 4: Trusted backend flow (recalculate_all_talent_scores batch RPC)...");
  const t4 = await adminClient.rpc("recalculate_all_talent_scores");

  const t4Success = !t4.error && t4.data && (t4.data.ok === true || t4.data.recalculated_count > 0);
  results.push({
    test: "Test 4 — Trusted backend flow (recalculate_all_talent_scores)",
    target: "Platform Batch Engine",
    expected: "SUCCESS",
    actual: t4Success ? `SUCCESS (Recalculated: ${t4.data?.recalculated_count})` : `FAILED (${t4.error?.message})`,
    status: t4Success ? "PASSED" : "FAILED",
  });
  console.log(`Result: ${t4Success ? "SUCCESS [PASS]" : "FAILED [FAIL]"}: data=${JSON.stringify(t4.data)}, error=${t4.error?.message || "none"}\n`);

  // -------------------------------------------------------------------------
  // TEST 5: Invalid / nonexistent student UUID
  // -------------------------------------------------------------------------
  console.log("Running TEST 5: Student attempts non-existent student UUID...");
  const fakeUuid = "00000000-0000-0000-0000-000000000000";
  const t5 = await studentClient.rpc("calculate_talent_score", {
    p_student_id: fakeUuid,
  });

  const t5Rejected = !!t5.error;
  results.push({
    test: "Test 5 — Invalid / nonexistent student UUID",
    target: fakeUuid,
    expected: "REJECTED",
    actual: t5Rejected ? `REJECTED (${t5.error?.message})` : "ALLOWED",
    status: t5Rejected ? "PASSED" : "FAILED",
  });
  console.log(`Result: ${t5Rejected ? "REJECTED [PASS]" : "ACCEPTED [FAIL]"}: error=${t5.error?.message || "none"}\n`);

  // -------------------------------------------------------------------------
  // TEST 6: Student attempts repeated unauthorized calls against multiple students
  // -------------------------------------------------------------------------
  console.log("Running TEST 6: Student A attempts multiple unauthorized target UUIDs...");
  let allBlocked = true;
  const multiAttempts = [];

  for (const target of otherStudents) {
    const res = await studentClient.rpc("calculate_talent_score", {
      p_student_id: target.id,
    });
    const blocked = !!res.error;
    multiAttempts.push({ name: target.name, id: target.id, blocked, error: res.error?.message });
    if (!blocked) allBlocked = false;
  }

  results.push({
    test: "Test 6 — Student attempts repeated unauthorized calls",
    target: `${multiAttempts.length} different student targets`,
    expected: "ALL REJECTED",
    actual: allBlocked ? "ALL REJECTED (100% blocked)" : "SOME ALLOWED (Vulnerable!)",
    status: allBlocked ? "PASSED" : "FAILED",
  });
  console.log(`Result: ${allBlocked ? "ALL REJECTED [PASS]" : "VULNERABLE [FAIL]"}: tested ${multiAttempts.length} targets\n`);

  // -------------------------------------------------------------------------
  // Summary Table
  // -------------------------------------------------------------------------
  console.log("===============================================================================");
  console.log("SECURITY VERIFICATION SUMMARY — FIX #2");
  console.log("===============================================================================");
  console.table(results);

  const overallPassed = results.every((r) => r.status === "PASSED");
  console.log(`\nOVERALL VERIFICATION RESULT: ${overallPassed ? "ALL 6 SECURITY TESTS PASSED!" : "TESTS FAILED!"}`);
  return overallPassed;
}

runTalentScoreSecurityTests().catch((err) => {
  console.error("FATAL test error:", err);
  process.exit(1);
});
