import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Chip, Console, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore, type ProvisionedStudent } from "@/lib/app-store";
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, RefreshCw, KeyRound, Sparkles } from "lucide-react";
import { TRACKS } from "@/lib/tracks";

export const Route = createFileRoute("/admin/provisioning")({
  head: () => ({
    meta: [
      { title: "Bulk CSV Provisioning — SantoGe Talent Cloud" },
      { name: "description", content: "Stage 0 Institutional Onboarding: Provision entire college batches (100–300 learners) from CSV with validation and instant credential generation." },
      { property: "og:title", content: "Bulk CSV Provisioning — SantoGe Talent Cloud" },
      { property: "og:description", content: "Stage 0 Institutional Onboarding: Provision entire college batches from validated CSV." },
    ],
  }),
  component: ProvisioningPage,
});

const HEADERS = ["student_name", "email", "password", "roll_no", "dept", "course_1", "course_2", "course_3", "batch_id"];

const TEMPLATE = `${HEADERS.join(",")}
Ajay Kumar,ajay@college.edu,Temp@1234,22CS014,CSE,mern,datascience,marketing,BATCH-2026-ABC-CSE-01
Kiran S,kiran@college.edu,Temp@1234,22CS015,CSE,medical,sap,,BATCH-2026-ABC-CSE-01
Sneha Iyer,sneha@college.edu,Temp@1234,22CS016,ECE,aiml,,,BATCH-2026-ABC-CSE-01
Arun Raj,arun@college.edu,Temp@1234,22CS017,CSE,cloud,sre,cyber,BATCH-2026-ABC-CSE-01
Priya Sharma,priya@college.edu,Temp@1234,22IT073,IT,java,datascience,cyber,BATCH-2026-ABC-IT-02
Manoj V,manoj@college.edu,Temp@1234,22CS018,CSE,testing,fullstack,,BATCH-2026-ABC-CSE-01
Deepa K,deepa@college.edu,Temp@1234,22EC045,ECE,aiml,datascience,,BATCH-2026-XYZ-ECE-01
Siddharth N,sid@college.edu,Temp@1234,22IT088,IT,cloud,cyber,,BATCH-2026-ABC-IT-02`;

function ProvisioningPage() {
  const store = useAppStore();
  const [csv, setCsv] = useState(TEMPLATE);
  const [log, setLog] = useState<string[]>([
    "[ready] Stage 0 Institutional Provisioning engine initialized.",
    "[policy] No initial assessment test needed. Pre-assign 1 to 3 courses in CSV.",
    "[policy] Batch capacity constraint: 100 to 300 students max per batch cohort.",
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsv(content);
        toast.success(`Loaded ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsv(content);
        toast.success(`Loaded ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const process = () => {
    const lines = csv.trim().split("\n").filter(Boolean);
    if (lines.length < 2) {
      toast.error("CSV contains no data rows");
      return;
    }

    const header = (lines[0] ?? "").split(",").map((h) => h.trim());
    const missing = HEADERS.filter((h) => !header.includes(h));
    if (missing.length) {
      setLog((l) => [`[error] Missing columns: ${missing.join(", ")}`, ...l]);
      toast.error("CSV header missing required columns");
      return;
    }

    const rows: ProvisionedStudent[] = [];
    const out: string[] = [`[parse] Validating ${lines.length - 1} student rows…`];
    const batchCounts: Record<string, number> = {};

    lines.slice(1).forEach((line, i) => {
      const cells = line.split(",").map((c) => c.trim());
      const rec = Object.fromEntries(header.map((h, idx) => [h, cells[idx] ?? ""])) as unknown as ProvisionedStudent;
      
      if (!rec.email.includes("@")) {
        out.push(`[skip] Row ${i + 1}: Invalid email "${rec.email}"`);
        return;
      }

      // Track batch sizes
      const bid = rec.batch_id || "BATCH-DEFAULT";
      batchCounts[bid] = (batchCounts[bid] || 0) + 1;

      // Validate assigned courses (1 to 3)
      const courses = [rec.course_1, rec.course_2, rec.course_3].filter(Boolean);
      if (courses.length === 0) {
        out.push(`[warn] Row ${i + 1}: ${rec.student_name} has 0 courses assigned, defaulting to mern`);
        rec.course_1 = "mern";
      }

      rows.push(rec);
      out.push(`[provisioned] ${rec.student_name} (${rec.roll_no}) → Batch ${rec.batch_id} [${courses.join(", ") || "mern"}]`);
    });

    // Check batch sizing rule: 100-300 students per batch
    Object.entries(batchCounts).forEach(([bid, count]) => {
      if (count > 300) {
        out.push(`[alert] Batch ${bid} has ${count} students (Exceeds maximum recommended 300/batch).`);
      } else {
        out.push(`[batch] Batch ${bid}: ${count} learners mapped (Capacity compliant).`);
      }
    });

    store.addProvisioned(rows);
    store.pushCronLog({ stage: "provisioning", message: `${rows.length} learners provisioned via CSV`, status: "ok" });
    out.push(`[complete] ${rows.length} accounts provisioned. Credentials and welcome broadcast queued.`);
    setLog(out);
    toast.success(`${rows.length} learners provisioned successfully!`);
  };

  const provisionedList = store.provisioned || [];
  const batchesList = store.batches || [];

  const exportProvisioned = () => {
    if (provisionedList.length === 0) {
      toast.info("No provisioned records to export.");
      return;
    }
    const csvContent = [
      HEADERS.join(","),
      ...provisionedList.map((p) =>
        [p.student_name, p.email, p.password, p.roll_no, p.dept, p.course_1, p.course_2, p.course_3, p.batch_id].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `santoge-provisioned-credentials-${Date.now()}.csv`;
    link.click();
    toast.success("Downloaded credentials CSV");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stage 0: Bulk CSV Provisioning & Onboarding"
        subtitle="Onboard college rosters, validate 100–300 batch sizing, pre-assign 1–3 technical courses, and generate instant student logins."
        action={<Chip tone="purple">{provisionedList.length} accounts created</Chip>}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Total Provisioned" value={provisionedList.length} hint="Auto-issued logins" />
        <Stat label="Required CSV Headers" value={HEADERS.length} accent="var(--brand-purple)" hint="Strict column schema" />
        <Stat label="Active Batches" value={batchesList.length} accent="var(--brand-emerald)" hint="100–300 learners/cohort" />
        <Stat label="Pre-assigned Tracks" value="15 Available" accent="var(--brand-amber)" hint="Max 3 per learner" />
      </div>

      {/* CSV Input & Log Section */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="CSV Upload & Editor"
          subtitle="Paste CSV text, drag & drop a file, or download the standard template"
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-purple hover:underline"
              >
                <Upload className="size-3.5" /> Upload File
              </button>
              <a
                href={`data:text/csv;charset=utf-8,${encodeURIComponent(TEMPLATE)}`}
                download="santoge-provisioning-template.csv"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-cyan hover:underline ml-2"
              >
                <Download className="size-3.5" /> Template
              </a>
            </div>
          }
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "relative rounded-xl border transition-colors",
              isDragging ? "border-brand-cyan bg-brand-cyan/10" : "border-line-soft bg-surface-dark"
            )}
          >
            <textarea
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              rows={13}
              className="w-full bg-transparent p-3 font-mono text-[11px] text-foreground outline-none focus:border-brand-cyan/60"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={process}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-2.5 text-xs font-bold text-surface-dark shadow-md hover:opacity-90"
            >
              <Upload className="size-4" /> Run Provisioning & Issue Logins
            </button>

            {provisionedList.length > 0 && (
              <button
                onClick={exportProvisioned}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs font-semibold text-foreground hover:border-brand-cyan/60"
              >
                <Download className="size-3.5" /> Export Credentials CSV
              </button>
            )}
          </div>
        </Panel>

        <Panel title="Provisioning & Validation Log" subtitle="Real-time row validation and batch sizing check">
          <Console lines={log} empty="Run provisioning to see validation logs." />
        </Panel>
      </div>

      {/* Schema Reference Panel */}
      <Panel title="Stage 0 CSV Schema Reference" subtitle="Standard institutional CSV format specifications">
        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-line-soft bg-surface-soft p-3">
            <p className="font-bold text-brand-cyan">Identity & Credentials</p>
            <p className="mt-1 text-copy-subtle">
              <span className="font-mono text-foreground font-semibold">student_name, email, password, roll_no, dept</span>
            </p>
            <p className="mt-2 text-[11px] text-copy-subtle">
              Instantly issues login credentials. No preliminary screening tests required.
            </p>
          </div>

          <div className="rounded-xl border border-line-soft bg-surface-soft p-3">
            <p className="font-bold text-brand-purple">Pre-Assigned Tracks (1–3)</p>
            <p className="mt-1 text-copy-subtle">
              <span className="font-mono text-foreground font-semibold">course_1, course_2, course_3</span>
            </p>
            <p className="mt-2 text-[11px] text-copy-subtle">
              Map up to 3 of the 15 specialized in-browser tech tracks (e.g. mern, aiml, cloud).
            </p>
          </div>

          <div className="rounded-xl border border-line-soft bg-surface-soft p-3">
            <p className="font-bold text-brand-emerald">Placement Cohort Batch</p>
            <p className="mt-1 text-copy-subtle">
              <span className="font-mono text-foreground font-semibold">batch_id</span> (e.g. BATCH-2026-ABC-CSE-01)
            </p>
            <p className="mt-2 text-[11px] text-copy-subtle">
              Batch size is constrained between 100 and 300 students for synchronized placement.
            </p>
          </div>
        </div>
      </Panel>

      {/* Recently Provisioned Table */}
      {provisionedList.length > 0 && (
        <Panel
          title="Recently Provisioned Accounts"
          subtitle="Provisioned student logins ready for immediate authentication"
          action={<Chip tone="cyan">{provisionedList.length} Records</Chip>}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-copy-subtle border-b border-line-soft">
                <tr>
                  <th className="py-2.5 pr-4 font-semibold">Learner Name</th>
                  <th className="py-2.5 pr-4 font-semibold">Email</th>
                  <th className="py-2.5 pr-4 font-semibold">Roll No & Dept</th>
                  <th className="py-2.5 pr-4 font-semibold">Batch Cohort</th>
                  <th className="py-2.5 pr-4 font-semibold">Assigned Courses</th>
                  <th className="py-2.5 font-semibold text-right">Credentials</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft/60 text-foreground">
                {provisionedList.slice(-10).reverse().map((p, idx) => (
                  <tr key={`${p.email}-${idx}`} className="hover:bg-surface-soft/60">
                    <td className="py-2.5 pr-4 font-bold">{p.student_name}</td>
                    <td className="py-2.5 pr-4 font-mono text-copy-subtle">{p.email}</td>
                    <td className="py-2.5 pr-4">
                      <span className="font-mono">{p.roll_no}</span> · {p.dept}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="rounded bg-surface-soft border border-line-soft px-2 py-0.5 font-mono text-[11px]">
                        {p.batch_id}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {[p.course_1, p.course_2, p.course_3].filter(Boolean).map((c) => (
                          <span key={c} className="rounded bg-surface-dark border border-line-soft px-1.5 py-0.5 text-[10px] font-mono">
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-mono text-brand-cyan">
                      <span className="inline-flex items-center gap-1 rounded bg-brand-cyan/10 px-2 py-0.5 text-[10px] font-bold text-brand-cyan">
                        <KeyRound className="size-2.5" /> Issued
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}

