/**
 * SantoGe Talent Cloud — Admin Data Service
 *
 * CURRENT SOURCE: Mock / local data from app-store.tsx
 * FUTURE SOURCE:  Supabase PostgreSQL (when schema is ready)
 *
 * Egress policy:
 *   NO automatic Supabase queries.
 *   NO polling, NO realtime, NO background sync.
 *   All functions currently return mock data only.
 */

import type { Batch, ProvisionedStudent, ContentItem } from "@/lib/app-store";

// ---------------------------------------------------------------------------
// Types — shaped for future Supabase columns (specific, not *)
// ---------------------------------------------------------------------------

/**
 * Minimal batch record shape for future Supabase queries.
 * Future query: .select('id,name,capacity,enrolled,dept,last_sync_at')
 */
export type BatchRecord = {
  id: string;
  name: string;
  capacity: number;
  enrolled: number;
  dept: string;
  last_sync_at: string | null;
};

/**
 * Minimal provisioned student record for future Supabase queries.
 * Future query: .select('id,email,name,roll_no,dept,batch_id').limit(50)
 */
export type ProvisionedStudentRecord = {
  id: string;
  email: string;
  name: string;
  roll_no: string;
  dept: string;
  batch_id: string;
};

// ---------------------------------------------------------------------------
// Data service — mock-first, Supabase-ready
// ---------------------------------------------------------------------------

/**
 * Get all batches.
 * CURRENT: Returns mock data from app-store (passed in).
 * FUTURE:  Will query Supabase batches table with pagination.
 *          NEVER fetches entire table — always uses .limit() and .range().
 */
export function getBatches(localBatches: Batch[]): Batch[] {
  return localBatches;
}

/**
 * Get provisioned students.
 * CURRENT: Returns mock data from app-store (passed in).
 * FUTURE:  Will query with pagination — never downloads all rows.
 *
 * Future example:
 * ```ts
 * const { data } = await supabaseClient
 *   .from('provisioned_students')
 *   .select('id,email,name,roll_no,dept,batch_id')
 *   .eq('batch_id', batchId)
 *   .range(page * pageSize, (page + 1) * pageSize - 1);
 * ```
 */
export function getProvisionedStudents(
  localProvisioned: ProvisionedStudent[],
): ProvisionedStudent[] {
  return localProvisioned;
}

/**
 * Get content items.
 * CURRENT: Returns mock data from app-store (passed in).
 * FUTURE:  Will query Supabase content table with specific column selection.
 */
export function getContentItems(localContent: ContentItem[]): ContentItem[] {
  return localContent;
}

/**
 * FUTURE: Fetch batch list from Supabase with pagination.
 * DO NOT call automatically. Only call on explicit user action (e.g., page load with user intent).
 *
 * Example:
 * ```ts
 * const { data, error } = await supabaseClient
 *   .from('batches')
 *   .select('id,name,capacity,enrolled,dept,last_sync_at')
 *   .order('created_at', { ascending: false })
 *   .limit(20);
 * ```
 */
export async function fetchBatchesFromSupabase(): Promise<BatchRecord[]> {
  // TODO: Implement when Supabase batches table schema is finalised.
  return [];
}
