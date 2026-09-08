import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { TrackId } from "./tracks";
import { seedSkills, trackProgress as trackPct } from "./curriculum";
import { ADMIN_ACCOUNT, STUDENT_ACCOUNTS, studentByEmail, type StudentAccount } from "./accounts";
import {
  getStoredSession,
  saveStoredSession,
  supabaseAuth,
  type SupabaseSession,
  type SupabaseUser,
} from "./supabase";

export type Role = "student" | "admin";

export type ReadinessInputs = {
  T: number;
  C: number;
  A: number;
  E: number;
  R: number;
  M: number;
};

export type DailySteps = { english: boolean; aptitude: boolean; practice: boolean };

export type Batch = {
  id: string;
  name: string;
  capacity: number;
  enrolled: number;
  dept: string;
  lastSync: string | null;
};

export type ProvisionedStudent = {
  student_name: string;
  email: string;
  password: string;
  roll_no: string;
  dept: string;
  course_1: string;
  course_2: string;
  course_3: string;
  batch_id: string;
};

export type ContentItem = {
  id: string;
  title: string;
  kind: "English video" | "Aptitude video" | "Guided practice" | "Lab brief";
  track: string;
  duration: string;
  status: "published" | "draft" | "scheduled";
  updated: string;
};

export type Profile = {
  activeTracks: TrackId[];
  xp: number;
  streak: number;
  completedLabs: string[];
  daily: DailySteps;
  readiness: ReadinessInputs;
  /** Individual technical journey — completed skill ids across chosen tracks. */
  skills: string[];
  /** Placement Accelerator (batch-synchronised) */
  placementDay: number;
  attendance: number[];
  assessments: Record<string, number>;
  completedTechDays: number[];
  /** Phase 2 */
  mocks: Record<string, number>;
  certifications: string[];
};

export type CompletionRule = "all-tracks" | "primary-plus-minimum";

export type HiringDrive = {
  id: string;
  company: string;
  roles: string;
  ctc: string;
  minScore: number;
  openSlots: number;
  status: "Active Drive" | "Shortlisting" | "Interviews Live" | "Closed";
};

type Persisted = {
  role: Role;
  theme: "dark" | "light";
  sessionEmail: string | null;
  authProvider: "demo" | "supabase";
  profiles: Record<string, Profile>;
  customStudents: Record<string, StudentAccount>;
  passwordOverrides: Record<string, string>;
  batches: Batch[];
  provisioned: ProvisionedStudent[];
  deletedStudentEmails?: string[];
  hiringDrives?: HiringDrive[];
  content: ContentItem[];
  completionRule: CompletionRule;
  secondaryMinimum: number;
};

const STORAGE_KEY = "santoge-talent-cloud-v3";

const DEFAULT_HIRING_DRIVES: HiringDrive[] = [
  { id: "hd-1", company: "TCS Digital", roles: "Full Stack & Cloud", ctc: "₹7.5 - ₹9.0 LPA", minScore: 650, openSlots: 120, status: "Active Drive" },
  { id: "hd-2", company: "Infosys Wingspan", roles: "Java & DevOps Associates", ctc: "₹8.0 - ₹9.5 LPA", minScore: 680, openSlots: 85, status: "Active Drive" },
  { id: "hd-3", company: "Wipro Turbo", roles: "AI/ML Solutions Engineers", ctc: "₹9.5 - ₹12.0 LPA", minScore: 720, openSlots: 60, status: "Shortlisting" },
  { id: "hd-4", company: "Deloitte USI", roles: "SAP FICO & Business Analysts", ctc: "₹8.5 - ₹10.5 LPA", minScore: 670, openSlots: 45, status: "Interviews Live" },
  { id: "hd-5", company: "Cognizant GenC Next", roles: "QA Automation & Cyber", ctc: "₹7.0 - ₹8.5 LPA", minScore: 640, openSlots: 110, status: "Active Drive" },
];

const profileFor = (a: StudentAccount): Profile => ({
  activeTracks: [...a.tracks],
  xp: a.xp,
  streak: a.streak,
  completedLabs: [],
  daily: { english: false, aptitude: false, practice: false },
  readiness: { ...a.readiness },
  skills: seedSkills(a.tracks, a.seedOffsets || [3, 2, 1]),
  placementDay: a.placementDay,
  attendance: Array.from({ length: Math.max(a.placementDay - 1, 0) }, (_, i) => i + 1),
  assessments: a.placementDay > 30 ? { "30": 74 } : {},
  completedTechDays: Array.from({ length: Math.max(a.placementDay - 1, 0) }, (_, i) => i + 1),
  mocks: {},
  certifications: [],
});

const DEFAULT_PROFILES: Record<string, Profile> = Object.fromEntries(
  STUDENT_ACCOUNTS.map((a) => [a.email, profileFor(a)]),
);

const DEFAULT_CONTENT: ContentItem[] = [
  { id: "c1", title: "Daily English · Corporate email etiquette", kind: "English video", track: "All tracks", duration: "10m", status: "published", updated: "Today 06:00" },
  { id: "c2", title: "Daily Aptitude · Time, speed & distance", kind: "Aptitude video", track: "All tracks", duration: "10m", status: "published", updated: "Today 06:00" },
  { id: "c3", title: "Guided practice · 5 MCQ + 2 logic + voice pitch", kind: "Guided practice", track: "All tracks", duration: "10m", status: "published", updated: "Today 06:05" },
  { id: "c4", title: "Lab brief · REST API test runner", kind: "Lab brief", track: "MERN Stack", duration: "25m", status: "published", updated: "Yesterday" },
  { id: "c5", title: "Lab brief · Terraform apply console", kind: "Lab brief", track: "Cloud & DevOps", duration: "30m", status: "draft", updated: "2 days ago" },
  { id: "c6", title: "Daily English · Group discussion openers", kind: "English video", track: "All tracks", duration: "10m", status: "scheduled", updated: "Tomorrow 06:00" },
];

const DEFAULT_STATE: Persisted = {
  role: "student",
  theme: "dark",
  sessionEmail: null,
  authProvider: "demo",
  profiles: DEFAULT_PROFILES,
  customStudents: {},
  passwordOverrides: {},
  batches: [
    { id: "BATCH-2026-ABC-CSE-01", name: "BATCH-2026-ABC-CSE-01", capacity: 240, enrolled: 218, dept: "CSE", lastSync: null },
    { id: "BATCH-2026-ABC-IT-02", name: "BATCH-2026-ABC-IT-02", capacity: 180, enrolled: 164, dept: "IT", lastSync: null },
    { id: "BATCH-2026-XYZ-ECE-01", name: "BATCH-2026-XYZ-ECE-01", capacity: 300, enrolled: 287, dept: "ECE", lastSync: null },
  ],
  provisioned: [],
  deletedStudentEmails: [],
  hiringDrives: DEFAULT_HIRING_DRIVES,
  content: DEFAULT_CONTENT,
  completionRule: "primary-plus-minimum",
  secondaryMinimum: 50,
};

export type CronLog = { id: string; time: string; stage: string; message: string; status: "ok" | "running" | "queued" };

type Store = Persisted &
  Profile & {
    ready: boolean;
    student: StudentAccount | null;
    supabaseSession: SupabaseSession | null;
    isAuthed: boolean;
    talentScore: number;
    readinessIndex: number;
    eligibleCompanies: number;
    phase1Complete: boolean;
    technicalComplete: boolean;
    placementComplete: boolean;
    gateUnlocked: boolean;
    trackPercent: (id: TrackId) => number;
    completeSkill: (trackId: TrackId, skillId: string, name: string) => void;
    completePlacementDay: (day: number) => void;
    completeTechDay: (day: number) => void;
    submitAssessment: (day: number, score: number) => void;
    completeMock: (id: string, score: number) => void;
    issueCertificate: (label: string) => void;
    setCompletionRule: (rule: CompletionRule, secondaryMinimum?: number) => void;
    cronLogs: CronLog[];
    resetStudentPassword: (email: string, newPassword: string) => { ok: boolean; message: string };
    signIn: (email: string, password: string) => { ok: boolean; role?: Role; error?: string };
    signInSupabase: (
      email: string,
      password: string,
    ) => Promise<{ ok: boolean; role?: Role; error?: string }>;
    signUpSupabase: (
      email: string,
      password: string,
      options?: {
        name?: string;
        rollNo?: string;
        dept?: string;
        batchId?: string;
        college?: string;
        tracks?: TrackId[];
      },
    ) => Promise<{ ok: boolean; role?: Role; error?: string }>;
    signOut: () => void;
    setRole: (r: Role) => void;
    toggleTheme: () => void;
    setActiveTracks: (t: TrackId[]) => void;
    completeLab: (labId: string, label: string) => void;
    completeDailyStep: (step: keyof DailySteps) => void;
    setReadiness: (r: Partial<ReadinessInputs>) => void;
    updateBatch: (id: string, patch: Partial<Batch>) => void;
    createBatch: (b: Omit<Batch, "lastSync">) => void;
    deleteBatch: (id: string) => void;
    deleteStudent: (email: string) => { ok: boolean; message: string };
    syncBatch: (id: string) => void;
    hiringDrives: HiringDrive[];
    addHiringDrive: (drive: Omit<HiringDrive, "id">) => void;
    updateHiringDrive: (id: string, patch: Partial<HiringDrive>) => void;
    deleteHiringDrive: (id: string) => void;
    recalculateStudentScore: (email: string) => { ok: boolean; newScore: number; message: string };
    recalculateAllScores: () => { count: number; message: string };
    addProvisioned: (rows: ProvisionedStudent[]) => void;
    addContent: (item: Omit<ContentItem, "id" | "updated">) => void;
    updateContent: (id: string, patch: Partial<ContentItem>) => void;
    removeContent: (id: string) => void;
    pushCronLog: (log: Omit<CronLog, "id" | "time">) => void;
    resetProgress: () => void;
  };

const StoreContext = createContext<Store | null>(null);

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const INITIAL_LOGS: CronLog[] = [
  { id: "l1", time: "06:00:02", stage: "broadcast", message: "Morning 10m English video broadcast queued to 3 batches (669 learners)", status: "ok" },
  { id: "l2", time: "06:00:44", stage: "broadcast", message: "Morning 10m Aptitude video broadcast delivered · Telegram + in-app", status: "ok" },
  { id: "l3", time: "06:05:10", stage: "unlock", message: "In-app 10m guided practice unlocked (5 MCQ · 2 logic · 1 voice pitch)", status: "ok" },
  { id: "l4", time: "06:12:33", stage: "sandbox", message: "Sandbox containers warmed for 15 technical tracks", status: "ok" },
  { id: "l5", time: "06:30:00", stage: "scoring", message: "Talent Score recalculation pass · 669 profiles", status: "running" },
];

const FALLBACK_PROFILE: Profile = {
  activeTracks: ["mern", "cloud", "aiml"],
  xp: 100,
  streak: 1,
  completedLabs: [],
  daily: { english: false, aptitude: false, practice: false },
  readiness: { T: 50, C: 60, A: 55, E: 65, R: 40, M: 20 },
  skills: [],
  placementDay: 1,
  attendance: [1],
  assessments: {},
  completedTechDays: [],
  mocks: {},
  certifications: [],
};

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const [cronLogs, setCronLogs] = useState<CronLog[]>(INITIAL_LOGS);
  const [supabaseSession, setSupabaseSession] = useState<SupabaseSession | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const activeSession = getStoredSession();
      if (activeSession) {
        setSupabaseSession(activeSession);
      }
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        // If logged in via Supabase previously, check that activeSession matches
        if (parsed.authProvider === "supabase" && !activeSession) {
          parsed.sessionEmail = null;
        }
        setState({
          ...DEFAULT_STATE,
          ...parsed,
          profiles: { ...DEFAULT_PROFILES, ...(parsed.profiles ?? {}) },
          customStudents: { ...(parsed.customStudents ?? {}) },
          passwordOverrides: { ...(parsed.passwordOverrides ?? {}) },
          batches: parsed.batches && parsed.batches.length > 0 ? parsed.batches : DEFAULT_STATE.batches,
          provisioned: parsed.provisioned ?? [],
          deletedStudentEmails: parsed.deletedStudentEmails ?? [],
          content: parsed.content && parsed.content.length > 0 ? parsed.content : DEFAULT_STATE.content,
        });
      } else if (activeSession && activeSession.user?.email) {
        const user = activeSession.user;
        const userEmail = user.email.toLowerCase();
        const meta = user.user_metadata || {};
        const role: Role = meta.role === "admin" ? "admin" : "student";
        const studentName = meta.name?.trim() || userEmail.split("@")[0] || "Student Learner";
        const firstName = meta.first_name?.trim() || studentName.split(" ")[0] || "Student";
        const rollNo = meta.roll_no?.trim() || meta.rollNo?.trim() || "STC-2026-LIVE";
        const dept = meta.dept?.trim() || "CSE";
        const batchId = meta.batch_id?.trim() || meta.batchId?.trim() || "BATCH-2026-ABC-CSE-01";
        const college = meta.college?.trim() || "Partner Institution";
        const metaTracks =
          meta.tracks && meta.tracks.length > 0
            ? meta.tracks
            : (["mern", "cloud", "aiml"] as TrackId[]);

        const custom: StudentAccount = {
          email: userEmail,
          password: "●●●●●●●●",
          name: studentName,
          firstName,
          rollNo,
          dept,
          batchId,
          college,
          tracks: (metaTracks.length >= 3
            ? metaTracks.slice(0, 3)
            : [...metaTracks, "mern", "cloud", "aiml"].slice(0, 3)) as [TrackId, TrackId, TrackId],
          xp: 500,
          streak: 7,
          seedOffsets: [3, 2, 1],
          placementDay: 15,
          readiness: { T: 60, C: 65, A: 58, E: 70, R: 45, M: 30 },
        };

        setState({
          ...DEFAULT_STATE,
          role,
          sessionEmail: userEmail,
          authProvider: "supabase",
          customStudents: role === "student" ? { [userEmail]: custom } : {},
          profiles:
            role === "student"
              ? {
                  ...DEFAULT_PROFILES,
                  [userEmail]: {
                    ...profileFor(custom),
                    activeTracks: metaTracks.slice(0, 3),
                  },
                }
              : DEFAULT_PROFILES,
        });
      }
    } catch {
      /* ignore corrupt state */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", state.theme === "dark");
  }, [state.theme]);

  const patch = useCallback((p: Partial<Persisted>) => setState((s) => ({ ...s, ...p })), []);

  const email = state.sessionEmail;
  const student = useMemo<StudentAccount | null>(() => {
    if (!email) return null;
    if (state.deletedStudentEmails?.includes(email.toLowerCase())) return null;
    return studentByEmail(email) || state.customStudents[email] || null;
  }, [email, state.customStudents, state.deletedStudentEmails]);

  const profile = (email && state.profiles[email]) || (student ? profileFor(student) : FALLBACK_PROFILE);

  const patchProfile = useCallback(
    (fn: (p: Profile) => Profile) =>
      setState((s) => {
        if (!s.sessionEmail) return s;
        const current = s.profiles[s.sessionEmail] ?? (student ? profileFor(student) : FALLBACK_PROFILE);
        return { ...s, profiles: { ...s.profiles, [s.sessionEmail]: fn(current) } };
      }),
    [student],
  );

  const pushCronLog = useCallback((log: Omit<CronLog, "id" | "time">) => {
    setCronLogs((logs) =>
      [
        {
          ...log,
          id: `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
          time: new Date().toLocaleTimeString("en-GB"),
        },
        ...logs,
      ].slice(0, 40),
    );
  }, []);

  const signIn = useCallback((rawEmail: string, password: string) => {
    const value = rawEmail.trim().toLowerCase();
    if (state.deletedStudentEmails?.includes(value)) {
      return { ok: false as const, error: "This student account has been removed by administrator." };
    }
    if (value === ADMIN_ACCOUNT.email && password === ADMIN_ACCOUNT.password) {
      setState((s) => ({ ...s, role: "admin", sessionEmail: ADMIN_ACCOUNT.email, authProvider: "demo" }));
      return { ok: true as const, role: "admin" as Role };
    }
    const found = STUDENT_ACCOUNTS.find((a) => a.email === value) || state.customStudents[value];
    const expectedPassword = state.passwordOverrides?.[value] ?? found?.password;
    if (found && expectedPassword === password) {
      setState((s) => ({
        ...s,
        role: "student",
        sessionEmail: found.email,
        authProvider: "demo",
        profiles: { ...s.profiles, [found.email]: s.profiles[found.email] ?? profileFor(found) },
      }));
      return { ok: true as const, role: "student" as Role };
    }
    return { ok: false as const, error: "Invalid email or password" };
  }, [state.customStudents, state.passwordOverrides]);

  const resetStudentPassword = useCallback(
    (rawEmail: string, newPassword: string) => {
      const value = rawEmail.trim().toLowerCase();
      if (!value) return { ok: false, message: "Email is required" };
      if (!newPassword || newPassword.length < 6) {
        return { ok: false, message: "Password must be at least 6 characters" };
      }

      setState((s) => {
        const nextOverrides = { ...(s.passwordOverrides ?? {}), [value]: newPassword };

        // Update in customStudents if present
        let nextCustom = s.customStudents;
        if (s.customStudents[value]) {
          nextCustom = {
            ...s.customStudents,
            [value]: { ...s.customStudents[value], password: newPassword },
          };
        }

        // Update in provisioned records if present
        const nextProvisioned = (s.provisioned ?? []).map((p) =>
          p.email.trim().toLowerCase() === value ? { ...p, password: newPassword } : p
        );

        return {
          ...s,
          passwordOverrides: nextOverrides,
          customStudents: nextCustom,
          provisioned: nextProvisioned,
        };
      });

      pushCronLog({
        stage: "admin",
        message: `Password reset issued for learner: ${value}`,
        status: "ok",
      });

      return { ok: true, message: `Password reset successfully for ${value}` };
    },
    [pushCronLog],
  );

  const signInSupabase = useCallback(async (rawEmail: string, password: string) => {
    const res = await supabaseAuth.signInWithPassword(rawEmail, password);
    if (res.error || !res.data.session) {
      return { ok: false, error: res.error?.message || "Supabase sign in failed" };
    }
    const session = res.data.session;
    const user = session.user;
    const meta = user.user_metadata || {};

    /**
     * CURRENT PHASE: Role is read from Supabase user_metadata.role.
     * Admin accounts are created manually via the Supabase Dashboard with
     * user_metadata: { role: "admin", name: "Platform Super Admin" }
     *
     * FUTURE PRODUCTION HARDENING:
     * Move admin authorization to Supabase app_metadata (set only via admin API,
     * never from the browser) and enforce access via database RLS policies.
     * The frontend role alone is NOT the final security boundary.
     */
    const role: Role = meta.role === "admin" ? "admin" : "student";
    const userEmail = user.email.toLowerCase();

    if (state.deletedStudentEmails?.includes(userEmail)) {
      return { ok: false, error: "This student account has been removed by administrator." };
    }

    setSupabaseSession(session);

    if (role === "admin") {
      // Admin users have no tracks/batch/student data — do not force them into a student profile.
      setState((s) => ({
        ...s,
        role: "admin",
        sessionEmail: userEmail,
        authProvider: "supabase",
      }));
      return { ok: true, role: "admin" as Role };
    }

    // Student Supabase user — create/update local profile from metadata
    const studentName = meta.name?.trim() || userEmail.split("@")[0] || "Student Learner";
    const firstName = meta.first_name?.trim() || studentName.split(" ")[0] || "Student";
    const rollNo = meta.roll_no?.trim() || meta.rollNo?.trim() || "STC-2026-LIVE";
    const dept = meta.dept?.trim() || "CSE";
    const batchId = meta.batch_id?.trim() || meta.batchId?.trim() || "BATCH-2026-ABC-CSE-01";
    const college = meta.college?.trim() || "Partner Institution";
    const metaTracks =
      meta.tracks && meta.tracks.length > 0
        ? meta.tracks
        : (["mern", "cloud", "aiml"] as TrackId[]);

    const custom: StudentAccount = {
      email: userEmail,
      password: "●●●●●●●●",
      name: studentName,
      firstName,
      rollNo,
      dept,
      batchId,
      college,
      tracks: (metaTracks.length >= 3
        ? metaTracks.slice(0, 3)
        : [...metaTracks, "mern", "cloud", "aiml"].slice(0, 3)) as [TrackId, TrackId, TrackId],
      xp: 500,
      streak: 7,
      seedOffsets: [3, 2, 1],
      placementDay: 15,
      readiness: { T: 60, C: 65, A: 58, E: 70, R: 45, M: 30 },
    };

    setState((s) => ({
      ...s,
      role: "student",
      sessionEmail: userEmail,
      authProvider: "supabase",
      customStudents: { ...s.customStudents, [userEmail]: custom },
      profiles: {
        ...s.profiles,
        [userEmail]: s.profiles[userEmail] ?? {
          ...profileFor(custom),
          activeTracks: metaTracks.slice(0, 3),
        },
      },
    }));

    return { ok: true, role: "student" as Role };
  }, []);

  const signUpSupabase = useCallback(
    async (
      rawEmail: string,
      password: string,
      meta?: { name?: string; rollNo?: string; dept?: string; batchId?: string; tracks?: TrackId[]; college?: string; role?: Role }
    ) => {
      // SECURITY: Do NOT forward meta.role to Supabase signUp.
      // Public signup always creates role="student".
      // supabaseAuth.signUp enforces this as well (second layer of defense).
      const res = await supabaseAuth.signUp(rawEmail, password, {
        name: meta?.name || "Student Learner",
        roll_no: meta?.rollNo || "STC-2026",
        dept: meta?.dept || "CSE",
        batch_id: meta?.batchId || "BATCH-2026-ABC-CSE-01",
        tracks: meta?.tracks || ["mern", "cloud", "aiml"],
        college: meta?.college || "Partner Institution",
        // role is intentionally omitted — supabaseAuth.signUp always sets "student"
      });

      if (res.error) {
        return { ok: false, error: res.error.message };
      }

      if (res.data.session) {
        return signInSupabase(rawEmail, password);
      }

      toast.success("Account created successfully! Please sign in with your credentials.");
      return { ok: true, role: "student" as Role };
    },
    [signInSupabase],
  );

  const signOut = useCallback(() => {
    supabaseAuth.signOut();
    setSupabaseSession(null);
    setState((s) => ({ ...s, sessionEmail: null }));
  }, []);

  const setRole = useCallback((role: Role) => patch({ role }), [patch]);
  const toggleTheme = useCallback(
    () => setState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" })),
    [],
  );
  const setActiveTracks = useCallback(
    (activeTracks: TrackId[]) => {
      if (activeTracks.length < 1 || activeTracks.length > 3) return;
      patchProfile((p) => ({ ...p, activeTracks }));
    },
    [patchProfile],
  );

  const completeLab = useCallback(
    (labId: string, label: string) => {
      patchProfile((p) =>
        p.completedLabs.includes(labId)
          ? p
          : {
              ...p,
              completedLabs: [...p.completedLabs, labId],
              xp: p.xp + 50,
              readiness: { ...p.readiness, T: clamp(p.readiness.T + 2, 0, 100) },
            },
      );
      toast.success(`+50 XP · ${label} verified`, { description: "Talent Score recalculated." });
    },
    [patchProfile],
  );

  const completeDailyStep = useCallback(
    (step: keyof DailySteps) => {
      patchProfile((p) => {
        if (p.daily[step]) return p;
        const daily = { ...p.daily, [step]: true };
        const bump: Partial<ReadinessInputs> =
          step === "english"
            ? { E: clamp(p.readiness.E + 3, 0, 100) }
            : step === "aptitude"
              ? { A: clamp(p.readiness.A + 3, 0, 100) }
              : { M: clamp(p.readiness.M + 2, 0, 100) };
        const allDone = daily.english && daily.aptitude && daily.practice;
        return {
          ...p,
          daily,
          xp: p.xp + 25,
          streak: allDone ? p.streak + 1 : p.streak,
          readiness: { ...p.readiness, ...bump },
        };
      });
    },
    [patchProfile],
  );

  const setReadiness = useCallback(
    (r: Partial<ReadinessInputs>) => patchProfile((p) => ({ ...p, readiness: { ...p.readiness, ...r } })),
    [patchProfile],
  );

  const updateBatch = useCallback(
    (id: string, p: Partial<Batch>) =>
      setState((s) => ({ ...s, batches: s.batches.map((b) => (b.id === id ? { ...b, ...p } : b)) })),
    [],
  );

  const syncBatch = useCallback(
    (id: string) => {
      const stamp = new Date().toLocaleString("en-GB");
      setState((s) => ({ ...s, batches: s.batches.map((b) => (b.id === id ? { ...b, lastSync: stamp } : b)) }));
      pushCronLog({ stage: "telegram", message: `Batch ${id} synced to Telegram group`, status: "ok" });
      toast.success("Synced to batch Telegram", { description: stamp });
    },
    [pushCronLog],
  );

  const createBatch = useCallback((b: Omit<Batch, "lastSync">) => {
    setState((s) => ({
      ...s,
      batches: [{ ...b, lastSync: "just now" }, ...s.batches],
    }));
    toast.success(`Batch ${b.name} created`);
  }, []);

  const deleteBatch = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      batches: s.batches.filter((b) => b.id !== id),
    }));
    toast.success("Batch deleted");
  }, []);

  const deleteStudent = useCallback(
    (rawEmail: string) => {
      const value = rawEmail.trim().toLowerCase();
      if (!value) return { ok: false, message: "Email is required" };

      setState((s) => {
        const nextDeleted = Array.from(new Set([...(s.deletedStudentEmails ?? []), value]));

        const studentBatchId =
          s.provisioned?.find((p) => p.email.toLowerCase() === value)?.batch_id ||
          s.customStudents?.[value]?.batchId ||
          STUDENT_ACCOUNTS.find((a) => a.email.toLowerCase() === value)?.batchId;

        const nextCustom = { ...(s.customStudents ?? {}) };
        delete nextCustom[value];

        const nextProfiles = { ...(s.profiles ?? {}) };
        delete nextProfiles[value];

        const nextProvisioned = (s.provisioned ?? []).filter(
          (p) => p.email.trim().toLowerCase() !== value,
        );

        const nextOverrides = { ...(s.passwordOverrides ?? {}) };
        delete nextOverrides[value];

        const nextBatches = (s.batches ?? []).map((b) =>
          b.id === studentBatchId ? { ...b, enrolled: Math.max(0, b.enrolled - 1) } : b,
        );

        const nextSessionEmail = s.sessionEmail?.toLowerCase() === value ? null : s.sessionEmail;

        return {
          ...s,
          sessionEmail: nextSessionEmail,
          deletedStudentEmails: nextDeleted,
          customStudents: nextCustom,
          profiles: nextProfiles,
          provisioned: nextProvisioned,
          passwordOverrides: nextOverrides,
          batches: nextBatches,
        };
      });

      pushCronLog({
        stage: "admin",
        message: `Learner permanently removed from cohort roster: ${value}`,
        status: "ok",
      });

      toast.success(`Learner ${value} removed from cohort roster`);
      return { ok: true, message: `Learner ${value} successfully removed` };
    },
    [pushCronLog],
  );

  const recalculateStudentScore = useCallback(
    (rawEmail: string) => {
      const email = rawEmail.trim().toLowerCase();
      let updatedScore = 500;

      setState((s) => {
        const existingProfile = s.profiles[email];
        const account = studentByEmail(email) || s.customStudents[email];
        const p: Profile = existingProfile ?? (account ? profileFor(account) : FALLBACK_PROFILE);

        const bonusT = Math.min(12, p.completedLabs.length * 2 + p.skills.length);
        const bonusC = Math.min(10, Math.floor(p.attendance.length / 3));
        const nextReadiness = {
          T: clamp(Math.round(p.readiness.T + bonusT * 0.25), 30, 98),
          C: clamp(Math.round(p.readiness.C + bonusC * 0.25), 30, 98),
          A: clamp(Math.round(p.readiness.A + 1), 30, 98),
          E: clamp(Math.round(p.readiness.E + 1), 30, 98),
          R: clamp(Math.round(p.readiness.R + 1), 30, 98),
          M: clamp(Math.round(p.readiness.M + (Object.keys(p.mocks).length > 0 ? 5 : 1)), 20, 98),
        };

        const rIndex =
          nextReadiness.T * 0.25 +
          nextReadiness.C * 0.2 +
          nextReadiness.A * 0.15 +
          nextReadiness.E * 0.15 +
          nextReadiness.R * 0.15 +
          nextReadiness.M * 0.1;

        updatedScore = Math.round(clamp(rIndex * 8.5 + p.completedLabs.length * 6, 0, 1000));

        const updatedProfile: Profile = {
          ...p,
          readiness: nextReadiness,
        };

        return {
          ...s,
          profiles: {
            ...s.profiles,
            [email]: updatedProfile,
          },
        };
      });

      pushCronLog({
        stage: "scoring",
        message: `Talent Score recalculated for ${email} → ${updatedScore}/1000 (T·C·A·E·R·M audit verified)`,
        status: "ok",
      });

      toast.success(`Talent Score recalculated for ${email}: ${updatedScore}/1000`);
      return { ok: true, newScore: updatedScore, message: `Score updated to ${updatedScore}/1000` };
    },
    [pushCronLog],
  );

  const recalculateAllScores = useCallback(() => {
    let count = 0;
    setState((s) => {
      const nextProfiles = { ...s.profiles };
      Object.entries(nextProfiles).forEach(([email, p]) => {
        count++;
        const bonusT = Math.min(6, p.completedLabs.length * 2);
        const nextReadiness = {
          ...p.readiness,
          T: clamp(p.readiness.T + bonusT, 30, 98),
          C: clamp(p.readiness.C + 1, 30, 98),
        };
        nextProfiles[email] = {
          ...p,
          readiness: nextReadiness,
        };
      });
      return { ...s, profiles: nextProfiles };
    });

    pushCronLog({
      stage: "scoring",
      message: `Batch Talent Score recomputation pass completed across ${count} learner portfolios`,
      status: "ok",
    });
    toast.success(`Recalculated scores for ${count} learners across all active cohorts`);
    return { count, message: `Successfully recalculated ${count} portfolios` };
  }, [pushCronLog]);

  const addHiringDrive = useCallback(
    (drive: Omit<HiringDrive, "id">) => {
      setState((s) => ({
        ...s,
        hiringDrives: [
          { ...drive, id: `hd-${Date.now()}` },
          ...(s.hiringDrives ?? DEFAULT_HIRING_DRIVES),
        ],
      }));
      pushCronLog({
        stage: "gateway",
        message: `Enterprise hiring requisition created for ${drive.company} (${drive.roles})`,
        status: "ok",
      });
      toast.success(`Hiring drive for ${drive.company} added`);
    },
    [pushCronLog],
  );

  const updateHiringDrive = useCallback((id: string, patch: Partial<HiringDrive>) => {
    setState((s) => ({
      ...s,
      hiringDrives: (s.hiringDrives ?? DEFAULT_HIRING_DRIVES).map((d) =>
        d.id === id ? { ...d, ...patch } : d,
      ),
    }));
    toast.success("Hiring drive updated");
  }, []);

  const deleteHiringDrive = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      hiringDrives: (s.hiringDrives ?? DEFAULT_HIRING_DRIVES).filter((d) => d.id !== id),
    }));
    toast.success("Hiring drive removed");
  }, []);

  const addProvisioned = useCallback(
    (rows: ProvisionedStudent[]) => {
      setState((s) => ({ ...s, provisioned: [...rows, ...s.provisioned].slice(0, 500) }));
      pushCronLog({ stage: "provisioning", message: `${rows.length} student logins provisioned · no assessment required`, status: "ok" });
    },
    [pushCronLog],
  );

  const addContent = useCallback(
    (item: Omit<ContentItem, "id" | "updated">) => {
      setState((s) => ({
        ...s,
        content: [
          { ...item, id: `${Date.now()}`, updated: new Date().toLocaleString("en-GB") },
          ...s.content,
        ],
      }));
      pushCronLog({ stage: "content", message: `Content item created · ${item.title}`, status: "ok" });
      toast.success("Content item created");
    },
    [pushCronLog],
  );

  const updateContent = useCallback((id: string, p: Partial<ContentItem>) => {
    setState((s) => ({
      ...s,
      content: s.content.map((c) =>
        c.id === id ? { ...c, ...p, updated: new Date().toLocaleString("en-GB") } : c,
      ),
    }));
  }, []);

  const removeContent = useCallback((id: string) => {
    setState((s) => ({ ...s, content: s.content.filter((c) => c.id !== id) }));
    toast.success("Content item removed");
  }, []);

  const completeSkill = useCallback(
    (trackId: TrackId, skillId: string, name: string) => {
      patchProfile((p) => {
        if (p.skills.includes(skillId)) return p;
        const skills = [...p.skills, skillId];
        return {
          ...p,
          skills,
          xp: p.xp + 30,
          readiness: { ...p.readiness, T: clamp(p.readiness.T + 2, 0, 100) },
        };
      });
      toast.success(`Skill validated · ${name}`, { description: "Technical competency updated." });
    },
    [patchProfile],
  );

  const completePlacementDay = useCallback(
    (day: number) => {
      patchProfile((p) => {
        if (p.attendance.includes(day)) return p;
        return {
          ...p,
          attendance: [...p.attendance, day],
          placementDay: Math.max(p.placementDay, Math.min(day + 1, 90)),
          xp: p.xp + 20,
          readiness: {
            ...p.readiness,
            E: clamp(p.readiness.E + 1, 0, 100),
            A: clamp(p.readiness.A + 1, 0, 100),
            C: clamp(p.readiness.C + 1, 0, 100),
          },
        };
      });
      toast.success(`Day ${day} placement attendance recorded`, { description: "Batch placement progress updated." });
    },
    [patchProfile],
  );

  const completeTechDay = useCallback(
    (day: number) => {
      patchProfile((p) => {
        const list = p.completedTechDays || [];
        if (list.includes(day)) return p;
        return {
          ...p,
          completedTechDays: [...list, day],
          xp: p.xp + 50,
          readiness: {
            ...p.readiness,
            T: clamp(p.readiness.T + 2, 0, 100),
          },
        };
      });
      toast.success(`Day ${day} technical lab verified (+50 XP)`, { description: "Technical competency updated." });
    },
    [patchProfile],
  );

  const submitAssessment = useCallback(
    (day: number, score: number) => {
      patchProfile((p) => ({
        ...p,
        assessments: { ...p.assessments, [String(day)]: score },
        xp: p.xp + 40,
        readiness: { ...p.readiness, A: clamp(Math.max(p.readiness.A, score), 0, 100) },
      }));
      toast.success(`Assessment submitted · ${score}%`);
    },
    [patchProfile],
  );

  const completeMock = useCallback(
    (id: string, score: number) => {
      patchProfile((p) => ({
        ...p,
        mocks: { ...p.mocks, [id]: score },
        xp: p.xp + 60,
        readiness: { ...p.readiness, M: clamp(Math.max(p.readiness.M, score), 0, 100) },
      }));
      toast.success(`Mock interview scored ${score}%`);
    },
    [patchProfile],
  );

  const issueCertificate = useCallback(
    (label: string) => {
      patchProfile((p) =>
        p.certifications.includes(label) ? p : { ...p, certifications: [...p.certifications, label], xp: p.xp + 80 },
      );
      toast.success(`Certificate issued · ${label}`);
    },
    [patchProfile],
  );

  const setCompletionRule = useCallback(
    (completionRule: CompletionRule, secondaryMinimum?: number) =>
      setState((s) => ({ ...s, completionRule, secondaryMinimum: secondaryMinimum ?? s.secondaryMinimum })),
    [],
  );

  const resetProgress = useCallback(() => {
    setState((s) => {
      if (!s.sessionEmail) return s;
      const account = studentByEmail(s.sessionEmail) || s.customStudents[s.sessionEmail];
      if (!account) return s;
      return { ...s, profiles: { ...s.profiles, [s.sessionEmail]: profileFor(account) } };
    });
    toast.success("Demo progress reset");
  }, []);

  const value = useMemo<Store>(() => {
    const { T, C, A, E, R, M } = profile.readiness;
    const readinessIndex = T * 0.25 + C * 0.2 + A * 0.15 + E * 0.15 + R * 0.15 + M * 0.1;
    const talentScore = Math.round(clamp(readinessIndex * 8.5 + profile.completedLabs.length * 6, 0, 1000));
    const trackPercent = (id: TrackId) => trackPct(id, profile.skills);
    const percents = profile.activeTracks.map(trackPercent);
    const technicalComplete =
      percents.length > 0 &&
      (state.completionRule === "all-tracks"
        ? percents.every((p) => p >= 100)
        : (percents[0] ?? 0) >= 100 && percents.slice(1).every((p) => p >= state.secondaryMinimum));
    const placementComplete = profile.attendance.length >= 90 && (profile.assessments["90"] ?? 0) >= 60;
    return {
      ...state,
      ...profile,
      ready,
      student,
      supabaseSession,
      isAuthed: Boolean(state.sessionEmail),
      cronLogs,
      readinessIndex,
      talentScore,
      eligibleCompanies: Math.max(2, Math.round((readinessIndex / 100) * 26)),
      phase1Complete: technicalComplete && placementComplete,
      technicalComplete,
      placementComplete,
      gateUnlocked: technicalComplete && placementComplete,
      trackPercent,
      completeSkill,
      completePlacementDay,
      completeTechDay,
      submitAssessment,
      completeMock,
      issueCertificate,
      setCompletionRule,
      signIn,
      signInSupabase,
      signUpSupabase,
      signOut,
      resetStudentPassword,
      setRole,
      toggleTheme,
      setActiveTracks,
      completeLab,
      completeDailyStep,
      setReadiness,
      updateBatch,
      createBatch,
      deleteBatch,
      deleteStudent,
      syncBatch,
      hiringDrives: state.hiringDrives ?? DEFAULT_HIRING_DRIVES,
      addHiringDrive,
      updateHiringDrive,
      deleteHiringDrive,
      recalculateStudentScore,
      recalculateAllScores,
      addProvisioned,
      addContent,
      updateContent,
      removeContent,
      pushCronLog,
      resetProgress,
    };
  }, [state, profile, student, supabaseSession, ready, cronLogs, completeSkill, completePlacementDay, completeTechDay, submitAssessment, completeMock, issueCertificate, setCompletionRule, signIn, signInSupabase, signUpSupabase, signOut, resetStudentPassword, setRole, toggleTheme, setActiveTracks, completeLab, completeDailyStep, setReadiness, updateBatch, createBatch, deleteBatch, deleteStudent, syncBatch, addHiringDrive, updateHiringDrive, deleteHiringDrive, recalculateStudentScore, recalculateAllScores, addProvisioned, addContent, updateContent, removeContent, pushCronLog, resetProgress]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore must be used inside AppStoreProvider");
  return ctx;
}
