/**
 * SantoGe Talent Cloud — Admin Data Service
 *
 * Authoritative integration for Live Supabase mode (Super Admin).
 * Rules:
 * - Specific column selection only (NO select('*')).
 * - Dynamic derived metrics (enrolled counts, averages).
 * - Zero realtime subscriptions, zero continuous polling.
 */

import { getSupabaseClient } from "@/lib/supabase";
import type { TrackId } from "@/lib/tracks";
import { isUuid } from "./batch-lookup";
import type {
  DbBatch,
  DbStudentProfile,
  DbInstitution,
  DbPlatformSettings,
  ProvisionedStudent,
} from "./types";

export type { ProvisionedStudent };

export interface ProvisionResult {
  ok: boolean;
  count: number;
  failedCount: number;
  results: Array<{ email: string; ok: boolean; error?: string }>;
  message: string;
}

export type LiveRosterItem = {
  id: string;
  auth_user_id: string | null;
  name: string;
  email: string;
  rollNo: string;
  dept: string;
  college: string;
  batchId: string;
  batchName?: string;
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

  // 1. Fetch metadata for all active students, batches, and institutions unconditionally
  // so the dropdown of partner institutions is ALWAYS complete, stable, and accurate!
  const [allStudentsMetaRes, batchesRes, institutionsRes] = await Promise.all([
    supabase
      .from("student_profiles")
      .select("id,college,institution_id,batch_id")
      .eq("status", "active"),
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

  if (allStudentsMetaRes.error) throw new Error(allStudentsMetaRes.error.message);
  if (batchesRes.error) throw new Error(batchesRes.error.message);
  if (institutionsRes.error) throw new Error(institutionsRes.error.message);

  // 2. Build stable platform-wide institutions list from all active students & institutions
  const instMap = new Map<
    string,
    { id: string; name: string; code: string; studentCount: number; collegeNames: string[] }
  >();

  (institutionsRes.data || []).forEach((inst: DbInstitution) => {
    instMap.set(inst.id, {
      id: inst.id,
      name: inst.name,
      code: inst.code,
      studentCount: 0,
      collegeNames: [inst.name.toLowerCase()],
    });
  });

  (allStudentsMetaRes.data || []).forEach(
    (s: { college: string | null; institution_id: string | null }) => {
      const colName = s.college?.trim();
      const instId = s.institution_id;

      if (instId && instMap.has(instId)) {
        instMap.get(instId)!.studentCount += 1;
        if (colName && !instMap.get(instId)!.collegeNames.includes(colName.toLowerCase())) {
          instMap.get(instId)!.collegeNames.push(colName.toLowerCase());
        }
      } else if (colName) {
        let matchedEntry:
          | { id: string; name: string; code: string; studentCount: number; collegeNames: string[] }
          | undefined;
        for (const entry of instMap.values()) {
          if (
            entry.name.toLowerCase() === colName.toLowerCase() ||
            entry.collegeNames.includes(colName.toLowerCase())
          ) {
            matchedEntry = entry;
            break;
          }
        }
        if (matchedEntry) {
          matchedEntry.studentCount += 1;
          if (!matchedEntry.collegeNames.includes(colName.toLowerCase())) {
            matchedEntry.collegeNames.push(colName.toLowerCase());
          }
        } else {
          instMap.set(colName, {
            id: colName,
            name: colName,
            code: colName,
            studentCount: 1,
            collegeNames: [colName.toLowerCase()],
          });
        }
      }
    },
  );

  // Resolve target institution details if filtering
  let targetInstId: string | null = null;
  let targetCollegeName: string | null = null;

  if (selectedInstId !== "all") {
    const cleanLookup = selectedInstId.trim();
    const cleanNoHyphens = cleanLookup.replace(/-/g, " ").toLowerCase();

    if (instMap.has(cleanLookup)) {
      const entry = instMap.get(cleanLookup)!;
      targetInstId = UUID_REGEX.test(entry.id) ? entry.id : null;
      targetCollegeName = entry.name;
    } else {
      for (const entry of instMap.values()) {
        if (
          entry.id.toLowerCase() === cleanLookup.toLowerCase() ||
          entry.name.toLowerCase() === cleanNoHyphens ||
          entry.collegeNames.includes(cleanNoHyphens) ||
          entry.id.toLowerCase().replace(/-/g, " ") === cleanNoHyphens
        ) {
          targetInstId = UUID_REGEX.test(entry.id) ? entry.id : null;
          targetCollegeName = entry.name;
          break;
        }
      }
    }

    if (!targetCollegeName) {
      targetCollegeName = selectedInstId.replace(/-/g, " ").trim();
      if (UUID_REGEX.test(selectedInstId)) {
        targetInstId = selectedInstId;
      }
    }
  }

  // 3. Query filtered students based on selection
  let studentQuery = supabase
    .from("student_profiles")
    .select(
      "id,name,email,dept,college,batch_id,institution_id,status,placement_day,talent_score,readiness_t,readiness_c,readiness_a,readiness_e,readiness_r,readiness_m",
    )
    .eq("status", "active");

  if (selectedInstId !== "all") {
    if (targetInstId && targetCollegeName) {
      studentQuery = studentQuery.or(
        `institution_id.eq.${targetInstId},college.ilike.%${targetCollegeName}%`,
      );
    } else if (targetInstId) {
      studentQuery = studentQuery.eq("institution_id", targetInstId);
    } else if (targetCollegeName) {
      studentQuery = studentQuery.ilike("college", `%${targetCollegeName}%`);
    }
  }

  const { data: studentsData, error: studentsError } = await studentQuery;
  if (studentsError) throw new Error(studentsError.message);

  const students = (studentsData || []) as unknown as Array<{
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

  // Batch enrolled mapping derived dynamically from filtered students
  const batchCounts: Record<string, number> = {};
  students.forEach((s) => {
    if (s.batch_id) {
      batchCounts[s.batch_id] = (batchCounts[s.batch_id] || 0) + 1;
    }
  });

  const rawBatches = (batchesRes.data || []) as DbBatch[];
  const batches = rawBatches
    .map((b) => ({
      ...b,
      enrolled_count: batchCounts[b.id] || 0,
    }))
    .filter((b) => {
      if (selectedInstId === "all") return true;
      if (targetInstId && b.institution_id === targetInstId) return true;
      if (targetCollegeName && b.name.toLowerCase().includes(targetCollegeName.toLowerCase()))
        return true;
      if (targetCollegeName) {
        const words = targetCollegeName.split(/\s+/).filter((w) => w.length > 2);
        if (words.some((w) => b.name.toLowerCase().includes(w.toLowerCase()))) return true;
      }
      if ((batchCounts[b.id] ?? 0) > 0) return true;
      return false;
    });

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
    institutions: Array.from(instMap.values()).map((i) => ({
      id: i.id,
      name: i.name,
      code: i.code,
      studentCount: i.studentCount,
    })),
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
    const instId = options.institutionId.trim();
    if (UUID_REGEX.test(instId)) {
      const { data: instData } = await supabase
        .from("institutions")
        .select("name")
        .eq("id", instId)
        .maybeSingle();
      if (instData?.name) {
        query = query.or(`institution_id.eq.${instId},college.ilike.%${instData.name}%`);
      } else {
        query = query.eq("institution_id", instId);
      }
    } else {
      const cleanCol = instId.replace(/-/g, " ").trim();
      query = query.ilike("college", `%${cleanCol}%`);
    }
  }

  if (options?.searchQuery) {
    const q = options.searchQuery.trim();
    // Search batch names so searching e.g. "PSG" or "BATCH-2026" returns learners in that batch
    const { data: matchedBatches } = await supabase
      .from("batches")
      .select("id")
      .ilike("name", `%${q}%`);

    const matchedBatchIds = (matchedBatches || []).map((b: { id: string }) => b.id);
    if (matchedBatchIds.length > 0) {
      query = query.or(
        `name.ilike.%${q}%,email.ilike.%${q}%,roll_no.ilike.%${q}%,dept.ilike.%${q}%,college.ilike.%${q}%,batch_id.in.(${matchedBatchIds.join(",")})`,
      );
    } else {
      query = query.or(
        `name.ilike.%${q}%,email.ilike.%${q}%,roll_no.ilike.%${q}%,dept.ilike.%${q}%,college.ilike.%${q}%`,
      );
    }
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

  // Resolve human-readable batch names for all students in this page
  const uniqueBatchIds = Array.from(
    new Set(studentRows.map((s: { batch_id: string | null }) => s.batch_id).filter(Boolean)),
  ) as string[];

  const batchMap = new Map<string, string>();
  if (uniqueBatchIds.length > 0) {
    const { data: batchesData } = await supabase
      .from("batches")
      .select("id,name")
      .in("id", uniqueBatchIds);
    (batchesData || []).forEach((b: { id: string; name: string }) => {
      batchMap.set(b.id, b.name);
    });
  }

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
    batchName: s.batch_id
      ? batchMap.get(s.batch_id) || (isUuid(s.batch_id) ? "Unknown Batch" : s.batch_id)
      : "Not Assigned",
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

  // Detach any assigned students so they display "Not Assigned" instead of referencing a deleted batch
  await supabase.from("student_profiles").update({ batch_id: null }).eq("batch_id", id);

  // Soft-archive so it immediately disappears from active listings
  const { error: archiveError } = await supabase
    .from("batches")
    .update({ status: "archived" })
    .eq("id", id);

  // Also attempt hard delete if allowed by database policies
  const { error: deleteError } = await supabase.from("batches").delete().eq("id", id);

  if (archiveError && deleteError) {
    return {
      ok: false,
      error: deleteError?.message || archiveError?.message || "Failed to delete batch",
    };
  }

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

  if (isUuid) {
    const { data, error } = await supabase
      .from("student_profiles")
      .update({ status: "deleted", updated_at: new Date().toISOString() })
      .eq("id", raw)
      .select("id");

    if (error) return { ok: false, error: error.message };
    if (data && data.length > 0) return { ok: true };

    const { error: authErr } = await supabase
      .from("student_profiles")
      .update({ status: "deleted", updated_at: new Date().toISOString() })
      .eq("auth_user_id", raw);

    if (authErr) return { ok: false, error: authErr.message };
    return { ok: true };
  }

  const { error } = await supabase
    .from("student_profiles")
    .update({ status: "deleted", updated_at: new Date().toISOString() })
    .eq("email", raw.toLowerCase());

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Clear provisioned student profiles (soft-delete status: "deleted").
 * Accepts optional list of student IDs or emails to clear; if omitted, clears all active students.
 */
export async function clearAllLiveStudents(
  target?: { emails?: string[]; ids?: string[] } | string[],
): Promise<{ ok: boolean; count: number; error?: string }> {
  const supabase = getSupabaseClient();

  let emails: string[] = [];
  let ids: string[] = [];

  if (Array.isArray(target)) {
    target.forEach((item) => {
      const trimmed = item.trim();
      if (UUID_REGEX.test(trimmed)) {
        ids.push(trimmed);
      } else {
        emails.push(trimmed.toLowerCase());
      }
    });
  } else if (target) {
    if (target.emails) emails = target.emails.map((e) => e.trim().toLowerCase());
    if (target.ids) ids = target.ids.map((id) => id.trim());
  }

  const chunkSize = 100;
  let totalCleared = 0;

  if (ids.length > 0) {
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);
      const { error, count } = await supabase
        .from("student_profiles")
        .update({ status: "deleted", updated_at: new Date().toISOString() })
        .in("id", chunk);

      if (error) return { ok: false, count: totalCleared, error: error.message };
      totalCleared += count ?? chunk.length;
    }
    return { ok: true, count: totalCleared };
  }

  if (emails.length > 0) {
    for (let i = 0; i < emails.length; i += chunkSize) {
      const chunk = emails.slice(i, i + chunkSize);
      const { error, count } = await supabase
        .from("student_profiles")
        .update({ status: "deleted", updated_at: new Date().toISOString() })
        .in("email", chunk);

      if (error) return { ok: false, count: totalCleared, error: error.message };
      totalCleared += count ?? chunk.length;
    }
    return { ok: true, count: totalCleared };
  }

  const { error, count } = await supabase
    .from("student_profiles")
    .update({ status: "deleted", updated_at: new Date().toISOString() })
    .eq("status", "active");

  if (error) return { ok: false, count: 0, error: error.message };
  return { ok: true, count: count ?? 0 };
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

  try {
    const { data: edgeData, error: edgeErr } = await supabase.functions.invoke(
      "admin-provision-students",
      {
        body: {
          action: "create_single",
          student: {
            student_name: student.name.trim(),
            email,
            password,
            roll_no: student.rollNo.trim(),
            dept: student.dept.trim(),
            batch_id: student.batchId,
            college: student.college?.trim() || "",
            course_1: student.tracks?.[0] || "",
            course_2: student.tracks?.[1] || "",
            course_3: student.tracks?.[2] || "",
          },
        },
      },
    );

    if (edgeErr) {
      return {
        ok: false,
        message:
          edgeErr.message ||
          "Provisioning service is unavailable. Please verify the 'admin-provision-students' Edge Function is deployed on Supabase.",
      };
    }

    if (edgeData?.results?.[0]?.ok) {
      return { ok: true, message: `Student account provisioned for ${email}` };
    }

    return {
      ok: false,
      message:
        edgeData?.results?.[0]?.error ||
        edgeData?.error ||
        "Failed to provision student in Supabase.",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to reach provisioning service";
    return {
      ok: false,
      message: `${msg}. Please ensure the Supabase Edge Function 'admin-provision-students' is deployed and accessible.`,
    };
  }
}

export async function provisionLiveStudents(rows: ProvisionedStudent[]): Promise<ProvisionResult> {
  const supabase = getSupabaseClient();

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

    if (edgeErr) {
      return {
        ok: false,
        count: 0,
        failedCount: rows.length,
        results: rows.map((r) => ({
          email: r.email,
          ok: false,
          error:
            edgeErr.message ||
            "Provisioning service unavailable. Please verify that the 'admin-provision-students' Edge Function is deployed on Supabase.",
        })),
        message:
          edgeErr.message ||
          "Provisioning service is unavailable. Please verify that the 'admin-provision-students' Edge Function is deployed on Supabase.",
      };
    }

    if (edgeData && Array.isArray(edgeData.results)) {
      return {
        ok: Boolean(edgeData.ok),
        count: Number(edgeData.count) || 0,
        failedCount: Number(edgeData.failedCount) || 0,
        results: edgeData.results,
        message: edgeData.message || `${edgeData.count || 0} students provisioned`,
      };
    }

    return {
      ok: false,
      count: 0,
      failedCount: rows.length,
      results: rows.map((r) => ({
        email: r.email,
        ok: false,
        error: edgeData?.error || "Unexpected response from provisioning service",
      })),
      message: edgeData?.error || "Unexpected response from provisioning service",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Network error contacting Edge Function";
    return {
      ok: false,
      count: 0,
      failedCount: rows.length,
      results: rows.map((r) => ({
        email: r.email,
        ok: false,
        error: msg,
      })),
      message: `Provisioning service unreachable: ${msg}. Please retry.`,
    };
  }
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

    return {
      ok: false,
      message:
        error?.message ||
        data?.error ||
        "Password reset service unavailable. Please check the 'admin-provision-students' Edge Function.",
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Password reset failed";
    return {
      ok: false,
      message: `${msg}. Please ensure the 'admin-provision-students' Edge Function is deployed.`,
    };
  }
}

export async function fetchLiveTrackDistribution(): Promise<
  Array<{ trackId: string; trackName: string; studentCount: number; percentage: number }>
> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc("get_track_distribution");

  if (error || !data) {
    return [];
  }

  return (
    data as Array<{
      track_id: string;
      track_name: string;
      student_count: number;
      percentage: number;
    }>
  ).map((d) => ({
    trackId: d.track_id,
    trackName: d.track_name,
    studentCount: Number(d.student_count),
    percentage: Number(d.percentage),
  }));
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
