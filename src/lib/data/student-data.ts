/**
 * SantoGe Talent Cloud — Student Data Service
 *
 * Authoritative integration for Live Supabase mode and fallback for Demo mode.
 * Rules:
 * - Specific column selection only (NO select('*')).
 * - Zero realtime subscriptions, zero continuous polling.
 * - Idempotent RPC / mutations.
 */

import { getSupabaseClient } from "@/lib/supabase";
import type { StudentAccount } from "@/lib/accounts";
import type { Profile, ReadinessInputs } from "@/lib/app-store";
import type { TrackId } from "@/lib/tracks";
import type {
  DbStudentProfile,
  DbStudentTrack,
  DbSkillCompletion,
  DbLabCompletion,
  DbDailyProgress,
  DbPlacementAttendance,
  DbTechnicalDay,
  DbAssessment,
  DbMockInterview,
  DbCertification,
} from "./types";

export type LiveStudentData = {
  profile: DbStudentProfile;
  tracks: TrackId[];
  skills: string[];
  completedLabs: string[];
  daily: { english: boolean; aptitude: boolean; practice: boolean };
  attendance: number[];
  completedTechDays: number[];
  assessments: Record<string, number>;
  mocks: Record<string, number>;
  certifications: string[];
};

/**
 * Fetch a Live student profile and assigned tracks from Supabase by auth user ID.
 */
export async function fetchLiveStudentProfile(
  authUserId: string,
): Promise<{ profile: DbStudentProfile; tracks: TrackId[] } | null> {
  const supabase = getSupabaseClient();

  const { data: profileData, error: profileErr } = await supabase
    .from("student_profiles")
    .select(
      "id,auth_user_id,institution_id,batch_id,name,email,roll_no,dept,college,status,xp,streak,placement_day,talent_score,readiness_t,readiness_c,readiness_a,readiness_e,readiness_r,readiness_m,created_at,updated_at",
    )
    .eq("auth_user_id", authUserId)
    .eq("status", "active")
    .maybeSingle();

  if (profileErr || !profileData) {
    return null;
  }

  const profile = profileData as unknown as DbStudentProfile;

  // Fetch assigned tracks
  const { data: tracksData } = await supabase
    .from("student_tracks")
    .select("track_id,position")
    .eq("student_id", profile.id)
    .order("position", { ascending: true });

  const rawTracks = (tracksData || []).map((t: { track_id: string }) => t.track_id as TrackId);
  const tracks: TrackId[] =
    rawTracks.length > 0 ? rawTracks : (["mern", "cloud", "aiml"] as TrackId[]);

  return { profile, tracks };
}

/**
 * Fetch complete live student progress data for the authenticated student.
 */
export async function fetchLiveStudentProgress(studentId: string): Promise<{
  skills: string[];
  completedLabs: string[];
  daily: { english: boolean; aptitude: boolean; practice: boolean };
  attendance: number[];
  completedTechDays: number[];
  assessments: Record<string, number>;
  mocks: Record<string, number>;
  certifications: string[];
}> {
  const supabase = getSupabaseClient();

  const todayStr = new Date().toISOString().split("T")[0];

  const [
    skillsRes,
    labsRes,
    dailyRes,
    attendanceRes,
    techDaysRes,
    assessmentsRes,
    mocksRes,
    certsRes,
  ] = await Promise.all([
    supabase.from("student_skill_completions").select("skill_id").eq("student_id", studentId),
    supabase.from("student_lab_completions").select("lab_id").eq("student_id", studentId),
    supabase
      .from("student_daily_progress")
      .select("english_completed,aptitude_completed,practice_completed")
      .eq("student_id", studentId)
      .eq("date", todayStr)
      .maybeSingle(),
    supabase
      .from("placement_attendance")
      .select("day")
      .eq("student_id", studentId)
      .order("day", { ascending: true }),
    supabase
      .from("student_technical_days")
      .select("day")
      .eq("student_id", studentId)
      .order("day", { ascending: true }),
    supabase.from("student_assessments").select("day,score").eq("student_id", studentId),
    supabase.from("student_mocks").select("mock_id,score").eq("student_id", studentId),
    supabase.from("student_certifications").select("label").eq("student_id", studentId),
  ]);

  const skills = (skillsRes.data || []).map((s: { skill_id: string }) => s.skill_id);
  const completedLabs = (labsRes.data || []).map((l: { lab_id: string }) => l.lab_id);

  const dailyData = dailyRes.data as {
    english_completed?: boolean;
    aptitude_completed?: boolean;
    practice_completed?: boolean;
  } | null;

  const daily = {
    english: Boolean(dailyData?.english_completed),
    aptitude: Boolean(dailyData?.aptitude_completed),
    practice: Boolean(dailyData?.practice_completed),
  };

  const attendance = (attendanceRes.data || []).map((a: { day: number }) => a.day);
  const completedTechDays = (techDaysRes.data || []).map((t: { day: number }) => t.day);

  const assessments: Record<string, number> = {};
  (assessmentsRes.data || []).forEach((a: { day: number; score: number }) => {
    assessments[String(a.day)] = Number(a.score);
  });

  const mocks: Record<string, number> = {};
  (mocksRes.data || []).forEach((m: { mock_id: string; score: number }) => {
    mocks[m.mock_id] = Number(m.score);
  });

  const certifications = (certsRes.data || []).map((c: { label: string }) => c.label);

  return {
    skills,
    completedLabs,
    daily,
    attendance,
    completedTechDays,
    assessments,
    mocks,
    certifications,
  };
}

// ---------------------------------------------------------------------------
// Atomic Live Mutations
// ---------------------------------------------------------------------------

export async function completeLivePlacementDay(
  studentId: string,
  day: number,
): Promise<{ ok: boolean; placement_day?: number; xp?: number }> {
  const supabase = getSupabaseClient();

  // Try RPC first for atomic update
  const { data, error } = await supabase.rpc("complete_student_placement_day", {
    p_student_id: studentId,
    p_day: day,
  });

  if (!error && data) {
    return data as { ok: boolean; placement_day?: number; xp?: number };
  }

  // Fallback direct table operations if RPC not yet deployed
  await supabase
    .from("placement_attendance")
    .upsert(
      { student_id: studentId, day, completed_at: new Date().toISOString() },
      { onConflict: "student_id,day" },
    );

  const { data: updated } = await supabase
    .from("student_profiles")
    .update({
      placement_day: Math.min(day + 1, 90),
      updated_at: new Date().toISOString(),
    })
    .eq("id", studentId)
    .select("placement_day,xp");
  const updatedData = updated as { placement_day?: number; xp?: number } | null;
  return {
    ok: true,
    ...(updatedData?.placement_day
      ? { placement_day: updatedData.placement_day }
      : { placement_day: day + 1 }),
    ...(typeof updatedData?.xp === "number" ? { xp: updatedData.xp } : {}),
  };
}

export async function completeLiveSkill(
  studentId: string,
  skillId: string,
  trackId: string,
): Promise<{ ok: boolean }> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.rpc("complete_student_skill", {
    p_student_id: studentId,
    p_skill_id: skillId,
    p_track_id: trackId,
  });

  if (!error) return { ok: true };

  // Fallback direct upsert
  await supabase.from("student_skill_completions").upsert(
    {
      student_id: studentId,
      skill_id: skillId,
      track_id: trackId,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "student_id,skill_id" },
  );

  return { ok: true };
}

export async function completeLiveLab(
  studentId: string,
  labId: string,
  label: string,
): Promise<{ ok: boolean }> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.rpc("complete_student_lab", {
    p_student_id: studentId,
    p_lab_id: labId,
    p_label: label,
  });

  if (!error) return { ok: true };

  await supabase.from("student_lab_completions").upsert(
    {
      student_id: studentId,
      lab_id: labId,
      label,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "student_id,lab_id" },
  );

  return { ok: true };
}

export async function completeLiveDailyStep(
  studentId: string,
  step: "english" | "aptitude" | "practice",
): Promise<{ ok: boolean }> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.rpc("complete_student_daily_step", {
    p_student_id: studentId,
    p_step: step,
  });

  if (!error) return { ok: true };

  const today = new Date().toISOString().split("T")[0];
  const patch: Record<string, boolean> = {
    english_completed: step === "english",
    aptitude_completed: step === "aptitude",
    practice_completed: step === "practice",
  };

  await supabase.from("student_daily_progress").upsert(
    {
      student_id: studentId,
      date: today,
      ...patch,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "student_id,date" },
  );

  return { ok: true };
}

export async function submitLiveAssessment(
  studentId: string,
  day: number,
  score: number,
): Promise<{ ok: boolean }> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.rpc("submit_student_assessment", {
    p_student_id: studentId,
    p_day: day,
    p_score: score,
  });

  if (!error) return { ok: true };

  await supabase.from("student_assessments").upsert(
    {
      student_id: studentId,
      day,
      score,
      submitted_at: new Date().toISOString(),
    },
    { onConflict: "student_id,day" },
  );

  return { ok: true };
}

export async function completeLiveMock(
  studentId: string,
  mockId: string,
  score: number,
  feedback: string = "",
): Promise<{ ok: boolean }> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.rpc("complete_student_mock", {
    p_student_id: studentId,
    p_mock_id: mockId,
    p_score: score,
    p_feedback: feedback,
  });

  if (!error) return { ok: true };

  await supabase.from("student_mocks").upsert(
    {
      student_id: studentId,
      mock_id: mockId,
      score,
      feedback_summary: feedback,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "student_id,mock_id" },
  );

  return { ok: true };
}

export async function issueLiveCertificate(
  studentId: string,
  label: string,
): Promise<{ ok: boolean }> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.rpc("issue_student_certificate", {
    p_student_id: studentId,
    p_label: label,
  });

  if (!error) return { ok: true };

  await supabase.from("student_certifications").upsert(
    {
      student_id: studentId,
      label,
      issued_at: new Date().toISOString(),
    },
    { onConflict: "student_id,label" },
  );

  return { ok: true };
}

export async function updateLiveStudentTracks(
  studentId: string,
  tracks: TrackId[],
): Promise<{ ok: boolean }> {
  const supabase = getSupabaseClient();

  // Delete existing tracks
  await supabase.from("student_tracks").delete().eq("student_id", studentId);

  // Insert new 1-3 tracks
  const rows = tracks.slice(0, 3).map((track_id, idx) => ({
    student_id: studentId,
    track_id,
    position: idx + 1,
  }));

  if (rows.length > 0) {
    await supabase.from("student_tracks").insert(rows);
  }

  return { ok: true };
}

export async function updateLiveReadiness(
  studentId: string,
  readiness: Partial<ReadinessInputs>,
): Promise<{ ok: boolean }> {
  const supabase = getSupabaseClient();

  const patch: Record<string, number> = {};
  if (typeof readiness.T === "number") patch["readiness_t"] = readiness.T;
  if (typeof readiness.C === "number") patch["readiness_c"] = readiness.C;
  if (typeof readiness.A === "number") patch["readiness_a"] = readiness.A;
  if (typeof readiness.E === "number") patch["readiness_e"] = readiness.E;
  if (typeof readiness.R === "number") patch["readiness_r"] = readiness.R;
  if (typeof readiness.M === "number") patch["readiness_m"] = readiness.M;

  if (Object.keys(patch).length > 0) {
    await supabase
      .from("student_profiles")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", studentId);
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Demo Mode Helpers (Pure local state facade)
// ---------------------------------------------------------------------------

export function getStudentProfile(
  email: string,
  localProfiles: Record<string, Profile>,
  _localAccounts: StudentAccount[],
): Profile | null {
  return localProfiles[email.toLowerCase().trim()] || null;
}
