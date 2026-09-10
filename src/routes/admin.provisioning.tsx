import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Chip, Console, PageHeader, Panel, Stat } from "@/components/kit";
import {
  fetchLiveStudentRoster,
  fetchLiveBatches,
  provisionLiveStudents,
  addLiveStudent,
  deleteLiveStudent,
  clearAllLiveStudents,
  type ProvisionedStudent,
} from "@/lib/data/admin-data";
import { isUuid } from "@/lib/data";
import {
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  KeyRound,
  Sparkles,
  Trash2,
  Plus,
  Search,
  Copy,
  Check,
  BookOpen,
  ShieldCheck,
  Layers,
  X,
  Terminal,
} from "lucide-react";
import { TRACKS, trackById, type TrackId } from "@/lib/tracks";
import { cn } from "@/lib/utils";
import {
  AdminResetPasswordModal,
  type ResetPasswordStudent,
} from "@/components/admin-reset-password-modal";

export const Route = createFileRoute("/admin/provisioning")({
  head: () => ({
    meta: [
      { title: "Bulk CSV Provisioning — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Stage 0 Institutional Onboarding: Provision entire college batches (100–300 learners) from CSV with validation, track assignment, and instant credential generation.",
      },
      { property: "og:title", content: "Bulk CSV Provisioning — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content:
          "Stage 0 Institutional Onboarding: Provision entire college batches from validated CSV.",
      },
    ],
  }),
  component: ProvisioningPage,
});

/** Standard 10-column CSV Schema */
const HEADERS = [
  "student_name",
  "email",
  "password",
  "roll_no",
  "dept",
  "course_1",
  "course_2",
  "course_3",
  "batch_id",
  "college",
];

/** Production standard CSV template with realistic entries and valid tracks */
const TEMPLATE = `${HEADERS.join(",")}
Ajay Kumar,ajay@college.edu,Temp@1234,22CS014,CSE,mern,datascience,cloud,BATCH-2026-ABC-CSE-01,PSG College of Technology
Kiran Sundaram,kiran@college.edu,Temp@1234,22CS015,CSE,aiml,datascience,cloud,BATCH-2026-ABC-CSE-01,PSG College of Technology
Sneha Iyer,sneha@college.edu,Temp@1234,22EC016,ECE,aiml,java,cyber,BATCH-2026-ABC-CSE-01,PSG College of Technology
Arun Raj,arun@college.edu,Temp@1234,22CS017,CSE,cloud,sre,cyber,BATCH-2026-ABC-CSE-01,PSG College of Technology
Priya Sharma,priya@college.edu,Temp@1234,22IT073,IT,java,datascience,qa,BATCH-2026-ABC-IT-02,National Institute of Technology
Manoj Varadhan,manoj@college.edu,Temp@1234,22CS018,CSE,mern,cloud,uiux,BATCH-2026-ABC-CSE-01,PSG College of Technology
Deepa Krishnan,deepa@college.edu,Temp@1234,22EC045,ECE,aiml,datascience,mobile,BATCH-2026-XYZ-ECE-01,Anna University College of Engineering
Siddharth N,sid@college.edu,Temp@1234,22IT088,IT,cloud,cyber,sre,BATCH-2026-ABC-IT-02,National Institute of Technology
Ananya Ramesh,ananya@college.edu,Temp@1234,22CS102,CSE,mern,java,qa,BATCH-2026-ABC-CSE-01,PSG College of Technology
Girish Patel,girish@college.edu,Temp@1234,22AI034,AIDS,aiml,datascience,bianalytics,BATCH-2026-ABC-CSE-01,PSG College of Technology`;

/** Common course alias normalizer to ensure valid TrackId */
const COURSE_ALIASES: Record<string, TrackId> = {
  mern: "mern",
  fullstack: "mern",
  react: "mern",
  node: "mern",
  java: "java",
  spring: "java",
  aiml: "aiml",
  ai: "aiml",
  ml: "aiml",
  datascience: "datascience",
  data: "datascience",
  python: "datascience",
  cloud: "cloud",
  devops: "cloud",
  aws: "cloud",
  azure: "cloud",
  cyber: "cyber",
  security: "cyber",
  cybersecurity: "cyber",
  sre: "sre",
  uiux: "uiux",
  design: "uiux",
  figma: "uiux",
  qa: "qa",
  testing: "qa",
  automation: "qa",
  mobile: "mobile",
  flutter: "mobile",
  reactnative: "mobile",
  android: "mobile",
  medical: "medical",
  healthcare: "medical",
  marketing: "marketing",
  digitalmarketing: "marketing",
  sap: "sap",
  fico: "sap",
  hr: "hr",
  payroll: "hr",
  bianalytics: "bianalytics",
  bi: "bianalytics",
  powerbi: "bianalytics",
};

/** Normalizes flexible column header titles */
const normalizeHeader = (raw: string): string => {
  const clean = raw
    .trim()
    .toLowerCase()
    .replace(/[\s\-_]+/g, "");
  if (["studentname", "name", "learnername", "fullname"].includes(clean)) return "student_name";
  if (["email", "emailaddress", "studentemail"].includes(clean)) return "email";
  if (["password", "pass", "temppassword"].includes(clean)) return "password";
  if (["rollno", "roll", "rollnumber", "regno", "registerno"].includes(clean)) return "roll_no";
  if (["dept", "department", "branch"].includes(clean)) return "dept";
  if (["course1", "course_1", "track1", "track_1"].includes(clean)) return "course_1";
  if (["course2", "course_2", "track2", "track_2"].includes(clean)) return "course_2";
  if (["course3", "course_3", "track3", "track_3"].includes(clean)) return "course_3";
  if (["batchid", "batch", "cohort", "cohortid"].includes(clean)) return "batch_id";
  if (["college", "institution", "university", "collegename"].includes(clean)) return "college";
  return clean;
};

/** Log line parser for IDE terminal styling */
function parseLogLine(raw: string) {
  const match = raw.match(/^\[([a-z0-9_-]+)\]\s*(.*)$/i);
  if (!match || !match[1]) {
    return { tag: null, text: raw };
  }
  return { tag: match[1].toLowerCase(), text: match[2] ?? "" };
}

const TAG_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  ready: { bg: "bg-brand-cyan/15 border-brand-cyan/30 text-brand-cyan", text: "text-brand-cyan", label: "READY" },
  policy: { bg: "bg-brand-purple/15 border-brand-purple/30 text-brand-purple", text: "text-copy-subtle", label: "POLICY" },
  batch: { bg: "bg-brand-cyan/15 border-brand-cyan/30 text-brand-cyan", text: "text-foreground", label: "BATCH" },
  provisioned: { bg: "bg-brand-emerald/15 border-brand-emerald/30 text-brand-emerald", text: "text-foreground", label: "PROVISIONED" },
  auth: { bg: "bg-brand-purple/15 border-brand-purple/30 text-brand-purple", text: "text-brand-purple", label: "AUTH" },
  complete: { bg: "bg-brand-emerald/20 border-brand-emerald/40 text-brand-emerald", text: "text-brand-emerald font-semibold", label: "COMPLETE" },
  warning: { bg: "bg-brand-amber/15 border-brand-amber/30 text-brand-amber", text: "text-brand-amber", label: "WARNING" },
  alert: { bg: "bg-brand-amber/15 border-brand-amber/30 text-brand-amber", text: "text-brand-amber", label: "ALERT" },
  error: { bg: "bg-brand-rose/15 border-brand-rose/30 text-brand-rose", text: "text-brand-rose font-medium", label: "ERROR" },
  cleared: { bg: "bg-brand-rose/15 border-brand-rose/30 text-brand-rose", text: "text-brand-rose", label: "CLEARED" },
  refresh: { bg: "bg-brand-cyan/15 border-brand-cyan/30 text-brand-cyan", text: "text-copy-subtle", label: "REFRESH" },
};

function ProvisioningPage() {
  const queryClient = useQueryClient();

  // Authoritative Live queries
  const liveRosterQuery = useQuery({
    queryKey: ["live", "student-roster"],
    queryFn: () => fetchLiveStudentRoster({ pageSize: 500 }),
  });

  const liveBatchesQuery = useQuery({
    queryKey: ["live", "batches"],
    queryFn: fetchLiveBatches,
  });

  const [csv, setCsv] = useState(TEMPLATE);
  const [log, setLog] = useState<string[]>([
    "[ready] Stage 0 Institutional Provisioning engine initialized.",
    "[policy] No initial screening test needed. Pre-assign 1 to 3 technical tracks in CSV.",
    "[policy] Batch capacity constraint: 100 to 300 students max per cohort batch.",
    "[auth] Instant credentials auto-issued. Accounts immediately accessible via /login.",
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [isLogCopied, setIsLogCopied] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Table filters & search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatchFilter, setSelectedBatchFilter] = useState("all");
  const [selectedTrackFilter, setSelectedTrackFilter] = useState("all");

  // Modals
  const [resetTargetStudent, setResetTargetStudent] = useState<ResetPasswordStudent | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [clearMode, setClearMode] = useState<"filtered" | "all">("filtered");
  const [deleteTargetStudent, setDeleteTargetStudent] = useState<{
    id?: string;
    name: string;
    email: string;
    rollNo: string;
    batchId: string;
  } | null>(null);

  // Single Add Student Modal
  const [isSingleAddModalOpen, setIsSingleAddModalOpen] = useState(false);
  const [singleName, setSingleName] = useState("");
  const [singleEmail, setSingleEmail] = useState("");
  const [singlePassword, setSinglePassword] = useState("Temp@1234");
  const [singleRollNo, setSingleRollNo] = useState("");
  const [singleDept, setSingleDept] = useState("CSE");
  const [singleBatchId, setSingleBatchId] = useState("");
  const [singleCollege, setSingleCollege] = useState("");
  const [singleTracks, setSingleTracks] = useState<TrackId[]>(["mern"]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsv(content);
        toast.success(`Loaded ${file.name} (${content.split("\n").length - 1} rows)`);
      }
    };
    reader.readAsText(file);
    // Reset file input value to allow re-uploading same file
    e.target.value = "";
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
        toast.success(`Loaded ${file.name} via drop`);
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "santoge-provisioning-template.csv";
    link.click();
    toast.success("Downloaded CSV Template");
  };

  const resetToTemplate = () => {
    setCsv(TEMPLATE);
    toast.info("Editor reset to default standard template");
  };

  const normalizeCourse = (
    raw: string | undefined,
  ): { ok: boolean; trackId?: TrackId; error?: string } => {
    if (!raw || !raw.trim()) return { ok: true };
    const cleaned = raw
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    const mapped = COURSE_ALIASES[cleaned];
    if (!mapped) {
      return { ok: false, error: `Invalid course code "${raw}". Must match a valid track.` };
    }
    return { ok: true, trackId: mapped };
  };

  const processCsv = async () => {
    setIsProcessing(true);
    const lines = csv
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      toast.error("CSV contains no student data rows");
      setIsProcessing(false);
      return;
    }

    const rawHeaders = (lines[0] ?? "").split(",").map((h) => h.trim());
    const normalizedHeaders = rawHeaders.map(normalizeHeader);

    // Validate essential columns
    const hasName = normalizedHeaders.includes("student_name");
    const hasEmail = normalizedHeaders.includes("email");

    if (!hasName || !hasEmail) {
      setLog((l) => [
        `[error] Header must include at least student_name and email. Provided: ${rawHeaders.join(", ")}`,
        ...l,
      ]);
      toast.error("CSV missing required student_name or email header");
      setIsProcessing(false);
      return;
    }

    const rows: ProvisionedStudent[] = [];
    const out: string[] = [`[parse] Validating ${lines.length - 1} student records…`];
    const batchCounts: Record<string, number> = {};
    const seenEmails = new Set<string>();

    lines.slice(1).forEach((line, i) => {
      // Split by comma respecting basic quotes
      const cells = line.split(",").map((c) => c.replace(/^["']|["']$/g, "").trim());
      const rowMap: Record<string, string> = {};
      normalizedHeaders.forEach((nh, idx) => {
        rowMap[nh] = cells[idx] ?? "";
      });

      const email = (rowMap["email"] || "").toLowerCase().trim();
      const studentName = rowMap["student_name"] || "";

      if (!email || !email.includes("@")) {
        out.push(`[skip] Row ${i + 2}: Skipped invalid email "${email}" (${studentName})`);
        return;
      }

      if (seenEmails.has(email)) {
        out.push(`[duplicate] Row ${i + 2}: Skipped duplicate email in file "${email}"`);
        return;
      }
      seenEmails.add(email);

      const rollNo = rowMap["roll_no"] || "";
      const dept = rowMap["dept"] || "";
      const batchId = rowMap["batch_id"] || "";
      const college = rowMap["college"] || "";
      const password = rowMap["password"] || "Temp@1234";

      // Track course assignments: strict validation, never default missing course to mern
      const c1Val = normalizeCourse(rowMap["course_1"]);
      if (!c1Val.ok) {
        out.push(`[error] Row ${i + 2}: course_1 has invalid course code "${rowMap["course_1"]}" for "${email}"`);
        return;
      }
      const c2Val = normalizeCourse(rowMap["course_2"]);
      if (!c2Val.ok) {
        out.push(`[error] Row ${i + 2}: course_2 has invalid course code "${rowMap["course_2"]}" for "${email}"`);
        return;
      }
      const c3Val = normalizeCourse(rowMap["course_3"]);
      if (!c3Val.ok) {
        out.push(`[error] Row ${i + 2}: course_3 has invalid course code "${rowMap["course_3"]}" for "${email}"`);
        return;
      }

      const c1 = c1Val.trackId || "";
      let c2 = c2Val.trackId || "";
      let c3 = c3Val.trackId || "";

      // Ensure de-duplicated tracks per student
      if (c2 && c2 === c1) c2 = "";
      if (c3 && (c3 === c1 || c3 === c2)) c3 = "";

      if (!studentName || !rollNo || !dept || !batchId) {
        out.push(
          `[error] Row ${i + 2}: Missing required field (name, roll_no, dept, or batch_id) for "${email}"`,
        );
        return;
      }

      // Track batch sizes
      if (batchId) {
        batchCounts[batchId] = (batchCounts[batchId] || 0) + 1;
      }

      const record: ProvisionedStudent = {
        student_name: studentName,
        email,
        password,
        roll_no: rollNo,
        dept,
        course_1: c1,
        course_2: c2,
        course_3: c3,
        batch_id: batchId,
        college,
      };

      rows.push(record);
      const coursesStr = [c1, c2, c3].filter(Boolean).join(", ") || "No tracks assigned";
      const displayBatch =
        batchNameById.get(batchId) || (isUuid(batchId) ? "Assigned Batch" : batchId);
      out.push(`[provisioned] ${studentName} (${rollNo}) → ${displayBatch} [${coursesStr}]`);
    });

    // Check batch sizing rule: 100-300 students per batch
    Object.entries(batchCounts).forEach(([bid, count]) => {
      if (count > 300) {
        out.push(
          `[alert] Batch ${bid} has ${count} students (Exceeds maximum recommended 300/batch).`,
        );
      } else {
        out.push(`[batch] Batch ${bid}: ${count} learners mapped (Capacity compliant).`);
      }
    });

    if (rows.length === 0) {
      toast.error("No valid student rows could be parsed");
      setIsProcessing(false);
      return;
    }

    const res = await provisionLiveStudents(rows);
    if (res.count > 0) {
      out.push(
        `[complete] Successfully provisioned ${res.count} student accounts to Supabase backend.`,
      );
    }
    if (res.failedCount > 0) {
      out.push(`[warning] ${res.failedCount} records failed during provisioning:`);
      (res.results || []).forEach((r: { email: string; ok: boolean; error?: string }) => {
        if (!r.ok) {
          out.push(`  ❌ ${r.email}: ${r.error || "Unknown error"}`);
        }
      });
    }
    if (res.ok) {
      out.push(`[auth] Portal credentials active. Students can authenticate at /login.`);
      setLog(out);
      toast.success(`${res.count} learners onboarded to Live Supabase backend!`);
    } else if (res.count > 0) {
      out.push(`[auth] ${res.count} portal credentials active. ${res.failedCount} failed.`);
      setLog(out);
      toast.warning(
        `Partial success: ${res.count} learners onboarded, ${res.failedCount} failed. Check console.`,
      );
    } else {
      out.push(`[error] All records failed to provision: ${res.message || "Unknown error"}`);
      setLog(out);
      toast.error(res.message || "Failed to provision students to Supabase backend");
    }

    if (res.count > 0) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["live", "student-roster"] }),
        queryClient.invalidateQueries({ queryKey: ["live", "batches"] }),
        queryClient.invalidateQueries({ queryKey: ["live", "admin-analytics"] }),
      ]);
    }

    setIsProcessing(false);
  };

  const provisionedList = useMemo(() => {
    const items = liveRosterQuery.data?.items || [];
    return items.map((s) => ({
      student_name: s.name,
      email: s.email,
      password: "••••••••",
      roll_no: s.rollNo,
      dept: s.dept,
      course_1: s.tracks[0] || "",
      course_2: s.tracks[1] || "",
      course_3: s.tracks[2] || "",
      batch_id: s.batchId || "",
      college: s.college || "",
    }));
  }, [liveRosterQuery.data]);

  const batchesList = useMemo(() => {
    if (liveBatchesQuery.data) {
      return liveBatchesQuery.data.map((b) => ({
        id: b.id,
        name: b.name,
        enrolled: b.enrolled_count,
        capacity: b.capacity,
        dept: b.dept,
        status: b.status,
      }));
    }
    return [];
  }, [liveBatchesQuery.data]);

  const batchNameById = useMemo(() => {
    const map = new Map<string, string>();
    batchesList.forEach((batch) => {
      map.set(batch.id, batch.name);
    });
    return map;
  }, [batchesList]);

  // Filtered provisioned list based on Search & Selectors
  const filteredProvisioned = useMemo(() => {
    return provisionedList.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const batchName = (p.batch_id ? batchNameById.get(p.batch_id) : "")?.toLowerCase() || "";

      const matchesQuery =
        !q ||
        p.student_name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.roll_no.toLowerCase().includes(q) ||
        p.dept.toLowerCase().includes(q) ||
        p.batch_id.toLowerCase().includes(q) ||
        batchName.includes(q) ||
        (p.college && p.college.toLowerCase().includes(q));

      const matchesBatch = selectedBatchFilter === "all" || p.batch_id === selectedBatchFilter;
      const matchesTrack =
        selectedTrackFilter === "all" ||
        p.course_1 === selectedTrackFilter ||
        p.course_2 === selectedTrackFilter ||
        p.course_3 === selectedTrackFilter;

      return matchesQuery && matchesBatch && matchesTrack;
    });
  }, [provisionedList, searchQuery, selectedBatchFilter, selectedTrackFilter, batchNameById]);

  const exportProvisioned = () => {
    if (provisionedList.length === 0) {
      toast.info("No provisioned records to export.");
      return;
    }
    const csvContent = [
      HEADERS.join(","),
      ...provisionedList.map((p) =>
        [
          p.student_name,
          p.email,
          p.password,
          p.roll_no,
          p.dept,
          p.course_1,
          p.course_2,
          p.course_3,
          p.batch_id,
          p.college || "Partner Engineering College",
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `santoge-provisioned-credentials-${Date.now()}.csv`;
    link.click();
    toast.success(`Exported ${provisionedList.length} credentials to CSV`);
  };

  const isFiltered = filteredProvisioned.length < provisionedList.length;
  const targetCountToClear =
    isFiltered && clearMode === "filtered"
      ? filteredProvisioned.length
      : provisionedList.length;

  const handleClearAll = async () => {
    if (provisionedList.length === 0) {
      toast.info("No provisioned records to clear.");
      setIsClearAllModalOpen(false);
      return;
    }

    setIsClearingAll(true);
    try {
      const targets =
        isFiltered && clearMode === "filtered"
          ? filteredProvisioned.map((s) => s.email)
          : undefined;

      const countToClear = targets ? targets.length : provisionedList.length;
      const res = await clearAllLiveStudents(targets);

      if (res.ok) {
        toast.success(`Successfully cleared ${res.count || countToClear} student accounts`);
        setCsv("");
        setLog([
          `[cleared] Removed ${res.count || countToClear} student accounts from database (${new Date().toLocaleTimeString()}).`,
          `[refresh] Student directories and cohort batch headcounts updated.`,
        ]);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["live", "student-roster"] }),
          queryClient.invalidateQueries({ queryKey: ["live", "batches"] }),
          queryClient.invalidateQueries({ queryKey: ["live", "admin-analytics"] }),
        ]);
        setIsClearAllModalOpen(false);
      } else {
        toast.error(res.error || "Failed to clear student accounts");
        setLog((prev) => [
          ...prev,
          `[error] Failed to clear student accounts: ${res.error || "Unknown error"} (${new Date().toLocaleTimeString()}).`,
        ]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error while clearing accounts";
      toast.error(msg);
      setLog((prev) => [
        ...prev,
        `[error] Exception clearing student accounts: ${msg} (${new Date().toLocaleTimeString()}).`,
      ]);
    } finally {
      setIsClearingAll(false);
    }
  };

  const handleClearCsvText = () => {
    setCsv("");
    toast.success("Cleared student-provisioning.csv text");
  };

  const handleCopyLog = () => {
    if (log.length === 0) return;
    navigator.clipboard.writeText(log.join("\n"));
    setIsLogCopied(true);
    toast.success("Copied console logs to clipboard");
    setTimeout(() => setIsLogCopied(false), 2000);
  };

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  const csvRowCount = useMemo(() => {
    return Math.max(0, csv.trim().split("\n").filter(Boolean).length - 1);
  }, [csv]);

  const copyCredentials = (email: string, pass: string) => {
    navigator.clipboard.writeText(`Email: ${email} | Password: ${pass}`);
    setCopiedEmail(email);
    toast.success(`Copied login for ${email}`);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const toggleSingleTrack = (trackId: TrackId) => {
    setSingleTracks((prev) => {
      if (prev.includes(trackId)) {
        if (prev.length === 1) {
          toast.info("Learners must have at least 1 technical track assigned");
          return prev;
        }
        return prev.filter((t) => t !== trackId);
      } else {
        if (prev.length >= 3) {
          toast.warning("Maximum 3 technical tracks allowed per learner");
          return prev;
        }
        return [...prev, trackId];
      }
    });
  };

  const handleSingleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleName.trim()) {
      toast.error("Please enter student's full name");
      return;
    }
    if (!singleEmail.trim() || !singleEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!singleBatchId.trim()) {
      toast.error("Please select a batch");
      return;
    }
    if (!singleRollNo.trim()) {
      toast.error("Please enter a Roll / Student ID");
      return;
    }
    if (!singleDept.trim()) {
      toast.error("Please select or enter a department");
      return;
    }
    if (!singleCollege.trim()) {
      toast.error("Please enter the college / institution name");
      return;
    }
    if (singleTracks.length === 0) {
      toast.error("Please select at least 1 technical track (max 3)");
      return;
    }

    const batchId = singleBatchId.trim();
    const password = singlePassword.trim() || "Temp@1234";

    const res = await addLiveStudent({
      name: singleName.trim(),
      email: singleEmail.trim().toLowerCase(),
      password,
      rollNo: singleRollNo.trim(),
      dept: singleDept.trim(),
      batchId,
      college: singleCollege.trim(),
      tracks: singleTracks,
    });

    if (res.ok) {
      toast.success(`Student ${singleName.trim()} registered to Supabase backend!`);
      const singleDisplayBatch =
        batchNameById.get(batchId) || (isUuid(batchId) ? "Assigned Batch" : batchId);
      setLog((prev) => [
        `[provisioned] Single student registered: ${singleName.trim()} (${singleEmail.trim().toLowerCase()}) → ${singleDisplayBatch}`,
        ...prev,
      ]);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["live", "student-roster"] }),
        queryClient.invalidateQueries({ queryKey: ["live", "batches"] }),
        queryClient.invalidateQueries({ queryKey: ["live", "admin-analytics"] }),
      ]);
      setIsSingleAddModalOpen(false);
      setSingleName("");
      setSingleEmail("");
      setSinglePassword("Temp@1234");
      setSingleRollNo("");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stage 0: Bulk CSV Provisioning & Institutional Onboarding"
        subtitle="Onboard college cohorts (100–300 learners) from CSV with validation, track assignment, and instant student portal logins."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsSingleAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-purple/40 bg-brand-purple/10 px-3 py-1.5 text-xs font-semibold text-brand-purple hover:bg-brand-purple/20 transition-colors shadow-sm"
            >
              <Plus className="size-3.5" />
              <span>+ Add Single Learner</span>
            </button>
            <button
              onClick={() => {
                setResetTargetStudent(null);
                setIsResetModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line-soft bg-surface-elevated px-3 py-1.5 text-xs font-semibold text-foreground hover:border-brand-purple/60 transition-colors"
            >
              <KeyRound className="size-3.5 text-brand-purple" />
              <span>Reset Learner Password</span>
            </button>
            <Chip tone="purple">{provisionedList.length} accounts created</Chip>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <Stat
          label="Total Provisioned"
          value={provisionedList.length}
          hint="Active portal logins"
        />
        <Stat
          label="Required CSV Headers"
          value="10 Columns"
          accent="var(--brand-purple)"
          hint="Flexible schema normalizer"
        />
        <Stat
          label="Active Batches"
          value={batchesList.length}
          accent="var(--brand-emerald)"
          hint="100–300 learners/cohort"
        />
        <Stat
          label="Pre-assigned Tracks"
          value="15 Available"
          accent="var(--brand-amber)"
          hint="Max 3 per learner"
        />
      </div>

      {/* CSV Input & Log Section — Symmetrical IDE Workbench */}
      <div className="grid gap-5 lg:grid-cols-2 items-stretch">
        {/* Left: CSV Editor Panel */}
        <Panel
          className="flex flex-col h-full"
          title="CSV Upload & Bulk Provisioning Editor"
          subtitle="Paste CSV text, drag & drop your institution file, or download the standard template"
          action={
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line-soft bg-surface-soft px-2.5 py-1 text-xs font-semibold text-foreground hover:border-brand-purple/50 hover:bg-brand-purple/10 hover:text-brand-purple transition-all"
                title="Upload CSV from computer"
              >
                <Upload className="size-3.5" />
                <span>Upload</span>
              </button>
              <button
                type="button"
                onClick={downloadTemplate}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line-soft bg-surface-soft px-2.5 py-1 text-xs font-semibold text-foreground hover:border-brand-cyan/50 hover:bg-brand-cyan/10 hover:text-brand-cyan transition-all"
                title="Download standard 10-column CSV template"
              >
                <Download className="size-3.5" />
                <span>Template</span>
              </button>
              <button
                type="button"
                onClick={resetToTemplate}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line-soft bg-surface-soft px-2.5 py-1 text-xs font-semibold text-copy-subtle hover:text-foreground hover:bg-surface-elevated transition-all"
                title="Reset textarea to default template"
              >
                <RefreshCw className="size-3.5" />
                <span>Reset</span>
              </button>
            </div>
          }
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,text/csv"
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
              "relative flex flex-col flex-1 rounded-xl border transition-colors overflow-hidden",
              isDragging
                ? "border-brand-cyan bg-brand-cyan/10 shadow-lg shadow-brand-cyan/10"
                : "border-line-soft bg-surface-dark",
            )}
          >
            {/* Terminal Window Header Bar */}
            <div className="flex items-center justify-between border-b border-line-soft bg-surface-elevated/70 px-3.5 py-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-brand-rose/80" />
                  <span className="size-2.5 rounded-full bg-brand-amber/80" />
                  <span className="size-2.5 rounded-full bg-brand-emerald/80" />
                </div>
                <span className="font-mono text-[11px] font-medium text-copy-subtle ml-1">
                  student-provisioning.csv
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-copy-subtle">
                <span className="rounded bg-surface-soft px-1.5 py-0.5 font-semibold text-brand-purple">
                  10 Columns
                </span>
                <span>
                  {csvRowCount} {csvRowCount === 1 ? "row" : "rows"}
                </span>
                <span>•</span>
                <span>UTF-8</span>
              </div>
            </div>

            <textarea
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              wrap="off"
              placeholder="Paste comma-separated student rows here or drag & drop a .csv file…"
              className="h-[360px] flex-1 w-full resize-none bg-transparent p-3.5 font-mono text-[11.5px] leading-relaxed text-foreground outline-none whitespace-pre overflow-x-auto overflow-y-auto selection:bg-brand-cyan/20"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                onClick={processCsv}
                disabled={isProcessing || !csv.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple px-4 py-2.5 text-xs font-bold text-surface-dark shadow-md hover:opacity-95 transition-opacity disabled:opacity-50"
              >
                {isProcessing ? (
                  <RefreshCw className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                <span>{isProcessing ? "Processing Rows…" : "Run Provisioning & Issue Logins"}</span>
              </button>
              <span className="text-[11px] font-mono text-copy-subtle hidden sm:inline">
                {csvRowCount > 0 ? `${csvRowCount} student records ready` : "No rows"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {provisionedList.length > 0 && (
                <button
                  onClick={exportProvisioned}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs font-semibold text-foreground hover:border-brand-cyan/60 transition-colors"
                >
                  <Download className="size-3.5" />
                  <span>Export CSV</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleClearCsvText}
                disabled={!csv}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand-rose/40 bg-brand-rose/10 px-3 py-2 text-xs font-semibold text-brand-rose hover:bg-brand-rose/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Clear student-provisioning.csv text"
              >
                <Trash2 className="size-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          </div>
        </Panel>

        {/* Right: Validation & Audit Console Panel */}
        <Panel
          className="flex flex-col h-full"
          title="Provisioning & Validation Log"
          subtitle="Real-time validation, track assignments, and batch capacity audits"
          action={
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-2.5 py-0.5 text-[11px] font-semibold text-brand-cyan">
                <span className="size-1.5 rounded-full bg-brand-cyan animate-pulse" />
                <span>Live Console</span>
              </span>
              <button
                type="button"
                onClick={handleCopyLog}
                disabled={log.length === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-line-soft bg-surface-soft px-2.5 py-1 text-xs font-semibold text-copy-subtle hover:text-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="Copy console logs to clipboard"
              >
                {isLogCopied ? (
                  <Check className="size-3.5 text-brand-emerald" />
                ) : (
                  <Copy className="size-3.5" />
                )}
                <span>{isLogCopied ? "Copied" : "Copy Log"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setLog([]);
                  toast.info("Cleared console logs");
                }}
                disabled={log.length === 0}
                className="inline-flex items-center gap-1 rounded-lg border border-brand-rose/30 bg-brand-rose/10 px-2.5 py-1 text-xs font-semibold text-brand-rose hover:bg-brand-rose/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title="Clear console output"
              >
                <Trash2 className="size-3.5" />
                <span>Clear Console</span>
              </button>
            </div>
          }
        >
          <div className="relative flex flex-col flex-1 rounded-xl border border-line-soft bg-surface-dark overflow-hidden">
            {/* Terminal Window Header Bar */}
            <div className="flex items-center justify-between border-b border-line-soft bg-surface-elevated/70 px-3.5 py-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-brand-rose/80" />
                  <span className="size-2.5 rounded-full bg-brand-amber/80" />
                  <span className="size-2.5 rounded-full bg-brand-emerald/80" />
                </div>
                <span className="font-mono text-[11px] font-medium text-copy-subtle ml-1">
                  provisioning-audit.log
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-copy-subtle">
                <span className="rounded bg-surface-soft px-1.5 py-0.5 font-semibold text-brand-cyan">
                  Live Stdout
                </span>
                <span>
                  {log.length} {log.length === 1 ? "event" : "events"}
                </span>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="h-[360px] flex-1 overflow-y-auto overflow-x-auto p-3.5 font-mono text-[11.5px] leading-relaxed space-y-1.5 bg-brand-ink/40">
              {log.length === 0 ? (
                <div className="grid h-full place-items-center text-center p-6">
                  <div>
                    <div className="mx-auto mb-2 grid size-10 place-items-center rounded-xl bg-surface-soft text-copy-subtle">
                      <Terminal className="size-5" />
                    </div>
                    <p className="text-xs font-semibold text-foreground">Console Ready</p>
                    <p className="mt-1 max-w-xs text-[11px] text-copy-subtle">
                      Awaiting provisioning execution. Paste or upload CSV on the left and click
                      &quot;Run Provisioning & Issue Logins&quot; to inspect line-by-line validation,
                      track mappings, and batch audits.
                    </p>
                  </div>
                </div>
              ) : (
                log.map((line, idx) => {
                  const { tag, text } = parseLogLine(line);
                  const style = tag ? TAG_STYLES[tag] : null;

                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-2 group hover:bg-surface-soft/40 px-1.5 py-0.5 rounded transition-colors"
                    >
                      <span className="select-none text-[10px] text-copy-subtle/50 font-mono w-5 text-right flex-shrink-0 pt-0.5">
                        {idx + 1}
                      </span>
                      {style ? (
                        <div className="flex items-baseline gap-2 flex-wrap min-w-0">
                          <span
                            className={cn(
                              "inline-flex items-center rounded border px-1.5 py-0.2 text-[9.5px] font-bold uppercase tracking-wider flex-shrink-0",
                              style.bg,
                            )}
                          >
                            {style.label}
                          </span>
                          <span className={cn("break-all", style.text)}>{text}</span>
                        </div>
                      ) : (
                        <span className="text-brand-cyan/90 break-all pl-1">{line}</span>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={consoleEndRef} />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2 text-xs text-copy-subtle">
              <span className="size-2 rounded-full bg-brand-emerald animate-pulse" />
              <span className="font-mono text-[11px]">Audit Engine Active</span>
              <span className="text-line-soft">•</span>
              <span className="font-mono text-[11px] text-copy-subtle">0–1000 TS Gates</span>
            </div>

            <div className="flex items-center gap-2 font-mono text-[11px] text-copy-subtle">
              <span>{log.length} {log.length === 1 ? "event recorded" : "events recorded"}</span>
            </div>
          </div>
        </Panel>
      </div>

      {/* Available Technical Tracks Reference Card */}
      <Panel
        title="15 Specialized Technical Course Tracks Reference"
        subtitle="Valid course codes for CSV columns (course_1, course_2, course_3). Map up to 3 per student."
      >
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5 text-xs">
          {TRACKS.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-line-soft bg-surface-soft p-2.5 hover:border-line-soft/80 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-bold text-brand-cyan">{t.id}</span>
                <span className="size-2 rounded-full" style={{ backgroundColor: t.accent }} />
              </div>
              <p className="font-semibold text-foreground truncate">{t.name}</p>
              <p className="text-[10px] text-copy-subtle truncate mt-0.5">{t.tagline}</p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Recently Provisioned Table with Search & Filtering */}
      {provisionedList.length > 0 && (
        <Panel
          title="Provisioned Student Learner Directory"
          subtitle="All active provisioned accounts with login credentials, assigned batch, and technical specializations"
          action={
            <div className="flex items-center gap-2">
              <Chip tone="cyan">
                {filteredProvisioned.length} of {provisionedList.length} Learners
              </Chip>
              <button
                type="button"
                onClick={() => {
                  setClearMode(isFiltered ? "filtered" : "all");
                  setIsClearAllModalOpen(true);
                }}
                className="inline-flex items-center gap-1 rounded-xl border border-brand-rose/40 bg-brand-rose/10 px-2.5 py-1 text-xs font-semibold text-brand-rose hover:bg-brand-rose/20 transition-colors"
                title="Delete provisioned student accounts from database"
              >
                <Trash2 className="size-3" />
                <span>Delete All Accounts</span>
              </button>
            </div>
          }
        >
          {/* Table Search & Filter Bar */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 size-3.5 text-copy-subtle" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, roll no, college, batch…"
                className="w-full rounded-xl border border-line-soft bg-surface-soft pl-9 pr-3 py-2 text-xs text-foreground outline-none focus:border-brand-cyan/60"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedBatchFilter}
                onChange={(e) => setSelectedBatchFilter(e.target.value)}
                className="rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-brand-cyan/60"
              >
                <option value="all">All Batches ({batchesList.length})</option>
                {batchesList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.enrolled}/{b.capacity})
                  </option>
                ))}
              </select>

              <select
                value={selectedTrackFilter}
                onChange={(e) => setSelectedTrackFilter(e.target.value)}
                className="rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-brand-cyan/60"
              >
                <option value="all">All Tracks (15)</option>
                {TRACKS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.id})
                  </option>
                ))}
              </select>

              {(searchQuery || selectedBatchFilter !== "all" || selectedTrackFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedBatchFilter("all");
                    setSelectedTrackFilter("all");
                  }}
                  className="rounded-xl border border-line-soft bg-surface-dark px-2.5 py-2 text-xs font-semibold text-copy-subtle hover:text-foreground"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-copy-subtle border-b border-line-soft">
                <tr>
                  <th className="py-2.5 pr-4 font-semibold">Learner Name</th>
                  <th className="py-2.5 pr-4 font-semibold">Email</th>
                  <th className="py-2.5 pr-4 font-semibold">Roll No & Dept</th>
                  <th className="py-2.5 pr-4 font-semibold">Institution / College</th>
                  <th className="py-2.5 pr-4 font-semibold">Batch Cohort</th>
                  <th className="py-2.5 pr-4 font-semibold">Assigned Tracks</th>
                  <th className="py-2.5 font-semibold text-right">Credentials & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft/60 text-foreground">
                {filteredProvisioned.slice(0, 50).map((p, idx) => (
                  <tr
                    key={`${p.email}-${idx}`}
                    className="hover:bg-surface-soft/60 transition-colors"
                  >
                    <td className="py-2.5 pr-4">
                      <p className="font-bold text-foreground">{p.student_name}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-brand-emerald">
                        <CheckCircle2 className="size-2.5" /> Active & Login Ready
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-copy-subtle">{p.email}</td>
                    <td className="py-2.5 pr-4">
                      <span className="font-mono">{p.roll_no}</span> · {p.dept}
                    </td>
                    <td className="py-2.5 pr-4 text-copy-subtle">{p.college || "—"}</td>
                    <td className="py-2.5 pr-4">
                      <span className="rounded bg-surface-soft border border-line-soft px-2 py-0.5 text-[11px] text-brand-purple font-semibold">
                        {p.batch_id
                          ? batchNameById.get(p.batch_id) || "Unknown Batch"
                          : "Not Assigned"}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {Array.from(new Set([p.course_1, p.course_2, p.course_3].filter(Boolean)))
                          .length > 0 ? (
                          Array.from(
                            new Set([p.course_1, p.course_2, p.course_3].filter(Boolean)),
                          ).map((c, cIdx) => (
                            <span
                              key={`${p.email}-${c}-${cIdx}`}
                              className="rounded bg-surface-dark border border-line-soft px-1.5 py-0.5 text-[10px] font-mono text-foreground"
                            >
                              {trackById(c as TrackId).short || c}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-copy-subtle italic">Not Assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 text-right font-mono">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => copyCredentials(p.email, p.password)}
                          className="inline-flex items-center gap-1 rounded-lg border border-line-soft bg-surface-dark px-2 py-1 text-[11px] font-semibold text-copy-subtle hover:text-brand-cyan hover:border-brand-cyan/60 transition-colors"
                          title="Copy login email and password"
                        >
                          {copiedEmail === p.email ? (
                            <>
                              <Check className="size-3 text-brand-emerald" />
                              <span className="text-brand-emerald">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setResetTargetStudent({
                              name: p.student_name,
                              email: p.email,
                              rollNo: p.roll_no,
                              batchId: p.batch_id
                                ? batchNameById.get(p.batch_id) || "Unknown Batch"
                                : "Not Assigned",
                              dept: p.dept,
                              college: p.college || "Partner Engineering College",
                            });
                            setIsResetModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-line-soft bg-surface-dark px-2 py-1 text-[11px] font-semibold text-copy-subtle hover:text-brand-purple hover:border-brand-purple/60 transition-colors"
                          title="Reset Student Password"
                        >
                          <KeyRound className="size-3" />
                          <span>Reset</span>
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTargetStudent({
                              name: p.student_name,
                              email: p.email,
                              rollNo: p.roll_no,
                              batchId: p.batch_id,
                            });
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-line-soft bg-surface-dark px-2 py-1 text-[11px] font-semibold text-copy-subtle hover:text-brand-rose hover:border-brand-rose/60 hover:bg-brand-rose/10 transition-colors"
                          title="Delete Student from System"
                        >
                          <Trash2 className="size-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Single Add Student Modal */}
      {isSingleAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/75 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl border border-line-soft bg-surface-elevated p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-brand-purple/15 text-brand-purple border border-brand-purple/30">
                  <Plus className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Add Single Learner
                  </h3>
                  <p className="text-[11px] text-copy-subtle">
                    Creates instant portal credentials, cohort sync, and technical track assignment.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSingleAddModalOpen(false)}
                className="text-copy-subtle hover:text-foreground text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSingleAdd} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Student Full Name <span className="text-brand-rose">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={singleName}
                    onChange={(e) => setSingleName(e.target.value)}
                    placeholder="e.g. Arun Kumar"
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs text-foreground outline-none focus:border-brand-purple/60"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Student Login Email <span className="text-brand-rose">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={singleEmail}
                    onChange={(e) => setSingleEmail(e.target.value)}
                    placeholder="e.g. arun@college.edu"
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs text-foreground outline-none focus:border-brand-purple/60 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Login Password <span className="text-brand-rose">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={singlePassword}
                    onChange={(e) => setSinglePassword(e.target.value)}
                    placeholder="Temp@1234"
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs text-foreground outline-none focus:border-brand-purple/60 font-mono"
                  />
                  <span className="text-[10px] text-copy-subtle mt-0.5 block">
                    Learner uses this password to log in
                  </span>
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Roll / Registration Number
                  </label>
                  <input
                    type="text"
                    value={singleRollNo}
                    onChange={(e) => setSingleRollNo(e.target.value)}
                    placeholder="e.g. 22CS099"
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs text-foreground outline-none focus:border-brand-purple/60 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-foreground mb-1">Department</label>
                  <select
                    value={singleDept}
                    onChange={(e) => setSingleDept(e.target.value)}
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs text-foreground outline-none focus:border-brand-purple/60"
                  >
                    <option value="CSE">CSE (Computer Science)</option>
                    <option value="IT">IT (Information Technology)</option>
                    <option value="ECE">ECE (Electronics & Comm)</option>
                    <option value="EEE">EEE (Electrical & Electronics)</option>
                    <option value="MECH">MECH (Mechanical)</option>
                    <option value="AIDS">AI & Data Science</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-foreground mb-1">
                    Placement Accelerator Cohort <span className="text-brand-rose">*</span>
                  </label>
                  <select
                    value={singleBatchId || (batchesList[0]?.id ?? "")}
                    onChange={(e) => setSingleBatchId(e.target.value)}
                    className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs text-foreground outline-none focus:border-brand-purple/60"
                  >
                    {batchesList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.enrolled}/{b.capacity})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-foreground mb-1">
                  Institution / College
                </label>
                <input
                  type="text"
                  value={singleCollege}
                  onChange={(e) => setSingleCollege(e.target.value)}
                  placeholder="e.g. PSG College of Technology"
                  className="w-full rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-xs text-foreground outline-none focus:border-brand-purple/60"
                />
              </div>

              {/* Technical Tracks Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-foreground">
                    Assign Technical Learning Tracks ({singleTracks.length}/3 selected)
                  </label>
                  <span className="text-[10px] text-copy-subtle">Choose 1 to 3 tracks</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto p-1.5 rounded-xl border border-line-soft bg-surface-soft">
                  {TRACKS.map((track) => {
                    const isSelected = singleTracks.includes(track.id);
                    return (
                      <button
                        type="button"
                        key={track.id}
                        onClick={() => toggleSingleTrack(track.id)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-left text-[11px] transition-all",
                          isSelected
                            ? "border-brand-purple bg-brand-purple/20 text-foreground font-semibold shadow-sm"
                            : "border-line-soft bg-surface-dark/60 text-copy-subtle hover:border-line-soft/80 hover:text-foreground",
                        )}
                      >
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: track.accent }}
                        />
                        <span className="truncate">{track.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-brand-emerald/30 bg-brand-emerald/10 p-2.5 text-[11px] text-brand-emerald flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>Immediate login is activated at /login with provided credentials.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line-soft">
                <button
                  type="button"
                  onClick={() => setIsSingleAddModalOpen(false)}
                  className="rounded-xl border border-line-soft bg-surface-soft px-4 py-2 text-xs font-semibold text-copy-subtle hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan px-4 py-2 text-xs font-bold text-surface-dark hover:opacity-95 shadow-lg shadow-brand-purple/20 transition-opacity"
                >
                  <Plus className="size-3.5" />
                  <span>Provision Learner</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Reset Password Modal */}
      <AdminResetPasswordModal
        isOpen={isResetModalOpen}
        student={resetTargetStudent}
        onClose={() => {
          setIsResetModalOpen(false);
          setResetTargetStudent(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteTargetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-line-soft bg-surface-elevated p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 border-b border-line-soft pb-3">
              <div className="grid size-10 place-items-center rounded-xl bg-brand-rose/15 text-brand-rose border border-brand-rose/30">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Remove Provisioned Learner?
                </h3>
                <p className="text-xs text-copy-subtle">
                  This action permanently deletes the student account
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-line-soft bg-surface-soft p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-copy-subtle font-medium">Student Name:</span>
                <span className="font-bold text-foreground">{deleteTargetStudent.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-copy-subtle font-medium">Email Address:</span>
                <span className="font-mono text-copy-subtle">{deleteTargetStudent.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-copy-subtle font-medium">Roll Number:</span>
                <span className="font-mono font-semibold text-foreground">
                  {deleteTargetStudent.rollNo}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-copy-subtle font-medium">Cohort Batch:</span>
                <span className="font-bold text-brand-purple">
                  {deleteTargetStudent.batchId
                    ? batchNameById.get(deleteTargetStudent.batchId) || "Unknown Batch"
                    : "Not Assigned"}
                </span>
              </div>
            </div>

            <p className="text-xs text-copy-subtle leading-relaxed">
              Removing this student will permanently revoke credentials, update cohort batch
              headcount, and record the removal in the audit trail.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line-soft">
              <button
                type="button"
                onClick={() => setDeleteTargetStudent(null)}
                className="rounded-xl border border-line-soft bg-surface-soft px-4 py-2 text-xs font-semibold text-copy-subtle hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const identifier = deleteTargetStudent.id || deleteTargetStudent.email;
                  const res = await deleteLiveStudent(identifier);
                  if (res.ok) {
                    toast.success(`Removed student ${deleteTargetStudent.name}`);
                    await Promise.all([
                      queryClient.invalidateQueries({ queryKey: ["live", "student-roster"] }),
                      queryClient.invalidateQueries({ queryKey: ["live", "batches"] }),
                      queryClient.invalidateQueries({ queryKey: ["live", "admin-analytics"] }),
                    ]);
                    setDeleteTargetStudent(null);
                  } else {
                    toast.error(res.error || "Failed to delete student from Supabase");
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-rose px-4 py-2 text-xs font-bold text-white hover:bg-brand-rose/90 shadow-lg shadow-brand-rose/20 transition-colors"
              >
                <Trash2 className="size-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Provisioned Confirmation Modal */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-ink/75 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-line-soft bg-surface-elevated p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-brand-rose/15 text-brand-rose border border-brand-rose/30">
                  <AlertTriangle className="size-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Clear Provisioned Accounts
                  </h3>
                  <p className="text-xs text-copy-subtle">Irreversible Account Removal</p>
                </div>
              </div>
              <button
                type="button"
                disabled={isClearingAll}
                onClick={() => setIsClearAllModalOpen(false)}
                className="rounded-lg p-1.5 text-copy-subtle hover:bg-surface-soft hover:text-foreground transition-colors disabled:opacity-50"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-copy-subtle">
              <p className="leading-relaxed">
                You are about to remove student accounts from the active directory. Their credentials will be deactivated and batch headcounts updated.
              </p>

              {isFiltered ? (
                <div className="space-y-2 rounded-xl border border-line-soft bg-surface-soft p-3">
                  <div className="font-semibold text-foreground">Select removal scope:</div>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="clearScope"
                      checked={clearMode === "filtered"}
                      onChange={() => setClearMode("filtered")}
                      className="accent-brand-rose"
                      disabled={isClearingAll}
                    />
                    <span className="text-foreground font-medium">
                      Filtered learners only (<span className="text-brand-rose font-bold">{filteredProvisioned.length}</span> students)
                    </span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="radio"
                      name="clearScope"
                      checked={clearMode === "all"}
                      onChange={() => setClearMode("all")}
                      className="accent-brand-rose"
                      disabled={isClearingAll}
                    />
                    <span>
                      All active provisioned learners (<span className="font-semibold">{provisionedList.length}</span> total)
                    </span>
                  </label>
                </div>
              ) : (
                <div className="rounded-xl border border-brand-rose/20 bg-brand-rose/5 p-3 flex items-center justify-between">
                  <span className="font-medium text-foreground">Total Accounts to Remove:</span>
                  <span className="font-mono text-sm font-bold text-brand-rose">
                    {provisionedList.length} Learners
                  </span>
                </div>
              )}

              <div className="rounded-xl border border-line-soft bg-surface-soft/60 p-3 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <ShieldCheck className="size-3.5 text-brand-cyan" />
                  <span>Audit & System Safety</span>
                </div>
                <p className="text-[11px] leading-normal text-copy-subtle">
                  Student profiles are soft-deleted to maintain foreign-key consistency and audit trails. Cohort enrollments and executive analytics will recalculate immediately.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-line-soft">
              <button
                type="button"
                disabled={isClearingAll}
                onClick={() => setIsClearAllModalOpen(false)}
                className="rounded-xl border border-line-soft bg-surface-soft px-4 py-2 text-xs font-semibold text-copy-subtle hover:text-foreground hover:bg-surface-elevated transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isClearingAll || targetCountToClear === 0}
                onClick={handleClearAll}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-rose px-4 py-2 text-xs font-bold text-white hover:bg-brand-rose/90 shadow-lg shadow-brand-rose/20 transition-colors disabled:opacity-50"
              >
                {isClearingAll ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>Clearing {targetCountToClear} Accounts…</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" />
                    <span>Confirm Clear ({targetCountToClear})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
