import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: ({ location }) => {
    // Preserve recovery tokens and query parameters if redirected to site root
    const hasSearch = Object.keys(location.search || {}).length > 0;
    const rawHash = typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "";

    if (rawHash && hasSearch) {
      throw redirect({ to: "/login", search: location.search, hash: rawHash });
    }
    if (rawHash) {
      throw redirect({ to: "/login", hash: rawHash });
    }
    if (hasSearch) {
      throw redirect({ to: "/login", search: location.search });
    }
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
