import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ylofqmmbwgrqtsrclnww.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bIuZOdaZ_m3jp6s6cyoV_A_P8mKwqXf";

async function runSecurityTests() {
  console.log("===============================================================================");
  console.log("SantoGe Talent Cloud (STC) — Fix #1 Security Verification Suite");
  console.log("===============================================================================\n");

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // 1. Authenticate as student Ajay Kumar
  console.log("Step 1: Authenticating as student (ajay@college.edu)...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "ajay@college.edu",
    password: "ajay@college.edu",
  });

  if (authError || !authData.user) {
    console.error("FAILED to authenticate student:", authError);
    process.exit(1);
  }

  const studentAuthId = authData.user.id;
  console.log(`Authenticated student user ID: ${studentAuthId}`);

  // Fetch current profile state
  const { data: profile, error: profError } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("auth_user_id", studentAuthId)
    .single();

  if (profError || !profile) {
    console.error("FAILED to fetch student profile:", profError);
    process.exit(1);
  }

  console.log(`Student Profile ID: ${profile.id}`);
  console.log(`Current State: xp=${profile.xp}, talent_score=${profile.talent_score}, placement_day=${profile.placement_day}, status=${profile.status}, batch_id=${profile.batch_id}\n`);

  const results = [];

  // -------------------------------------------------------------------------
  // Test 1: Student attempts XP modification
  // -------------------------------------------------------------------------
  console.log("Running Test 1: Student attempts XP modification (xp = 999999)...");
  const t1 = await supabase
    .from("student_profiles")
    .update({ xp: 999999 })
    .eq("id", profile.id)
    .select();
  
  const t1Rejected = !!t1.error;
  results.push({
    test: "Test 1 — Student attempts XP modification (xp = 999999)",
    expected: "REJECTED",
    status: t1Rejected ? "PASSED (REJECTED)" : "FAILED (ACCEPTED)",
    error: t1.error?.message || "No error (Vulnerable!)",
  });
  console.log(`Result: ${t1Rejected ? "REJECTED [PASS]" : "ACCEPTED [FAIL]"}: ${t1.error?.message || "None"}\n`);

  // -------------------------------------------------------------------------
  // Test 2: Student attempts Talent Score modification
  // -------------------------------------------------------------------------
  console.log("Running Test 2: Student attempts Talent Score modification (talent_score = 999)...");
  const t2 = await supabase
    .from("student_profiles")
    .update({ talent_score: 999 })
    .eq("id", profile.id)
    .select();

  const t2Rejected = !!t2.error;
  results.push({
    test: "Test 2 — Student attempts Talent Score modification (talent_score = 999)",
    expected: "REJECTED",
    status: t2Rejected ? "PASSED (REJECTED)" : "FAILED (ACCEPTED)",
    error: t2.error?.message || "No error (Vulnerable!)",
  });
  console.log(`Result: ${t2Rejected ? "REJECTED [PASS]" : "ACCEPTED [FAIL]"}: ${t2.error?.message || "None"}\n`);

  // -------------------------------------------------------------------------
  // Test 3: Student attempts Placement Day modification
  // -------------------------------------------------------------------------
  console.log("Running Test 3: Student attempts Placement Day modification (placement_day = 90)...");
  const t3 = await supabase
    .from("student_profiles")
    .update({ placement_day: 90 })
    .eq("id", profile.id)
    .select();

  const t3Rejected = !!t3.error;
  results.push({
    test: "Test 3 — Student attempts Placement Day modification (placement_day = 90)",
    expected: "REJECTED",
    status: t3Rejected ? "PASSED (REJECTED)" : "FAILED (ACCEPTED)",
    error: t3.error?.message || "No error (Vulnerable!)",
  });
  console.log(`Result: ${t3Rejected ? "REJECTED [PASS]" : "ACCEPTED [FAIL]"}: ${t3.error?.message || "None"}\n`);

  // -------------------------------------------------------------------------
  // Test 4: Student attempts auth_user_id modification
  // -------------------------------------------------------------------------
  console.log("Running Test 4: Student attempts auth_user_id modification...");
  const t4 = await supabase
    .from("student_profiles")
    .update({ auth_user_id: "00000000-0000-0000-0000-000000000000" })
    .eq("id", profile.id)
    .select();

  const t4Rejected = !!t4.error;
  results.push({
    test: "Test 4 — Student attempts auth_user_id modification",
    expected: "REJECTED",
    status: t4Rejected ? "PASSED (REJECTED)" : "FAILED (ACCEPTED)",
    error: t4.error?.message || "No error (Vulnerable!)",
  });
  console.log(`Result: ${t4Rejected ? "REJECTED [PASS]" : "ACCEPTED [FAIL]"}: ${t4.error?.message || "None"}\n`);

  // -------------------------------------------------------------------------
  // Test 5: Student attempts institution_id / batch_id modification
  // -------------------------------------------------------------------------
  console.log("Running Test 5: Student attempts batch_id modification...");
  const t5 = await supabase
    .from("student_profiles")
    .update({ batch_id: "00000000-0000-0000-0000-000000000000" })
    .eq("id", profile.id)
    .select();

  const t5Rejected = !!t5.error;
  results.push({
    test: "Test 5 — Student attempts batch_id modification",
    expected: "REJECTED",
    status: t5Rejected ? "PASSED (REJECTED)" : "FAILED (ACCEPTED)",
    error: t5.error?.message || "No error (Vulnerable!)",
  });
  console.log(`Result: ${t5Rejected ? "REJECTED [PASS]" : "ACCEPTED [FAIL]"}: ${t5.error?.message || "None"}\n`);

  // -------------------------------------------------------------------------
  // Test 6: Student attempts status modification
  // -------------------------------------------------------------------------
  console.log("Running Test 6: Student attempts status modification (status = 'suspended')...");
  const t6 = await supabase
    .from("student_profiles")
    .update({ status: "suspended" })
    .eq("id", profile.id)
    .select();

  const t6Rejected = !!t6.error;
  results.push({
    test: "Test 6 — Student attempts status modification (status = 'suspended')",
    expected: "REJECTED",
    status: t6Rejected ? "PASSED (REJECTED)" : "FAILED (ACCEPTED)",
    error: t6.error?.message || "No error (Vulnerable!)",
  });
  console.log(`Result: ${t6Rejected ? "REJECTED [PASS]" : "ACCEPTED [FAIL]"}: ${t6.error?.message || "None"}\n`);

  // -------------------------------------------------------------------------
  // Test 7: Legitimate profile update
  // -------------------------------------------------------------------------
  console.log("Running Test 7: Legitimate profile update (name & readiness weights)...");
  const originalName = profile.name;
  const originalReadinessT = profile.readiness_t;
  const newReadinessT = (originalReadinessT % 100) + 1;

  const t7 = await supabase
    .from("student_profiles")
    .update({
      name: originalName,
      readiness_t: newReadinessT,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id)
    .select();

  const t7Success = !t7.error && t7.data && t7.data.length > 0;
  // Revert readiness_t
  await supabase
    .from("student_profiles")
    .update({ readiness_t: originalReadinessT, updated_at: new Date().toISOString() })
    .eq("id", profile.id);

  results.push({
    test: "Test 7 — Legitimate profile update (name & readiness_t)",
    expected: "SUCCESS",
    status: t7Success ? "PASSED (SUCCESS)" : "FAILED (BLOCKED)",
    error: t7.error?.message || "None",
  });
  console.log(`Result: ${t7Success ? "SUCCESS [PASS]" : "BLOCKED [FAIL]"}: ${t7.error?.message || "None"}\n`);

  // -------------------------------------------------------------------------
  // Test 8: Existing trusted backend flow
  // -------------------------------------------------------------------------
  console.log("Running Test 8: Existing trusted backend flow (calculate_talent_score RPC)...");
  const t8 = await supabase.rpc("calculate_talent_score", {
    p_student_id: profile.id,
  });

  const t8Success = !t8.error && typeof t8.data === "number";
  results.push({
    test: "Test 8 — Existing trusted backend flow (calculate_talent_score)",
    expected: "SUCCESS",
    status: t8Success ? `PASSED (Calculated: ${t8.data})` : "FAILED (ERROR)",
    error: t8.error?.message || "None",
  });
  console.log(`Result: ${t8Success ? `SUCCESS [PASS] (Score: ${t8.data})` : "FAILED [FAIL]"}: ${t8.error?.message || "None"}\n`);

  // -------------------------------------------------------------------------
  // Summary Table
  // -------------------------------------------------------------------------
  console.log("===============================================================================");
  console.log("VERIFICATION RESULTS SUMMARY");
  console.log("===============================================================================");
  console.table(results);

  // Return overall pass status
  const allPassed =
    t1Rejected &&
    t2Rejected &&
    t3Rejected &&
    t4Rejected &&
    t5Rejected &&
    t6Rejected &&
    t7Success &&
    t8Success;

  // Cleanup: ensure profile is restored to original state
  await supabase
    .from("student_profiles")
    .update({
      xp: profile.xp,
      talent_score: profile.talent_score,
      placement_day: profile.placement_day,
      name: profile.name,
      readiness_t: profile.readiness_t,
      updated_at: new Date().toISOString(),
    })
    .eq("id", profile.id);

  console.log(`\nOVERALL STATUS: ${allPassed ? "ALL 8 SECURITY TESTS PASSED!" : "SECURITY TESTS FAILED!"}`);
  return allPassed;
}

runSecurityTests().catch((err) => {
  console.error("FATAL test runner error:", err);
  process.exit(1);
});
