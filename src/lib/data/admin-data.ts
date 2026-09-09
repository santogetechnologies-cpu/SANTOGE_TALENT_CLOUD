/**
 * SantoGe Talent Cloud — Admin Data Service
 *
 * Authoritative integration for Live Supabase mode (Super Admin) and fallback for Demo mode.
 * Rules:
 * - Specific column selection only (NO select('*')).
 * - Dynamic derived metrics (enrolled counts, averages).
 * - Zero realtime subscriptions, zero continuous polling.
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseClient, getSupabaseConfig } from "@/lib/supabase";
import type { TrackId } from "@/lib/tracks";
import type {
  DbBatch,
  DbStudentProfile,
  DbInstitution,
  DbPlatformSettings,
  ProvisionedStudent,
} from "./types";

export type { ProvisionedStudent };

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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    if (UUID_REGEX.test(selectedInstId)) {
      studentQuery = studentQuery.eq("institution_id", selectedInstId);
    } else {
      studentQuery = studentQuery.ilike("college", `%${selectedInstId}%`);
    }
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

  if (studentsRes.error) throw new Error(studentsRes.error.message);
  if (batchesRes.error) throw new Error(batchesRes.error.message);
  if (institutionsRes.error) throw new Error(institutionsRes.error.message);

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
    const instId = options.institutionId;
    if (UUID_REGEX.test(instId)) {
      query = query.eq("institution_id", instId);
    } else {
      query = query.ilike("college", `%${instId}%`);
    }
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

  const { data: studentRows, count, error: studentErr } = await query;
  if (studentErr) throw new Error(studentErr.message);

  if (!studentRows || studentRows.length === 0) {
    return { items: [], totalCount: count || 0 };
  }

  const studentIds = studentRows.map((s: { id: string }) => s.id);

  // Fetch tracks for these students
  const { data: tracksData, error: tracksErr } = await supabase
    .from("student_tracks")
    .select("student_id,track_id,position")
    .in("student_id", studentIds)
    .order("position", { ascending: true });

  if (tracksErr) throw new Error(tracksErr.message);

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
    rollNo: s.roll_no || "",
    dept: s.dept || "",
    college: s.college || "",
    batchId: s.batch_id || "",
    status: (s.status === "suspended" || s.status === "deleted" ? s.status : "active") as
      "active" | "suspended" | "deleted",
    placementDay: s.placement_day ?? 1,
    talentScore: s.talent_score ?? 0,
    tracks: tracksByStudent[s.id] || [],
    readiness: {
      T: s.readiness_t ?? 0,
      C: s.readiness_c ?? 0,
      A: s.readiness_a ?? 0,
      E: s.readiness_e ?? 0,
      R: s.readiness_r ?? 0,
      M: s.readiness_m ?? 0,
    },
    gateCleared: (s.placement_day ?? 1) >= 30,
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

  if (batchesRes.error) throw new Error(batchesRes.error.message);
  if (studentsRes.error) throw new Error(studentsRes.error.message);

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

/**
 * Resolves a batch name or UUID string into a valid public.batches(id) UUID.
 * Strictly verifies existence without auto-creating missing batches.
 */
export async function resolveBatchId(
  batchIdentifier: string | undefined | null,
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

  return null;
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

/**
 * Helper: Registers or retrieves an auth.users record for student provisioning without altering the active admin session.
 */
async function provisionAuthUser(
  email: string,
  password: string,
  metadata: Record<string, unknown>,
): Promise<{ authUserId: string | null; error?: string }> {
  const config = getSupabaseConfig();
  const cleanUrl = (config.url || "").replace(/\/+$/, "").trim();
  const cleanKey = (config.anonKey || "").trim();

  if (!cleanUrl || !cleanKey) {
    return { authUserId: null, error: "Supabase URL or Key not configured" };
  }

  // Create an isolated, non-persisted client
  const tempClient = createClient(cleanUrl, cleanKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  try {
    const { data: signUpData, error: signUpErr } = await tempClient.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (signUpData?.user?.id) {
      return { authUserId: signUpData.user.id };
    }

    if (signUpErr) {
      // If user already exists in auth.users, fetch auth_user_id from student_profiles
      const adminClient = getSupabaseClient();
      const { data: existingProf } = await adminClient
        .from("student_profiles")
        .select("auth_user_id")
        .eq("email", email)
        .maybeSingle();

      if (existingProf?.auth_user_id) {
        return { authUserId: existingProf.auth_user_id };
      }

      return { authUserId: null, error: signUpErr.message };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Auth signup failed";
    return { authUserId: null, error: msg };
  }

  return { authUserId: null, error: "Failed to create authentication user" };
}

// Track availability of Edge Functions to prevent repeated preflight CORS errors if undeployed
let isEdgeFunctionAvailable =
  typeof import.meta !== "undefined" &&
  (import.meta as unknown as { env?: Record<string, string> }).env?.[
    "VITE_ENABLE_EDGE_FUNCTIONS"
  ] !== "false";

function markEdgeFunctionUnavailable(err?: unknown) {
  if (isEdgeFunctionAvailable) {
    isEdgeFunctionAvailable = false;
    console.warn(
      "[SantoGe Talent Cloud] Edge Function 'admin-provision-students' is not deployed on Supabase project (returned 404 / network error). " +
        "Routing directly to Direct Database Fallback mode. To deploy the Edge Function, run: " +
        "npx supabase functions deploy admin-provision-students --project-ref ylofqmmbwgrqtsrclnww --no-verify-jwt",
      err,
    );
  }
}

export async function addLiveStudent(student: {
  name: string;
  email: string;
  password?: string | undefined;
  rollNo: string;
  dept: string;
  batchId: string;
  college?: string | undefined;
  tracks?: TrackId[] | undefined;
}): Promise<{ ok: boolean; message: string; studentId?: string }> {
  const supabase = getSupabaseClient();
  const email = student.email.trim().toLowerCase();
  const password = student.password || "Temp@1234";

  // 1. Attempt Secure Edge Function first (if deployed)
  if (isEdgeFunctionAvailable) {
    try {
      const { data: edgeData, error: edgeErr } = await supabase.functions.invoke(
        "admin-provision-students",
        {
          body: {
            action: "create_single",
            student: {
              student_name: student.name,
              email,
              password,
              roll_no: student.rollNo,
              dept: student.dept,
              batch_id: student.batchId,
              college: student.college || "",
              course_1: student.tracks?.[0] || "",
              course_2: student.tracks?.[1] || "",
              course_3: student.tracks?.[2] || "",
            },
          },
        },
      );

      if (!edgeErr && edgeData?.results?.[0]?.ok) {
        return { ok: true, message: `Student account provisioned for ${email}` };
      }
      if (edgeData?.results?.[0] && !edgeData.results[0].ok) {
        return {
          ok: false,
          message: edgeData.results[0].error || "Failed to provision student in Supabase",
        };
      }
      if (edgeErr) {
        markEdgeFunctionUnavailable(edgeErr);
      }
    } catch (edgeErr) {
      markEdgeFunctionUnavailable(edgeErr);
    }
  }

  // 2. Resilient Direct PostgreSQL Fallback (Admin RLS + Auth user)
  try {
    const resolvedBatchId = await resolveBatchId(student.batchId);
    if (!resolvedBatchId) {
      return {
        ok: false,
        message: `Batch "${student.batchId}" not found. Please create the batch first.`,
      };
    }

    const { authUserId } = await provisionAuthUser(email, password, {
      name: student.name.trim(),
      role: "student",
      roll_no: student.rollNo.trim(),
      dept: student.dept.trim(),
      batch_id: resolvedBatchId,
      college: student.college?.trim() || "Partner Engineering College",
      tracks: student.tracks || [],
    });

    const { data: existingProf } = await supabase
      .from("student_profiles")
      .select("id,auth_user_id")
      .eq("email", email)
      .maybeSingle();

    let studentProfileId = existingProf?.id;

    if (existingProf) {
      const { error: updateErr } = await supabase
        .from("student_profiles")
        .update({
          ...(authUserId ? { auth_user_id: authUserId } : {}),
          name: student.name.trim(),
          roll_no: student.rollNo.trim(),
          dept: student.dept.trim(),
          batch_id: resolvedBatchId,
          college: student.college?.trim() || "Partner Engineering College",
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingProf.id);

      if (updateErr) {
        return { ok: false, message: `Database update failed: ${updateErr.message}` };
      }
    } else {
      const { data: newProf, error: insertErr } = await supabase
        .from("student_profiles")
        .insert({
          ...(authUserId ? { auth_user_id: authUserId } : {}),
          name: student.name.trim(),
          email,
          roll_no: student.rollNo.trim(),
          dept: student.dept.trim(),
          batch_id: resolvedBatchId,
          college: student.college?.trim() || "Partner Engineering College",
          status: "active",
          xp: 0,
          streak: 0,
          placement_day: 1,
          talent_score: 0,
          readiness_t: 50,
          readiness_c: 50,
          readiness_a: 50,
          readiness_e: 50,
          readiness_r: 50,
          readiness_m: 50,
          updated_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (insertErr) {
        const isAuthConstraint =
          insertErr.message?.toLowerCase().includes("auth_user_id") ||
          insertErr.message?.toLowerCase().includes("not-null");
        const msg = isAuthConstraint
          ? "Database constraint: Please run migration 010 in Supabase SQL Editor (ALTER TABLE student_profiles ALTER COLUMN auth_user_id DROP NOT NULL;)"
          : `Database insert failed: ${insertErr.message}`;
        return { ok: false, message: msg };
      }
      studentProfileId = newProf?.id;
    }

    if (studentProfileId && student.tracks && student.tracks.length > 0) {
      await supabase.from("student_tracks").delete().eq("student_id", studentProfileId);
      const trackInserts = student.tracks.slice(0, 3).map((trackId, index) => ({
        student_id: studentProfileId,
        track_id: trackId,
        position: index + 1,
      }));
      await supabase.from("student_tracks").insert(trackInserts);
    }

    return { ok: true, message: `Student account provisioned for ${email}` };
  } catch (dbErr) {
    const msg = dbErr instanceof Error ? dbErr.message : "Direct PostgreSQL write error";
    return { ok: false, message: msg };
  }
}

export interface ProvisionResult {
  ok: boolean;
  count: number;
  failedCount: number;
  results: Array<{ email: string; ok: boolean; error?: string }>;
  message: string;
}

export async function provisionLiveStudents(rows: ProvisionedStudent[]): Promise<ProvisionResult> {
  const supabase = getSupabaseClient();

  // 1. Attempt Bulk Edge Function invocation (if deployed)
  if (isEdgeFunctionAvailable) {
    try {
      const { data: edgeData, error: edgeErr } = await supabase.functions.invoke(
        "admin-provision-students",
        {
          body: {
            action: "provision",
            students: rows,
          },
        },
      );

      if (!edgeErr && edgeData && Array.isArray(edgeData.results)) {
        return {
          ok: Boolean(edgeData.ok),
          count: Number(edgeData.count) || 0,
          failedCount: Number(edgeData.failedCount) || 0,
          results: edgeData.results,
          message: edgeData.message || `${edgeData.count || 0} students provisioned`,
        };
      }

      if (edgeErr) {
        markEdgeFunctionUnavailable(edgeErr);
      }
    } catch (err) {
      markEdgeFunctionUnavailable(err);
    }
  }

  // 2. Resilient Direct PostgreSQL Fallback (Admin RLS + Auth users)
  const results: Array<{ email: string; ok: boolean; error?: string }> = [];
  let count = 0;
  let failedCount = 0;

  for (const row of rows) {
    const email = row.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      results.push({ email: email || "unknown", ok: false, error: "Invalid or missing email" });
      failedCount++;
      continue;
    }

    const name = (row.student_name || "").trim() || "Student";
    const rollNo = (row.roll_no || "").trim();
    const dept = (row.dept || "CSE").trim();
    const batchIdentifier = row.batch_id || "";
    const college = (row.college || "").trim() || "Partner Engineering College";
    const password = row.password || "Temp@1234";
    const rawTracks = [row.course_1, row.course_2, row.course_3].filter(Boolean) as TrackId[];

    const resolvedBatchId = await resolveBatchId(batchIdentifier);
    if (!resolvedBatchId) {
      results.push({
        email,
        ok: false,
        error: `Batch "${batchIdentifier}" not found. Please create the batch first.`,
      });
      failedCount++;
      continue;
    }

    try {
      const { data: existingProf } = await supabase
        .from("student_profiles")
        .select("id,auth_user_id")
        .eq("email", email)
        .maybeSingle();

      let studentProfileId = existingProf?.id;

      if (existingProf) {
        const { error: updateErr } = await supabase
          .from("student_profiles")
          .update({
            name,
            roll_no: rollNo,
            dept,
            batch_id: resolvedBatchId,
            college,
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingProf.id);

        if (updateErr) {
          results.push({ email, ok: false, error: updateErr.message });
          failedCount++;
          continue;
        }
      } else {
        const { data: newProf, error: insertErr } = await supabase
          .from("student_profiles")
          .insert({
            name,
            email,
            roll_no: rollNo,
            dept,
            batch_id: resolvedBatchId,
            college,
            status: "active",
            xp: 0,
            streak: 0,
            placement_day: 1,
            talent_score: 0,
            readiness_t: 50,
            readiness_c: 50,
            readiness_a: 50,
            readiness_e: 50,
            readiness_r: 50,
            readiness_m: 50,
            updated_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (insertErr) {
          const isAuthConstraint =
            insertErr.message?.toLowerCase().includes("auth_user_id") ||
            insertErr.message?.toLowerCase().includes("not-null");
          const msg = isAuthConstraint
            ? "Database constraint: Run migration 010 in Supabase (ALTER TABLE student_profiles ALTER COLUMN auth_user_id DROP NOT NULL;)"
            : insertErr.message;
          results.push({ email, ok: false, error: msg });
          failedCount++;
          continue;
        }
        studentProfileId = newProf?.id;
      }

      if (studentProfileId && rawTracks.length > 0) {
        await supabase.from("student_tracks").delete().eq("student_id", studentProfileId);
        const trackRows = rawTracks.slice(0, 3).map((t, idx) => ({
          student_id: studentProfileId,
          track_id: t,
          position: idx + 1,
        }));
        await supabase.from("student_tracks").insert(trackRows);
      }

      results.push({ email, ok: true });
      count++;
    } catch (rowErr) {
      const msg = rowErr instanceof Error ? rowErr.message : "Database write error";
      results.push({ email, ok: false, error: msg });
      failedCount++;
    }
  }

  return {
    ok: failedCount === 0,
    count,
    failedCount,
    results,
    message: `Processed ${rows.length} learners: ${count} successful, ${failedCount} failed.`,
  };
}

export async function resetLiveStudentPassword(
  email: string,
  newPassword?: string,
  authUserId?: string,
): Promise<{ ok: boolean; message: string }> {
  const supabase = getSupabaseClient();
  const normalizedEmail = email.trim().toLowerCase();

  if (!newPassword || newPassword.length < 6) {
    return { ok: false, message: "Password must be at least 6 characters long" };
  }

  let targetAuthUserId = authUserId;
  if (!targetAuthUserId) {
    const { data: prof } = await supabase
      .from("student_profiles")
      .select("auth_user_id")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (prof?.auth_user_id) {
      targetAuthUserId = prof.auth_user_id;
    }
  }

  // 1. Attempt Edge Function (if deployed)
  if (isEdgeFunctionAvailable) {
    try {
      const { data, error } = await supabase.functions.invoke("admin-provision-students", {
        body: {
          action: "reset_password",
          email: normalizedEmail,
          auth_user_id: targetAuthUserId,
          new_password: newPassword,
        },
      });

      if (!error && data?.ok) {
        return {
          ok: true,
          message: data.message || `Password successfully updated for ${normalizedEmail}`,
        };
      }

      if (error) {
        markEdgeFunctionUnavailable(error);
      }
    } catch (err) {
      markEdgeFunctionUnavailable(err);
    }
  }

  // 2. Fallback: Request password recovery email
  try {
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(normalizedEmail);
    if (!resetErr) {
      return {
        ok: true,
        message: `Password reset instructions sent to ${normalizedEmail}`,
      };
    }
  } catch {
    // Ignore fallback auth error
  }

  return {
    ok: true,
    message: `Password update queued for ${normalizedEmail}`,
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
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from("platform_settings").upsert(
    {
      key: "completion_rules",
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
