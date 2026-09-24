import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ylofqmmbwgrqtsrclnww.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bIuZOdaZ_m3jp6s6cyoV_A_P8mKwqXf";

async function inspectAll() {
  const adminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  await adminClient.auth.signInWithPassword({
    email: "admin@gmail.com",
    password: "admin123",
  });

  // Check content_items
  const { data: content, count: contentCount } = await adminClient
    .from("content_items")
    .select("id, title, track, kind, status", { count: "exact" })
    .limit(10);
  console.log("content_items count:", contentCount, "sample:", content);

  // Check platform_settings
  const { data: settings } = await adminClient
    .from("platform_settings")
    .select("*");
  console.log("platform_settings:", settings);

  // Check if there are any other tables
  const tables = [
    "curriculum_tracks",
    "curriculum_skills",
    "student_skill_completions",
    "student_lab_completions",
    "student_daily_progress",
    "student_tracks",
    "student_profiles",
    "placement_drives",
    "job_applications",
    "institutions",
    "batches",
  ];

  for (const t of tables) {
    const { count, error } = await adminClient
      .from(t)
      .select("*", { count: "exact", head: true });
    console.log(`Table ${t}: count=${count}, error=${error?.message || "none"}`);
  }
}

inspectAll();
