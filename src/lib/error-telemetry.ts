/**
 * SantoGe Talent Cloud Error & Telemetry Logger
 */

type ErrorContext = Record<string, unknown>;

export function logAppError(error: unknown, context: ErrorContext = {}) {
  if (typeof window === "undefined") return;

  const message =
    error instanceof Response
      ? `HTTP ${error.status}: ${error.statusText || "Response error"} at ${error.url || window.location.pathname}`
      : error instanceof Error
        ? error.message
        : String(error);

  const stack = error instanceof Error ? error.stack : undefined;

  console.error("[SantoGe Telemetry]", {
    message,
    stack,
    route: window.location.pathname,
    timestamp: new Date().toISOString(),
    ...context,
  });
}
