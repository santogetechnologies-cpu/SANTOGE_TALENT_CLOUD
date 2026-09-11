import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { AppStoreProvider } from "@/lib/app-store";
import { logAppError } from "../lib/error-telemetry";
import { supabaseAuth } from "@/lib/supabase";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    logAppError(error, { boundary: "tanstack_root_error_component" });

    // Automatically recover from chunk hash mismatches caused by fresh deployments
    const msg = error?.message || "";
    if (
      msg.includes("Failed to fetch dynamically imported module") ||
      msg.includes("dynamically imported module") ||
      msg.includes("Loading chunk") ||
      msg.includes("error loading dynamically imported module")
    ) {
      const key = `chunk_reload_${window.location.pathname}`;
      const lastReload = sessionStorage.getItem(key);
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem(key, String(now));
        window.location.reload();
      }
    }
  }, [error]);

  const handleHardReset = async () => {
    try {
      await supabaseAuth.signOut();
    } catch {
      /* ignore */
    }
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
    window.location.href = "/";
  };

  const isChunkError =
    error?.message?.includes("dynamically imported module") ||
    error?.message?.includes("Loading chunk");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 text-center shadow-md">
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          {isChunkError ? "New Version Available" : "This page didn't load"}
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          {isChunkError
            ? "A new update has been deployed to SantoGe Talent Cloud. Please reload to load the latest application assets."
            : error?.message || "An unexpected error occurred while rendering this page."}
        </p>

        {error?.stack && !isChunkError && (
          <div className="mt-4 max-h-40 overflow-y-auto rounded-lg border border-border bg-surface-dark p-3 text-left font-mono text-[10px] text-slate-200">
            <pre className="whitespace-pre-wrap">{error.stack}</pre>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Reload Application
          </button>
          {!isChunkError && (
            <>
              <button
                onClick={() => {
                  router.invalidate();
                  reset();
                }}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                Try again
              </button>
              <button
                onClick={handleHardReset}
                className="inline-flex items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
              >
                Reset storage &amp; reload
              </button>
            </>
          )}
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SantoGe Talent Cloud — ITSE & Placement Accelerator" },
      {
        name: "description",
        content:
          "Interactive technical skill engine, batch placement accelerator, and unified talent readiness workspace.",
      },
      { name: "author", content: "SantoGe Talent Cloud" },
      { property: "og:title", content: "SantoGe Talent Cloud — ITSE & Placement Accelerator" },
      {
        property: "og:description",
        content:
          "Dual-track readiness: 15 individual technical specialisations + synchronised 90-day placement cohort.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/og-image.svg" },
      { property: "og:image:type", content: "image/svg+xml" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@SantoGeCloud" },
      { name: "twitter:image", content: "/og-image.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    const handlePreloadError = () => {
      const key = `chunk_reload_${window.location.pathname}`;
      const lastReload = sessionStorage.getItem(key);
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem(key, String(now));
        window.location.reload();
      }
    };

    window.addEventListener("vite:preloadError", handlePreloadError);
    return () => {
      window.removeEventListener("vite:preloadError", handlePreloadError);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppStoreProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </AppStoreProvider>
    </QueryClientProvider>
  );
}
