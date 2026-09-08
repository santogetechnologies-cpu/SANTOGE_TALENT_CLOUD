/**
 * SantoGe Talent Cloud — Admin Data Service
 *
 * Authoritative integration for Live Supabase mode (Super Admin) and fallback for Demo mode.
 * Rules:
 * - Specific column selection only (NO select('*')).
 * - Dynamic derived metrics (enrolled counts, averages).
 * - Zero realtime subscriptions, zero continuous polling.
 */

import { getSupabaseClient } from "@/lib/supabase";
import type { Batch, ProvisionedStudent } from "@/lib/app-store";
import type { TrackId } from "@/lib/tracks";
import type { DbBatch, DbStudentProfile, DbInstitution, DbPlatformSettings } from "./types";

export type LiveRosterItem = {
  id: string;
  auth_user_id: string | null;
  name: string;
  email: string;
  rollNo: string;
  dept: string;
  college: string;
  batchId: string;
  status: "active" | "suspended" | "deleted";
  placementDay: number;
  talentScore: number;
  tracks: TrackId[];
  readiness: { T: number; C: number; A: number; E: number; R: number; M: number };
  gateCleared: boolean;
};

export type LiveAnalyticsData = {
  totalEnrolled: number;
  totalBatches: number;
  avgReadiness: number;
  marketplaceReadyCount: number;
  marketplacePercent: number;
  institutions: Array<{ id: string; name: string; code: string; studentCount: number }>;
  batches: Array<DbBatch & { enrolled_count: number }>;
  funnel: Array<{ label: string; count: number; pct: number; color: string }>;
};

/**
 * Fetch authoritative Live Super Admin analytics metrics from Supabase.
 */
export async function fetchLiveAdminAnalytics(
  selectedInstId: string = "all",
): Promise<LiveAnalyticsData> {
  const supabase = getSupabaseClient();

  // 1. Fetch active students with specific columns
  let studentQuery = supabase
    .from("student_profiles")
    .select(
      "id,name,email,dept,college,batch_id,institution_id,status,placement_day,talent_score,readiness_t,readiness_c,readiness_a,readiness_e,readiness_r,readiness_m",
    )
    .eq("status", "active");

  if (selectedInstId !== "all") {
    studentQuery = studentQuery.or(
      `institution_id.eq.${selectedInstId},college.ilike.%${selectedInstId}%`,
    );
  }

  const [studentsRes, batchesRes, institutionsRes] = await Promise.all([
    studentQuery,
    supabase
      .from("batches")
      .select("id,institution_id,name,capacity,dept,status,last_sync_at,created_at,updated_at")
      .eq("status", "active")
      .order("name", { ascending: true }),
    supabase
      .from("institutions")
      .select("id,name,code,status,created_at,updated_at")
      .eq("status", "active"),
  ]);

  const students = (studentsRes.data || []) as unknown as Array<{
    id: string;
    name: string;
    email: string;
    dept: string;
    college: string;
    batch_id: string | null;
    institution_id: string | null;
    placement_day: number;
    talent_score: number;
    readiness_t: number;
    readiness_c: number;
    readiness_a: number;
    readiness_e: number;
    readiness_r: number;
    readiness_m: number;
  }>;

  const totalEnrolled = students.length;

  // Batch enrolled mapping derived dynamically from student_profiles
  const batchCounts: Record<string, number> = {};
  students.forEach((s) => {
    if (s.batch_id) {
      batchCounts[s.batch_id] = (batchCounts[s.batch_id] || 0) + 1;
    }
  });

  const rawBatches = (batchesRes.data || []) as DbBatch[];
  const batches = rawBatches.map((b) => ({
    ...b,
    enrolled_count: batchCounts[b.id] || 0,
  }));

  // Average readiness
  let avgReadiness = 0;
  if (totalEnrolled > 0) {
    const sum = students.reduce((acc, s) => {
      const idx =
        s.readiness_t * 0.25 +
        s.readiness_c * 0.2 +
        s.readiness_a * 0.15 +
        s.readiness_e * 0.15 +
        s.readiness_r * 0.15 +
        s.readiness_m * 0.1;
      return acc + idx;
    }, 0);
    avgReadiness = Math.round(sum / totalEnrolled);
  }

  const marketplaceReadyCount = students.filter((s) => s.talent_score >= 700).length;
  const marketplacePercent =
    totalEnrolled > 0 ? Math.round((marketplaceReadyCount / totalEnrolled) * 100) : 0;

  // Institutions aggregation
  const instMap = new Map<
    string,
    { id: string; name: string; code: string; studentCount: number }
  >();
  (institutionsRes.data || []).forEach((inst: DbInstitution) => {
    instMap.set(inst.id, { id: inst.id, name: inst.name, code: inst.code, studentCount: 0 });
  });

  students.forEach((s) => {
    if (s.institution_id && instMap.has(s.institution_id)) {
      const existing = instMap.get(s.institution_id)!;
      existing.studentCount += 1;
    } else if (s.college) {
      const colId = s.college.toLowerCase().replace(/\s+/g, "-");
      if (!instMap.has(colId)) {
        instMap.set(colId, { id: colId, name: s.college, code: colId, studentCount: 0 });
      }
      instMap.get(colId)!.studentCount += 1;
    }
  });

  // Dynamic Funnel calculations
  const stage1 = totalEnrolled;
  const stage2 = students.filter((s) => s.placement_day >= 2).length;
  const stage3 = students.filter((s) => s.talent_score >= 500).length;
  const stage4 = students.filter((s) => s.placement_day >= 30).length;
  const stage5 = students.filter((s) => s.talent_score >= 600).length;
  const stage6 = marketplaceReadyCount;

  const funnel = [
    { label: "Total Provisioned Cohort", count: stage1, pct: 100, color: "var(--brand-cyan)" },
    {
      label: "Phase 1: Twin 30m Active",
      count: stage2,
      pct: totalEnrolled ? Math.round((stage2 / totalEnrolled) * 100) : 0,
      color: "var(--brand-purple)",
    },
    {
      label: "Phase 1: Labs & Sandboxes Verified",
      count: stage3,
      pct: totalEnrolled ? Math.round((stage3 / totalEnrolled) * 100) : 0,
      color: "var(--brand-emerald)",
    },
    {
      label: "Dual Gate: 100% Verified Cleared",
      count: stage4,
      pct: totalEnrolled ? Math.round((stage4 / totalEnrolled) * 100) : 0,
      color: "var(--brand-amber)",
    },
    {
      label: "Phase 2: AI & Mentor Mock Panels",
      count: stage5,
      pct: totalEnrolled ? Math.round((stage5 / totalEnrolled) * 100) : 0,
      color: "var(--brand-rose)",
    },
    {
      label: "Recruiter Offers & Marketplace Ready",
      count: stage6,
      pct: totalEnrolled ? Math.round((stage6 / totalEnrolled) * 100) : 0,
      color: "#10b981",
    },
  ];

  return {
    totalEnrolled,
    totalBatches: batches.length,
    avgReadiness,
    marketplaceReadyCount,
    marketplacePercent,
    institutions: Array.from(instMap.values()),
    batches,
    funnel,
  };
}

/**
 * Fetch paginated live student roster from Supabase.
 */
export async function fetchLiveStudentRoster(options?: {
  page?: number | undefined;
  pageSize?: number | undefined;
  institutionId?: string | undefined;
  searchQuery?: string | undefined;
  trackId?: string | undefined;
  tier?: string | undefined;
  driveMinScore?: number | undefined;
}): Promise<{ items: LiveRosterItem[]; totalCount: number }> {
  const supabase = getSupabaseClient();
  const page = options?.page ?? 0;
  const pageSize = options?.pageSize ?? 50;

  let query = supabase
    .from("student_profiles")
    .select(
      "id,auth_user_id,name,email,roll_no,dept,college,batch_id,status,placement_day,talent_score,readiness_t,readiness_c,readiness_a,readiness_e,readiness_r,readiness_m",
      { count: "exact" },
    )
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (options?.institutionId && options.institutionId !== "all") {
    query = query.or(
      `institution_id.eq.${options.institutionId},college.ilike.%${options.institutionId}%`,
    );
  }

  if (options?.searchQuery) {
    const q = options.searchQuery.trim();
    query = query.or(
      `name.ilike.%${q}%,email.ilike.%${q}%,roll_no.ilike.%${q}%,dept.ilike.%${q}%,college.ilike.%${q}%`,
    );
  }

  if (typeof options?.driveMinScore === "number") {
    query = query.gte("talent_score", options.driveMinScore);
  }

  if (options?.tier === "marketplace") {
    query = query.gte("talent_score", 700);
  } else if (options?.tier === "ats") {
    query = query.gte("talent_score", 450).lt("talent_score", 700);
  } else if (options?.tier === "phase1") {
    query = query.lt("talent_score", 450);
  }

  query = query.range(page * pageSize, (page + 1) * pageSize - 1);

  const { data: studentRows, count } = await query;
  if (!studentRows || studentRows.length === 0) {
    return { items: [], totalCount: count || 0 };
  }

  const studentIds = studentRows.map((s: { id: string }) => s.id);

  // Fetch tracks for these students
  const { data: tracksData } = await supabase
    .from("student_tracks")
    .select("student_id,track_id,position")
    .in("student_id", studentIds)
    .order("position", { ascending: true });

  const tracksByStudent: Record<string, TrackId[]> = {};
  (tracksData || []).forEach((t: { student_id: string; track_id: string }) => {
    const list = tracksByStudent[t.student_id] ?? [];
    list.push(t.track_id as TrackId);
    tracksByStudent[t.student_id] = list;
  });

  interface StudentRow {
    id: string;
    auth_user_id: string | null;
    name: string;
    email: string;
    roll_no: string | null;
    dept: string | null;
    college: string | null;
    batch_id: string | null;
    status: string;
    placement_day: number;
    talent_score: number;
    readiness_t: number;
    readiness_c: number;
    readiness_a: number;
    readiness_e: number;
    readiness_r: number;
    readiness_m?: number;
  }

  const items: LiveRosterItem[] = (studentRows as unknown as StudentRow[]).map((s) => ({
    id: s.id,
    auth_user_id: s.auth_user_id,
    name: s.name,
    email: s.email,
    rollNo: s.roll_no || "2026-ROLL",
    dept: s.dept || "CSE",
    college: s.college || "Partner Engineering College",
    batchId: s.batch_id || "BATCH-2026-LIVE-01",
    status: (s.status === "suspended" || s.status === "deleted" ? s.status : "active") as
      "active" | "suspended" | "deleted",
    placementDay: s.placement_day,
    talentScore: s.talent_score,
    tracks: tracksByStudent[s.id] || ["mern", "cloud"],
    readiness: {
      T: s.readiness_t,
      C: s.readiness_c,
      A: s.readiness_a,
      E: s.readiness_e,
      R: s.readiness_r,
      M: s.readiness_m ?? 80,
    },
    gateCleared: s.placement_day >= 30,
  }));

  return { items, totalCount: count || items.length };
}

// ---------------------------------------------------------------------------
// Batch Management Mutations
// ---------------------------------------------------------------------------

export async function fetchLiveBatches(): Promise<Array<DbBatch & { enrolled_count: number }>> {
  const supabase = getSupabaseClient();

  const [batchesRes, studentsRes] = await Promise.all([
    supabase
      .from("batches")
      .select("id,institution_id,name,capacity,dept,status,last_sync_at,created_at,updated_at")
      .eq("status", "active")
      .order("name", { ascending: true }),
    supabase.from("student_profiles").select("batch_id").eq("status", "active"),
  ]);

  const batchCounts: Record<string, number> = {};
  (studentsRes.data || []).forEach((s: { batch_id: string | null }) => {
    if (s.batch_id) {
      batchCounts[s.batch_id] = (batchCounts[s.batch_id] || 0) + 1;
    }
  });

  const batches = (batchesRes.data || []) as DbBatch[];
  return batches.map((b) => ({
    ...b,
    enrolled_count: batchCounts[b.id] || 0,
  }));
}

export async function createLiveBatch(batch: {
  name: string;
  capacity: number;
  dept: string;
  institution_id?: string | null;
}): Promise<{ ok: boolean; data?: DbBatch; error?: string }> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("batches")
    .insert({
      name: batch.name,
      capacity: batch.capacity || 300,
      dept: batch.dept || "Engineering",
      institution_id: batch.institution_id || null,
      status: "active",
      last_sync_at: new Date().toISOString(),
    })
    .select("id,institution_id,name,capacity,dept,status,last_sync_at,created_at,updated_at")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data: data as DbBatch };
}

export async function updateLiveBatch(
  id: string,
  patch: Partial<DbBatch>,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  const updateFields: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name) updateFields["name"] = patch.name;
  if (typeof patch.capacity === "number") updateFields["capacity"] = patch.capacity;
  if (patch.dept) updateFields["dept"] = patch.dept;
  if (patch.status) updateFields["status"] = patch.status;
  if (patch.last_sync_at) updateFields["last_sync_at"] = patch.last_sync_at;

  const { error } = await supabase.from("batches").update(updateFields).eq("id", id);
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

export async function deleteLiveBatch(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from("batches").update({ status: "archived" }).eq("id", id);
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Student Management Mutations
// ---------------------------------------------------------------------------

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolves a batch name or UUID string into a valid public.batches(id) UUID.
 * Idempotently creates the batch row if it doesn't exist yet.
 */
export async function resolveBatchId(
  batchIdentifier: string | undefined | null,
  dept: string = "CSE",
): Promise<string | null> {
  if (!batchIdentifier) return null;
  const raw = batchIdentifier.trim();
  const supabase = getSupabaseClient();

  if (UUID_REGEX.test(raw)) {
    const { data } = await supabase.from("batches").select("id").eq("id", raw).maybeSingle();
    if (data?.id) return data.id;
  }

  // Look up by name
  const { data: byName } = await supabase
    .from("batches")
    .select("id")
    .eq("name", raw)
    .maybeSingle();
  if (byName?.id) return byName.id;

  // Create batch dynamically if not found
  const { data: created } = await supabase
    .from("batches")
    .insert({
      name: raw,
      dept: dept || "CSE",
      capacity: 300,
      status: "active",
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  return (created as { id: string })?.id ?? null;
}

export async function deleteLiveStudent(
  studentIdentifier: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  const raw = studentIdentifier.trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);

  const query = supabase
    .from("student_profiles")
    .update({ status: "deleted", updated_at: new Date().toISOString() });

  const { error } = isUuid ? await query.eq("id", raw) : await query.eq("email", raw.toLowerCase());

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function addLiveStudent(student: {
  name: string;
  email: string;
  password?: string;
  rollNo: string;
  dept: string;
  batchId: string;
  college?: string;
  tracks?: TrackId[];
}): Promise<{ ok: boolean; message: string; studentId?: string }> {
  const supabase = getSupabaseClient();
  const email = student.email.trim().toLowerCase();
  const password = student.password || "Temp@1234";

  // Resolve batch UUID
  const resolvedBatchUuid = await resolveBatchId(student.batchId, student.dept);

  // 1. Sign up Supabase Auth user
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: student.name,
        role: "student",
        roll_no: student.rollNo,
        dept: student.dept,
        batch_id: resolvedBatchUuid || student.batchId,
        college: student.college || "Partner Engineering College",
        tracks: student.tracks || ["mern", "cloud"],
      },
    },
  });

  if (authErr && !authErr.message.includes("already registered")) {
    return { ok: false, message: authErr.message };
  }

  const authUserId = authData?.user?.id;

  // 2. Insert/Upsert into student_profiles (NEVER storing password in database)
  const { data: profileData, error: profileErr } = await supabase
    .from("student_profiles")
    .upsert(
      {
        ...(authUserId ? { auth_user_id: authUserId } : {}),
        name: student.name,
        email,
        roll_no: student.rollNo,
        dept: student.dept,
        batch_id: resolvedBatchUuid,
        college: student.college || "Partner Engineering College",
        status: "active",
        xp: 250,
        streak: 1,
        placement_day: 1,
        talent_score: 520,
        readiness_t: 60,
        readiness_c: 55,
        readiness_a: 55,
        readiness_e: 60,
        readiness_r: 40,
        readiness_m: 25,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" },
    )
    .select("id")
    .single();

  if (profileErr) {
    return { ok: false, message: profileErr.message };
  }

  const studentId = (profileData as { id: string })?.id;

  // 3. Assign technical tracks
  if (studentId && student.tracks && student.tracks.length > 0) {
    await supabase.from("student_tracks").delete().eq("student_id", studentId);
    const trackRows = student.tracks.slice(0, 3).map((t, idx) => ({
      student_id: studentId,
      track_id: t,
      position: idx + 1,
    }));
    await supabase.from("student_tracks").insert(trackRows);
  }

  return { ok: true, message: `Student account provisioned for ${email}`, studentId };
}

export async function provisionLiveStudents(
  rows: ProvisionedStudent[],
): Promise<{ ok: boolean; count: number; message: string }> {
  let createdCount = 0;

  for (const r of rows) {
    const rawTracks = [r.course_1, r.course_2, r.course_3].filter(Boolean) as TrackId[];
    const res = await addLiveStudent({
      name: r.student_name,
      email: r.email,
      password: r.password || "Temp@1234",
      rollNo: r.roll_no,
      dept: r.dept,
      batchId: r.batch_id,
      college: r.college || "Partner Engineering College",
      tracks: rawTracks.length > 0 ? rawTracks : ["mern", "cloud"],
    });
    if (res.ok) createdCount += 1;
  }

  return {
    ok: true,
    count: createdCount,
    message: `${createdCount} students provisioned to Supabase backend`,
  };
}

// ---------------------------------------------------------------------------
// Platform Settings
// ---------------------------------------------------------------------------

export async function fetchLivePlatformSettings(): Promise<DbPlatformSettings["value"] | null> {
  const supabase = getSupabaseClient();

  const { data } = await supabase
    .from("platform_settings")
    .select("key,value")
    .eq("key", "completion_rules")
    .maybeSingle();

  return (data as { value: DbPlatformSettings["value"] })?.value || null;
}

export async function updateLivePlatformSettings(
  value: DbPlatformSettings["value"],
): Promise<{ ok: boolean }> {
  const supabase = getSupabaseClient();

  await supabase.from("platform_settings").upsert(
    {
      key: "completion_rules",
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  return { ok: true };
}
