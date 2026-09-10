/**
 * SantoGe Talent Cloud — Curriculum Data Service
 *
 * Authoritative integration for Live Supabase mode (Curriculum & Content CMS).
 * Rules:
 * - Specific column selection only (NO select('*')).
 * - Zero realtime subscriptions, zero continuous polling.
 */

import { getSupabaseClient } from "@/lib/supabase";
import type { TrackId } from "@/lib/tracks";
import type { DbCurriculumTrack, DbCurriculumSkill, DbContentItem } from "./types";
import type { ContentItem } from "@/lib/app-store";

export async function fetchLiveCurriculumTracks(): Promise<DbCurriculumTrack[]> {
  const supabase = getSupabaseClient();

  const { data } = await supabase
    .from("curriculum_tracks")
    .select("id,name,short_name,category,total_skills,accent,created_at,updated_at")
    .order("name", { ascending: true });

  return (data || []) as DbCurriculumTrack[];
}

export async function fetchLiveCurriculumSkills(trackId: TrackId): Promise<DbCurriculumSkill[]> {
  const supabase = getSupabaseClient();

  const { data } = await supabase
    .from("curriculum_skills")
    .select("id,track_id,title,day,type,status,created_at,updated_at")
    .eq("track_id", trackId)
    .order("day", { ascending: true });

  return (data || []) as DbCurriculumSkill[];
}

// ---------------------------------------------------------------------------
// Content CMS Items (Admin CRUD & Student Read)
// ---------------------------------------------------------------------------

export async function fetchLiveContentItems(): Promise<ContentItem[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("content_items")
    .select("id,title,kind,track,duration,status,updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  if (!data) return [];

  return (
    data as Array<{
      id: string;
      title: string;
      kind: "English video" | "Aptitude video" | "Guided practice" | "Lab brief";
      track: string;
      duration: string;
      status: "published" | "draft" | "scheduled";
      updated_at: string;
    }>
  ).map((c) => ({
    id: c.id,
    title: c.title,
    kind: c.kind,
    track: c.track,
    duration: c.duration,
    status: c.status,
    updated: new Date(c.updated_at).toLocaleString("en-GB"),
  }));
}

export async function createLiveContentItem(
  item: Omit<ContentItem, "id" | "updated">,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("content_items")
    .insert({
      title: item.title,
      kind: item.kind,
      track: item.track,
      duration: item.duration,
      status: item.status,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: (data as { id: string })?.id };
}

export async function updateLiveContentItem(
  id: string,
  patch: Partial<ContentItem>,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  const updateFields: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.title) updateFields["title"] = patch.title;
  if (patch.kind) updateFields["kind"] = patch.kind;
  if (patch.track) updateFields["track"] = patch.track;
  if (patch.duration) updateFields["duration"] = patch.duration;
  if (patch.status) updateFields["status"] = patch.status;

  const { error } = await supabase.from("content_items").update(updateFields).eq("id", id);
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

export async function upsertLiveContentItem(
  filter: { track: string; kind: ContentItem["kind"]; titlePrefix: string },
  item: Omit<ContentItem, "id" | "updated">,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const supabase = getSupabaseClient();

  const { data: existing, error: findErr } = await supabase
    .from("content_items")
    .select("id")
    .eq("track", filter.track)
    .eq("kind", filter.kind)
    .ilike("title", `${filter.titlePrefix}%`)
    .maybeSingle();

  if (findErr) {
    return { ok: false, error: findErr.message };
  }

  if (existing?.id) {
    const { error: updErr } = await supabase
      .from("content_items")
      .update({
        title: item.title,
        duration: item.duration,
        status: item.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (updErr) return { ok: false, error: updErr.message };
    return { ok: true, id: existing.id };
  } else {
    const { data: insData, error: insErr } = await supabase
      .from("content_items")
      .insert({
        title: item.title,
        kind: item.kind,
        track: item.track,
        duration: item.duration,
        status: item.status,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insErr) return { ok: false, error: insErr.message };
    return { ok: true, id: (insData as { id: string })?.id };
  }
}

export async function deleteLiveContentItem(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.from("content_items").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}
