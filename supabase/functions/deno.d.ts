// Ambient type declarations for Supabase Edge Functions in editors without the Deno extension active.
// In the live Supabase Edge Runtime, the global Deno namespace is provided natively.

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    has(key: string): boolean;
    toObject(): Record<string, string>;
  }

  export const env: Env;

  export function serve(handler: (request: Request) => Response | Promise<Response>): void;

  export function serve(
    options: {
      port?: number;
      hostname?: string;
      onListen?: (params: { hostname: string; port: number }) => void;
      onError?: (error: unknown) => Response | Promise<Response>;
    },
    handler: (request: Request) => Response | Promise<Response>,
  ): void;
}
