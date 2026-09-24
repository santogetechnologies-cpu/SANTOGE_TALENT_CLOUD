import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ylofqmmbwgrqtsrclnww.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bIuZOdaZ_m3jp6s6cyoV_A_P8mKwqXf";

async function cleanupBaselineArtifacts() {
  const adminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  await adminClient.auth.signInWithPassword({
    email: "admin@gmail.com",
    password: "admin123",
  });

  const { data: studentA } = await adminClient
    .from("student_profiles")
    .select("id, xp")
    .eq("email", "ajay@college.edu")
    .single();

  console.log("Current Ajay state:", studentA);

  const { data: completions } = await adminClient
    .from("student_skill_completions")
    .select("*")
    .eq("student_id", studentA.id);

  console.log("Completions for Ajay:", completions);

  // Delete completions
  const { error: delErr } = await adminClient
    .from("student_skill_completions")
    .delete()
    .eq("student_id", studentA.id);

  console.log("Deleted completions error:", delErr);

  // Reset Ajay's XP back to 270 (original baseline before the test run)
  // Note: Since admin trigger is in effect, let's see if admin can update xp directly
  const { error: updateErr } = await adminClient
    .from("student_profiles")
    .update({ xp: 270 })
    .eq("id", studentA.id);

  console.log("Reset Ajay XP error:", updateErr);

  const { data: freshStudentA } = await adminClient
    .from("student_profiles")
    .select("id, xp")
    .eq("email", "ajay@college.edu")
    .single();

  console.log("Cleaned Ajay state:", freshStudentA);
}

cleanupBaselineArtifacts();
