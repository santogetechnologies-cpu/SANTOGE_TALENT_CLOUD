import { createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Chip, PageHeader, Panel } from "@/components/kit";
import { LAB_COMPONENTS } from "@/components/labs";
import { useAppStore } from "@/lib/app-store";
import { trackById, type TrackId } from "@/lib/tracks";
import { cn } from "@/lib/utils";
import { Search, ShieldAlert, Lock, ArrowRight } from "lucide-react";
import { useLiveStudentProfile, useLiveStudentProgress, isStudentTrackAssigned } from "@/lib/data";

export const Route = createFileRoute("/student/labs")({
  head: () => ({
    meta: [
      { title: "Technical Labs — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Run interactive sandbox labs across your assigned technical courses and earn verified Talent Score credit.",
      },
      { property: "og:title", content: "Technical Labs — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content: "Interactive sandbox labs for assigned technical courses with instant verification.",
      },
    ],
  }),
  component: LabsPage,
});

function LabsPage() {
  const store = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchTrack = searchParams.get("track") as TrackId | null;

  const { data: liveProfileData } = useLiveStudentProfile(
    store.supabaseSession?.user?.id,
    !!store.supabaseSession?.user?.id,
  );
  const liveStudentId = liveProfileData?.profile?.id || store.liveStudentId;
  const { data: liveProgressData } = useLiveStudentProgress(
    liveStudentId || undefined,
    !!liveStudentId,
  );

  const activeTracks: TrackId[] = liveProfileData?.tracks || store.activeTracks;
  const completedLabs = liveProgressData?.completedLabs || store.completedLabs;

  const [selected, setSelected] = useState<TrackId>(() => {
    if (searchTrack && activeTracks.includes(searchTrack)) {
      return searchTrack;
    }
    return activeTracks[0] ?? ("mern" as TrackId);
  });
  const [query, setQuery] = useState("");

  // Keep selected in sync with activeTracks or searchTrack
  useEffect(() => {
    if (searchTrack && activeTracks.includes(searchTrack)) {
      setSelected(searchTrack);
    } else if (activeTracks.length > 0 && (!selected || !activeTracks.includes(selected))) {
      setSelected(activeTracks[0]!);
    }
  }, [searchTrack, activeTracks, selected]);

  // Only show assigned courses in the sidebar list
  const assignedTrackObjects = useMemo(() => {
    return activeTracks.map((id) => trackById(id)).filter(Boolean);
  }, [activeTracks]);

  const filtered = useMemo(() => {
    return assignedTrackObjects.filter(
      (t) =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.tagline.toLowerCase().includes(query.toLowerCase()),
    );
  }, [assignedTrackObjects, query]);

  const isSelectedAssigned = Boolean(selected && isStudentTrackAssigned(activeTracks, selected));
  const isSearchUnassigned = Boolean(searchTrack && !isStudentTrackAssigned(activeTracks, searchTrack));
  const showAccessDenied = isSearchUnassigned || !isSelectedAssigned;
  const Lab = !showAccessDenied && selected ? LAB_COMPONENTS[selected] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Technical Labs"
        subtitle="Sandboxed skill engines for your assigned technical courses. Execute, verify, and earn Talent Score."
        action={<Chip tone="cyan">{completedLabs.length} labs verified</Chip>}
      />

      {activeTracks.length === 0 ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
            <Lock className="size-6" />
          </div>
          <h3 className="text-base font-bold text-amber-200">No Technical Tracks Assigned Yet</h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-copy-subtle">
            Course access is strictly provisioned by Admin. Once your administrator assigns your 1 to 3 technical courses, your interactive sandbox engines will be unlocked automatically.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <Panel
            title="Assigned Labs"
            subtitle={`${activeTracks.length} course${activeTracks.length > 1 ? "s" : ""} provisioned`}
          >
            {activeTracks.length > 3 && (
              <label className="mb-3 flex items-center gap-2 rounded-xl border border-line-soft bg-surface-soft px-3 py-2">
                <Search className="size-4 text-copy-subtle" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search assigned tracks…"
                  className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-copy-subtle"
                />
              </label>
            )}
            <div className="max-h-[560px] space-y-1.5 overflow-y-auto pr-1">
              {filtered.map((t, idx) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelected(t.id);
                    void navigate({ to: "/student/labs", search: { track: t.id } as any });
                  }}
                  className={cn(
                    "w-full rounded-xl border px-3 py-2.5 text-left transition-colors",
                    selected === t.id
                      ? "border-brand-cyan/60 bg-surface-soft"
                      : "border-line-soft bg-transparent hover:bg-surface-soft",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-foreground">{t.short}</p>
                      <span className="rounded bg-brand-cyan/10 px-1 py-0.2 text-[9px] font-semibold text-brand-cyan">
                        {idx === 0 ? "Course 1" : idx === 1 ? "Course 2" : "Course 3"}
                      </span>
                    </div>
                    <span className="size-2 rounded-full" style={{ background: t.accent }} />
                  </div>
                  <p className="mt-0.5 text-[11px] text-copy-subtle">{t.labTitle}</p>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-1 py-4 text-xs text-copy-subtle">No assigned tracks match "{query}".</p>
              )}
            </div>
          </Panel>

          <div className="min-w-0">
            {showAccessDenied ? (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-8 text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400">
                  <ShieldAlert className="size-6" />
                </div>
                <h3 className="text-base font-bold text-rose-200">Access Denied: Unassigned Course Lab</h3>
                <p className="mx-auto mt-1 max-w-md text-xs text-rose-300/80">
                  This technical sandbox lab belongs to a course that is not assigned to your profile. Students are strictly restricted to Admin-provisioned technical courses.
                </p>
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => {
                      if (activeTracks[0]) {
                        setSelected(activeTracks[0]);
                        void navigate({ to: "/student/labs" });
                      }
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-cyan px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-brand-cyan/90"
                  >
                    Switch to {activeTracks[0] ? trackById(activeTracks[0])?.short : "Assigned Course"}
                    <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            ) : Lab ? (
              <Lab />
            ) : (
              <div className="rounded-2xl border border-line-soft bg-surface-soft p-8 text-center text-xs text-copy-subtle">
                Select an assigned lab from the sidebar to open the sandbox engine.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
