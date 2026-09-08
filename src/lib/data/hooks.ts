/**
 * SantoGe Talent Cloud — React Query Hooks for Live Supabase Data
 *
 * Provides standardized, cached, and automatically invalidatable hooks for all Live data.
 * Zero realtime egress, zero polling intervals.
 */

import { useQuery } from "@tanstack/react-query";
import {
  fetchLiveStudentProfile,
  fetchLiveStudentProgress,
} from "./student-data";
import {
  fetchLiveAdminAnalytics,
  fetchLiveStudentRoster,
  fetchLiveBatches,
  fetchLivePlatformSettings,
} from "./admin-data";
import {
  fetchLiveHiringDrives,
  fetchLiveBatchLeaderboard,
  fetchLivePlacements,
} from "./placement-data";
import {
  fetchLiveCurriculumTracks,
  fetchLiveCurriculumSkills,
  fetchLiveContentItems,
} from "./curriculum-data";
import type { TrackId } from "@/lib/tracks";

// ---------------------------------------------------------------------------
// Student Hooks
// ---------------------------------------------------------------------------

export function useLiveStudentProfile(authUserId: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: ["live", "student-profile", authUserId],
    queryFn: () => (authUserId ? fetchLiveStudentProfile(authUserId) : null),
    enabled: Boolean(enabled && authUserId),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}

export function useLiveStudentProgress(studentId: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: ["live", "student-progress", studentId],
    queryFn: () => (studentId ? fetchLiveStudentProgress(studentId) : null),
    enabled: Boolean(enabled && studentId),
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
}

export function useLiveLeaderboard(batchId: string | null | undefined, limit = 50, enabled = true) {
  return useQuery({
    queryKey: ["live", "student-leaderboard", batchId, limit],
    queryFn: () => (batchId ? fetchLiveBatchLeaderboard(batchId, limit) : []),
    enabled: Boolean(enabled && batchId && batchId !== "BATCH"),
    staleTime: 1000 * 60 * 5,
  });
}

export function useLivePlacements(studentId: string | null | undefined, enabled = true) {
  return useQuery({
    queryKey: ["live", "placements", studentId],
    queryFn: () => (studentId ? fetchLivePlacements(studentId) : []),
    enabled: Boolean(enabled && studentId),
    staleTime: 1000 * 60 * 5,
  });
}

// ---------------------------------------------------------------------------
// Admin Hooks
// ---------------------------------------------------------------------------

export function useLiveAdminAnalytics(institutionId = "all", enabled = true) {
  return useQuery({
    queryKey: ["live", "admin-analytics", institutionId],
    queryFn: () => fetchLiveAdminAnalytics(institutionId),
    enabled,
    staleTime: 1000 * 60 * 2,
  });
}

export function useLiveStudentRoster(
  options?: {
    page?: number | undefined;
    pageSize?: number | undefined;
    institutionId?: string | undefined;
    searchQuery?: string | undefined;
    trackId?: string | undefined;
    tier?: string | undefined;
    driveMinScore?: number | undefined;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: [
      "live",
      "student-roster",
      options?.institutionId ?? "all",
      options?.searchQuery ?? "",
      options?.trackId ?? "all",
      options?.tier ?? "all",
      options?.driveMinScore ?? 0,
      options?.page ?? 0,
      options?.pageSize ?? 50,
    ],
    queryFn: () => fetchLiveStudentRoster(options),
    enabled,
    staleTime: 1000 * 60 * 2,
  });
}

export function useLiveBatches(enabled = true) {
  return useQuery({
    queryKey: ["live", "batches"],
    queryFn: fetchLiveBatches,
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLiveContent(enabled = true) {
  return useQuery({
    queryKey: ["live", "content"],
    queryFn: fetchLiveContentItems,
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLiveHiringDrives(enabled = true) {
  return useQuery({
    queryKey: ["live", "hiring-drives"],
    queryFn: fetchLiveHiringDrives,
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLivePlatformSettings(enabled = true) {
  return useQuery({
    queryKey: ["live", "platform-settings"],
    queryFn: fetchLivePlatformSettings,
    enabled,
    staleTime: 1000 * 60 * 10,
  });
}
