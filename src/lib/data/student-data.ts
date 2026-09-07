/**
 * SantoGe Talent Cloud — Student Data Service
 *
 * CURRENT SOURCE: Mock / local data from app-store.tsx and accounts.ts
 * FUTURE SOURCE:  Supabase PostgreSQL (when schema is ready)
 *
 * Architecture principle:
 *   UI components → call these hooks/functions → get data
 *   Data source (mock vs Supabase) is swapped HERE, not in UI components.
 *
 * Egress policy:
 *   NO automatic Supabase queries.
 *   NO polling, NO realtime, NO background sync.
 *   All functions currently return mock data only.
 */

import type { StudentAccount } from "@/lib/accounts";
import type { Profile } from "@/lib/app-store";

// ---------------------------------------------------------------------------
// Types — used by future Supabase integration
// ---------------------------------------------------------------------------

/**
 * Minimal student record shape for future Supabase queries.
 * When DB integration is ready, only select these specific columns:
 *   .select('id,email,name,roll_no,dept,batch_id,college')
 * Never use .select('*')
 */
export type StudentRecord = {
  id: string;
  email: string;
  name: string;
  roll_no: string;
  dept: string;
  batch_id: string;
  college: string;
};

/**
 * Minimal progress record shape for future Supabase queries.
 * When DB integration is ready:
 *   .select('student_id,track_id,completed_skill_ids,xp,streak,placement_day')
 */
export type StudentProgressRecord = {
  student_id: string;
  track_id: string;
  completed_skill_ids: string[];
  xp: number;
  streak: number;
  placement_day: number;
};

// ---------------------------------------------------------------------------
// Data service — mock-first, Supabase-ready
// ---------------------------------------------------------------------------

/**
 * Get a student profile by email.
 *
 * CURRENT: Returns the profile from the local app-store state (passed in).
 * FUTURE:  Will query Supabase students table for the authenticated user only.
 *          Never fetches all students.
 */
export function getStudentProfile(
  email: string,
  localProfiles: Record<string, Profile>,
  localAccounts: StudentAccount[],
): Profile | null {
  // Current: mock data
  const profile = localProfiles[email];
  if (profile) return profile;

  // Fallback: derive from account
  const account = localAccounts.find((a) => a.email === email);
  if (!account) return null;

  return null; // profile not found locally
}

/**
 * FUTURE: Fetch a single student's record from Supabase.
 * This function is a typed stub — DO NOT call it automatically.
 * It will only be wired up when the Supabase schema is created.
 *
 * Example of safe future implementation:
 *
 * ```ts
 * const { data, error } = await supabaseClient
 *   .from('students')
 *   .select('id,email,name,roll_no,dept,batch_id,college')  // ← specific columns only, never *
 *   .eq('email', email)
 *   .single();
 * ```
 */
export async function fetchStudentFromSupabase(
  _email: string,
): Promise<StudentRecord | null> {
  // TODO: Implement when Supabase students table schema is finalised.
  // The email parameter is prefixed with _ to suppress unused-var lint.
  return null;
}
