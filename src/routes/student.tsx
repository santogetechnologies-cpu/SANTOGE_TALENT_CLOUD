import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/student")({
  component: () => <AppShell portal="student" />,
});
