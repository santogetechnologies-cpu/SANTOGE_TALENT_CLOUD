import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ylofqmmbwgrqtsrclnww.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bIuZOdaZ_m3jp6s6cyoV_A_P8mKwqXf";

async function inspect() {
  const adminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: adminAuth, error: adminAuthErr } = await adminClient.auth.signInWithPassword({
    email: "admin@gmail.com",
    password: "admin123",
  });
  if (adminAuthErr) {
    console.error("Admin login error:", adminAuthErr);
    process.exit(1);
  }

  console.log("Logged in as admin successfully.");

  // Check curriculum_tracks
  const { data: tracks, error: tracksErr } = await adminClient
    .from("curriculum_tracks")
    .select("*")
    .limit(5);
  console.log("curriculum_tracks sample:", tracks, "error:", tracksErr);

  // Check total curriculum tracks count
  const { count: trackCount } = await adminClient
    .from("curriculum_tracks")
    .select("*", { count: "exact", head: true });
  console.log("curriculum_tracks total count:", trackCount);

  // Check curriculum_skills
  const { data: skills, error: skillsErr } = await adminClient
    .from("curriculum_skills")
    .select("*")
    .limit(5);
  console.log("curriculum_skills sample:", skills, "error:", skillsErr);

  // Check total curriculum skills count
  const { count: skillCount } = await adminClient
    .from("curriculum_skills")
    .select("*", { count: "exact", head: true });
  console.log("curriculum_skills total count:", skillCount);

  // Check student_tracks
  const { data: studentTracks, error: stErr } = await adminClient
    .from("student_tracks")
    .select("*")
    .limit(5);
  console.log("student_tracks sample:", studentTracks, "error:", stErr);

  // Check student_skill_completions
  const { data: completions, error: compErr } = await adminClient
    .from("student_skill_completions")
    .select("*")
    .limit(10);
  console.log("student_skill_completions sample:", completions, "error:", compErr);

  const { count: compCount } = await adminClient
    .from("student_skill_completions")
    .select("*", { count: "exact", head: true });
  console.log("student_skill_completions total count:", compCount);

  // Check Ajay's assigned tracks
  const { data: ajayProfile } = await adminClient
    .from("student_profiles")
    .select("id, name, email")
    .eq("email", "ajay@college.edu")
    .single();

  const { data: ajayTracks } = await adminClient
    .from("student_tracks")
    .select("*")
    .eq("student_id", ajayProfile.id);
  console.log("Ajay's assigned tracks:", ajayTracks);

  // Check Ajay's existing completions
  const { data: ajayCompletions } = await adminClient
    .from("student_skill_completions")
    .select("*")
    .eq("student_id", ajayProfile.id);
  console.log("Ajay's completions count:", ajayCompletions?.length, ajayCompletions);
}

inspect();
