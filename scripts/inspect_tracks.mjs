import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ylofqmmbwgrqtsrclnww.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bIuZOdaZ_m3jp6s6cyoV_A_P8mKwqXf";

async function inspectStudentTracks() {
  const adminClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  await adminClient.auth.signInWithPassword({
    email: "admin@gmail.com",
    password: "admin123",
  });

  const { data: st } = await adminClient
    .from("student_tracks")
    .select("track_id");

  const distinct = [...new Set(st.map(s => s.track_id))];
  console.log("Distinct tracks in student_tracks:", distinct);

  // Also check curriculum_tracks
  const { data: ct } = await adminClient
    .from("curriculum_tracks")
    .select("id, name");
  console.log("All tracks in curriculum_tracks:", ct);
}

inspectStudentTracks();
