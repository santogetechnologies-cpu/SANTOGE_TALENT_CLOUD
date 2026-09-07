/**
 * SantoGe Talent Cloud — Placement Data Service
 *
 * CURRENT SOURCE: Mock / local data from app-store.tsx
 * FUTURE SOURCE:  Supabase PostgreSQL (when schema is ready)
 *
 * Egress policy:
 *   NO automatic Supabase queries.
 *   NO polling, NO realtime, NO background sync.
 *   All functions currently return mock data only.
 */

// ---------------------------------------------------------------------------
// Types — shaped for future Supabase columns (specific, not *)
// ---------------------------------------------------------------------------

/**
 * Minimal leaderboard entry for future Supabase queries.
 * Future query:
 *   .select('student_id,name,talent_score,rank,batch_id')
 *   .eq('batch_id', batchId)
 *   .order('talent_score', { ascending: false })
 *   .limit(50)
 */
export type LeaderboardEntry = {
  student_id: string;
  name: string;
  talent_score: number;
  rank: number;
  batch_id: string;
};

/**
 * Minimal placement record for future Supabase queries.
 * Future query:
 *   .select('student_id,company_name,offer_date,package_lpa,status')
 *   .eq('student_id', studentId)
 */
export type PlacementRecord = {
  student_id: string;
  company_name: string;
  offer_date: string;
  package_lpa: number;
  status: "offered" | "accepted" | "declined";
};

/**
 * Minimal mock interview record for future Supabase queries.
 * Future query:
 *   .select('id,student_id,score,feedback_summary,completed_at')
 *   .eq('student_id', studentId)
 *   .order('completed_at', { ascending: false })
 *   .limit(10)
 */
export type MockInterviewRecord = {
  id: string;
  student_id: string;
  score: number;
  feedback_summary: string;
  completed_at: string;
};

// ---------------------------------------------------------------------------
// Data service — mock-first, Supabase-ready
// ---------------------------------------------------------------------------

/**
 * FUTURE: Fetch leaderboard for a batch from Supabase.
 * DO NOT call automatically. Always filters by batch_id and applies a limit.
 * NEVER downloads all students to compute rank in the browser.
 *
 * Example:
 * ```ts
 * const { data } = await supabaseClient
 *   .from('talent_scores')
 *   .select('student_id,name,talent_score,rank,batch_id')
 *   .eq('batch_id', batchId)
 *   .order('talent_score', { ascending: false })
 *   .limit(50);
 * ```
 */
export async function fetchLeaderboardFromSupabase(
  _batchId: string,
  _limit: number = 50,
): Promise<LeaderboardEntry[]> {
  // TODO: Implement when Supabase talent_scores table schema is finalised.
  return [];
}

/**
 * FUTURE: Fetch placement records for a student from Supabase.
 * DO NOT call automatically. Always filters by student_id.
 *
 * Example:
 * ```ts
 * const { data } = await supabaseClient
 *   .from('placements')
 *   .select('student_id,company_name,offer_date,package_lpa,status')
 *   .eq('student_id', studentId)
 *   .order('offer_date', { ascending: false });
 * ```
 */
export async function fetchPlacementRecordsFromSupabase(
  _studentId: string,
): Promise<PlacementRecord[]> {
  // TODO: Implement when Supabase placements table schema is finalised.
  return [];
}

/**
 * FUTURE: Fetch mock interview history for a student from Supabase.
 * DO NOT call automatically. Always filters by student_id and uses a limit.
 */
export async function fetchMockInterviewsFromSupabase(
  _studentId: string,
): Promise<MockInterviewRecord[]> {
  // TODO: Implement when Supabase mock_interviews table schema is finalised.
  return [];
}
