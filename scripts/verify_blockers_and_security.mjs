import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ylofqmmbwgrqtsrclnww.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bIuZOdaZ_m3jp6s6cyoV_A_P8mKwqXf";

async function verifyBackendBlockersAndSecurity() {
  console.log("===============================================================================");
  console.log("SantoGe Talent Cloud (STC) — Backend Blockers & Security Verification Suite");
  console.log("===============================================================================\n");

  const results = [];

  // Authenticate as Student A (Ajay Kumar)
  const studentClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: studentAuth, error: studentAuthErr } = await studentClient.auth.signInWithPassword({
    email: "ajay@college.edu",
    password: "ajay@college.edu",
  });

  if (studentAuthErr || !studentAuth.user) {
    console.error("FATAL: Failed to authenticate student Ajay:", studentAuthErr);
    process.exit(1);
  }

  const { data: studentAProfile } = await studentClient
    .from("student_profiles")
    .select("id, name, email, xp, talent_score")
    .eq("auth_user_id", studentAuth.user.id)
    .single();

  const studentAId = studentAProfile.id;
  console.log(`Student A (Ajay): id=${studentAId}, current XP=${studentAProfile.xp}, score=${studentAProfile.talent_score}`);

  // Authenticate as Admin (admin@gmail.com)
  const adminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: adminAuth, error: adminAuthErr } = await adminClient.auth.signInWithPassword({
    email: "admin@gmail.com",
    password: "admin123",
  });

  if (adminAuthErr || !adminAuth.user) {
    console.error("FATAL: Failed to authenticate admin:", adminAuthErr);
    process.exit(1);
  }

  const { data: otherStudents } = await adminClient
    .from("student_profiles")
    .select("id, name, email, xp, talent_score")
    .neq("id", studentAId)
    .limit(1);

  const studentB = otherStudents[0];
  console.log(`Student B (Target: ${studentB.name}): id=${studentB.id}, XP=${studentB.xp}\n`);

  // ---------------------------------------------------------------------------
  // TEST 1: Blocker 1 — complete_student_technical_day RPC Resolution
  // ---------------------------------------------------------------------------
  console.log("[TEST 1] Testing public.complete_student_technical_day(UUID, INT)...");
  const t1 = await studentClient.rpc("complete_student_technical_day", {
    p_student_id: studentAId,
    p_day: 1,
  });

  const t1Resolved = !t1.error || t1.error.code !== "PGRST202";
  results.push({
    test: "Blocker 1: complete_student_technical_day RPC Resolution",
    expected: "PostgREST resolves RPC (Not PGRST202)",
    actual: t1Resolved ? `RESOLVED (Result: ${JSON.stringify(t1.data)})` : `MISSING (${t1.error?.message})`,
    status: t1Resolved ? "PASSED" : "BLOCKED",
  });
  console.log(`  -> ${t1Resolved ? "RESOLVED" : "MISSING FROM REMOTE SCHEMA"}:`, t1.error?.message || t1.data, "\n");

  // ---------------------------------------------------------------------------
  // TEST 2: Blocker 2 — submit_student_exercise_answer RPC Resolution
  // ---------------------------------------------------------------------------
  console.log("[TEST 2] Testing public.submit_student_exercise_answer RPC...");
  const t2 = await studentClient.rpc("submit_student_exercise_answer", {
    p_student_id: studentAId,
    p_day: 1,
    p_category: "Aptitude",
    p_question_id: "aptitude_0",
    p_selected_option: 1,
    p_is_correct: true,
  });

  const t2Resolved = !t2.error || t2.error.code !== "PGRST202";
  results.push({
    test: "Blocker 2: submit_student_exercise_answer RPC Resolution",
    expected: "PostgREST resolves RPC (Not PGRST202)",
    actual: t2Resolved ? `RESOLVED (Result: ${JSON.stringify(t2.data)})` : `MISSING (${t2.error?.message})`,
    status: t2Resolved ? "PASSED" : "BLOCKED",
  });
  console.log(`  -> ${t2Resolved ? "RESOLVED" : "MISSING FROM REMOTE SCHEMA"}:`, t2.error?.message || t2.data, "\n");

  // ---------------------------------------------------------------------------
  // TEST 3: Blocker 2 — Table student_exercise_submissions & RLS
  // ---------------------------------------------------------------------------
  console.log("[TEST 3] Testing public.student_exercise_submissions table & direct writes...");
  const t3DirectInsert = await studentClient
    .from("student_exercise_submissions")
    .insert({
      student_id: studentAId,
      day: 1,
      category: "Aptitude",
      question_id: "hack_0",
      selected_option: 0,
    });

  const t3TableMissing = t3DirectInsert.error && t3DirectInsert.error.code === "PGRST205";
  const t3DirectWriteBlocked = t3DirectInsert.error && (t3DirectInsert.error.code === "42501" || t3DirectInsert.error.message.includes("permission denied"));

  results.push({
    test: "Blocker 2: student_exercise_submissions Table & Direct Write Revocation",
    expected: "Direct INSERT blocked by security permissions (REVOKE INSERT)",
    actual: t3TableMissing ? "TABLE MISSING FROM REMOTE (PGRST205)" : (t3DirectWriteBlocked ? "BLOCKED BY PERMISSIONS (Secure)" : `UNPROTECTED: ${JSON.stringify(t3DirectInsert)}`),
    status: t3DirectWriteBlocked ? "PASSED" : (t3TableMissing ? "BLOCKED" : "FAILED"),
  });
  console.log(`  -> Table Write Status:`, t3DirectInsert.error?.message || "Allowed", "\n");

  // ---------------------------------------------------------------------------
  // TEST 4: Student B Isolation (Cross-student attack)
  // ---------------------------------------------------------------------------
  console.log("[TEST 4] Student A attempts submission on behalf of Student B...");
  const t4 = await studentClient.rpc("submit_student_exercise_answer", {
    p_student_id: studentB.id,
    p_day: 1,
    p_category: "Aptitude",
    p_question_id: "aptitude_0",
    p_selected_option: 2,
    p_is_correct: false,
  });

  const t4Rejected = t4.error && (t4.error.message.includes("Unauthorized") || t4.error.code === "P0001");
  results.push({
    test: "Security: Student A submits answer for Student B",
    expected: "REJECTED (Unauthorized)",
    actual: t4Rejected ? "REJECTED (Unauthorized)" : (t4.error ? t4.error.message : "ALLOWED (Vulnerable!)"),
    status: t4Rejected ? "PASSED" : (t4.error?.code === "PGRST202" ? "BLOCKED (RPC not on remote)" : "FAILED"),
  });
  console.log(`  -> Cross-Student Result:`, t4.error?.message || t4.data, "\n");

  // Summary Table
  console.log("===============================================================================");
  console.log("VERIFICATION SUITE SUMMARY");
  console.log("===============================================================================");
  console.table(results);

  return results;
}

verifyBackendBlockersAndSecurity().catch((err) => {
  console.error("FATAL test suite error:", err);
});
