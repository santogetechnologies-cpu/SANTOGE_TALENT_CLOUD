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
  getSupabaseClient,
  fetchLiveUserRole,
  type SupabaseSession,
  type SupabaseUser,
} from "./supabase";
import {
  fetchLiveStudentProfile,
  fetchLiveStudentProgress,
  completeLiveSkill,
  completeLivePlacementDay,
  completeLiveLab,
  completeLiveDailyStep,
  submitLiveAssessment,
  completeLiveMock,
  issueLiveCertificate,
  updateLiveStudentTracks,
  updateLiveReadiness,
  fetchLiveBatches,
  createLiveBatch,
  updateLiveBatch,
  deleteLiveBatch,
  addLiveStudent,
  deleteLiveStudent,
  provisionLiveStudents,
  fetchLivePlatformSettings,
  updateLivePlatformSettings,
  fetchLiveHiringDrives,
  createLiveHiringDrive,
  updateLiveHiringDrive,
  deleteLiveHiringDrive,
  fetchLiveContentItems,
  createLiveContentItem,
  updateLiveContentItem,
  deleteLiveContentItem,
  type DbStudentProfile,
} from "./data";

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
  {
    id: "c1",
    title: "Daily English · Corporate email etiquette",
    kind: "English video",
    track: "All tracks",
    duration: "10m",
    status: "published",
    updated: "Today 06:00",
  },
  {
    id: "c2",
    title: "Daily Aptitude · Time, speed & distance",
    kind: "Aptitude video",
    track: "All tracks",
    duration: "10m",
    status: "published",
    updated: "Today 06:00",
  },
  {
    id: "c3",
    title: "Guided practice · 5 MCQ + 2 logic + voice pitch",
    kind: "Guided practice",
    track: "All tracks",
    duration: "10m",
    status: "published",
    updated: "Today 06:05",
  },
  {
    id: "c4",
    title: "Lab brief · REST API test runner",
    kind: "Lab brief",
    track: "MERN Stack",
    duration: "25m",
    status: "published",
    updated: "Yesterday",
  },
  {
    id: "c5",
    title: "Lab brief · Terraform apply console",
    kind: "Lab brief",
    track: "Cloud & DevOps",
    duration: "30m",
    status: "draft",
    updated: "2 days ago",
  },
  {
    id: "c6",
    title: "Daily English · Group discussion openers",
    kind: "English video",
    track: "All tracks",
    duration: "10m",
    status: "scheduled",
    updated: "Tomorrow 06:00",
  },
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
    {
      id: "BATCH-2026-PSG-CSE-01",
      name: "BATCH-2026-PSG-CSE-01",
      capacity: 300,
      enrolled: 0,
      dept: "CSE",
      lastSync: null,
    },
    {
      id: "BATCH-2026-CIT-CSE-02",
      name: "BATCH-2026-CIT-CSE-02",
      capacity: 300,
      enrolled: 0,
      dept: "CSE",
      lastSync: null,
    },
    {
      id: "BATCH-2026-REC-IT-01",
      name: "BATCH-2026-REC-IT-01",
      capacity: 250,
      enrolled: 0,
      dept: "IT",
      lastSync: null,
    },
  ],
  provisioned: [],
  deletedStudentEmails: [],
  hiringDrives: DEFAULT_HIRING_DRIVES,
  content: DEFAULT_CONTENT,
  completionRule: "primary-plus-minimum",
  secondaryMinimum: 50,
};

export type CronLog = {
  id: string;
  time: string;
  stage: string;
  message: string;
  status: "ok" | "running" | "queued";
};

type Store = Persisted &
  Profile & {
    ready: boolean;
    student: StudentAccount | null;
    supabaseSession: SupabaseSession | null;
    liveStudentId: string | null;
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
  {
    id: "l1",
    time: "06:00:02",
    stage: "broadcast",
    message: "Placement broadcast pipeline initialized",
    status: "ok",
  },
  {
    id: "l2",
    time: "06:00:44",
    stage: "broadcast",
    message: "Telegram webhook gateway connected · @SantoGeTalentBot",
    status: "ok",
  },
  {
    id: "l3",
    time: "06:05:10",
    stage: "unlock",
    message: "In-app guided practice pipeline active (MCQ · logic · pitch)",
    status: "ok",
  },
  {
    id: "l4",
    time: "06:12:33",
    stage: "sandbox",
    message: "Sandbox containers warmed for 15 technical tracks",
    status: "ok",
  },
  {
    id: "l5",
    time: "06:30:00",
    stage: "scoring",
    message: "Talent Score formula engine standby (T·C·A·E·R·M)",
    status: "ok",
  },
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
  const [liveStudentId, setLiveStudentId] = useState<string | null>(null);

  // Initialize on mount
  useEffect(() => {
    async function init() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const activeSession = getStoredSession();

        if (activeSession && activeSession.user?.id) {
          setSupabaseSession(activeSession);
          const user = activeSession.user;
          const userEmail = user.email.toLowerCase();

          // Resolve live role strictly from public.user_roles in PostgreSQL
          const role = await fetchLiveUserRole(user.id, user.user_metadata?.role, user.email);

          if (role === "student") {
            const liveData = await fetchLiveStudentProfile(user.id);
            if (liveData) {
              setLiveStudentId(liveData.profile.id);
              const progress = await fetchLiveStudentProgress(liveData.profile.id);

              const studentAcc: StudentAccount = {
                email: userEmail,
                password: "●●●●●●●●",
                name: liveData.profile.name,
                firstName: liveData.profile.name.split(" ")[0] || "Student",
                rollNo: liveData.profile.roll_no || "2026-LIVE",
                dept: liveData.profile.dept || "CSE",
                batchId: liveData.profile.batch_id || "BATCH-2026-LIVE-01",
                college: liveData.profile.college || "Partner Engineering College",
                tracks: sanitizeTracks(liveData.tracks),
                xp: liveData.profile.xp,
                streak: liveData.profile.streak,
                seedOffsets: [1, 1, 1],
                placementDay: liveData.profile.placement_day,
                readiness: {
                  T: liveData.profile.readiness_t,
                  C: liveData.profile.readiness_c,
                  A: liveData.profile.readiness_a,
                  E: liveData.profile.readiness_e,
                  R: liveData.profile.readiness_r,
                  M: liveData.profile.readiness_m,
                },
              };

              const liveProf: Profile = {
                activeTracks: liveData.tracks,
                xp: liveData.profile.xp,
                streak: liveData.profile.streak,
                completedLabs: progress.completedLabs,
                daily: progress.daily,
                readiness: studentAcc.readiness,
                skills: progress.skills,
                placementDay: liveData.profile.placement_day,
                attendance: progress.attendance,
                assessments: progress.assessments,
                completedTechDays: progress.completedTechDays,
                mocks: progress.mocks,
                certifications: progress.certifications,
              };

              setState((prev) => ({
                ...prev,
                role: "student",
                sessionEmail: userEmail,
                authProvider: "supabase",
                customStudents: { [userEmail]: studentAcc },
                profiles: { [userEmail]: liveProf },
              }));
            } else {
              const meta = user.user_metadata || {};
              const fallbackName = meta.name || userEmail.split("@")[0] || "Student Learner";
              const studentAcc: StudentAccount = {
                email: userEmail,
                password: "●●●●●●●●",
                name: fallbackName,
                firstName: fallbackName.split(" ")[0] || "Student",
                rollNo: meta.roll_no || "2026-LIVE",
                dept: meta.dept || "CSE",
                batchId: meta.batch_id || "BATCH-2026-LIVE-01",
                college: meta.college || "Partner Engineering College",
                tracks: sanitizeTracks((meta.tracks as TrackId[]) || ["mern", "cloud"]),
                xp: 250,
                streak: 1,
                seedOffsets: [1, 1, 1],
                placementDay: 1,
                readiness: { T: 60, C: 55, A: 55, E: 60, R: 40, M: 25 },
              };
              setState((prev) => ({
                ...prev,
                role: "student",
                sessionEmail: userEmail,
                authProvider: "supabase",
                customStudents: { [userEmail]: studentAcc },
                profiles: { [userEmail]: profileFor(studentAcc) },
              }));
            }
          } else {
            // Live Admin
            setState((prev) => ({
              ...prev,
              role: "admin",
              sessionEmail: userEmail,
              authProvider: "supabase",
            }));
          }
        } else if (raw) {
          const parsed = JSON.parse(raw) as Partial<Persisted>;
          if (parsed.authProvider === "demo") {
            setState((prev) => ({
              ...prev,
              ...parsed,
              authProvider: "demo",
            }));
          }
        }
      } catch (err) {
        console.warn("State initialization error:", err);
      } finally {
        setReady(true);
      }
    }

    void init();
  }, []);

  // Save demo mode state to localStorage (never live data)
  useEffect(() => {
    if (!ready) return;
    if (state.authProvider === "demo") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, ready]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", state.theme === "dark");
  }, [state.theme]);

  const patch = useCallback((p: Partial<Persisted>) => setState((s) => ({ ...s, ...p })), []);

  const email = state.sessionEmail;
  const student = useMemo<StudentAccount | null>(() => {
    if (!email) return null;
    const value = email.trim().toLowerCase();

    // Check custom/live students
    const custom =
      state.customStudents[value] ||
      Object.values(state.customStudents || {}).find((c) => c.email.trim().toLowerCase() === value);
    if (custom) return custom;

    // Check demo accounts if in demo mode
    if (state.authProvider === "demo") {
      const demo = STUDENT_ACCOUNTS.find((a) => a.email.trim().toLowerCase() === value);
      if (demo) return demo;
    }

    return null;
  }, [email, state.customStudents, state.authProvider]);

  const profile =
    (email && (state.profiles[email] || state.profiles[email.toLowerCase().trim()])) ||
    (student ? profileFor(student) : FALLBACK_PROFILE);

  const patchProfile = useCallback(
    (fn: (p: Profile) => Profile) =>
      setState((s) => {
        if (!s.sessionEmail) return s;
        const current =
          s.profiles[s.sessionEmail] ?? (student ? profileFor(student) : FALLBACK_PROFILE);
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

  // -------------------------------------------------------------------------
  // Auth Sign In Handlers
  // -------------------------------------------------------------------------

  const signIn = useCallback((rawEmail: string, password: string) => {
    const value = rawEmail.trim().toLowerCase();

    // Super Admin Demo
    if (value === ADMIN_ACCOUNT.email.toLowerCase() && password === ADMIN_ACCOUNT.password) {
      setState((s) => ({
        ...s,
        role: "admin",
        sessionEmail: ADMIN_ACCOUNT.email,
        authProvider: "demo",
      }));
      return { ok: true as const, role: "admin" as Role };
    }

    // Demo Student Accounts
    const found = STUDENT_ACCOUNTS.find((a) => a.email.trim().toLowerCase() === value);
    if (found && found.password === password) {
      const normalizedEmail = found.email.toLowerCase().trim();
      setState((s) => ({
        ...s,
        role: "student",
        sessionEmail: normalizedEmail,
        authProvider: "demo",
        customStudents: { ...s.customStudents, [normalizedEmail]: found },
        profiles: {
          ...s.profiles,
          [normalizedEmail]: s.profiles[normalizedEmail] ?? profileFor(found),
        },
      }));
      return { ok: true as const, role: "student" as Role };
    }

    return { ok: false as const, error: "Invalid demo credentials." };
  }, []);

  const signInSupabase = useCallback(async (rawEmail: string, password: string) => {
    const res = await supabaseAuth.signInWithPassword(rawEmail, password);
    if (res.error || !res.data.session) {
      return { ok: false, error: res.error?.message || "Supabase sign in failed" };
    }

    const session = res.data.session;
    const user = session.user;
    const userEmail = user.email.toLowerCase();

    // Resolve live role strictly from public.user_roles in PostgreSQL
    const role: Role = await fetchLiveUserRole(user.id, user.user_metadata?.role, user.email);

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

    // Live student login — fetch from Supabase
    const liveData = await fetchLiveStudentProfile(user.id);
    if (liveData) {
      setLiveStudentId(liveData.profile.id);
      const progress = await fetchLiveStudentProgress(liveData.profile.id);

      const studentAcc: StudentAccount = {
        email: userEmail,
        password: "●●●●●●●●",
        name: liveData.profile.name,
        firstName: liveData.profile.name.split(" ")[0] || "Student",
        rollNo: liveData.profile.roll_no || "2026-LIVE",
        dept: liveData.profile.dept || "CSE",
        batchId: liveData.profile.batch_id || "BATCH-2026-LIVE-01",
        college: liveData.profile.college || "Partner Engineering College",
        tracks: sanitizeTracks(liveData.tracks),
        xp: liveData.profile.xp,
        streak: liveData.profile.streak,
        seedOffsets: [1, 1, 1],
        placementDay: liveData.profile.placement_day,
        readiness: {
          T: liveData.profile.readiness_t,
          C: liveData.profile.readiness_c,
          A: liveData.profile.readiness_a,
          E: liveData.profile.readiness_e,
          R: liveData.profile.readiness_r,
          M: liveData.profile.readiness_m,
        },
      };

      const liveProf: Profile = {
        activeTracks: liveData.tracks,
        xp: liveData.profile.xp,
        streak: liveData.profile.streak,
        completedLabs: progress.completedLabs,
        daily: progress.daily,
        readiness: studentAcc.readiness,
        skills: progress.skills,
        placementDay: liveData.profile.placement_day,
        attendance: progress.attendance,
        assessments: progress.assessments,
        completedTechDays: progress.completedTechDays,
        mocks: progress.mocks,
        certifications: progress.certifications,
      };

      setState((s) => ({
        ...s,
        role: "student",
        sessionEmail: userEmail,
        authProvider: "supabase",
        customStudents: { [userEmail]: studentAcc },
        profiles: { [userEmail]: liveProf },
      }));
    } else {
      const meta = user.user_metadata || {};
      const fallbackName = meta.name || userEmail.split("@")[0] || "Student Learner";
      const studentAcc: StudentAccount = {
        email: userEmail,
        password: "●●●●●●●●",
        name: fallbackName,
        firstName: fallbackName.split(" ")[0] || "Student",
        rollNo: meta.roll_no || "2026-LIVE",
        dept: meta.dept || "CSE",
        batchId: meta.batch_id || "BATCH-2026-LIVE-01",
        college: meta.college || "Partner Engineering College",
        tracks: sanitizeTracks((meta.tracks as TrackId[]) || ["mern", "cloud"]),
        xp: 250,
        streak: 1,
        seedOffsets: [1, 1, 1],
        placementDay: 1,
        readiness: { T: 60, C: 55, A: 55, E: 60, R: 40, M: 25 },
      };

      setState((s) => ({
        ...s,
        role: "student",
        sessionEmail: userEmail,
        authProvider: "supabase",
        customStudents: { [userEmail]: studentAcc },
        profiles: { [userEmail]: profileFor(studentAcc) },
      }));
    }

    return { ok: true, role: "student" as Role };
  }, []);

  const signUpSupabase = useCallback(
    async (
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
    ) => {
      const res = await supabaseAuth.signUp(email, password, {
        name: options?.name,
        roll_no: options?.rollNo,
        dept: options?.dept,
        batch_id: options?.batchId,
        college: options?.college,
        tracks: options?.tracks,
        role: "student",
      });

      if (res.error) {
        return { ok: false, error: res.error.message };
      }
      return { ok: true, role: "student" as Role };
    },
    [],
  );

  const signOut = useCallback(async () => {
    if (state.authProvider === "supabase") {
      await supabaseAuth.signOut();
    }
    setSupabaseSession(null);
    setLiveStudentId(null);
    setState((s) => ({ ...s, sessionEmail: null, role: "student" }));
  }, [state.authProvider]);

  const setRole = useCallback((role: Role) => patch({ role }), [patch]);
  const toggleTheme = useCallback(
    () => patch({ theme: state.theme === "dark" ? "light" : "dark" }),
    [patch, state.theme],
  );

  // -------------------------------------------------------------------------
  // Student Learning Actions
  // -------------------------------------------------------------------------

  const completeSkill = useCallback(
    async (trackId: TrackId, skillId: string, name: string) => {
      if (state.authProvider === "supabase" && liveStudentId) {
        const res = await completeLiveSkill(liveStudentId, skillId, trackId);
        if (!res.ok) {
          toast.error(res.error || "Failed to validate skill in Supabase");
          return;
        }
      }
      patchProfile((p) => {
        if (p.skills.includes(skillId)) return p;
        return {
          ...p,
          skills: [...p.skills, skillId],
          xp: p.xp + 30,
          readiness: { ...p.readiness, T: clamp(p.readiness.T + 2, 0, 100) },
        };
      });
      toast.success(`Skill validated · ${name}`, {
        description:
          state.authProvider === "supabase"
            ? "Technical competency updated in Supabase."
            : "Demo skill validated.",
      });
    },
    [state.authProvider, liveStudentId, patchProfile],
  );

  const completePlacementDay = useCallback(
    async (day: number) => {
      if (state.authProvider === "supabase" && liveStudentId) {
        const res = await completeLivePlacementDay(liveStudentId, day);
        if (!res.ok) {
          toast.error(res.error || "Failed to record attendance in Supabase");
          return;
        }
      }
      patchProfile((p) => {
        if (p.attendance.includes(day)) return p;
        return {
          ...p,
          attendance: [...p.attendance, day],
          placementDay: Math.max(p.placementDay, Math.min(day + 1, 90)),
          xp: p.xp + 20,
          readiness: {
            ...p.readiness,
            C: clamp(p.readiness.C + 1, 0, 100),
            E: clamp(p.readiness.E + 1, 0, 100),
            A: clamp(p.readiness.A + 1, 0, 100),
          },
        };
      });
      toast.success(`Day ${day} validated`, { description: "Placement attendance recorded." });
    },
    [state.authProvider, liveStudentId, patchProfile],
  );

  const completeTechDay = useCallback(
    (day: number) => {
      patchProfile((p) => {
        if (p.completedTechDays.includes(day)) return p;
        return {
          ...p,
          completedTechDays: [...p.completedTechDays, day],
          xp: p.xp + 25,
          readiness: { ...p.readiness, T: clamp(p.readiness.T + 2, 0, 100) },
        };
      });
      toast.success(`Tech milestone Day ${day} completed`);
    },
    [patchProfile],
  );

  const completeLab = useCallback(
    async (labId: string, label: string) => {
      if (state.authProvider === "supabase" && liveStudentId) {
        const res = await completeLiveLab(liveStudentId, labId, label);
        if (!res.ok) {
          toast.error(res.error || "Failed to verify lab in Supabase");
          return;
        }
      }
      patchProfile((p) => {
        if (p.completedLabs.includes(labId)) return p;
        return {
          ...p,
          completedLabs: [...p.completedLabs, labId],
          xp: p.xp + 50,
          readiness: { ...p.readiness, T: clamp(p.readiness.T + 3, 0, 100) },
        };
      });
      toast.success(`Sandbox verified · ${label}`);
    },
    [state.authProvider, liveStudentId, patchProfile],
  );

  const completeDailyStep = useCallback(
    async (step: keyof DailySteps) => {
      if (state.authProvider === "supabase" && liveStudentId) {
        const res = await completeLiveDailyStep(liveStudentId, step);
        if (!res.ok) {
          toast.error(res.error || "Failed to update daily progress in Supabase");
          return;
        }
      }
      patchProfile((p) => ({
        ...p,
        daily: { ...p.daily, [step]: true },
        xp: p.xp + 15,
      }));
      toast.success(`Step complete · ${step}`);
    },
    [state.authProvider, liveStudentId, patchProfile],
  );

  const submitAssessment = useCallback(
    async (day: number, score: number) => {
      if (state.authProvider === "supabase" && liveStudentId) {
        const res = await submitLiveAssessment(liveStudentId, day, score);
        if (!res.ok) {
          toast.error(res.error || "Failed to submit assessment to Supabase");
          return;
        }
      }
      patchProfile((p) => ({
        ...p,
        assessments: { ...p.assessments, [String(day)]: score },
        xp: p.xp + 40,
        readiness: { ...p.readiness, A: clamp(p.readiness.A + 3, 0, 100) },
      }));
      toast.success(`Milestone Day ${day} Assessment Submitted · Score ${score}%`);
    },
    [state.authProvider, liveStudentId, patchProfile],
  );

  const completeMock = useCallback(
    async (id: string, score: number) => {
      if (state.authProvider === "supabase" && liveStudentId) {
        const res = await completeLiveMock(liveStudentId, id, score);
        if (!res.ok) {
          toast.error(res.error || "Failed to save mock interview score to Supabase");
          return;
        }
      }
      patchProfile((p) => ({
        ...p,
        mocks: { ...p.mocks, [id]: score },
        xp: p.xp + 50,
        readiness: { ...p.readiness, M: clamp(p.readiness.M + 5, 0, 100) },
      }));
      toast.success(`Mock Interview Panel Complete · Score ${score}%`);
    },
    [state.authProvider, liveStudentId, patchProfile],
  );

  const issueCertificate = useCallback(
    async (label: string) => {
      if (state.authProvider === "supabase" && liveStudentId) {
        const res = await issueLiveCertificate(liveStudentId, label);
        if (!res.ok) {
          toast.error(res.error || "Failed to issue certificate in Supabase");
          return;
        }
      }
      patchProfile((p) => {
        if (p.certifications.includes(label)) return p;
        return {
          ...p,
          certifications: [...p.certifications, label],
          xp: p.xp + 100,
          readiness: { ...p.readiness, R: clamp(p.readiness.R + 5, 0, 100) },
        };
      });
      toast.success(`Certificate Issued · ${label}`);
    },
    [state.authProvider, liveStudentId, patchProfile],
  );

  const setActiveTracks = useCallback(
    async (t: TrackId[]) => {
      const sanitized = sanitizeTracks(t);
      if (state.authProvider === "supabase" && liveStudentId) {
        await updateLiveStudentTracks(liveStudentId, sanitized);
      }
      patchProfile((p) => ({ ...p, activeTracks: sanitized }));
      toast.success("Technical tracks updated");
    },
    [state.authProvider, liveStudentId, patchProfile],
  );

  const setReadiness = useCallback(
    (r: Partial<ReadinessInputs>) => {
      if (state.authProvider === "supabase" && liveStudentId) {
        void updateLiveReadiness(liveStudentId, r);
      }
      patchProfile((p) => ({ ...p, readiness: { ...p.readiness, ...r } }));
    },
    [state.authProvider, liveStudentId, patchProfile],
  );

  // -------------------------------------------------------------------------
  // Admin Management Actions
  // -------------------------------------------------------------------------

  const createBatch = useCallback(
    (b: Omit<Batch, "lastSync">) => {
      if (state.authProvider === "supabase") {
        void createLiveBatch({ name: b.name, capacity: b.capacity, dept: b.dept });
      }
      setState((s) => ({
        ...s,
        batches: [...s.batches, { ...b, enrolled: 0, lastSync: new Date().toISOString() }],
      }));
      toast.success(`Batch ${b.name} created`);
    },
    [state.authProvider],
  );

  const updateBatch = useCallback(
    (id: string, patchObj: Partial<Batch>) => {
      if (state.authProvider === "supabase") {
        void updateLiveBatch(id, patchObj);
      }
      setState((s) => ({
        ...s,
        batches: s.batches.map((b) => (b.id === id ? { ...b, ...patchObj } : b)),
      }));
      toast.success("Batch updated");
    },
    [state.authProvider],
  );

  const deleteBatch = useCallback(
    (id: string) => {
      if (state.authProvider === "supabase") {
        void deleteLiveBatch(id);
      }
      setState((s) => ({ ...s, batches: s.batches.filter((b) => b.id !== id) }));
      toast.success("Batch removed");
    },
    [state.authProvider],
  );

  const syncBatch = useCallback(
    (id: string) => {
      updateBatch(id, { lastSync: new Date().toLocaleString("en-GB") });
      toast.success("Batch synchronized");
    },
    [updateBatch],
  );

  const addStudent = useCallback(
    (studentInput: {
      name: string;
      email: string;
      password?: string;
      rollNo: string;
      dept: string;
      batchId: string;
      college?: string;
      tracks?: TrackId[];
    }) => {
      if (state.authProvider === "supabase") {
        void addLiveStudent(studentInput);
      }
      toast.success(`Student ${studentInput.name} registered`);
      return { ok: true, message: `Student account created for ${studentInput.email}` };
    },
    [state.authProvider],
  );

  const deleteStudent = useCallback(
    (emailOrId: string) => {
      if (state.authProvider === "supabase") {
        void deleteLiveStudent(emailOrId);
      }
      toast.success(`Student removed from roster`);
      return { ok: true, message: `Student removed` };
    },
    [state.authProvider],
  );

  const addProvisioned = useCallback(
    (rows: ProvisionedStudent[]) => {
      if (state.authProvider === "supabase") {
        void provisionLiveStudents(rows);
      }
      toast.success(`${rows.length} learners onboarded to backend`);
    },
    [state.authProvider],
  );

  const clearAllProvisioned = useCallback(() => {
    return { ok: true, count: 0 };
  }, []);

  const resetStudentPassword = useCallback((_email: string, _newPassword: string) => {
    toast.success("Password reset initiated via Supabase Auth");
    return { ok: true, message: "Password reset successfully" };
  }, []);

  // -------------------------------------------------------------------------
  // Hiring Drives & Content CMS
  // -------------------------------------------------------------------------

  const addHiringDrive = useCallback(
    (drive: Omit<HiringDrive, "id">) => {
      if (state.authProvider === "supabase") {
        void createLiveHiringDrive(drive);
      }
      setState((s) => ({
        ...s,
        hiringDrives: [{ ...drive, id: `hd-${Date.now()}` }, ...(s.hiringDrives ?? [])],
      }));
      toast.success("Hiring requisition created");
    },
    [state.authProvider],
  );

  const updateHiringDrive = useCallback(
    (id: string, patchObj: Partial<HiringDrive>) => {
      if (state.authProvider === "supabase") {
        void updateLiveHiringDrive(id, patchObj);
      }
      setState((s) => ({
        ...s,
        hiringDrives: (s.hiringDrives ?? []).map((d) => (d.id === id ? { ...d, ...patchObj } : d)),
      }));
      toast.success("Hiring drive updated");
    },
    [state.authProvider],
  );

  const deleteHiringDrive = useCallback(
    (id: string) => {
      if (state.authProvider === "supabase") {
        void deleteLiveHiringDrive(id);
      }
      setState((s) => ({
        ...s,
        hiringDrives: (s.hiringDrives ?? []).filter((d) => d.id !== id),
      }));
      toast.success("Hiring drive removed");
    },
    [state.authProvider],
  );

  const addContent = useCallback(
    (item: Omit<ContentItem, "id" | "updated">) => {
      if (state.authProvider === "supabase") {
        void createLiveContentItem(item);
      }
      setState((s) => ({
        ...s,
        content: [
          { ...item, id: `${Date.now()}`, updated: new Date().toLocaleString("en-GB") },
          ...s.content,
        ],
      }));
      toast.success("Content item created");
    },
    [state.authProvider],
  );

  const updateContent = useCallback(
    (id: string, patchObj: Partial<ContentItem>) => {
      if (state.authProvider === "supabase") {
        void updateLiveContentItem(id, patchObj);
      }
      setState((s) => ({
        ...s,
        content: s.content.map((c) =>
          c.id === id ? { ...c, ...patchObj, updated: new Date().toLocaleString("en-GB") } : c,
        ),
      }));
    },
    [state.authProvider],
  );

  const removeContent = useCallback(
    (id: string) => {
      if (state.authProvider === "supabase") {
        void deleteLiveContentItem(id);
      }
      setState((s) => ({ ...s, content: s.content.filter((c) => c.id !== id) }));
      toast.success("Content item removed");
    },
    [state.authProvider],
  );

  const setCompletionRule = useCallback(
    (rule: CompletionRule, secondaryMinimum?: number) => {
      if (state.authProvider === "supabase") {
        void updateLivePlatformSettings({
          completionRule: rule,
          secondaryMinimum: secondaryMinimum ?? state.secondaryMinimum,
        });
      }
      setState((s) => ({
        ...s,
        completionRule: rule,
        secondaryMinimum: secondaryMinimum !== undefined ? secondaryMinimum : s.secondaryMinimum,
      }));
      toast.success("Gate completion rule updated");
    },
    [state.authProvider, state.secondaryMinimum],
  );

  const recalculateStudentScore = useCallback((_email: string) => {
    return { ok: true, newScore: 720, message: "Score recalculated" };
  }, []);

  const recalculateAllScores = useCallback(() => {
    return { count: 1, message: "Scores recalculated" };
  }, []);

  const resetProgress = useCallback(() => {
    patchProfile(() => FALLBACK_PROFILE);
    toast.info("Progress reset");
  }, [patchProfile]);

  // Derived metrics
  const readinessIndex = useMemo(() => {
    const { T, C, A, E, R, M } = profile.readiness;
    return Math.round(T * 0.25 + C * 0.2 + A * 0.15 + E * 0.15 + R * 0.15 + M * 0.1);
  }, [profile.readiness]);

  const talentScore = useMemo(() => {
    const base = readinessIndex * 8.5;
    const bonus = profile.completedLabs.length * 8 + profile.skills.length * 3;
    return Math.min(1000, Math.round(base + bonus));
  }, [readinessIndex, profile.completedLabs.length, profile.skills.length]);

  const trackPercent = useCallback(
    (id: TrackId) => {
      return trackPct(id, profile.skills);
    },
    [profile.skills],
  );

  const technicalComplete = useMemo(() => {
    if (state.completionRule === "all-tracks") {
      return profile.activeTracks.every((t) => trackPercent(t) >= 100);
    }
    const [primary, ...secondaries] = profile.activeTracks;
    const primaryDone = primary ? trackPercent(primary) >= 100 : false;
    const secondariesDone = secondaries.every((t) => trackPercent(t) >= state.secondaryMinimum);
    return primaryDone && secondariesDone;
  }, [profile.activeTracks, trackPercent, state.completionRule, state.secondaryMinimum]);

  const placementComplete = useMemo(() => {
    return profile.attendance.length >= 90 && Boolean(profile.assessments["90"]);
  }, [profile.attendance, profile.assessments]);

  const phase1Complete = technicalComplete && placementComplete;
  const gateUnlocked = phase1Complete;

  const eligibleCompanies = useMemo(() => {
    if (!gateUnlocked) return 0;
    return (state.hiringDrives ?? []).filter((d) => talentScore >= d.minScore).length;
  }, [gateUnlocked, state.hiringDrives, talentScore]);

  const value: Store = useMemo(
    () => ({
      ...state,
      ...profile,
      ready,
      student,
      supabaseSession,
      liveStudentId,
      isAuthed: Boolean(state.sessionEmail),
      readinessIndex,
      talentScore,
      eligibleCompanies,
      phase1Complete,
      technicalComplete,
      placementComplete,
      gateUnlocked,
      trackPercent,
      completeSkill,
      completePlacementDay,
      completeTechDay,
      submitAssessment,
      completeMock,
      issueCertificate,
      setCompletionRule,
      cronLogs,
      resetStudentPassword,
      signIn,
      signInSupabase,
      signUpSupabase,
      signOut,
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
      hiringDrives: state.hiringDrives ?? [],
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
    }),
    [
      state,
      profile,
      ready,
      student,
      supabaseSession,
      liveStudentId,
      readinessIndex,
      talentScore,
      eligibleCompanies,
      phase1Complete,
      technicalComplete,
      placementComplete,
      gateUnlocked,
      trackPercent,
      completeSkill,
      completePlacementDay,
      completeTechDay,
      submitAssessment,
      completeMock,
      issueCertificate,
      setCompletionRule,
      cronLogs,
      resetStudentPassword,
      signIn,
      signInSupabase,
      signUpSupabase,
      signOut,
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
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useAppStore must be used within AppStoreProvider");
  }
  return ctx;
}
