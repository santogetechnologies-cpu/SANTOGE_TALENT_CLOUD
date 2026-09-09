import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Play, RotateCcw } from "lucide-react";
import { Console, CodeEditor, Chip } from "@/components/kit";
import { useAppStore } from "@/lib/app-store";
import { TRACKS, type TrackId } from "@/lib/tracks";
import { useLiveStudentProfile, useLiveStudentProgress, completeLiveLab } from "@/lib/data";
import { cn } from "@/lib/utils";

function LabFrame({
  id,
  concept,
  children,
}: {
  id: TrackId;
  concept: string;
  children: (run: (lines: string[]) => void, lines: string[], reset: () => void) => React.ReactNode;
}) {
  const store = useAppStore();
  const queryClient = useQueryClient();

  const { data: liveProfileData } = useLiveStudentProfile(
    store.supabaseSession?.user?.id,
    !!store.supabaseSession?.user?.id,
  );
  const liveStudentId = liveProfileData?.profile?.id || store.liveStudentId;
  const { data: liveProgressData } = useLiveStudentProgress(
    liveStudentId || undefined,
    !!liveStudentId,
  );

  const [lines, setLines] = useState<string[]>([]);
  const track = TRACKS.find((t) => t.id === id)!;
  const completedLabs = liveProgressData?.completedLabs || store.completedLabs;
  const done = completedLabs.includes(id);

  const run = async (out: string[]) => {
    setLines(out);
    if (liveStudentId) {
      await completeLiveLab(liveStudentId, id, track.labTitle);
      queryClient.invalidateQueries({
        queryKey: ["live", "student-progress", liveStudentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
      });
    }
    store.completeLab(id);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-line-soft bg-surface-soft p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-copy-subtle">
          Concept card
        </p>
        <p className="mt-1.5 text-sm text-foreground">{concept}</p>
      </div>
      {children(run, lines, () => setLines([]))}
      <div className="flex items-center gap-2">
        {done ? (
          <Chip tone="emerald">Verified · +50 XP awarded</Chip>
        ) : (
          <Chip tone="muted">Not yet verified</Chip>
        )}
        <Chip tone="cyan">{track.short} sandbox</Chip>
      </div>
    </div>
  );
}

function RunButton({ onClick, label = "Run" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-2 text-xs font-bold text-surface-dark transition-opacity hover:opacity-90"
    >
      <Play className="size-3.5" /> {label}
    </button>
  );
}

function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs font-semibold text-copy-subtle hover:text-foreground"
    >
      <RotateCcw className="size-3.5" /> Clear
    </button>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-xs font-semibold text-copy-subtle">
      {label}
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-line-soft bg-surface-elevated px-3 py-2 font-mono text-[12.5px] text-foreground outline-none focus:border-brand-cyan/60"
      />
    </label>
  );
}

/* ---------------- 1. MERN ---------------- */
function MernLab() {
  const [code, setCode] = useState(
    `app.get("/api/learners/:id", async (req, res) => {\n  const learner = await Learner.findById(req.params.id);\n  res.json({ ok: true, learner });\n});`,
  );
  const [route, setRoute] = useState("/api/learners/661f");
  return (
    <LabFrame
      id="mern"
      concept="Express route handlers must return a typed JSON contract. Hit the endpoint with the test runner and inspect the serialized response."
    >
      {(run, lines, reset) => (
        <>
          <CodeEditor value={code} onChange={setCode} />
          <TextField label="GET request path" value={route} onChange={setRoute} />
          <div className="flex gap-2">
            <RunButton
              label="Send request"
              onClick={() =>
                run([
                  `$ curl -s -X GET http://localhost:5000${route}`,
                  "> 200 OK · 34ms · content-type: application/json",
                  JSON.stringify(
                    {
                      ok: true,
                      learner: {
                        _id: "661f",
                        name: "Ajay Kumar",
                        xp: 1250,
                        tracks: ["mern", "cloud", "aiml"],
                      },
                    },
                    null,
                    2,
                  ),
                  code.includes("res.json")
                    ? "✓ JSON contract assertion passed"
                    : "✗ handler never calls res.json()",
                ])
              }
            />
            <ResetButton onClick={reset} />
          </div>
          <Console lines={lines} />
        </>
      )}
    </LabFrame>
  );
}

/* ---------------- 2. Java ---------------- */
function JavaLab() {
  const [code, setCode] = useState(
    `@RestController\npublic class LearnerController {\n  @GetMapping("/learner/{id}")\n  ResponseEntity<Learner> find(@PathVariable String id) {\n    return ResponseEntity.ok(service.find(id));\n  }\n}`,
  );
  return (
    <LabFrame
      id="java"
      concept="A Spring Boot controller is only trustworthy with green unit tests. Execute the JUnit 5 suite against the MockMvc context."
    >
      {(run, lines, reset) => (
        <>
          <CodeEditor value={code} onChange={setCode} rows={9} />
          <div className="flex gap-2">
            <RunButton
              label="mvn test"
              onClick={() =>
                run([
                  "$ mvn -q test -Dtest=LearnerControllerTest",
                  "[INFO] Running JUnit 5 (junit-jupiter 5.10.2)",
                  "  ✓ find_returnsOk()                     18ms",
                  "  ✓ find_unknownId_returns404()          11ms",
                  "  ✓ find_serializesLearnerPayload()       9ms",
                  code.includes("@GetMapping")
                    ? "  ✓ mapping_annotationPresent()          2ms"
                    : "  ✗ mapping_annotationPresent() FAILED",
                  "[INFO] Tests run: 4, Failures: 0, Skipped: 0",
                  "[INFO] BUILD SUCCESS",
                ])
              }
            />
            <ResetButton onClick={reset} />
          </div>
          <Console lines={lines} />
        </>
      )}
    </LabFrame>
  );
}

/* ---------------- 3. AI/ML ---------------- */
const CHUNKS = [
  {
    id: "chunk_18",
    text: "Placement gate unlocks after dual 100% verified completion",
    base: 0.94,
  },
  { id: "chunk_04", text: "Readiness index weights technical progress at 0.25", base: 0.91 },
  {
    id: "chunk_27",
    text: "Twin 30 minute cadence: technical self-study + accelerator",
    base: 0.87,
  },
  { id: "chunk_11", text: "Batch sizing constrained between 100 and 300 learners", base: 0.71 },
  { id: "chunk_02", text: "Bulk CSV provisioning requires no initial assessment", base: 0.66 },
];
function AiLab() {
  const [query, setQuery] = useState("when does the placement gate unlock?");
  const [k, setK] = useState(3);
  return (
    <LabFrame
      id="aiml"
      concept="Retrieval-augmented generation grounds an LLM answer in your own corpus. Query the Pinecone index and inspect cosine similarity per chunk."
    >
      {(run, lines, reset) => (
        <>
          <TextField label="Similarity query" value={query} onChange={setQuery} />
          <label className="block text-xs font-semibold text-copy-subtle">
            top_k = {k}
            <input
              type="range"
              min={1}
              max={5}
              value={k}
              onChange={(e) => setK(Number(e.target.value))}
              className="mt-2 w-full accent-brand-purple"
            />
          </label>
          <div className="flex gap-2">
            <RunButton
              label="similarity_search()"
              onClick={() =>
                run([
                  `>>> retriever.similarity_search(${JSON.stringify(query)}, k=${k})`,
                  "index: itse-knowledge · dim 1536 · metric cosine",
                  ...CHUNKS.slice(0, k).map(
                    (c, i) =>
                      `  ${i + 1}. ${c.id}  score=${(c.base - i * 0.01).toFixed(3)}  "${c.text}"`,
                  ),
                  `✓ ${k} chunks injected into prompt context (${k * 128} tokens)`,
                ])
              }
            />
            <ResetButton onClick={reset} />
          </div>
          <Console lines={lines} />
        </>
      )}
    </LabFrame>
  );
}

/* ---------------- 4. Data Science ---------------- */
const RAW_ROWS = [
  { id: 1, hours: 3.5, score: 640, attendance: 92 },
  { id: 2, hours: NaN, score: 520, attendance: 78 },
  { id: 3, hours: 5.0, score: 810, attendance: 97 },
  { id: 4, hours: 1.2, score: 380, attendance: 61 },
  { id: 5, hours: 4.1, score: 720, attendance: 88 },
];
function DataLab() {
  const [dropna, setDropna] = useState(true);
  const [normalize, setNormalize] = useState(false);
  return (
    <LabFrame
      id="datascience"
      concept="Before modelling, clean the frame and read the correlation matrix. Nulls silently bias every downstream statistic."
    >
      {(run, lines, reset) => (
        <>
          <div className="overflow-hidden rounded-xl border border-line-soft">
            <table className="w-full text-left font-mono text-[12px]">
              <thead className="bg-surface-soft text-copy-subtle">
                <tr>
                  {["id", "hours", "score", "attendance"].map((h) => (
                    <th key={h} className="px-3 py-2">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RAW_ROWS.map((r) => (
                  <tr key={r.id} className="border-t border-line-soft text-foreground">
                    <td className="px-3 py-1.5">{r.id}</td>
                    <td className={cn("px-3 py-1.5", Number.isNaN(r.hours) && "text-brand-rose")}>
                      {Number.isNaN(r.hours) ? "NaN" : r.hours}
                    </td>
                    <td className="px-3 py-1.5">{r.score}</td>
                    <td className="px-3 py-1.5">{r.attendance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-4 text-xs font-semibold text-copy-subtle">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={dropna}
                onChange={(e) => setDropna(e.target.checked)}
                className="accent-brand-emerald"
              />{" "}
              df.dropna()
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={normalize}
                onChange={(e) => setNormalize(e.target.checked)}
                className="accent-brand-emerald"
              />{" "}
              min-max normalize
            </label>
          </div>
          <div className="flex gap-2">
            <RunButton
              label="Run pipeline"
              onClick={() =>
                run(
                  [
                    ">>> df = pd.read_csv('cohort.csv')",
                    dropna
                      ? ">>> df = df.dropna()   # 1 row removed"
                      : ">>> # nulls retained — corr() will skip pairs",
                    normalize ? ">>> df = (df - df.min()) / (df.max() - df.min())" : "",
                    ">>> df.corr(numeric_only=True)",
                    "              hours   score  attendance",
                    dropna
                      ? "hours         1.000   0.982       0.964"
                      : "hours         1.000   0.947       0.921",
                    dropna
                      ? "score         0.982   1.000       0.971"
                      : "score         0.947   1.000       0.958",
                    dropna
                      ? "attendance    0.964   0.971       1.000"
                      : "attendance    0.921   0.958       1.000",
                    `✓ ${dropna ? 4 : 5} rows · study hours strongly predict score`,
                  ].filter(Boolean),
                )
              }
            />
            <ResetButton onClick={reset} />
          </div>
          <Console lines={lines} />
        </>
      )}
    </LabFrame>
  );
}

/* ---------------- 5. Cloud / Terraform ---------------- */
function CloudLab() {
  const [tf, setTf] = useState(
    `resource "aws_instance" "itse_lab" {\n  ami           = "ami-0f5ee92e2d63afc18"\n  instance_type = "t3.micro"\n  count         = 2\n  tags = { Name = "itse-lab" }\n}`,
  );
  const count = Number(/count\s*=\s*(\d+)/.exec(tf)?.[1] ?? 1);
  const type = /instance_type\s*=\s*"([^"]+)"/.exec(tf)?.[1] ?? "t3.micro";
  return (
    <LabFrame
      id="cloud"
      concept="Infrastructure as code makes environments reproducible. Edit the resource block, plan the change, then apply it."
    >
      {(run, lines, reset) => (
        <>
          <CodeEditor value={tf} onChange={setTf} rows={8} />
          <div className="flex gap-2">
            <RunButton
              label="terraform apply"
              onClick={() =>
                run([
                  "$ terraform init -upgrade",
                  "Terraform has been successfully initialized!",
                  "$ terraform plan",
                  `Plan: ${count} to add, 0 to change, 0 to destroy.`,
                  "$ terraform apply -auto-approve",
                  ...Array.from(
                    { length: Math.min(count, 6) },
                    (_, i) =>
                      `aws_instance.itse_lab[${i}]: Creation complete after ${11 + i}s [id=i-0a${(4821 + i * 37).toString(16)}] · ${type} · 172.31.${20 + i}.${14 + i}`,
                  ),
                  `Apply complete! Resources: ${count} added, 0 changed, 0 destroyed.`,
                ])
              }
            />
            <ResetButton onClick={reset} />
          </div>
          <Console lines={lines} />
        </>
      )}
    </LabFrame>
  );
}

/* ---------------- 6. Cybersecurity ---------------- */
const PORTS = [
  { port: 22, svc: "ssh", state: "open", banner: "OpenSSH 9.6p1", risk: "key-only auth enforced" },
  { port: 80, svc: "http", state: "open", banner: "nginx 1.25.4", risk: "301 → https, acceptable" },
  { port: 443, svc: "https", state: "open", banner: "nginx 1.25.4 (TLS1.3)", risk: "HSTS present" },
  { port: 3306, svc: "mysql", state: "filtered", banner: "—", risk: "blocked by security group" },
];
function CyberLab() {
  const [cmd, setCmd] = useState("nmap -sV --open 10.20.4.18");
  const [selected, setSelected] = useState<number[]>([22, 80, 443, 3306]);
  return (
    <LabFrame
      id="cyber"
      concept="Reconnaissance maps the attack surface. Scan the hardened lab host and confirm which ports the firewall should be filtering."
    >
      {(run, lines, reset) => (
        <>
          <TextField label="Command" value={cmd} onChange={setCmd} />
          <div className="flex flex-wrap gap-2">
            {PORTS.map((p) => (
              <button
                key={p.port}
                onClick={() =>
                  setSelected((s) =>
                    s.includes(p.port) ? s.filter((x) => x !== p.port) : [...s, p.port],
                  )
                }
                className={cn(
                  "rounded-xl border px-3 py-1.5 font-mono text-xs",
                  selected.includes(p.port)
                    ? "border-brand-rose/60 bg-brand-rose/10 text-brand-rose"
                    : "border-line-soft bg-surface-soft text-copy-subtle",
                )}
              >
                {p.port}/{p.svc}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <RunButton
              label="Execute scan"
              onClick={() =>
                run([
                  `$ ${cmd}`,
                  "Starting Nmap 7.94 ( https://nmap.org )",
                  "PORT     STATE     SERVICE  VERSION",
                  ...PORTS.filter((p) => selected.includes(p.port)).map(
                    (p) =>
                      `${String(p.port + "/tcp").padEnd(9)}${p.state.padEnd(10)}${p.svc.padEnd(9)}${p.banner}`,
                  ),
                  "--- firewall review ---",
                  ...PORTS.filter((p) => selected.includes(p.port)).map(
                    (p) => `  ${p.port}: ${p.risk}`,
                  ),
                  `✓ Scan complete · ${selected.filter((s) => PORTS.find((p) => p.port === s)?.state === "open").length} open, ${selected.filter((s) => PORTS.find((p) => p.port === s)?.state === "filtered").length} filtered`,
                ])
              }
            />
            <ResetButton onClick={reset} />
          </div>
          <Console lines={lines} />
        </>
      )}
    </LabFrame>
  );
}

/* ---------------- 7. SRE / Kubernetes ---------------- */
function SreLab() {
  const [replicas, setReplicas] = useState(3);
  const rps = 4800;
  return (
    <LabFrame
      id="sre"
      concept="Horizontal scaling spreads request load across pods. Watch per-pod RPS and latency change as you scale the deployment."
    >
      {(run, lines, reset) => (
        <>
          <label className="block text-xs font-semibold text-copy-subtle">
            kubectl scale deploy/itse-api --replicas={replicas}
            <input
              type="range"
              min={1}
              max={12}
              value={replicas}
              onChange={(e) => setReplicas(Number(e.target.value))}
              className="mt-2 w-full accent-brand-cyan"
            />
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Array.from({ length: replicas }, (_, i) => (
              <div
                key={i}
                className="rounded-xl border border-line-soft bg-surface-soft p-2.5 font-mono text-[11px]"
              >
                <p className="text-brand-emerald">pod-{i + 1} Ready</p>
                <p className="text-copy-subtle">{Math.round(rps / replicas)} rps</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <RunButton
              label="Apply scale"
              onClick={() =>
                run([
                  `$ kubectl scale deploy/itse-api --replicas=${replicas}`,
                  "deployment.apps/itse-api scaled",
                  "$ kubectl rollout status deploy/itse-api",
                  `deployment "itse-api" successfully rolled out (${replicas}/${replicas} ready)`,
                  `ingress: ${rps} rps balanced → ${Math.round(rps / replicas)} rps/pod`,
                  `p95 latency: ${Math.max(38, Math.round(680 / replicas))}ms · error rate 0.02%`,
                  replicas < 3
                    ? "⚠ below minimum HA replica count (3)"
                    : "✓ SLO 99.9% availability satisfied",
                ])
              }
            />
            <ResetButton onClick={reset} />
          </div>
          <Console lines={lines} />
        </>
      )}
    </LabFrame>
  );
}

/* ---------------- 8. UI/UX ---------------- */
function hexToRgb(hex: string) {
  const m = /^#?([\da-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1]!, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as [number, number, number];
}
function luminance([r, g, b]: [number, number, number]) {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function UiuxLab() {
  const [bg, setBg] = useState("#0a0d14");
  const [fg, setFg] = useState("#f8fafc");
  const [viewport, setViewport] = useState<"mobile" | "desktop">("mobile");
  const a = hexToRgb(bg);
  const b = hexToRgb(fg);
  const ratio =
    a && b
      ? (Math.max(luminance(a), luminance(b)) + 0.05) /
        (Math.min(luminance(a), luminance(b)) + 0.05)
      : 0;
  return (
    <LabFrame
      id="uiux"
      concept="Accessible interfaces need contrast ≥ 7:1 for AAA body text. Test the palette across both viewports before shipping the design token."
    >
      {(run, lines, reset) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Surface colour" value={bg} onChange={setBg} placeholder="#0a0d14" />
            <TextField label="Text colour" value={fg} onChange={setFg} placeholder="#f8fafc" />
          </div>
          <div className="flex gap-2">
            {(["mobile", "desktop"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setViewport(v)}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-semibold capitalize",
                  viewport === v
                    ? "border-brand-purple/60 bg-brand-purple/10 text-brand-purple"
                    : "border-line-soft bg-surface-soft text-copy-subtle",
                )}
              >
                {v} {v === "mobile" ? "390px" : "1440px"}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-line-soft p-4">
            <div
              className={cn(
                "mx-auto rounded-xl p-5 transition-all",
                viewport === "mobile" ? "max-w-[280px]" : "max-w-full",
              )}
              style={{ background: bg, color: fg }}
            >
              <p className="font-display text-lg font-bold">Placement Readiness</p>
              <p className="mt-1 text-sm opacity-80">
                Body copy sample at 14px — check legibility.
              </p>
            </div>
          </div>
          <p className="font-mono text-xs text-copy-subtle">
            contrast = {ratio.toFixed(2)}:1 ·{" "}
            <span
              className={
                ratio >= 7
                  ? "text-brand-emerald"
                  : ratio >= 4.5
                    ? "text-brand-amber"
                    : "text-brand-rose"
              }
            >
              {ratio >= 7 ? "AAA pass" : ratio >= 4.5 ? "AA only" : "fail"}
            </span>
          </p>
          <div className="flex gap-2">
            <RunButton
              label="Run WCAG audit"
              onClick={() =>
                run([
                  `> axe-core audit · viewport ${viewport === "mobile" ? "390x844" : "1440x900"}`,
                  `contrast(${bg}, ${fg}) = ${ratio.toFixed(2)}:1`,
                  `AA (4.5:1)  ${ratio >= 4.5 ? "PASS" : "FAIL"}`,
                  `AAA (7:1)   ${ratio >= 7 ? "PASS" : "FAIL"}`,
                  "tap targets ≥ 44px  PASS",
                  "focus-visible ring   PASS",
                  ratio >= 7
                    ? "✓ token approved for design system"
                    : "⚠ adjust palette before promoting the token",
                ])
              }
            />
            <ResetButton onClick={reset} />
          </div>
          <Console lines={lines} />
        </>
      )}
    </LabFrame>
  );
}

/* ---------------- 9. QA Automation ---------------- */
const SPECS = [
  "auth.cy.ts › student can sign in with provisioned credentials",
  "labs.cy.ts › completing a sandbox awards 50 XP",
  "accelerator.cy.ts › daily practice unlocks after broadcast",
  "placement.cy.ts › readiness slider recalculates eligible companies",
  "gateway.cy.ts › ATS generator stays locked below 100%",
];
function QaLab() {
  const [failIndex, setFailIndex] = useState(-1);
  return (
    <LabFrame
      id="qa"
      concept="Regression suites are your safety net. Run the Cypress specs and read the step-by-step log; inject a failure to see the diagnostic output."
    >
      {(run, lines, reset) => (
        <>
          <label className="block text-xs font-semibold text-copy-subtle">
            Inject failure into spec
            <select
              value={failIndex}
              onChange={(e) => setFailIndex(Number(e.target.value))}
              className="mt-1.5 w-full rounded-xl border border-line-soft bg-surface-elevated px-3 py-2 text-xs text-foreground"
            >
              <option value={-1}>none — expect all green</option>
              {SPECS.map((s, i) => (
                <option key={s} value={i}>
                  {s.split(" › ")[0]}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <RunButton
              label="npx cypress run"
              onClick={() =>
                run([
                  "$ npx cypress run --browser chrome",
                  ...SPECS.flatMap((s, i) => [
                    `  ${i === failIndex ? "✗" : "✓"} ${s}  (${900 + i * 210}ms)`,
                    i === failIndex
                      ? `      AssertionError: expected 'locked' to equal 'unlocked'\n      at gateway.spec:42`
                      : "",
                  ]).filter(Boolean),
                  `Tests: ${SPECS.length} · Passing: ${failIndex === -1 ? SPECS.length : SPECS.length - 1} · Failing: ${failIndex === -1 ? 0 : 1}`,
                  failIndex === -1
                    ? "✓ Suite green — safe to merge"
                    : "✗ Pipeline blocked — fix the failing spec",
                ])
              }
            />
            <ResetButton onClick={reset} />
          </div>
          <Console lines={lines} />
        </>
      )}
    </LabFrame>
  );
}

/* ---------------- 10. Mobile ---------------- */
function MobileLab() {
  const [title, setTitle] = useState("Streak alert");
  const [body, setBody] = useState("Your 30m accelerator unlocks in 15 minutes.");
  const [pushed, setPushed] = useState(false);
  const [build, setBuild] = useState(1);
  return (
    <LabFrame
      id="mobile"
      concept="Hot reload keeps native iteration fast. Trigger a rebuild, then fire a push notification into the device mock."
    >
      {(run, lines, reset) => (
        <>
          <div className="flex flex-wrap items-start gap-5">
            <div className="mx-auto w-[220px] shrink-0 rounded-[28px] border-4 border-line-soft bg-surface-dark p-3">
              <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-line-soft" />
              {pushed && (
                <div className="mb-3 animate-in rounded-xl border border-brand-cyan/40 bg-brand-cyan/10 p-2.5">
                  <p className="text-[11px] font-bold text-brand-cyan">{title}</p>
                  <p className="text-[10px] text-copy-subtle">{body}</p>
                </div>
              )}
              <p className="font-display text-sm font-bold text-foreground">SantoGe Learner</p>
              <p className="mt-1 font-mono text-[10px] text-copy-subtle">
                build #{build} · hot reload
              </p>
              <div className="mt-3 space-y-1.5">
                {["Dashboard", "Labs", "Accelerator"].map((s) => (
                  <div
                    key={s}
                    className="rounded-lg bg-surface-soft px-2 py-1.5 text-[11px] text-foreground"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
            <div className="min-w-[220px] flex-1 space-y-3">
              <TextField label="Push title" value={title} onChange={setTitle} />
              <TextField label="Push body" value={body} onChange={setBody} />
              <button
                onClick={() => setBuild((b) => b + 1)}
                className="rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs font-semibold text-foreground"
              >
                Trigger hot reload
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <RunButton
              label="Send push"
              onClick={() => {
                setPushed(true);
                run([
                  `$ npx react-native start --reset-cache`,
                  `Fast Refresh: rebuilt bundle #${build} in ${420 + build * 13}ms`,
                  `$ fcm send --title "${title}"`,
                  `{ "success": 1, "failure": 0, "messageId": "0:17${Date.now().toString().slice(-8)}" }`,
                  "✓ Notification rendered in device mock",
                ]);
              }}
            />
            <ResetButton
              onClick={() => {
                setPushed(false);
                reset();
              }}
            />
          </div>
          <Console lines={lines} />
        </>
      )}
    </LabFrame>
  );
}

/* ---------------- 11. Medical Coding ---------------- */
const ICD: Record<string, string> = {
  "M54.5": "Low back pain",
  "E11.9": "Type 2 diabetes mellitus without complications",
  "J45.909": "Unspecified asthma, uncomplicated",
};
const CPT: Record<string, string> = {
  "22840": "Posterior non-segmental instrumentation",
  "99213": "Office visit, established patient, low complexity",
  "70450": "CT head/brain without contrast",
};
function MedicalLab() {
  const [icd, setIcd] = useState("M54.5");
  const [cpt, setCpt] = useState("22840");
  const [claims, setClaims] = useState(120);
  return (
    <LabFrame
      id="medical"
      concept="Clean claim rate depends on valid ICD-10 diagnosis and CPT procedure pairing. Validate the codes, then project reimbursement quality."
    >
      {(run, lines, reset) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="ICD-10 diagnosis code" value={icd} onChange={setIcd} />
            <TextField label="CPT procedure code" value={cpt} onChange={setCpt} />
          </div>
          <label className="block text-xs font-semibold text-copy-subtle">
            Monthly claim volume: {claims}
            <input
              type="range"
              min={20}
              max={400}
              step={10}
              value={claims}
              onChange={(e) => setClaims(Number(e.target.value))}
              className="mt-2 w-full accent-brand-rose"
            />
          </label>
          <div className="flex gap-2">
            <RunButton
              label="Validate & scrub"
              onClick={() => {
                const icdOk = Boolean(ICD[icd.toUpperCase()]);
                const cptOk = Boolean(CPT[cpt]);
                const rate = icdOk && cptOk ? 98.2 : icdOk || cptOk ? 74.5 : 41.0;
                run([
                  "> claim scrubber v4 · payer: Aetna",
                  `ICD-10 ${icd.toUpperCase()}: ${icdOk ? `VALID — ${ICD[icd.toUpperCase()]}` : "INVALID — not found in FY2026 code set"}`,
                  `CPT    ${cpt}: ${cptOk ? `VALID — ${CPT[cpt]}` : "INVALID — not found in CPT 2026"}`,
                  `medical necessity link: ${icdOk && cptOk ? "supported" : "unsupported (edit required)"}`,
                  `clean claim rate: ${rate}%  ·  denials projected: ${Math.round((claims * (100 - rate)) / 100)} / ${claims}`,
                  rate > 95
                    ? "✓ Claim batch ready for submission"
                    : "⚠ Route to coder review queue",
                ]);
              }}
            />
            <ResetButton onClick={reset} />
          </div>
          <Console lines={lines} />
        </>
      )}
    </LabFrame>
  );
}

/* ---------------- 12. Digital Marketing ---------------- */
function MarketingLab() {
  const [budget, setBudget] = useState(200000);
  const [split, setSplit] = useState(60);
  const searchRoas = 4.2;
  const socialRoas = 2.6;
  const searchSpend = (budget * split) / 100;
  const socialSpend = budget - searchSpend;
  const revenue = searchSpend * searchRoas + socialSpend * socialRoas;
  return (
    <LabFrame
      id="marketing"
      concept="Budget reallocation is the fastest ROAS lever. Shift spend between channels and watch blended return and CAC respond."
    >
      {(run, lines, reset) => (
        <>
          <label className="block text-xs font-semibold text-copy-subtle">
            Monthly budget ₹{budget.toLocaleString("en-IN")}
            <input
              type="range"
              min={50000}
              max={1000000}
              step={10000}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="mt-2 w-full accent-brand-amber"
            />
          </label>
          <label className="block text-xs font-semibold text-copy-subtle">
            Paid search {split}% · paid social {100 - split}%
            <input
              type="range"
              min={0}
              max={100}
              value={split}
              onChange={(e) => setSplit(Number(e.target.value))}
              className="mt-2 w-full accent-brand-amber"
            />
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Search spend", `₹${Math.round(searchSpend).toLocaleString("en-IN")}`],
              ["Social spend", `₹${Math.round(socialSpend).toLocaleString("en-IN")}`],
              ["Projected revenue", `₹${Math.round(revenue).toLocaleString("en-IN")}`],
              ["Blended ROAS", `${(revenue / budget).toFixed(2)}x`],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl border border-line-soft bg-surface-soft p-2.5">
                <p className="text-[10px] uppercase tracking-widest text-copy-subtle">{l}</p>
                <p className="mt-1 font-mono text-sm text-brand-amber">{v}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <RunButton
              label="Commit reallocation"
              onClick={() =>
                run([
                  "> reallocate --account itse-growth",
                  `paid_search: ₹${Math.round(searchSpend).toLocaleString("en-IN")} @ ${searchRoas}x`,
                  `paid_social: ₹${Math.round(socialSpend).toLocaleString("en-IN")} @ ${socialRoas}x`,
                  `blended ROAS ${(revenue / budget).toFixed(2)}x · CAC ₹${Math.round(budget / Math.max(1, revenue / 4200))}`,
                  `projected revenue ₹${Math.round(revenue).toLocaleString("en-IN")}`,
                  split > 70
                    ? "⚠ heavy search concentration — audit frequency capping"
                    : "✓ channel mix within variance guardrails",
                ])
              }
            />
            <ResetButton onClick={reset} />
          </div>
          <Console lines={lines} />
        </>
      )}
    </LabFrame>
  );
}

/* ---------------- 13. SAP FICO ---------------- */
function SapLab() {
  const [debit, setDebit] = useState("400000");
  const [credit, setCredit] = useState("113100");
  const [amount, setAmount] = useState(45000);
  return (
    <LabFrame
      id="sap"
      concept="Every FI document must balance debit and credit before posting. Fill the GL line items and post through transaction FB50."
    >
      {(run, lines, reset) => (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Debit GL account" value={debit} onChange={setDebit} />
            <TextField label="Credit GL account" value={credit} onChange={setCredit} />
          </div>
          <label className="block text-xs font-semibold text-copy-subtle">
            Amount ₹{amount.toLocaleString("en-IN")}
            <input
              type="range"
              min={1000}
              max={500000}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-2 w-full accent-brand-blue"
            />
          </label>
          <div className="flex gap-2">
            <RunButton
              label="Post (FB50)"
              onClick={() =>
                run([
                  "SAP Easy Access · /nFB50 · Company Code 1000 · FY 2026",
                  `Line 1  40  ${debit}  Debit   ₹${amount.toLocaleString("en-IN")}`,
                  `Line 2  50  ${credit}  Credit  ₹${amount.toLocaleString("en-IN")}`,
                  "Balance check: 0.00 — document is balanced",
                  `Document 10000${Math.floor(Math.random() * 9000 + 1000)} was posted in company code 1000`,
                  "✓ Ledger 0L updated · FAGLL03 line items available",
                ])
              }
            />
            <ResetButton onClick={reset} />
          </div>
          <Console lines={lines} />
        </>
      )}
    </LabFrame>
  );
}

/* ---------------- 14. HR & Payroll ---------------- */
function HrLab() {
  const [ctc, setCtc] = useState(600000);
  const [metro, setMetro] = useState(true);
  const basic = Math.round(ctc * 0.4);
  const hra = Math.round(basic * (metro ? 0.5 : 0.4));
  const epf = Math.round(Math.min(basic, 180000) * 0.12);
  const gross = Math.round(ctc - epf);
  const esi = gross / 12 <= 21000 ? Math.round(gross * 0.0075) : 0;
  const special = ctc - basic - hra - epf - esi;
  const taxable = Math.max(0, ctc - 75000 - epf);
  const tds = taxable <= 700000 ? 0 : Math.round((taxable - 700000) * 0.1 + 20000);
  const net = Math.round((ctc - epf - esi - tds) / 12);
  return (
    <LabFrame
      id="hr"
      concept="A compliant salary structure balances tax efficiency with statutory floors. Build the CTC breakup and read the monthly take-home."
    >
      {(run, lines, reset) => (
        <>
          <label className="block text-xs font-semibold text-copy-subtle">
            Annual CTC ₹{ctc.toLocaleString("en-IN")}
            <input
              type="range"
              min={240000}
              max={2400000}
              step={20000}
              value={ctc}
              onChange={(e) => setCtc(Number(e.target.value))}
              className="mt-2 w-full accent-brand-emerald"
            />
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold text-copy-subtle">
            <input
              type="checkbox"
              checked={metro}
              onChange={(e) => setMetro(e.target.checked)}
              className="accent-brand-emerald"
            />
            Metro city (HRA 50% of basic)
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              ["Basic", basic],
              ["HRA", hra],
              ["Special allowance", special],
              ["EPF (12%)", epf],
              ["ESI", esi],
              ["TDS (new regime)", tds],
            ].map(([l, v]) => (
              <div
                key={l as string}
                className="rounded-xl border border-line-soft bg-surface-soft p-2.5"
              >
                <p className="text-[10px] uppercase tracking-widest text-copy-subtle">{l}</p>
                <p className="mt-1 font-mono text-sm text-foreground">
                  ₹{(v as number).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <RunButton
              label="Compute payslip"
              onClick={() =>
                run([
                  "> payroll engine · FY 2026-27 · new tax regime",
                  `CTC              ₹${ctc.toLocaleString("en-IN")}`,
                  `Basic (40%)      ₹${basic.toLocaleString("en-IN")}`,
                  `HRA (${metro ? 50 : 40}% basic) ₹${hra.toLocaleString("en-IN")}`,
                  `Special allow.   ₹${special.toLocaleString("en-IN")}`,
                  `EPF employee     ₹${epf.toLocaleString("en-IN")}`,
                  `ESI              ₹${esi.toLocaleString("en-IN")}${esi === 0 ? "  (above wage ceiling)" : ""}`,
                  `TDS              ₹${tds.toLocaleString("en-IN")}`,
                  `NET TAKE-HOME    ₹${net.toLocaleString("en-IN")} / month`,
                  "✓ Payslip generated and statutory challans queued",
                ])
              }
            />
            <ResetButton onClick={reset} />
          </div>
          <Console lines={lines} />
        </>
      )}
    </LabFrame>
  );
}

/* ---------------- 15. Business Analytics ---------------- */
const MONTHS = [
  { m: "Apr", rev: 820000, target: 800000 },
  { m: "May", rev: 910000, target: 850000 },
  { m: "Jun", rev: 780000, target: 880000 },
  { m: "Jul", rev: 1040000, target: 900000 },
  { m: "Aug", rev: 1180000, target: 950000 },
  { m: "Sep", rev: 1260000, target: 1000000 },
];
function BiLab() {
  const [dax, setDax] = useState("Revenue YTD = TOTALYTD(SUM(Sales[Amount]), 'Date'[Date])");
  const [measure, setMeasure] = useState<"ytd" | "growth" | "variance">("ytd");
  const total = MONTHS.reduce((a, b) => a + b.rev, 0);
  const max = Math.max(...MONTHS.map((x) => x.rev));
  return (
    <LabFrame
      id="bianalytics"
      concept="DAX measures turn raw rows into KPIs. Choose a measure, evaluate the formula, and read the refreshed revenue visual."
    >
      {(run, lines, reset) => (
        <>
          <CodeEditor value={dax} onChange={setDax} rows={3} />
          <div className="flex flex-wrap gap-2">
            {(["ytd", "growth", "variance"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMeasure(m)}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-semibold",
                  measure === m
                    ? "border-brand-purple/60 bg-brand-purple/10 text-brand-purple"
                    : "border-line-soft bg-surface-soft text-copy-subtle",
                )}
              >
                {m === "ytd" ? "Revenue YTD" : m === "growth" ? "MoM Growth %" : "Target Variance"}
              </button>
            ))}
          </div>
          <div className="flex h-40 items-end gap-2 rounded-xl border border-line-soft bg-surface-soft p-3">
            {MONTHS.map((x) => (
              <div key={x.m} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-brand-purple to-brand-cyan transition-all"
                  style={{ height: `${(x.rev / max) * 100}%` }}
                />
                <span className="text-[10px] text-copy-subtle">{x.m}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <RunButton
              label="Evaluate measure"
              onClick={() =>
                run([
                  "> Power BI · evaluate measure against Sales[Amount]",
                  dax,
                  measure === "ytd"
                    ? `Revenue YTD = ₹${total.toLocaleString("en-IN")}`
                    : measure === "growth"
                      ? MONTHS.slice(1)
                          .map(
                            (x, i) =>
                              `${x.m}: ${(((x.rev - MONTHS[i]!.rev) / MONTHS[i]!.rev) * 100).toFixed(1)}%`,
                          )
                          .join("  ·  ")
                      : MONTHS.map(
                          (x) =>
                            `${x.m}: ${x.rev >= x.target ? "+" : ""}₹${(x.rev - x.target).toLocaleString("en-IN")}`,
                        ).join("  ·  "),
                  `rows scanned: 48,210 · refresh 1.8s`,
                  "✓ KPI card and column visual refreshed",
                ])
              }
            />
            <ResetButton onClick={reset} />
          </div>
          <Console lines={lines} />
        </>
      )}
    </LabFrame>
  );
}

export const LAB_COMPONENTS: Record<TrackId, () => React.ReactElement> = {
  mern: MernLab,
  java: JavaLab,
  aiml: AiLab,
  datascience: DataLab,
  cloud: CloudLab,
  cyber: CyberLab,
  sre: SreLab,
  uiux: UiuxLab,
  qa: QaLab,
  mobile: MobileLab,
  medical: MedicalLab,
  marketing: MarketingLab,
  sap: SapLab,
  hr: HrLab,
  bianalytics: BiLab,
};
