/**
 * SantoGe Talent Cloud — Placement Data Service
 *
 * Authoritative integration for Live Supabase mode (Hiring Drives, Leaderboard, Placements) and Demo mode.
 * Rules:
 * - Specific column selection only (NO select('*')).
 * - Zero realtime subscriptions, zero continuous polling.
 */

import { getSupabaseClient } from "@/lib/supabase";
import type { HiringDrive } from "@/lib/app-store";
import type { DbHiringDrive, DbPlacement } from "./types";

export type LeaderboardEntry = {
  student_id: string;
  name: string;
  talent_score: number;
  rank: number;
  batch_id: string;
};

export async function fetchLiveHiringDrives(): Promise<HiringDrive[]> {
  const supabase = getSupabaseClient();

  const { data } = await supabase
    .from("hiring_drives")
    .select("id,company,roles,ctc,min_score,open_slots,status,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (!data) return [];

  return (data as DbHiringDrive[]).map((d) => ({
    id: d.id,
    company: d.company,
    roles: d.roles,
    ctc: d.ctc,
    minScore: d.min_score,
    openSlots: d.open_slots,
    status: d.status,
  }));
}

export async function createLiveHiringDrive(
  drive: Omit<HiringDrive, "id">,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("hiring_drives")
    .insert({
      company: drive.company,
      roles: drive.roles,
      ctc: drive.ctc,
      min_score: drive.minScore,
      open_slots: drive.openSlots,
      status: drive.status,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: (data as { id: string })?.id };
}

export async function updateLiveHiringDrive(
  id: string,
  patch: Partial<HiringDrive>,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  const updateFields: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.company) updateFields["company"] = patch.company;
  if (patch.roles) updateFields["roles"] = patch.roles;
  if (patch.ctc) updateFields["ctc"] = patch.ctc;
  if (typeof patch.minScore === "number") updateFields["min_score"] = patch.minScore;
  if (typeof patch.openSlots === "number") updateFields["open_slots"] = patch.openSlots;
  if (patch.status) updateFields["status"] = patch.status;

  const { error } = await supabase.from("hiring_drives").update(updateFields).eq("id", id);
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

export async function deleteLiveHiringDrive(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from("hiring_drives").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

export async function fetchLiveBatchLeaderboard(
  batchId: string,
  limit: number = 50,
): Promise<LeaderboardEntry[]> {
  const supabase = getSupabaseClient();

  const { data } = await supabase
    .from("student_profiles")
    .select("id,name,talent_score,batch_id")
    .eq("batch_id", batchId)
    .eq("status", "active")
    .order("talent_score", { ascending: false })
    .limit(limit);

  if (!data) return [];

  return (data as Array<{ id: string; name: string; talent_score: number; batch_id: string }>).map(
    (s, idx) => ({
      student_id: s.id,
      name: s.name,
      talent_score: s.talent_score,
      rank: idx + 1,
      batch_id: s.batch_id,
    }),
  );
}

export async function fetchLivePlacements(studentId: string): Promise<DbPlacement[]> {
  const supabase = getSupabaseClient();

  const { data } = await supabase
    .from("placements")
    .select("id,student_id,company_name,offer_date,package_lpa,status,created_at,updated_at")
    .eq("student_id", studentId)
    .order("offer_date", { ascending: false });

  return (data || []) as DbPlacement[];
}
