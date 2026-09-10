/**
 * SantoGe Talent Cloud — Student Data Service
 *
 * Authoritative integration for Live Supabase mode.
 * Rules:
 * - Specific column selection only (NO select('*')).
 * - Zero realtime subscriptions, zero continuous polling.
 * - Idempotent RPC / mutations.
 */

import { getSupabaseClient } from "@/lib/supabase";
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
  ReadinessInputs,
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
  email?: string,
): Promise<{ profile: DbStudentProfile; tracks: TrackId[] } | null> {
  const supabase = getSupabaseClient();

  const { data: initialProfileData, error: profileErr } = await supabase
    .from("student_profiles")
    .select(
      "id,auth_user_id,institution_id,batch_id,name,email,roll_no,dept,college,status,xp,streak,placement_day,talent_score,readiness_t,readiness_c,readiness_a,readiness_e,readiness_r,readiness_m,created_at,updated_at",
    )
    .eq("auth_user_id", authUserId)
    .eq("status", "active")
    .maybeSingle();

  let profileData = initialProfileData;

  if (!profileData && email) {
    const normalizedEmail = email.trim().toLowerCase();
    const { data: byEmailData } = await supabase
      .from("student_profiles")
      .select(
        "id,auth_user_id,institution_id,batch_id,name,email,roll_no,dept,college,status,xp,streak,placement_day,talent_score,readiness_t,readiness_c,readiness_a,readiness_e,readiness_r,readiness_m,created_at,updated_at",
      )
      .eq("email", normalizedEmail)
      .eq("status", "active")
      .maybeSingle();

    if (byEmailData) {
      profileData = byEmailData;
      if (byEmailData.auth_user_id !== authUserId) {
        await supabase
          .from("student_profiles")
          .update({ auth_user_id: authUserId, updated_at: new Date().toISOString() })
          .eq("id", byEmailData.id);
      }
    }
  }

  if (profileErr) {
    throw new Error(profileErr.message);
  }

  if (!profileData) {
    return null;
  }

  const profile = profileData as unknown as DbStudentProfile;

  // Fetch assigned tracks
  const { data: tracksData, error: tracksErr } = await supabase
    .from("student_tracks")
    .select("track_id,position")
    .eq("student_id", profile.id)
    .order("position", { ascending: true });

  if (tracksErr) {
    throw new Error(tracksErr.message);
  }

  const rawTracks = (tracksData || []).map((t: { track_id: string }) => t.track_id as TrackId);
  const tracks: TrackId[] = rawTracks;

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

  if (skillsRes.error) throw new Error(skillsRes.error.message);
  if (labsRes.error) throw new Error(labsRes.error.message);
  if (attendanceRes.error) throw new Error(attendanceRes.error.message);
  if (techDaysRes.error) throw new Error(techDaysRes.error.message);
  if (assessmentsRes.error) throw new Error(assessmentsRes.error.message);
  if (mocksRes.error) throw new Error(mocksRes.error.message);
  if (certsRes.error) throw new Error(certsRes.error.message);

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
// Atomic Live Mutations (Direct Authoritative Supabase RPC)
// ---------------------------------------------------------------------------

export async function completeLivePlacementDay(
  studentId: string,
  day: number,
): Promise<{ ok: boolean; placement_day?: number; xp?: number; error?: string }> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc("complete_student_placement_day", {
    p_student_id: studentId,
    p_day: day,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const res = data as { ok?: boolean; placement_day?: number; xp?: number; error?: string } | null;
  if (res && res.ok === false) {
    return { ok: false, error: res.error || "Failed to complete placement day" };
  }

  return {
    ok: true,
    ...(res?.placement_day !== undefined ? { placement_day: res.placement_day } : {}),
    ...(res?.xp !== undefined ? { xp: res.xp } : {}),
  };
}

export async function completeLiveSkill(
  studentId: string,
  skillId: string,
  trackId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc("complete_student_skill", {
    p_student_id: studentId,
    p_skill_id: skillId,
    p_track_id: trackId,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const res = data as { ok?: boolean; error?: string } | null;
  if (res && res.ok === false) {
    return { ok: false, error: res.error || "Failed to complete skill" };
  }

  return { ok: true };
}

export async function completeLiveTechnicalDay(
  studentId: string,
  day: number,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from("student_technical_days").upsert(
    {
      student_id: studentId,
      day,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "student_id,day" },
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function completeLiveLab(
  studentId: string,
  labId: string,
  label: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc("complete_student_lab", {
    p_student_id: studentId,
    p_lab_id: labId,
    p_label: label,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const res = data as { ok?: boolean; error?: string } | null;
  if (res && res.ok === false) {
    return { ok: false, error: res.error || "Failed to complete lab" };
  }

  return { ok: true };
}

export async function completeLiveDailyStep(
  studentId: string,
  step: "english" | "aptitude" | "practice",
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc("complete_student_daily_step", {
    p_student_id: studentId,
    p_step: step,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const res = data as { ok?: boolean; error?: string } | null;
  if (res && res.ok === false) {
    return { ok: false, error: res.error || "Failed to complete daily step" };
  }

  return { ok: true };
}

export async function submitLiveAssessment(
  studentId: string,
  day: number,
  score: number,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc("submit_student_assessment", {
    p_student_id: studentId,
    p_day: day,
    p_score: score,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const res = data as { ok?: boolean; error?: string } | null;
  if (res && res.ok === false) {
    return { ok: false, error: res.error || "Failed to submit assessment" };
  }

  return { ok: true };
}

export async function completeLiveMock(
  studentId: string,
  mockId: string,
  score: number,
  feedback: string = "",
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc("complete_student_mock", {
    p_student_id: studentId,
    p_mock_id: mockId,
    p_score: score,
    p_feedback: feedback,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const res = data as { ok?: boolean; error?: string } | null;
  if (res && res.ok === false) {
    return { ok: false, error: res.error || "Failed to complete mock interview" };
  }

  return { ok: true };
}

export async function issueLiveCertificate(
  studentId: string,
  label: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase.rpc("issue_student_certificate", {
    p_student_id: studentId,
    p_label: label,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const res = data as { ok?: boolean; error?: string } | null;
  if (res && res.ok === false) {
    return { ok: false, error: res.error || "Failed to issue certificate" };
  }

  return { ok: true };
}

/**
 * Authoritative check to verify if a requested track is assigned to the student.
 * Ensures student access is strictly limited to their admin-assigned student_tracks.
 */
export function isStudentTrackAssigned(
  assignedTracks: TrackId[] | undefined,
  trackId: string | undefined,
): boolean {
  if (!assignedTracks || !trackId) return false;
  return assignedTracks.includes(trackId as TrackId);
}

export async function updateLiveReadiness(
  studentId: string,
  readiness: Partial<ReadinessInputs>,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  const patch: Record<string, number> = {};
  if (typeof readiness.T === "number") patch["readiness_t"] = readiness.T;
  if (typeof readiness.C === "number") patch["readiness_c"] = readiness.C;
  if (typeof readiness.A === "number") patch["readiness_a"] = readiness.A;
  if (typeof readiness.E === "number") patch["readiness_e"] = readiness.E;
  if (typeof readiness.R === "number") patch["readiness_r"] = readiness.R;
  if (typeof readiness.M === "number") patch["readiness_m"] = readiness.M;

  if (Object.keys(patch).length > 0) {
    const { error } = await supabase
      .from("student_profiles")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", studentId);

    if (error) {
      return { ok: false, error: error.message };
    }
  }

  return { ok: true };
}
