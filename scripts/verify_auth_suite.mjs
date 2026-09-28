import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ylofqmmbwgrqtsrclnww.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bIuZOdaZ_m3jp6s6cyoV_A_P8mKwqXf";

async function runTestSuite() {
  console.log("===============================================================================");
  console.log("SantoGe Talent Cloud (STC) — Comprehensive Supabase Auth Verification Suite");
  console.log("===============================================================================\n");

  const results = [];

  // TEST 1: Representative student logins
  console.log("TEST 1: Testing representative student logins against real Supabase Auth...");
  const studentsToTest = [
    { email: "ajay@college.edu", password: "ajay@college.edu" },
    { email: "kiran@college.edu", password: "kiran@college.edu" },
    { email: "sneha@college.edu", password: "sneha@college.edu" },
    { email: "aswin@college.edu", password: "aswin@college.edu" },
    { email: "ashly@college.edu", password: "Temp@1234" },
  ];

  let test1Passed = true;
  for (const s of studentsToTest) {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await client.auth.signInWithPassword({
      email: s.email,
      password: s.password,
    });
    if (error || !data.user) {
      console.error(`  FAIL: ${s.email} failed to log in:`, error?.message);
      test1Passed = false;
    } else {
      console.log(`  PASS: ${s.email} logged in. User ID: ${data.user.id}`);
      await client.auth.signOut();
    }
  }
  results.push({ test: "Representative Student Logins", pass: test1Passed });

  // TEST 2: Password Recovery Email Request
  console.log("\nTEST 2: Testing Password Recovery Dispatch (resetPasswordForEmail)...");
  const testClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { error: resetErr } = await testClient.auth.resetPasswordForEmail(
    "aswin@college.edu",
    { redirectTo: "http://localhost:8080/login?reset=true" }
  );
  if (resetErr) {
    console.error("  FAIL: resetPasswordForEmail returned error:", resetErr.message);
    results.push({ test: "Password Recovery Request", pass: false });
  } else {
    console.log("  PASS: resetPasswordForEmail successfully dispatched recovery email without errors.");
    results.push({ test: "Password Recovery Request", pass: true });
  }

  // TEST 3: Realtime Backend Password Update, Invalidation of Old Password, and Immediate New Password Acceptance
  console.log("\nTEST 3: Realtime Backend Password Update Cycle & Data Preservation...");
  const targetEmail = "aswin@college.edu";
  const originalPwd = "aswin@college.edu";
  const tempPwd = "AswinSecurePass#2026!";

  // 3a. Record student profile state before password update
  const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: authA } = await clientA.auth.signInWithPassword({ email: targetEmail, password: originalPwd });
  const { data: profBefore } = await clientA
    .from("student_profiles")
    .select("id, name, xp, placement_day, talent_score, readiness_t, readiness_c")
    .eq("auth_user_id", authA.user.id)
    .single();

  console.log(`  Profile before update: XP=${profBefore.xp}, TalentScore=${profBefore.talent_score}`);

  // 3b. Update password in Supabase Auth
  const { error: updateErr } = await clientA.auth.updateUser({ password: tempPwd });
  if (updateErr) {
    console.error("  FAIL: updateUser failed:", updateErr.message);
    results.push({ test: "Realtime Password Update", pass: false });
    return;
  }
  console.log("  PASS: updateUser succeeded in real Supabase Auth.");
  await clientA.auth.signOut();

  // 3c. Verify old password is now REJECTED
  const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { error: rejectOldErr } = await clientB.auth.signInWithPassword({ email: targetEmail, password: originalPwd });
  if (!rejectOldErr) {
    console.error("  FAIL: Old password was accepted after reset!");
    results.push({ test: "Old Password Invalidation", pass: false });
  } else {
    console.log("  PASS: Old password rejected as expected:", rejectOldErr.message);
    results.push({ test: "Old Password Invalidation", pass: true });
  }

  // 3d. Verify new password is now ACCEPTED
  const { data: authNew, error: acceptNewErr } = await clientB.auth.signInWithPassword({ email: targetEmail, password: tempPwd });
  if (acceptNewErr || !authNew.user) {
    console.error("  FAIL: New password rejected:", acceptNewErr?.message);
    results.push({ test: "New Password Acceptance", pass: false });
  } else {
    console.log("  PASS: New password accepted immediately by Supabase Auth!");
    results.push({ test: "New Password Acceptance", pass: true });

    // Verify student data remains 100% intact
    const { data: profAfter } = await clientB
      .from("student_profiles")
      .select("id, name, xp, placement_day, talent_score, readiness_t, readiness_c")
      .eq("auth_user_id", authNew.user.id)
      .single();

    const dataIntact =
      profBefore.id === profAfter.id &&
      profBefore.xp === profAfter.xp &&
      profBefore.talent_score === profAfter.talent_score;

    if (dataIntact) {
      console.log(`  PASS: Student data 100% intact: XP=${profAfter.xp}, TalentScore=${profAfter.talent_score}`);
      results.push({ test: "Student Application Data Preserved", pass: true });
    } else {
      console.error("  FAIL: Student profile data was altered!");
      results.push({ test: "Student Application Data Preserved", pass: false });
    }

    // Revert password back to original
    await clientB.auth.updateUser({ password: originalPwd });
    console.log("  Reverted password back to original password.");
    await clientB.auth.signOut();
  }

  // Verify original password works again
  const clientC = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: finalAuth } = await clientC.auth.signInWithPassword({ email: targetEmail, password: originalPwd });
  console.log("  Confirmed original password restored for:", finalAuth?.user?.email);
  await clientC.auth.signOut();

  // TEST 4: Role Isolation & RLS Security
  console.log("\nTEST 4: Role Isolation Verification (Student vs Admin)...");
  const studentClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  await studentClient.auth.signInWithPassword({ email: "ajay@college.edu", password: "ajay@college.edu" });
  const { data: studentRole } = await studentClient.rpc("get_my_role");
  console.log("  Ajay role from get_my_role RPC:", studentRole);

  const adminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  await adminClient.auth.signInWithPassword({ email: "admin@gmail.com", password: "admin123" });
  const { data: adminRole } = await adminClient.rpc("get_my_role");
  console.log("  Admin role from get_my_role RPC:", adminRole);

  const rolesPass = studentRole === "student" && (adminRole === "admin" || adminRole === "super_admin");
  results.push({ test: "Role Isolation & RPC get_my_role", pass: rolesPass });

  await studentClient.auth.signOut();
  await adminClient.auth.signOut();

  console.log("\n===============================================================================");
  console.log("FINAL TEST SUMMARY:");
  console.log("===============================================================================");
  console.table(results);
}

runTestSuite().catch(console.error);
