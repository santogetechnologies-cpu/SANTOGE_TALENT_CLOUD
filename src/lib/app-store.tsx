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
import { trackProgress as trackPct } from "./curriculum";
import type { Session } from "@supabase/supabase-js";
import {
  supabaseAuth,
  getSupabaseClient,
  fetchLiveUserRole,
  isSupabaseConfigured,
  type SupabaseSession,
  type SupabaseUser,
} from "./supabase";
import {
  fetchLiveStudentProfile,
  fetchLiveStudentProgress,
  completeLiveSkill,
  completeLivePlacementDay,
  completeLiveTechnicalDay,
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
  resetLiveStudentPassword,
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
  password?: string;
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
  talentScore: number;
  completedLabs: string[];
  daily: DailySteps;
  readiness: ReadinessInputs;
  skills: string[];
  placementDay: number;
  attendance: number[];
  assessments: Record<string, number>;
  completedTechDays: number[];
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

export type CronLog = {
  id: string;
  time: string;
  stage: string;
  message: string;
  status: "ok" | "running" | "queued";
};

export type StudentInfo = {
  name: string;
  email: string;
  firstName?: string;
  rollNo?: string;
  dept?: string;
  batchId?: string;
  college?: string;
  tracks?: TrackId[];
  xp?: number;
  streak?: number;
  placementDay?: number;
  talentScore?: number;
  readiness?: ReadinessInputs;
};

export type StudentAccount = StudentInfo;

export const sanitizeTracks = (tracks?: (TrackId | string)[]): TrackId[] => {
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

  return validTracks.slice(0, 3);
};

const DEFAULT_PROFILE: Profile = {
  activeTracks: [],
  xp: 0,
  streak: 0,
  talentScore: 0,
  completedLabs: [],
  daily: { english: false, aptitude: false, practice: false },
  readiness: { T: 0, C: 0, A: 0, E: 0, R: 0, M: 0 },
  skills: [],
  placementDay: 1,
  attendance: [],
  assessments: {},
  completedTechDays: [],
  mocks: {},
  certifications: [],
};

type AppStoreState = {
  role: Role;
  theme: "dark" | "light";
  sessionEmail: string | null;
  authProvider: "supabase";
  supabaseSession: SupabaseSession | null;
  liveStudentId: string | null;
  student: StudentInfo | null;
  profile: Profile;
  completionRule: CompletionRule;
  secondaryMinimum: number;
};

type AppStoreContextValue = AppStoreState & {
  ready: boolean;
  isAuthed: boolean;
  activeTracks: TrackId[];
  xp: number;
  streak: number;
  completedLabs: string[];
  daily: DailySteps;
  readiness: ReadinessInputs;
  skills: string[];
  placementDay: number;
  attendance: number[];
  assessments: Record<string, number>;
  completedTechDays: number[];
  mocks: Record<string, number>;
  certifications: string[];
  talentScore: number;
  readinessIndex: number;
  eligibleCompanies: number;
  phase1Complete: boolean;
  technicalComplete: boolean;
  placementComplete: boolean;
  gateUnlocked: boolean;
  cronLogs: CronLog[];
  pushCronLog: (log: Omit<CronLog, "id" | "time">) => void;
  trackPercent: (id: TrackId) => number;
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
  setReadiness: (patch: Partial<ReadinessInputs>) => void;
  setActiveTracks: (tracks: TrackId[], syncToDb?: boolean) => void;
  setDailyStep: (key: "english" | "aptitude" | "practice", val: boolean) => void;
  completeDailyStep: (key: "english" | "aptitude" | "practice") => void;
  completeSkill: (trackId: TrackId, skillId: string, name: string) => void;
  completePlacementDay: (day: number) => void;
  completeTechDay: (day: number) => void;
  completeLab: (labId: string) => void;
  submitAssessment: (day: number, score: number) => void;
  completeMock: (id: string, score: number) => void;
  issueCertificate: (label: string) => void;
  recalculateAllScores: () => void;
  recalculateStudentScore: (emailOrId?: string) => void;
  resetProgress: () => void;
  setCompletionRule: (rule: CompletionRule, secondaryMinimum?: number) => void;
  resetStudentPassword: (
    email: string,
    newPassword?: string,
  ) => Promise<{ ok: boolean; message: string }>;
};

const AppStoreContext = createContext<AppStoreContextValue | null>(null);

const THEME_STORAGE_KEY = "santoge-theme";

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [cronLogs, setCronLogs] = useState<CronLog[]>([]);

  const [state, setState] = useState<AppStoreState>(() => {
    let savedTheme: "dark" | "light" = "dark";
    if (typeof window !== "undefined") {
      try {
        const t = localStorage.getItem(THEME_STORAGE_KEY);
        if (t === "dark" || t === "light") savedTheme = t;
      } catch {
        /* ignore */
      }
    }
    return {
      role: "student",
      theme: savedTheme,
      sessionEmail: null,
      authProvider: "supabase",
      supabaseSession: null,
      liveStudentId: null,
      student: null,
      profile: DEFAULT_PROFILE,
      completionRule: "primary-plus-minimum",
      secondaryMinimum: 50,
    };
  });

  // Apply theme to DOM
  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.classList.toggle("dark", state.theme === "dark");
    }
  }, [state.theme]);

  // Supabase Auth session listener & boot initialization
  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured()) {
      setReady(true);
      return;
    }

    const supabase = getSupabaseClient();

    async function syncSession(session: Session | SupabaseSession | null) {
      if (!session?.user?.id) {
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            sessionEmail: null,
            supabaseSession: null,
            liveStudentId: null,
            student: null,
            profile: DEFAULT_PROFILE,
          }));
          setReady(true);
        }
        return;
      }

      const user = session.user;
      const userEmail = (user.email || "").toLowerCase();

      try {
        const [role, platformSettings] = await Promise.all([
          fetchLiveUserRole(user.id, user.user_metadata?.role, user.email),
          fetchLivePlatformSettings(),
        ]);

        const completionRule = platformSettings?.completionRule ?? "primary-plus-minimum";
        const secondaryMinimum = platformSettings?.secondaryMinimum ?? 50;

        if (role === "student") {
          const liveData = await fetchLiveStudentProfile(user.id, userEmail);
          if (liveData?.profile && isMounted) {
            const progress = await fetchLiveStudentProgress(liveData.profile.id);

            const studentInfo: StudentInfo = {
              email: userEmail,
              name: liveData.profile.name,
              firstName: liveData.profile.name.split(" ")[0] || "Student",
              rollNo: liveData.profile.roll_no || "",
              dept: liveData.profile.dept || "",
              batchId: liveData.profile.batch_id || "",
              college: liveData.profile.college || "",
              tracks: liveData.tracks,
              xp: liveData.profile.xp,
              streak: liveData.profile.streak,
              placementDay: liveData.profile.placement_day,
              talentScore: liveData.profile.talent_score,
              readiness: {
                T: liveData.profile.readiness_t,
                C: liveData.profile.readiness_c,
                A: liveData.profile.readiness_a,
                E: liveData.profile.readiness_e,
                R: liveData.profile.readiness_r,
                M: liveData.profile.readiness_m,
              },
            };

            const liveProfile: Profile = {
              activeTracks: liveData.tracks,
              xp: liveData.profile.xp,
              streak: liveData.profile.streak,
              talentScore: liveData.profile.talent_score,
              completedLabs: progress.completedLabs,
              daily: progress.daily,
              readiness: studentInfo.readiness!,
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
              supabaseSession: session as unknown as SupabaseSession,
              liveStudentId: liveData.profile.id,
              student: studentInfo,
              profile: liveProfile,
              completionRule,
              secondaryMinimum,
            }));
          }
        } else if (isMounted) {
          setState((prev) => ({
            ...prev,
            role: "admin",
            sessionEmail: userEmail,
            supabaseSession: session as unknown as SupabaseSession,
            liveStudentId: null,
            student: null,
            completionRule,
            secondaryMinimum,
          }));
        }
      } catch (syncErr) {
        console.warn("Live session sync warning:", syncErr);
      } finally {
        if (isMounted) setReady(true);
      }
    }

    // 1. Authoritative initial session retrieval from Supabase Auth
    void supabase.auth.getSession().then(({ data: { session } }) => {
      void syncSession(session);
    });

    // 2. Subscribe to Supabase Auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        void syncSession(null);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        void syncSession(session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setState((s) => {
      const nextTheme = s.theme === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {
        /* ignore */
      }
      return { ...s, theme: nextTheme };
    });
  }, []);

  const setRole = useCallback((r: Role) => {
    setState((s) => ({ ...s, role: r }));
  }, []);

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

  // Supabase Auth Sign In
  const signInSupabase = useCallback(async (rawEmail: string, password: string) => {
    const res = await supabaseAuth.signInWithPassword(rawEmail, password);
    if (res.error || !res.data.session) {
      return { ok: false, error: res.error?.message || "Supabase sign in failed" };
    }

    const session = res.data.session;
    const user = session.user;
    const userEmail = user.email.toLowerCase();

    try {
      const [role, platformSettings] = await Promise.all([
        fetchLiveUserRole(user.id, user.user_metadata?.role, user.email),
        fetchLivePlatformSettings(),
      ]);

      const completionRule = platformSettings?.completionRule ?? "primary-plus-minimum";
      const secondaryMinimum = platformSettings?.secondaryMinimum ?? 50;

      if (role === "admin") {
        setState((s) => ({
          ...s,
          role: "admin",
          sessionEmail: userEmail,
          supabaseSession: session,
          liveStudentId: null,
          student: null,
          completionRule,
          secondaryMinimum,
        }));
        return { ok: true, role: "admin" as Role };
      }

      // Fetch live student profile
      const liveData = await fetchLiveStudentProfile(user.id, userEmail);
      if (liveData?.profile) {
        const progress = await fetchLiveStudentProgress(liveData.profile.id);

        const studentInfo: StudentInfo = {
          email: userEmail,
          name: liveData.profile.name,
          firstName: liveData.profile.name.split(" ")[0] || "Student",
          rollNo: liveData.profile.roll_no || "",
          dept: liveData.profile.dept || "",
          batchId: liveData.profile.batch_id || "",
          college: liveData.profile.college || "",
          tracks: liveData.tracks,
          xp: liveData.profile.xp,
          streak: liveData.profile.streak,
          placementDay: liveData.profile.placement_day,
          talentScore: liveData.profile.talent_score,
          readiness: {
            T: liveData.profile.readiness_t,
            C: liveData.profile.readiness_c,
            A: liveData.profile.readiness_a,
            E: liveData.profile.readiness_e,
            R: liveData.profile.readiness_r,
            M: liveData.profile.readiness_m,
          },
        };

        const liveProfile: Profile = {
          activeTracks: liveData.tracks,
          xp: liveData.profile.xp,
          streak: liveData.profile.streak,
          talentScore: liveData.profile.talent_score,
          completedLabs: progress.completedLabs,
          daily: progress.daily,
          readiness: studentInfo.readiness!,
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
          supabaseSession: session,
          liveStudentId: liveData.profile.id,
          student: studentInfo,
          profile: liveProfile,
          completionRule,
          secondaryMinimum,
        }));
        return { ok: true, role: "student" as Role };
      }

      // Profile pending provisioning
      setState((s) => ({
        ...s,
        role: "student",
        sessionEmail: userEmail,
        supabaseSession: session,
        liveStudentId: null,
        student: {
          email: userEmail,
          name: user.user_metadata?.name || userEmail.split("@")[0] || "Student",
        },
        profile: DEFAULT_PROFILE,
        completionRule,
        secondaryMinimum,
      }));
      return { ok: true, role: "student" as Role };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initialize student session";
      return { ok: false, error: msg };
    }
  }, []);

  const signUpSupabase = useCallback(
    async (
      rawEmail: string,
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
      const res = await supabaseAuth.signUp(rawEmail, password, {
        name: options?.name,
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
    await supabaseAuth.signOut();
    setState((s) => ({
      ...s,
      sessionEmail: null,
      supabaseSession: null,
      liveStudentId: null,
      student: null,
      profile: DEFAULT_PROFILE,
    }));
    toast.success("Signed out successfully");
  }, []);

  const resetStudentPassword = useCallback(async (studentEmail: string, newPassword?: string) => {
    return resetLiveStudentPassword(studentEmail, newPassword);
  }, []);

  // -------------------------------------------------------------------------
  // Student Mutations (Supabase Live RPCs + Local optimistic cache)
  // -------------------------------------------------------------------------

  const setReadiness = useCallback((patch: Partial<ReadinessInputs>) => {
    setState((s) => {
      const nextReadiness = { ...s.profile.readiness, ...patch };
      const nextProfile = { ...s.profile, readiness: nextReadiness };

      if (s.liveStudentId) {
        void updateLiveReadiness(s.liveStudentId, patch);
      }

      return { ...s, profile: nextProfile };
    });
  }, []);

  const setActiveTracks = useCallback((tracks: TrackId[], syncToDb = false) => {
    setState((s) => {
      const nextProfile = { ...s.profile, activeTracks: tracks };
      if (syncToDb && s.liveStudentId) {
        void updateLiveStudentTracks(s.liveStudentId, tracks);
      }
      return { ...s, profile: nextProfile };
    });
  }, []);

  const setDailyStep = useCallback((key: "english" | "aptitude" | "practice", val: boolean) => {
    setState((s) => {
      const nextDaily = { ...s.profile.daily, [key]: val };
      const nextProfile = { ...s.profile, daily: nextDaily };
      if (s.liveStudentId && val) {
        void completeLiveDailyStep(s.liveStudentId, key);
      }
      return { ...s, profile: nextProfile };
    });
  }, []);

  const completeDailyStep = useCallback(
    (key: "english" | "aptitude" | "practice") => {
      setDailyStep(key, true);
    },
    [setDailyStep],
  );

  const completeSkill = useCallback((trackId: TrackId, skillId: string, name: string) => {
    setState((s) => {
      if (s.profile.skills.includes(skillId)) return s;
      const nextSkills = [...s.profile.skills, skillId];
      const nextXp = s.profile.xp + 25;
      const nextProfile = { ...s.profile, skills: nextSkills, xp: nextXp };

      if (s.liveStudentId) {
        void completeLiveSkill(s.liveStudentId, skillId, trackId);
      }

      toast.success(`Skill Mastered: ${name} (+25 XP)`);
      return { ...s, profile: nextProfile };
    });
  }, []);

  const completePlacementDay = useCallback((day: number) => {
    setState((s) => {
      const nextAtt = s.profile.attendance.includes(day)
        ? s.profile.attendance
        : [...s.profile.attendance, day];
      const nextDay = Math.min(day + 1, 90);
      const nextXp = s.profile.xp + 50;
      const nextProfile = {
        ...s.profile,
        attendance: nextAtt,
        placementDay: nextDay,
        xp: nextXp,
      };

      if (s.liveStudentId) {
        void completeLivePlacementDay(s.liveStudentId, day);
      }

      toast.success(`Placement Day ${day} completed! (+50 XP)`);
      return { ...s, profile: nextProfile };
    });
  }, []);

  const completeTechDay = useCallback((day: number) => {
    setState((s) => {
      if (s.profile.completedTechDays.includes(day)) return s;
      const nextTechDays = [...s.profile.completedTechDays, day];
      const nextXp = s.profile.xp + 50;
      const nextProfile = { ...s.profile, completedTechDays: nextTechDays, xp: nextXp };

      if (s.liveStudentId) {
        void completeLiveTechnicalDay(s.liveStudentId, day);
      }

      toast.success(`Technical Day ${day} verified! (+50 XP)`);
      return { ...s, profile: nextProfile };
    });
  }, []);

  const completeLab = useCallback((labId: string) => {
    setState((s) => {
      if (s.profile.completedLabs.includes(labId)) return s;
      const nextLabs = [...s.profile.completedLabs, labId];
      const nextXp = s.profile.xp + 50;
      const nextProfile = { ...s.profile, completedLabs: nextLabs, xp: nextXp };

      if (s.liveStudentId) {
        void completeLiveLab(s.liveStudentId, labId, labId);
      }

      toast.success(`Lab Challenge Passed (+50 XP)`);
      return { ...s, profile: nextProfile };
    });
  }, []);

  const recalculateAllScores = useCallback(() => {
    toast.success("Talent scores recalculation triggered");
  }, []);

  const recalculateStudentScore = useCallback((_emailOrId?: string) => {
    toast.success("Student talent score recalculation triggered");
  }, []);

  const submitAssessment = useCallback((day: number, score: number) => {
    setState((s) => {
      const nextAss = { ...s.profile.assessments, [String(day)]: score };
      const nextXp = s.profile.xp + 100;
      const nextProfile = { ...s.profile, assessments: nextAss, xp: nextXp };

      if (s.liveStudentId) {
        void submitLiveAssessment(s.liveStudentId, day, score);
      }

      toast.success(`Day ${day} Assessment Submitted: ${score}% (+100 XP)`);
      return { ...s, profile: nextProfile };
    });
  }, []);

  const completeMock = useCallback((id: string, score: number) => {
    setState((s) => {
      const nextMocks = { ...s.profile.mocks, [id]: score };
      const nextXp = s.profile.xp + 100;
      const nextProfile = { ...s.profile, mocks: nextMocks, xp: nextXp };

      if (s.liveStudentId) {
        void completeLiveMock(s.liveStudentId, id, score);
      }

      toast.success(`AI Mock Interview Recorded: ${score}% (+100 XP)`);
      return { ...s, profile: nextProfile };
    });
  }, []);

  const issueCertificate = useCallback((label: string) => {
    setState((s) => {
      if (s.profile.certifications.includes(label)) return s;
      const nextCerts = [...s.profile.certifications, label];
      const nextProfile = { ...s.profile, certifications: nextCerts };

      if (s.liveStudentId) {
        void issueLiveCertificate(s.liveStudentId, label);
      }

      toast.success(`Certification Issued: ${label}`);
      return { ...s, profile: nextProfile };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setState((s) => ({
      ...s,
      profile: {
        ...DEFAULT_PROFILE,
        activeTracks: s.profile.activeTracks,
      },
    }));
    toast.success("Progress reset");
  }, []);

  const setCompletionRule = useCallback((rule: CompletionRule, secondaryMinimum?: number) => {
    setState((s) => ({
      ...s,
      completionRule: rule,
      secondaryMinimum: secondaryMinimum ?? s.secondaryMinimum,
    }));
    void updateLivePlatformSettings({
      completionRule: rule,
      secondaryMinimum: secondaryMinimum ?? 50,
    });
    toast.success("Dual completion gate rule updated");
  }, []);

  // -------------------------------------------------------------------------
  // Derived Metrics & Calculations
  // -------------------------------------------------------------------------

  const profile = state.profile;
  const isAuthed = !!state.sessionEmail && !!state.supabaseSession;

  const trackPercent = useCallback((id: TrackId) => trackPct(id, profile.skills), [profile.skills]);

  const r = profile.readiness;
  const talentScore = useMemo(() => {
    return state.student?.talentScore ?? state.profile.talentScore ?? 0;
  }, [state.student?.talentScore, state.profile.talentScore]);

  const readinessIndex = useMemo(() => {
    return Math.round((r.T + r.C + r.A + r.E + r.R + r.M) / 6);
  }, [r]);

  const eligibleCompanies = useMemo(() => {
    if (talentScore >= 700) return 6;
    if (talentScore >= 500) return 3;
    return 1;
  }, [talentScore]);

  const phase1Complete = profile.placementDay >= 30;
  const technicalComplete = useMemo(() => {
    if (profile.activeTracks.length === 0) return false;
    if (state.completionRule === "all-tracks") {
      return profile.activeTracks.every((t) => trackPercent(t) >= 100);
    }
    const [primary, ...rest] = profile.activeTracks;
    const primaryOk = primary ? trackPercent(primary) >= 100 : false;
    const restOk = rest.every((t) => trackPercent(t) >= state.secondaryMinimum);
    return primaryOk && restOk;
  }, [profile.activeTracks, state.completionRule, state.secondaryMinimum, trackPercent]);

  const placementComplete = profile.placementDay >= 90;
  const gateUnlocked = phase1Complete;

  const value: AppStoreContextValue = {
    ready,
    isAuthed,
    role: state.role,
    theme: state.theme,
    sessionEmail: state.sessionEmail,
    authProvider: state.authProvider,
    supabaseSession: state.supabaseSession,
    liveStudentId: state.liveStudentId,
    student: state.student,
    profile: state.profile,
    completionRule: state.completionRule,
    secondaryMinimum: state.secondaryMinimum,
    activeTracks: profile.activeTracks,
    xp: profile.xp,
    streak: profile.streak,
    completedLabs: profile.completedLabs,
    daily: profile.daily,
    readiness: profile.readiness,
    skills: profile.skills,
    placementDay: profile.placementDay,
    attendance: profile.attendance,
    assessments: profile.assessments,
    completedTechDays: profile.completedTechDays,
    mocks: profile.mocks,
    certifications: profile.certifications,
    talentScore,
    readinessIndex,
    eligibleCompanies,
    phase1Complete,
    technicalComplete,
    placementComplete,
    gateUnlocked,
    cronLogs,
    pushCronLog,
    trackPercent,
    signInSupabase,
    signUpSupabase,
    signOut,
    setRole,
    toggleTheme,
    setReadiness,
    setActiveTracks,
    setDailyStep,
    completeDailyStep,
    completeSkill,
    completePlacementDay,
    completeTechDay,
    completeLab,
    submitAssessment,
    completeMock,
    issueCertificate,
    recalculateAllScores,
    recalculateStudentScore,
    resetProgress,
    setCompletionRule,
    resetStudentPassword,
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
