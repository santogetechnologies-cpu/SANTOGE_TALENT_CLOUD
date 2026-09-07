/**
 * SantoGe Talent Cloud — Data Layer Barrel Export
 *
 * Future data access layer. Currently all services return mock/local data.
 * Supabase DB integration will be wired here — one module at a time —
 * without touching UI components.
 *
 * Architecture:
 *   UI components
 *     ↓
 *   These data services (src/lib/data/)
 *     ↓
 *   Data source:
 *     ├── Mock / app-store (CURRENT — default)
 *     └── Supabase PostgreSQL (FUTURE — opt-in per module)
 */

export * from "./student-data";
export * from "./admin-data";
export * from "./curriculum-data";
export * from "./placement-data";
