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
  college?: string;
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

const DEFAULT_HIRING_DRIVES: HiringDrive[] = [];


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

const FALLBACK_TRACK_POOL: TrackId[] = ["mern", "cloud", "aiml", "java", "cyber", "datascience"];

export const sanitizeTracks = (tracks?: (TrackId | string)[]): [TrackId, TrackId, TrackId] => {
  const seen = new Set<TrackId>();
  const validTracks: TrackId[] = [];

  if (tracks && Array.isArray(tracks)) {
    for (const t of tracks) {
      if (t && typeof t === "string") {
        const trimmed = t.trim() as TrackId;
        if (trimmed && !seen.has(trimmed)) {
          seen.add(trimmed);
          validTracks.push(trimmed);
        }
      }
    }
  }

  for (const fallback of FALLBACK_TRACK_POOL) {
    if (validTracks.length >= 3) break;
    if (!seen.has(fallback)) {
      seen.add(fallback);
      validTracks.push(fallback);
    }
  }

  return [validTracks[0] ?? "mern", validTracks[1] ?? "cloud", validTracks[2] ?? "aiml"];
};

export const createStudentFromProvisioned = (p: ProvisionedStudent): StudentAccount => {
  const email = p.email.trim().toLowerCase();
  const rawTracks = [p.course_1, p.course_2, p.course_3].filter(Boolean) as TrackId[];
  const tracks = sanitizeTracks(rawTracks);

  return {
    email,
    password: p.password || "Temp@1234",
    name: p.student_name || email.split("@")[0] || "Learner",
    firstName: (p.student_name || email).split(" ")[0] || "Learner",
    rollNo: p.roll_no || "2026-ROLL",
    dept: p.dept || "CSE",
    batchId: p.batch_id || "BATCH-2026-ABC-CSE-01",
    college: p.college?.trim() || "Partner Engineering College",
    tracks,
    xp: 250,
    streak: 1,
    seedOffsets: [2, 1, 1],
    placementDay: 1,
    readiness: { T: 60, C: 55, A: 55, E: 60, R: 40, M: 25 },
  };
};

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
    { id: "BATCH-2026-ABC-CSE-01", name: "BATCH-2026-ABC-CSE-01", capacity: 240, enrolled: 0, dept: "CSE", lastSync: null },
    { id: "BATCH-2026-ABC-IT-02", name: "BATCH-2026-ABC-IT-02", capacity: 180, enrolled: 0, dept: "IT", lastSync: null },
    { id: "BATCH-2026-XYZ-ECE-01", name: "BATCH-2026-XYZ-ECE-01", capacity: 300, enrolled: 0, dept: "ECE", lastSync: null },
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
    addStudent: (student: {
      name: string;
      email: string;
      password?: string;
      rollNo: string;
      dept: string;
      batchId: string;
      college?: string;
      tracks?: TrackId[];
    }) => { ok: boolean; message: string };
    syncBatch: (id: string) => void;
    hiringDrives: HiringDrive[];
    addHiringDrive: (drive: Omit<HiringDrive, "id">) => void;
    updateHiringDrive: (id: string, patch: Partial<HiringDrive>) => void;
    deleteHiringDrive: (id: string) => void;
    recalculateStudentScore: (email: string) => { ok: boolean; newScore: number; message: string };
    recalculateAllScores: () => { count: number; message: string };
    addProvisioned: (rows: ProvisionedStudent[]) => void;
    clearAllProvisioned: () => { ok: boolean; count: number };
    addContent: (item: Omit<ContentItem, "id" | "updated">) => void;
    updateContent: (id: string, patch: Partial<ContentItem>) => void;
    removeContent: (id: string) => void;
    pushCronLog: (log: Omit<CronLog, "id" | "time">) => void;
    resetProgress: () => void;
  };

const StoreContext = createContext<Store | null>(null);

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const INITIAL_LOGS: CronLog[] = [
  { id: "l1", time: "06:00:02", stage: "broadcast", message: "Placement broadcast pipeline initialized", status: "ok" },
  { id: "l2", time: "06:00:44", stage: "broadcast", message: "Telegram webhook gateway connected · @SantoGeTalentBot", status: "ok" },
  { id: "l3", time: "06:05:10", stage: "unlock", message: "In-app guided practice pipeline active (MCQ · logic · pitch)", status: "ok" },
  { id: "l4", time: "06:12:33", stage: "sandbox", message: "Sandbox containers warmed for 15 technical tracks", status: "ok" },
  { id: "l5", time: "06:30:00", stage: "scoring", message: "Talent Score formula engine standby (T·C·A·E·R·M)", status: "ok" },
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

        const loadedCustom = { ...(parsed.customStudents ?? {}) };
        for (const [key, val] of Object.entries(loadedCustom)) {
          if (val && val.tracks) {
            loadedCustom[key] = {
              ...val,
              tracks: sanitizeTracks(val.tracks),
            };
          }
        }
        const loadedProfiles = { ...DEFAULT_PROFILES, ...(parsed.profiles ?? {}) };
        for (const [key, prof] of Object.entries(loadedProfiles)) {
          if (prof && prof.activeTracks) {
            loadedProfiles[key] = {
              ...prof,
              activeTracks: Array.from(new Set(prof.activeTracks)) as TrackId[],
            };
          }
        }

        // Filter out any legacy mock hiring drives
        const cleanedDrives = (parsed.hiringDrives ?? []).filter(
          (d) => !["hd-1", "hd-2", "hd-3", "hd-4", "hd-5"].includes(d.id),
        );

        // Sanitize batches to ensure enrolled reflects actual learners
        const rawBatches = parsed.batches && parsed.batches.length > 0 ? parsed.batches : DEFAULT_STATE.batches;
        const cleanedBatches = rawBatches.map((b) => ({
          ...b,
          enrolled: typeof b.enrolled === "number" ? Math.max(0, b.enrolled) : 0,
        }));

        setState({
          ...DEFAULT_STATE,
          ...parsed,
          profiles: loadedProfiles,
          customStudents: loadedCustom,
          passwordOverrides: { ...(parsed.passwordOverrides ?? {}) },
          batches: cleanedBatches,
          provisioned: parsed.provisioned ?? [],
          deletedStudentEmails: parsed.deletedStudentEmails ?? [],
          hiringDrives: cleanedDrives,
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

        const customTracks = sanitizeTracks(metaTracks);
        const custom: StudentAccount = {
          email: userEmail,
          password: "●●●●●●●●",
          name: studentName,
          firstName,
          rollNo,
          dept,
          batchId,
          college,
          tracks: customTracks,
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
                    activeTracks: Array.from(new Set(customTracks)),
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

  // Sync state across browser tabs when admin adds learners or updates state
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as Partial<Persisted>;
          setState((prev) => ({
            ...prev,
            ...parsed,
            customStudents: parsed.customStudents ? { ...parsed.customStudents } : prev.customStudents,
            provisioned: parsed.provisioned ?? prev.provisioned,
            passwordOverrides: parsed.passwordOverrides ? { ...parsed.passwordOverrides } : prev.passwordOverrides,
            deletedStudentEmails: parsed.deletedStudentEmails ?? prev.deletedStudentEmails ?? [],
            batches: parsed.batches ?? prev.batches,
            profiles: parsed.profiles ? { ...prev.profiles, ...parsed.profiles } : prev.profiles,
          }));
        } catch {
          /* ignore JSON parse errors */
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const patch = useCallback((p: Partial<Persisted>) => setState((s) => ({ ...s, ...p })), []);

  const email = state.sessionEmail;
  const student = useMemo<StudentAccount | null>(() => {
    if (!email) return null;
    const value = email.trim().toLowerCase();
    if (state.deletedStudentEmails?.some((d) => d.toLowerCase().trim() === value)) return null;

    // Check customStudents
    const custom =
      state.customStudents[value] ||
      Object.values(state.customStudents || {}).find(
        (c) => c.email.trim().toLowerCase() === value,
      );
    if (custom) return custom;

    // Check demo accounts
    const demo = STUDENT_ACCOUNTS.find((a) => a.email.trim().toLowerCase() === value);
    if (demo) return demo;

    // Check provisioned records
    const prov = (state.provisioned ?? []).find(
      (p) => p.email.trim().toLowerCase() === value,
    );
    if (prov) return createStudentFromProvisioned(prov);

    return null;
  }, [email, state.customStudents, state.provisioned, state.deletedStudentEmails]);

  const profile =
    (email && (state.profiles[email] || state.profiles[email.toLowerCase().trim()])) ||
    (student ? profileFor(student) : FALLBACK_PROFILE);

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

  const signIn = useCallback(
    (rawEmail: string, password: string) => {
      const value = rawEmail.trim().toLowerCase();
      if (state.deletedStudentEmails?.some((d) => d.toLowerCase().trim() === value)) {
        return { ok: false as const, error: "This student account has been removed by administrator." };
      }
      if (value === ADMIN_ACCOUNT.email.toLowerCase() && password === ADMIN_ACCOUNT.password) {
        setState((s) => ({ ...s, role: "admin", sessionEmail: ADMIN_ACCOUNT.email, authProvider: "demo" }));
        return { ok: true as const, role: "admin" as Role };
      }

      // 1. Check customStudents
      let found: StudentAccount | undefined =
        state.customStudents[value] ||
        Object.values(state.customStudents || {}).find(
          (c) => c.email.trim().toLowerCase() === value,
        );

      // 2. Check static demo accounts
      if (!found) {
        found = STUDENT_ACCOUNTS.find((a) => a.email.trim().toLowerCase() === value);
      }

      // 3. Check provisioned students
      if (!found) {
        const prov = (state.provisioned ?? []).find(
          (p) => p.email.trim().toLowerCase() === value,
        );
        if (prov) {
          found = createStudentFromProvisioned(prov);
        }
      }

      if (!found) {
        return { ok: false as const, error: "No student account found with this email address." };
      }

      const expectedPassword = state.passwordOverrides?.[value] ?? found.password;
      if (expectedPassword === password) {
        const studentAccount = found;
        const normalizedEmail = studentAccount.email.toLowerCase().trim();

        setState((s) => ({
          ...s,
          role: "student",
          sessionEmail: normalizedEmail,
          authProvider: "demo",
          customStudents: {
            ...s.customStudents,
            [normalizedEmail]: studentAccount,
          },
          profiles: {
            ...s.profiles,
            [normalizedEmail]: s.profiles[normalizedEmail] ?? profileFor(studentAccount),
          },
        }));

        return { ok: true as const, role: "student" as Role };
      }

      return {
        ok: false as const,
        error: `Invalid password for this learner account. (Default password: Temp@1234)`,
      };
    },
    [state.customStudents, state.provisioned, state.passwordOverrides, state.deletedStudentEmails],
  );

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

  const signInSupabase = useCallback(
    async (rawEmail: string, password: string) => {
      const value = rawEmail.trim().toLowerCase();

      if (state.deletedStudentEmails?.some((d) => d.toLowerCase().trim() === value)) {
        return { ok: false, error: "This student account has been removed by administrator." };
      }

      // Check if this account is registered as an admin-added / provisioned learner or demo account
      const isLocalStudent =
        Boolean(state.customStudents[value]) ||
        Object.values(state.customStudents || {}).some((c) => c.email.trim().toLowerCase() === value) ||
        (state.provisioned ?? []).some((p) => p.email.trim().toLowerCase() === value) ||
        STUDENT_ACCOUNTS.some((a) => a.email.trim().toLowerCase() === value);

      if (isLocalStudent) {
        // Authenticate directly with local student credentials to avoid 400 Bad Request
        const localRes = signIn(rawEmail, password);
        if (localRes.ok) {
          return localRes;
        }
        return {
          ok: false,
          error: localRes.error || `Invalid password for learner ${rawEmail}. Default password: Temp@1234`,
        };
      }

      // Real remote Supabase Auth user
      const res = await supabaseAuth.signInWithPassword(rawEmail, password);
      if (res.error || !res.data.session) {
        // Secondary fallback in case student was added just now in another window
        const localFallback = signIn(rawEmail, password);
        if (localFallback.ok) {
          return localFallback;
        }
        return { ok: false, error: res.error?.message || "Supabase sign in failed" };
      }
      const session = res.data.session;
      const user = session.user;
      const meta = user.user_metadata || {};

      const role: Role = meta.role === "admin" ? "admin" : "student";
      const userEmail = user.email.toLowerCase();

      if (state.deletedStudentEmails?.includes(userEmail)) {
        return { ok: false, error: "This student account has been removed by administrator." };
      }

      setSupabaseSession(session);

      if (role === "admin") {
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

      const customTracks = sanitizeTracks(metaTracks);
      const custom: StudentAccount = {
        email: userEmail,
        password: "●●●●●●●●",
        name: studentName,
        firstName,
        rollNo,
        dept,
        batchId,
        college,
        tracks: customTracks,
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
            activeTracks: Array.from(new Set(customTracks)),
          },
        },
      }));

      return { ok: true, role: "student" as Role };
    },
    [state.customStudents, state.provisioned, state.deletedStudentEmails, signIn],
  );

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
      const uniqueTracks = Array.from(new Set(activeTracks)) as TrackId[];
      patchProfile((p) => ({ ...p, activeTracks: uniqueTracks }));
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

  const addStudent = useCallback(
    (input: {
      name: string;
      email: string;
      password?: string;
      rollNo: string;
      dept: string;
      batchId: string;
      college?: string;
      tracks?: TrackId[];
    }) => {
      const email = input.email.trim().toLowerCase();
      if (!email || !email.includes("@")) {
        return { ok: false, message: "A valid email address is required" };
      }
      if (!input.name.trim()) {
        return { ok: false, message: "Student name is required" };
      }

      const password = input.password?.trim() || "Temp@1234";
      const rawTracks = (input.tracks && input.tracks.length > 0
        ? input.tracks
        : ["mern", "cloud", "aiml"]) as TrackId[];
      const tracks = sanitizeTracks(rawTracks);

      const newAccount: StudentAccount = {
        email,
        password,
        name: input.name.trim(),
        firstName: input.name.trim().split(" ")[0] || "Student",
        rollNo: input.rollNo.trim() || "2026-ROLL",
        dept: input.dept.trim() || "CSE",
        batchId: input.batchId.trim() || "BATCH-2026-ABC-CSE-01",
        college: input.college?.trim() || "Partner Institution",
        tracks,
        xp: 250,
        streak: 1,
        seedOffsets: [2, 1, 1],
        placementDay: 1,
        readiness: { T: 60, C: 55, A: 55, E: 60, R: 40, M: 25 },
      };

      const provRecord: ProvisionedStudent = {
        student_name: newAccount.name,
        email: newAccount.email,
        password: newAccount.password,
        roll_no: newAccount.rollNo,
        dept: newAccount.dept,
        batch_id: newAccount.batchId,
        course_1: tracks[0],
        course_2: tracks[1],
        course_3: tracks[2],
      };

      setState((s) => {
        const nextDeleted = (s.deletedStudentEmails ?? []).filter(
          (e) => e.toLowerCase().trim() !== email,
        );

        const nextBatches = (s.batches ?? []).map((b) =>
          b.id === newAccount.batchId ? { ...b, enrolled: b.enrolled + 1 } : b,
        );

        const nextProvisioned = [
          provRecord,
          ...(s.provisioned ?? []).filter((p) => p.email.trim().toLowerCase() !== email),
        ];

        return {
          ...s,
          deletedStudentEmails: nextDeleted,
          customStudents: {
            ...s.customStudents,
            [email]: newAccount,
          },
          profiles: {
            ...s.profiles,
            [email]: s.profiles[email] ?? profileFor(newAccount),
          },
          batches: nextBatches,
          provisioned: nextProvisioned,
          passwordOverrides: {
            ...(s.passwordOverrides ?? {}),
            [email]: password,
          },
        };
      });

      pushCronLog({
        stage: "provisioning",
        message: `Student learner provisioned: ${newAccount.name} (${email}) → Batch ${newAccount.batchId}`,
        status: "ok",
      });

      // Background attempt to register in Supabase Auth as well
      void supabaseAuth
        .signUp(email, password, {
          name: newAccount.name,
          roll_no: newAccount.rollNo,
          dept: newAccount.dept,
          batch_id: newAccount.batchId,
          college: newAccount.college,
          tracks: newAccount.tracks,
          role: "student",
        })
        .catch(() => {
          /* ignore network/domain errors */
        });

      toast.success(
        `Student ${newAccount.name} added! Login credentials: ${email} / ${password}`,
      );
      return { ok: true, message: `Student account created for ${email}` };
    },
    [pushCronLog],
  );

  const addProvisioned = useCallback(
    (rows: ProvisionedStudent[]) => {
      setState((s) => {
        const nextCustom = { ...s.customStudents };
        const nextProfiles = { ...s.profiles };
        const nextOverrides = { ...(s.passwordOverrides ?? {}) };
        const batchDeltas: Record<string, number> = {};
        const newEmails = new Set(rows.map((r) => r.email.trim().toLowerCase()));

        // Ensure newly provisioned students are removed from deleted list if re-added
        const nextDeleted = (s.deletedStudentEmails ?? []).filter(
          (e) => !newEmails.has(e.toLowerCase().trim()),
        );

        rows.forEach((r) => {
          const email = r.email.trim().toLowerCase();
          if (!email) return;
          const account = createStudentFromProvisioned(r);
          nextCustom[email] = account;
          nextProfiles[email] = nextProfiles[email] ?? profileFor(account);
          if (r.password) {
            nextOverrides[email] = r.password;
          }
          const bid = r.batch_id || "BATCH-2026-ABC-CSE-01";
          batchDeltas[bid] = (batchDeltas[bid] || 0) + 1;
        });

        // Update existing batches or auto-create new batch if it doesn't exist
        const existingBatchIds = new Set((s.batches ?? []).map((b) => b.id));
        const nextBatches = (s.batches ?? []).map((b) => {
          const added = batchDeltas[b.id];
          return added ? { ...b, enrolled: b.enrolled + added } : b;
        });

        // If CSV referenced a batch that doesn't exist yet, auto-create it
        Object.entries(batchDeltas).forEach(([bid, count]) => {
          if (!existingBatchIds.has(bid)) {
            const firstRowWithBatch = rows.find((r) => r.batch_id === bid);
            nextBatches.push({
              id: bid,
              name: bid,
              capacity: 300,
              enrolled: count,
              dept: firstRowWithBatch?.dept || "Engineering",
              lastSync: null,
            });
          }
        });

        const filteredOld = (s.provisioned ?? []).filter(
          (p) => !newEmails.has(p.email.trim().toLowerCase()),
        );

        return {
          ...s,
          deletedStudentEmails: nextDeleted,
          customStudents: nextCustom,
          profiles: nextProfiles,
          passwordOverrides: nextOverrides,
          batches: nextBatches,
          provisioned: [...rows, ...filteredOld].slice(0, 1000),
        };
      });

      pushCronLog({
        stage: "provisioning",
        message: `${rows.length} student logins provisioned and activated · Ready for student dashboard login`,
        status: "ok",
      });
    },
    [pushCronLog],
  );

  const clearAllProvisioned = useCallback(() => {
    let removedCount = 0;
    setState((s) => {
      removedCount = (s.provisioned ?? []).length;
      const provisionedEmails = new Set((s.provisioned ?? []).map((p) => p.email.trim().toLowerCase()));

      const nextCustom = { ...s.customStudents };
      provisionedEmails.forEach((em) => {
        delete nextCustom[em];
      });

      const nextProfiles = { ...s.profiles };
      provisionedEmails.forEach((em) => {
        delete nextProfiles[em];
      });

      return {
        ...s,
        provisioned: [],
        customStudents: nextCustom,
        profiles: nextProfiles,
      };
    });

    pushCronLog({
      stage: "provisioning",
      message: `Cleared all ${removedCount} provisioned student records`,
      status: "ok",
    });

    toast.success(`Cleared ${removedCount} provisioned records`);
    return { ok: true, count: removedCount };
  }, [pushCronLog]);

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
      addStudent,
      syncBatch,
      hiringDrives: state.hiringDrives ?? DEFAULT_HIRING_DRIVES,
      addHiringDrive,
      updateHiringDrive,
      deleteHiringDrive,
      recalculateStudentScore,
      recalculateAllScores,
      addProvisioned,
      clearAllProvisioned,
      addContent,
      updateContent,
      removeContent,
      pushCronLog,
      resetProgress,
    };
  }, [state, profile, student, supabaseSession, ready, cronLogs, completeSkill, completePlacementDay, completeTechDay, submitAssessment, completeMock, issueCertificate, setCompletionRule, signIn, signInSupabase, signUpSupabase, signOut, resetStudentPassword, setRole, toggleTheme, setActiveTracks, completeLab, completeDailyStep, setReadiness, updateBatch, createBatch, deleteBatch, deleteStudent, addStudent, syncBatch, addHiringDrive, updateHiringDrive, deleteHiringDrive, recalculateStudentScore, recalculateAllScores, addProvisioned, clearAllProvisioned, addContent, updateContent, removeContent, pushCronLog, resetProgress]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore must be used inside AppStoreProvider");
  return ctx;
}
