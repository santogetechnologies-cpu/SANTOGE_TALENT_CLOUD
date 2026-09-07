import { logAppError } from "./error-telemetry";

export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  logAppError(error, context);
}
