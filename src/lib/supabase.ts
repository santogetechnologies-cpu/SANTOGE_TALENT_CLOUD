/**
 * SantoGe Talent Cloud — Supabase Client & Auth Service
 *
 * Architecture:
 * - ONE singleton `@supabase/supabase-js` client (supabaseClient) — initialized once, never recreated.
 * - Single source of truth for LIVE mode: Supabase PostgreSQL + Supabase Auth.
 * - No background polling, no Realtime, no postgres_changes, no continuous setInterval synchronization.
 * - Egress optimized: exact column projections and targeted query caching via React Query.
 *
 * Egress policy:
 * - 0 automatic background WebSocket connections.
 * - Network calls execute purely on demand or via React Query caching strategies.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { TrackId } from "./tracks";
import type { Role } from "./app-store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SupabaseUserMetadata = {
  name?: string | undefined;
  first_name?: string | undefined;
  roll_no?: string | undefined;
  rollNo?: string | undefined;
  dept?: string | undefined;
  batch_id?: string | undefined;
  batchId?: string | undefined;
  college?: string | undefined;
  tracks?: TrackId[] | undefined;
  role?: Role | undefined;
};

export type SupabaseUser = {
  id: string;
  email: string;
  user_metadata: SupabaseUserMetadata;
  created_at: string;
  last_sign_in_at?: string | undefined;
};

export type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number | undefined;
  token_type: string;
  user: SupabaseUser;
};

export type SupabaseAuthConfig = {
  url: string;
  anonKey: string;
};

// ---------------------------------------------------------------------------
// Internal type for raw JSON responses from Supabase Auth REST API
// ---------------------------------------------------------------------------
type AuthApiResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user?: SupabaseUser;
  error_description?: string;
  msg?: string;
  message?: string;
};

// ---------------------------------------------------------------------------
// Environment — reads VITE_SUPABASE_PUBLISHABLE_KEY (the safe public key)
// ---------------------------------------------------------------------------

// Use bracket notation to satisfy noPropertyAccessFromIndexSignature
const ENV_URL: string | undefined =
  typeof import.meta !== "undefined"
    ? (import.meta.env["VITE_SUPABASE_URL"] as string | undefined)
    : undefined;

const ENV_KEY: string | undefined =
  typeof import.meta !== "undefined"
    ? (import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined)
    : undefined;

// ---------------------------------------------------------------------------
// Singleton @supabase/supabase-js client
//
// Rules:
// - Created ONCE per app lifecycle.
// - auth.autoRefreshToken = true  → standard token lifecycle.
// - auth.persistSession = true  → session stored in localStorage (standard).
// - auth.detectSessionInUrl = false → no URL hash parsing on every route.
// - realtime disabled          → zero egress from Realtime subscriptions.
// ---------------------------------------------------------------------------

let _supabaseClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = (ENV_URL || "").trim();
  const key = (ENV_KEY || "").trim();
  return Boolean(
    url &&
    url.startsWith("http") &&
    !url.includes("placeholder") &&
    key &&
    key !== "placeholder-key" &&
    key !== "placeholder-anon-key",
  );
}

export function getSupabaseConfig(): SupabaseAuthConfig {
  return {
    url: (ENV_URL || "").trim(),
    anonKey: (ENV_KEY || "").trim(),
  };
}

export function getSupabaseClient(): SupabaseClient {
  if (_supabaseClient) return _supabaseClient;

  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your .env file.",
    );
  }

  const safeUrl = (ENV_URL || "").trim();
  const safeKey = (ENV_KEY || "").trim();

  _supabaseClient = createClient(safeUrl, safeKey, {
    auth: {
      autoRefreshToken: true, // Standard auth token refresh
      persistSession: true, // Session stored in localStorage
      detectSessionInUrl: false, // No URL scanning on every navigation
    },
    global: {
      headers: {
        "x-application-name": "santoge-talent-cloud",
      },
    },
    // Realtime disabled — no websocket connections, zero egress from subscriptions.
    realtime: {
      params: {
        eventsPerSecond: 0,
      },
    },
  });

  return _supabaseClient;
}

export function resetSupabaseClient(): void {
  _supabaseClient = null;
}

// ---------------------------------------------------------------------------
// supabaseAuth — Supabase client authentication helpers
// ---------------------------------------------------------------------------

export const supabaseAuth = {
  /**
   * Authenticate a user against Supabase Auth API using supabase.auth.signInWithPassword.
   * Called ONLY when user clicks "Sign In via Supabase" — never automatically.
   */
  async signInWithPassword(
    email: string,
    password: string,
  ): Promise<{
    data: { session: SupabaseSession | null; user: SupabaseUser | null };
    error: Error | null;
  }> {
    const config = getSupabaseConfig();
    const cleanUrl = config.url.replace(/\/+$/, "");

    if (
      !cleanUrl ||
      cleanUrl.includes("placeholder") ||
      !config.anonKey ||
      config.anonKey === "placeholder-key"
    ) {
      return {
        data: { session: null, user: null },
        error: new Error(
          "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
        ),
      };
    }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data.session || !data.user) {
        const message = error?.message ?? "Invalid login credentials";
        return { data: { session: null, user: null }, error: new Error(message) };
      }

      const session: SupabaseSession = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        expires_at: data.session.expires_at,
        token_type: data.session.token_type,
        user: {
          id: data.user.id,
          email: data.user.email ?? email.trim().toLowerCase(),
          user_metadata: (data.user.user_metadata ?? {}) as SupabaseUserMetadata,
          created_at: data.user.created_at,
          last_sign_in_at: data.user.last_sign_in_at,
        },
      };

      return { data: { session, user: session.user }, error: null };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to connect to Supabase. Check your network or Supabase URL.";
      return { data: { session: null, user: null }, error: new Error(message) };
    }
  },

  /**
   * Register a new user in Supabase with technical tracks & batch preferences.
   * Called ONLY when user clicks "Sign Up" — never automatically.
   *
   * SECURITY: Public signup ALWAYS creates role="student".
   * Admin accounts MUST be created manually via the Supabase Dashboard.
   * This function ignores any caller-provided role="admin" — it is hardcoded
   * to "student" to prevent privilege escalation from the browser.
   */
  async signUp(
    email: string,
    password: string,
    metadata: SupabaseUserMetadata = {},
  ): Promise<{
    data: { session: SupabaseSession | null; user: SupabaseUser | null };
    error: Error | null;
  }> {
    const config = getSupabaseConfig();
    const cleanUrl = config.url.replace(/\/+$/, "");

    if (
      !cleanUrl ||
      cleanUrl.includes("placeholder") ||
      !config.anonKey ||
      config.anonKey === "placeholder-key"
    ) {
      return {
        data: { session: null, user: null },
        error: new Error(
          "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
        ),
      };
    }

    // SECURITY: Public signup ALWAYS forces role="student".
    // No caller can escalate to "admin" through this endpoint.
    const safeRole = "student" as const;

    try {
      const client = getSupabaseClient();
      const { data, error } = await client.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: metadata.name ?? "Student Learner",
            role: safeRole,
            ...(metadata.tracks ? { tracks: metadata.tracks } : {}),
            ...(metadata.batch_id ? { batch_id: metadata.batch_id } : {}),
            ...(metadata.dept ? { dept: metadata.dept } : {}),
            ...(metadata.roll_no ? { roll_no: metadata.roll_no } : {}),
            ...(metadata.college ? { college: metadata.college } : {}),
          },
        },
      });

      if (error) {
        return { data: { session: null, user: null }, error: new Error(error.message) };
      }

      const user = data.user
        ? ({
            id: data.user.id,
            email: data.user.email ?? email.trim().toLowerCase(),
            user_metadata: (data.user.user_metadata ?? {}) as SupabaseUserMetadata,
            created_at: data.user.created_at,
            last_sign_in_at: data.user.last_sign_in_at,
          } as SupabaseUser)
        : null;

      const session: SupabaseSession | null =
        data.session && user
          ? {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_in: data.session.expires_in,
              expires_at: data.session.expires_at,
              token_type: data.session.token_type,
              user,
            }
          : null;

      return { data: { session, user }, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to register with Supabase.";
      return { data: { session: null, user: null }, error: new Error(message) };
    }
  },

  /**
   * Sign out — clears stored tokens and notifies Supabase Auth.
   * Called ONLY when user explicitly clicks "Sign Out".
   */
  async signOut(): Promise<void> {
    try {
      const client = getSupabaseClient();
      await client.auth.signOut();
    } catch {
      // Ignore network failure on logout — client session is cleared regardless.
    }
  },

  /**
   * Test Supabase URL and Anon Key connectivity.
   * MANUAL only — called when admin/developer clicks "Test Connection" button.
   * NEVER called automatically or on a schedule.
   */
  async testConnection(
    customConfig?: SupabaseAuthConfig,
  ): Promise<{ ok: boolean; message: string }> {
    const cfg = customConfig ?? getSupabaseConfig();
    const cleanUrl = cfg.url.replace(/\/+$/, "");

    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      return { ok: false, message: "URL must start with https:// or http://" };
    }

    if (
      !cleanUrl ||
      cleanUrl.includes("placeholder") ||
      !cfg.anonKey ||
      cfg.anonKey === "placeholder-key"
    ) {
      return {
        ok: false,
        message:
          "No valid Supabase project configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.",
      };
    }

    try {
      const res = await fetch(`${cleanUrl}/auth/v1/settings`, {
        headers: { apikey: cfg.anonKey },
      });
      if (res.ok) {
        return { ok: true, message: "Connected to Supabase Auth API successfully" };
      }
      if (res.status === 401 || res.status === 403) {
        return { ok: false, message: "Invalid Supabase Publishable Key" };
      }
      return { ok: true, message: `Supabase responded with status ${res.status}` };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : "Could not reach Supabase endpoint",
      };
    }
  },

  /**
   * Trigger a password recovery email for a user via Supabase Auth.
   * MANUAL only — called when Platform Super Admin explicitly requests password reset email.
   * NEVER called automatically or on a schedule.
   */
  async resetPasswordForEmail(email: string): Promise<{ ok: boolean; message: string }> {
    const config = getSupabaseConfig();
    const cleanUrl = config.url.replace(/\/+$/, "");

    if (!cleanUrl || !config.anonKey || config.anonKey === "placeholder-key") {
      return { ok: false, message: "Supabase endpoint or key is not configured" };
    }

    try {
      const client = getSupabaseClient();
      const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase());
      if (error) {
        return { ok: false, message: error.message };
      }
      return { ok: true, message: "Supabase password recovery email dispatched" };
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : "Network error during Supabase recovery",
      };
    }
  },
};

/**
 * Fetch authoritative user role from public.user_roles in Supabase PostgreSQL.
 * Strictly verifies role in database.
 */
export async function fetchLiveUserRole(
  authUserId: string,
  _metadataRole?: string | undefined,
  _userEmail?: string | undefined,
): Promise<Role> {
  if (!authUserId) return "student";
  try {
    const client = getSupabaseClient();

    // 1. Primary check: Secure SECURITY DEFINER RPC get_my_role
    try {
      const { data: rpcRole, error: rpcErr } = await client.rpc("get_my_role");
      if (!rpcErr && rpcRole) {
        const r = String(rpcRole).toLowerCase();
        if (r === "admin" || r === "super_admin") return "admin";
        if (r === "student") return "student";
      }
    } catch {
      // Fall through to direct table check
    }

    // 2. Direct query on public.user_roles
    const { data, error } = await client
      .from("user_roles")
      .select("role")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (!error && data?.role) {
      const r = String(data.role).toLowerCase();
      if (r === "admin" || r === "super_admin") return "admin";
      return "student";
    }

    return "student";
  } catch {
    return "student";
  }
}
