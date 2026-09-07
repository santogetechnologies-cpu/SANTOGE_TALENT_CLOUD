import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Chip, Console, PageHeader, Panel, Stat } from "@/components/kit";
import { useAppStore, type ProvisionedStudent } from "@/lib/app-store";
import { Download, Upload } from "lucide-react";

export const Route = createFileRoute("/admin/provisioning")({
  head: () => ({
    meta: [
      { title: "Bulk CSV Provisioning — SantoGe Talent Cloud" },
      { name: "description", content: "Provision entire college batches from a single CSV with validation and instant credential generation." },
      { property: "og:title", content: "Bulk CSV Provisioning — SantoGe Talent Cloud" },
      { property: "og:description", content: "Provision entire college batches from one validated CSV upload." },
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
Priya Sharma,priya@college.edu,Temp@1234,22IT073,IT,java,datascience,cyber,BATCH-2026-ABC-IT-02`;

function ProvisioningPage() {
  const store = useAppStore();
  const [csv, setCsv] = useState(TEMPLATE);
  const [log, setLog] = useState<string[]>([]);

  const process = () => {
    const lines = csv.trim().split("\n").filter(Boolean);
    const header = (lines[0] ?? "").split(",").map((h) => h.trim());
    const missing = HEADERS.filter((h) => !header.includes(h));
    if (missing.length) {
      setLog([`[error] Missing columns: ${missing.join(", ")}`]);
      toast.error("CSV header invalid");
      return;
    }
    const rows: ProvisionedStudent[] = [];
    const out: string[] = [`[parse] ${lines.length - 1} data rows detected`];
    lines.slice(1).forEach((line, i) => {
      const cells = line.split(",").map((c) => c.trim());
      const rec = Object.fromEntries(header.map((h, idx) => [h, cells[idx] ?? ""])) as unknown as ProvisionedStudent;
      if (!rec.email.includes("@")) {
        out.push(`[skip] row ${i + 1}: invalid email "${rec.email}"`);
        return;
      }
      rows.push(rec);
      out.push(`[ok] ${rec.student_name} · ${rec.roll_no} · ${rec.batch_id} → credentials issued`);
    });
    store.addProvisioned(rows);
    store.pushCronLog({ stage: "provisioning", message: `${rows.length} learners provisioned`, status: "ok" });
    out.push(`[done] ${rows.length} accounts created, welcome emails queued`);
    setLog(out);
    toast.success(`${rows.length} learners provisioned`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk CSV Provisioning"
        subtitle="Onboard a whole college batch in one upload, with column validation and credential issue."
        action={<Chip tone="purple">{store.provisioned.length} provisioned</Chip>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Provisioned learners" value={store.provisioned.length} />
        <Stat label="Required columns" value={HEADERS.length} accent="var(--brand-purple)" />
        <Stat label="Batches" value={store.batches.length} accent="var(--brand-emerald)" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="CSV input"
          subtitle="Paste or edit rows, then run the importer"
          action={
            <a
              href={`data:text/csv;charset=utf-8,${encodeURIComponent(TEMPLATE)}`}
              download="santoge-provisioning-template.csv"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-cyan hover:underline"
            >
              <Download className="size-3.5" /> Template
            </a>
          }
        >
          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            rows={12}
            className="w-full rounded-xl border border-line-soft bg-surface-dark p-3 font-mono text-[11px] text-foreground outline-none focus:border-brand-cyan/60"
          />
          <button
            onClick={process}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-2.5 text-xs font-bold text-surface-dark"
          >
            <Upload className="size-4" /> Run provisioning
          </button>
        </Panel>

        <Panel title="Importer log" subtitle="Row-level validation output">
          <Console lines={log} empty="Run the importer to see validation output." />
        </Panel>
      </div>

      {store.provisioned.length > 0 && (
        <Panel title="Recently provisioned" subtitle="Latest accounts created">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-copy-subtle">
                <tr>
                  <th className="py-2 pr-4 font-semibold">Name</th>
                  <th className="py-2 pr-4 font-semibold">Roll no</th>
                  <th className="py-2 pr-4 font-semibold">Dept</th>
                  <th className="py-2 pr-4 font-semibold">Batch</th>
                  <th className="py-2 font-semibold">Courses</th>
                </tr>
              </thead>
              <tbody className="text-foreground">
                {store.provisioned.slice(-8).reverse().map((p) => (
                  <tr key={p.email} className="border-t border-line-soft">
                    <td className="py-2 pr-4">{p.student_name}</td>
                    <td className="py-2 pr-4 font-mono">{p.roll_no}</td>
                    <td className="py-2 pr-4">{p.dept}</td>
                    <td className="py-2 pr-4 font-mono">{p.batch_id}</td>
                    <td className="py-2">{[p.course_1, p.course_2, p.course_3].filter(Boolean).join(", ")}</td>
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
