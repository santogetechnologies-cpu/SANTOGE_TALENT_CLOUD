/**
 * SantoGe Talent Cloud — Curriculum Data Service
 *
 * CURRENT SOURCE: Mock / local data from curriculum.ts and syllabus-data.ts
 * FUTURE SOURCE:  Supabase PostgreSQL (when schema is ready)
 *
 * Egress policy:
 *   NO automatic Supabase queries.
 *   NO polling, NO realtime, NO background sync.
 *   All functions currently return mock data only.
 */

import type { TrackId } from "@/lib/tracks";

// ---------------------------------------------------------------------------
// Types — shaped for future Supabase columns (specific, not *)
// ---------------------------------------------------------------------------

/**
 * Minimal curriculum track record for future Supabase queries.
 * Future query: .select('id,name,short_name,total_skills,category')
 */
export type CurriculumTrackRecord = {
  id: TrackId;
  name: string;
  short_name: string;
  total_skills: number;
  category: string;
};

/**
 * Minimal skill record for future Supabase queries.
 * Future query: .select('id,track_id,title,day,type').eq('track_id', trackId).order('day')
 */
export type SkillRecord = {
  id: string;
  track_id: TrackId;
  title: string;
  day: number;
  type: "video" | "lab" | "quiz" | "project";
};

// ---------------------------------------------------------------------------
// Data service — mock-first, Supabase-ready
// ---------------------------------------------------------------------------

/**
 * FUTURE: Fetch track metadata from Supabase.
 * DO NOT call automatically.
 *
 * Example:
 * ```ts
 * const { data } = await supabaseClient
 *   .from('curriculum_tracks')
 *   .select('id,name,short_name,total_skills,category')
 *   .order('name');
 * ```
 */
export async function fetchTracksFromSupabase(): Promise<CurriculumTrackRecord[]> {
  // TODO: Implement when Supabase curriculum_tracks table schema is finalised.
  return [];
}

/**
 * FUTURE: Fetch skills for a specific track from Supabase.
 * DO NOT call automatically. Always filters by track_id — never fetches all skills.
 *
 * Example:
 * ```ts
 * const { data } = await supabaseClient
 *   .from('curriculum_skills')
 *   .select('id,track_id,title,day,type')
 *   .eq('track_id', trackId)
 *   .order('day')
 *   .limit(100);
 * ```
 */
export async function fetchSkillsByTrackFromSupabase(
  _trackId: TrackId,
): Promise<SkillRecord[]> {
  // TODO: Implement when Supabase curriculum_skills table schema is finalised.
  return [];
}
