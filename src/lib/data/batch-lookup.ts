/**
 * SantoGe Talent Cloud — Centralized Batch Lookup & Display Name Service
 *
 * Guarantees that Batch UUIDs / database IDs are NEVER exposed to the user-facing UI.
 * Human-readable batch names (e.g. "BATCH-2026-ABC-CSE-01" or "2026 Batch — PSG Tech")
 * are always resolved and displayed instead.
 */

import { useMemo } from "react";
import { useLiveBatches } from "./hooks";
import type { DbBatch } from "./types";

export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Checks whether a given string is a raw UUID.
 */
export function isUuid(value: string | null | undefined): boolean {
  if (!value) return false;
  return UUID_REGEX.test(value.trim());
}

/**
 * Resolves a human-readable batch display name from a batch ID or name string
 * using a batch list, map, or dictionary.
 *
 * Guaranteed Behavior:
 * 1. If batchIdOrName matches a batch by ID or Name, returns batch.name.
 * 2. If batchIdOrName is NOT a UUID (already human-readable), returns batchIdOrName.
 * 3. If batchIdOrName is a UUID and not found in the lookup, returns fallback or "Unknown Batch".
 * 4. Raw UUID is NEVER returned.
 */
export function resolveBatchDisplayName(
  batchIdOrName: string | null | undefined,
  batches?: DbBatch[] | Map<string, string> | Record<string, string> | null,
  fallback = "Not Assigned",
): string {
  if (!batchIdOrName || !batchIdOrName.trim()) {
    return fallback;
  }

  const raw = batchIdOrName.trim();

  if (batches instanceof Map) {
    const found = batches.get(raw);
    if (found) return found;
  } else if (Array.isArray(batches)) {
    const match = batches.find((b) => b.id === raw || b.name === raw);
    if (match) return match.name;
  } else if (batches && typeof batches === "object") {
    const found = (batches as Record<string, string>)[raw];
    if (found) return found;
  }

  // If the value is NOT a UUID, it is already a human-readable business name
  if (!isUuid(raw)) {
    return raw;
  }

  // Value is a UUID that was not found in the lookup: NEVER expose raw UUID
  return fallback === "Not Assigned" ? "Unknown Batch" : fallback;
}

/**
 * Centralized React hook providing batch name lookup and formatting.
 * Reuses the cached useLiveBatches query (5 min staleTime, zero realtime egress).
 */
export function useBatchLookup(enabled = true) {
  const { data: batches = [], isLoading } = useLiveBatches(enabled);

  const batchNameById = useMemo(() => {
    const map = new Map<string, string>();
    batches.forEach((b) => {
      map.set(b.id, b.name);
    });
    return map;
  }, [batches]);

  const getBatchName = (
    batchIdOrName: string | null | undefined,
    fallback?: string,
  ): string => {
    if (!batchIdOrName || !batchIdOrName.trim()) {
      return fallback || "Not Assigned";
    }

    const raw = batchIdOrName.trim();

    if (batchNameById.has(raw)) {
      return batchNameById.get(raw)!;
    }

    // If it is already a human-readable name, return it directly
    if (!isUuid(raw)) {
      return raw;
    }

    if (isLoading) {
      return "Loading Batch...";
    }

    // Value is a UUID not found in the map: NEVER return raw UUID
    return fallback || "Unknown Batch";
  };

  return {
    batches,
    batchNameById,
    getBatchName,
    isLoading,
  };
}
