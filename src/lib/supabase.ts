/**
 * SantoGe Talent Cloud — Supabase Client & Auth Service
 *
 * Architecture:
 * - ONE singleton `@supabase/supabase-js` client (supabaseClient) — initialized once, never recreated.
 * - ONE lightweight hand-rolled REST auth helper (supabaseAuth) — used by app-store.tsx for
 *   signIn, signUp, signOut, and the manual connection test. Kept for backward compatibility.
 * - No polling, no Realtime, no postgres_changes, no automatic DB queries.
 * - Supabase is AUTH infrastructure only for now. All application data uses mock/local sources.
 *
 * Egress policy:
 * - 0 automatic background requests.
 * - Network calls only happen when the user explicitly clicks Sign In, Sign Up, or Test Connection.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { TrackId } from "./tracks";
import type { Role } from "./app-store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SupabaseUserMetadata = {
  name?: string;
  first_name?: string;
  roll_no?: string;
  dept?: string;
  batch_id?: string;
  college?: string;
  tracks?: TrackId[];
  role?: Role;
};

export type SupabaseUser = {
  id: string;
  email: string;
  user_metadata: SupabaseUserMetadata;
  created_at: string;
  last_sign_in_at?: string;
};

export type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
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

// Fallback URL is clearly a placeholder so devs know it is not configured.
const DEFAULT_SUPABASE_URL = ENV_URL ?? "https://placeholder.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = ENV_KEY ?? "";

// ---------------------------------------------------------------------------
// Singleton @supabase/supabase-js client
//
// Rules:
// - Created ONCE per app lifecycle.
// - auth.autoRefreshToken = false → no background token refresh polling.
// - auth.persistSession = true  → session stored in localStorage (standard).
// - auth.detectSessionInUrl = false → no URL hash parsing on every route.
// - realtime disabled          → zero egress from Realtime subscriptions.
// ---------------------------------------------------------------------------

let _supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_supabaseClient) return _supabaseClient;

  _supabaseClient = createClient(
    DEFAULT_SUPABASE_URL,
    DEFAULT_SUPABASE_ANON_KEY || "placeholder-key",
    {
      auth: {
        autoRefreshToken: false,   // No background token-refresh polling
        persistSession: true,       // Session stored in localStorage (read on mount only)
        detectSessionInUrl: false,  // No URL scanning on every navigation
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
    },
  );

  return _supabaseClient;
}

// Re-initialize if config changes (e.g. admin manually sets a different project URL in the UI)
export function resetSupabaseClient(): void {
  _supabaseClient = null;
}

// ---------------------------------------------------------------------------
// Runtime config — allows the login page's "Endpoint Settings" panel to
// override the URL/key without hardcoding (no secrets in source code).
// ---------------------------------------------------------------------------

const STORAGE_KEY_CONFIG = "santoge-supabase-config-v1";
const STORAGE_KEY_SESSION = "santoge-supabase-session-v1";

export function getSupabaseConfig(): SupabaseAuthConfig {
  if (typeof window === "undefined") {
    return { url: DEFAULT_SUPABASE_URL, anonKey: DEFAULT_SUPABASE_ANON_KEY };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<SupabaseAuthConfig>;
      if (parsed.url && parsed.anonKey) return parsed as SupabaseAuthConfig;
    }
  } catch {
    // fallback to env defaults
  }
  return { url: DEFAULT_SUPABASE_URL, anonKey: DEFAULT_SUPABASE_ANON_KEY };
}

export function saveSupabaseConfig(config: SupabaseAuthConfig): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  // Reset the singleton so next auth call uses the updated config.
  resetSupabaseClient();
}

// ---------------------------------------------------------------------------
// Session persistence helpers (hand-rolled session cache)
// Used by app-store.tsx to re-hydrate session on app startup (once, on mount).
// ---------------------------------------------------------------------------

export function getStoredSession(): SupabaseSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return null;
    return JSON.parse(raw) as SupabaseSession;
  } catch {
    return null;
  }
}

export function saveStoredSession(session: SupabaseSession | null): void {
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  } else {
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
  }
}

// ---------------------------------------------------------------------------
// supabaseAuth — hand-rolled REST auth helpers
//
// These call the Supabase Auth REST API directly via fetch.
// They are kept for full backward compatibility with app-store.tsx and login.tsx.
// They are ONLY called when the user explicitly triggers a login action.
// ---------------------------------------------------------------------------

export const supabaseAuth = {
  /**
   * Authenticate a user against Supabase Auth REST API.
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

    try {
      const res = await fetch(`${cleanUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const json = (await res.json()) as AuthApiResponse;

      if (!res.ok) {
        const message =
          json.error_description ??
          json.msg ??
          json.message ??
          "Invalid login credentials";
        return { data: { session: null, user: null }, error: new Error(message) };
      }

      const session: SupabaseSession = {
        access_token: json.access_token ?? "",
        refresh_token: json.refresh_token ?? "",
        expires_in: json.expires_in ?? 3600,
        expires_at:
          json.expires_at ?? Math.floor(Date.now() / 1000) + (json.expires_in ?? 3600),
        token_type: json.token_type ?? "bearer",
        user: json.user as SupabaseUser,
      };

      saveStoredSession(session);
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
   *
   * Future production hardening:
   * - Move role authorization to Supabase app_metadata (not user_metadata)
   * - Enforce role via database RLS policies, not frontend metadata alone
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

    // SECURITY: Public signup ALWAYS forces role="student".
    // No caller can escalate to "admin" through this endpoint.
    const safeRole: "student" = "student";

    try {
      const res = await fetch(`${cleanUrl}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          data: {
            name: metadata.name ?? "Student Learner",
            // safeRole is always "student" — metadata.role is intentionally ignored
            role: safeRole,
            tracks: metadata.tracks ?? ["mern", "cloud", "aiml"],
            batch_id: metadata.batch_id ?? "BATCH-2026-ABC-CSE-01",
            dept: metadata.dept ?? "CSE",
            roll_no: metadata.roll_no ?? "STC2026",
            college: metadata.college ?? "Partner Engineering College",
          },
        }),
      });

      const json = (await res.json()) as AuthApiResponse;

      if (!res.ok) {
        const message =
          json.error_description ?? json.msg ?? json.message ?? "Sign up failed";
        return { data: { session: null, user: null }, error: new Error(message) };
      }

      const user = (json.user ?? json) as SupabaseUser;
      const session: SupabaseSession | null = json.access_token
        ? {
            access_token: json.access_token,
            refresh_token: json.refresh_token ?? "",
            expires_in: json.expires_in ?? 3600,
            token_type: json.token_type ?? "bearer",
            user,
          }
        : null;

      if (session) saveStoredSession(session);
      return { data: { session, user }, error: null };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to register with Supabase.";
      return { data: { session: null, user: null }, error: new Error(message) };
    }
  },

  /**
   * Sign out — clears stored tokens and notifies Supabase Auth.
   * Called ONLY when user explicitly clicks "Sign Out".
   */
  async signOut(): Promise<void> {
    const session = getStoredSession();
    const config = getSupabaseConfig();
    if (session?.access_token) {
      try {
        const cleanUrl = config.url.replace(/\/+$/, "");
        await fetch(`${cleanUrl}/auth/v1/logout`, {
          method: "POST",
          headers: {
            apikey: config.anonKey,
            Authorization: `Bearer ${session.access_token}`,
          },
        });
      } catch {
        // Ignore network failure on logout — local session is cleared regardless.
      }
    }
    saveStoredSession(null);
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

    if (!cfg.anonKey || cfg.anonKey === "placeholder-key") {
      return {
        ok: false,
        message: "No Anon Key configured. Set VITE_SUPABASE_PUBLISHABLE_KEY.",
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
        return { ok: false, message: "Invalid Supabase Anon Key" };
      }
      return { ok: true, message: `Supabase responded with status ${res.status}` };
    } catch (err) {
      return {
        ok: false,
        message:
          err instanceof Error ? err.message : "Could not reach Supabase endpoint",
      };
    }
  },
};
