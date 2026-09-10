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

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-dark px-4 text-foreground">
      <div className="w-full max-w-lg rounded-2xl border border-line-soft bg-surface-elevated p-6 text-center shadow-2xl">
        <h1 className="text-xl font-bold tracking-tight text-brand-rose">This page didn't load</h1>
        <p className="mt-2 text-xs text-copy-subtle">
          {error?.message || "An unexpected error occurred while rendering this page."}
        </p>

        {error?.stack && (
          <div className="mt-4 max-h-40 overflow-y-auto rounded-xl border border-line-soft bg-surface-dark p-3 text-left font-mono text-[10px] text-copy-subtle">
            <pre className="whitespace-pre-wrap">{error.stack}</pre>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-2 text-xs font-bold text-surface-dark transition-opacity hover:opacity-90"
          >
            Try again
          </button>
          <button
            onClick={handleHardReset}
            className="inline-flex items-center justify-center rounded-xl border border-brand-rose/40 bg-brand-rose/10 px-4 py-2 text-xs font-bold text-brand-rose hover:bg-brand-rose/20"
          >
            Reset storage &amp; reload
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-line-soft bg-surface-soft px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-elevated"
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

  return (
    <QueryClientProvider client={queryClient}>
      <AppStoreProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </AppStoreProvider>
    </QueryClientProvider>
  );
}
