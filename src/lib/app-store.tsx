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
import { TRACKS, type TrackId } from "./tracks";
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
  checkLiveStudentAccountStatus,
  completeLiveSkill,
  completeLivePlacementDay,
  completeLiveTechnicalDay,
  completeLiveLab,
  completeLiveDailyStep,
  submitLiveAssessment,
  completeLiveMock,
  issueLiveCertificate,
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
  triggerLiveTalentScoreRecalculation,
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
  course_1?: string;
  course_2?: string;
  course_3?: string;
  batch_id?: string;
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
  knowledgeChecks?: Record<string, KnowledgeCheckRecord>;
};

export type KnowledgeCheckRecord = {
  selectedOption: number;
  isCorrect: boolean;
  isLocked: boolean;
  xpAwarded: boolean;
  submittedAt: string;
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
  status: "ok" | "running" | "queued" | "failed" | "idle";
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
        if (trimmed && !seen.has(trimmed) && TRACKS.some((tr) => tr.id === trimmed)) {
          seen.add(trimmed);
          validTracks.push(trimmed);
        }
      }
    }
  }

  if (validTracks.length === 0) {
    validTracks.push("java");
  }

  return validTracks.slice(0, 3);
};

const DEFAULT_PROFILE: Profile = {
  activeTracks: ["java", "aiml", "datascience"],
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
  knowledgeChecks: {},
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
  setActiveTracks: (tracks: TrackId[]) => void;
  setDailyStep: (key: "english" | "aptitude" | "practice", val: boolean) => Promise<void> | void;
  completeDailyStep: (key: "english" | "aptitude" | "practice") => Promise<void> | void;
  completeSkill: (trackId: TrackId, skillId: string, name: string) => Promise<void> | void;
  completePlacementDay: (day: number) => Promise<void> | void;
  completeTechDay: (day: number) => Promise<void> | void;
  completeLab: (labId: string) => Promise<void> | void;
  submitAssessment: (day: number, score: number) => Promise<void> | void;
  completeMock: (id: string, score: number) => Promise<void> | void;
  issueCertificate: (label: string) => Promise<void> | void;
  recalculateAllScores: () => Promise<void> | void;
  recalculateStudentScore: (emailOrId?: string) => Promise<void> | void;
  resetProgress: () => void;
  setCompletionRule: (rule: CompletionRule, secondaryMinimum?: number) => void;
  resetStudentPassword: (
    email: string,
    newPassword?: string,
  ) => Promise<{ ok: boolean; message: string }>;
  recordKnowledgeCheck: (
    dayNum: number,
    trackId: string,
    topic: string,
    selectedOption: number,
    isCorrect: boolean,
  ) => Promise<{ ok: boolean; alreadyAnswered?: boolean; xpAwarded?: boolean }>;
  getKnowledgeCheck: (
    dayNum: number,
    trackId: string,
  ) => KnowledgeCheckRecord | null;
};

const AppStoreContext = createContext<AppStoreContextValue | null>(null);

const THEME_STORAGE_KEY = "santoge-theme";

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [cronLogs, setCronLogs] = useState<CronLog[]>([]);

  const [state, setState] = useState<AppStoreState>(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, "light");
      } catch {
        /* ignore */
      }
    }
    return {
      role: "student",
      theme: "light",
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

  // Enforce white (light) mode permanently across DOM
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("dark");
    }
  }, []);

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

      // Ensure token is fresh before firing parallel requests
      let activeSession = session;
      if (session.expires_at && session.expires_at * 1000 <= Date.now() + 5000) {
        try {
          const { data: refreshed } = await supabase.auth.refreshSession();
          if (refreshed?.session) {
            activeSession = refreshed.session;
          }
        } catch {
          // Continue with existing session
        }
      }

      const user = activeSession.user;
      const userEmail = (user.email || "").toLowerCase();

      try {
        const [role, platformSettings] = await Promise.all([
          fetchLiveUserRole(user.id, user.user_metadata?.role, user.email),
          fetchLivePlatformSettings(),
        ]);

        const completionRule = platformSettings?.completionRule ?? "primary-plus-minimum";
        const secondaryMinimum = platformSettings?.secondaryMinimum ?? 50;

        if (role === "student") {
          const accountStatus = await checkLiveStudentAccountStatus(user.id, userEmail);
          if (
            accountStatus.isDeleted ||
            accountStatus.status === "deleted" ||
            accountStatus.status === "suspended" ||
            !accountStatus.exists
          ) {
            await supabase.auth.signOut();
            if (isMounted) {
              setState((prev) => ({
                ...prev,
                role: "student",
                sessionEmail: null,
                supabaseSession: null,
                liveStudentId: null,
                student: null,
                profile: DEFAULT_PROFILE,
              }));
            }
            return;
          }

          const liveData = await fetchLiveStudentProfile(user.id, userEmail);
          if (liveData?.profile && liveData.profile.status === "active" && isMounted) {
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
          } else if (isMounted) {
            await supabase.auth.signOut();
            setState((prev) => ({
              ...prev,
              role: "student",
              sessionEmail: null,
              supabaseSession: null,
              liveStudentId: null,
              student: null,
              profile: DEFAULT_PROFILE,
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
    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.expires_at && session.expires_at * 1000 <= Date.now() + 10000) {
        // Cached session is expired or expiring in < 10s: refresh before syncing
        try {
          const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
          if (!refreshErr && refreshed.session) {
            void syncSession(refreshed.session);
            return;
          }
          // If refresh token is expired or revoked, reset session
          void syncSession(null);
          return;
        } catch {
          void syncSession(null);
          return;
        }
      }
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
    // White mode is permanently enforced
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("dark");
    }
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

      // Check account lifecycle status for student
      const accountStatus = await checkLiveStudentAccountStatus(user.id, userEmail);
      if (accountStatus.isDeleted || accountStatus.status === "deleted") {
        const supabase = getSupabaseClient();
        await supabase.auth.signOut();
        return {
          ok: false,
          error: "This student account has been removed or deactivated by the institutional administrator. Login access is revoked.",
        };
      }

      if (accountStatus.status === "suspended") {
        const supabase = getSupabaseClient();
        await supabase.auth.signOut();
        return {
          ok: false,
          error: "This student account is currently suspended. Please contact your institution administrator.",
        };
      }

      if (!accountStatus.exists) {
        const supabase = getSupabaseClient();
        await supabase.auth.signOut();
        return {
          ok: false,
          error: "No active student account found for this login. Please contact your college administrator to be provisioned.",
        };
      }

      // Fetch live student profile
      const liveData = await fetchLiveStudentProfile(user.id, userEmail);
      if (liveData?.profile && liveData.profile.status === "active") {
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

      // If profile is not found or not active, reject sign in
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      return {
        ok: false,
        error: "Student profile is not active. Please contact your college administrator.",
      };
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

  const setActiveTracks = useCallback((tracks: TrackId[]) => {
    setState((s) => {
      const nextProfile = { ...s.profile, activeTracks: tracks };
      return { ...s, profile: nextProfile };
    });
  }, []);

  const setDailyStep = useCallback(
    async (key: "english" | "aptitude" | "practice", val: boolean) => {
      if (!val) {
        setState((s) => ({
          ...s,
          profile: { ...s.profile, daily: { ...s.profile.daily, [key]: false } },
        }));
        return;
      }

      if (state.liveStudentId) {
        const res = await completeLiveDailyStep(state.liveStudentId, key);
        if (!res.ok) {
          toast.error(res.error || `Failed to complete ${key} daily step`);
          return;
        }
        setState((s) => ({
          ...s,
          profile: {
            ...s.profile,
            daily: { ...s.profile.daily, [key]: true },
            xp: res.xp !== undefined ? res.xp : s.profile.xp,
            talentScore: res.talent_score !== undefined ? res.talent_score : s.profile.talentScore,
          },
        }));
      } else {
        setState((s) => ({
          ...s,
          profile: { ...s.profile, daily: { ...s.profile.daily, [key]: true } },
        }));
      }
    },
    [state.liveStudentId],
  );

  const completeDailyStep = useCallback(
    async (key: "english" | "aptitude" | "practice") => {
      await setDailyStep(key, true);
    },
    [setDailyStep],
  );

  const completeSkill = useCallback(
    async (trackId: TrackId, skillId: string, name: string) => {
      if (state.profile.skills.includes(skillId)) return;

      if (state.liveStudentId) {
        const res = await completeLiveSkill(state.liveStudentId, skillId, trackId);
        if (!res.ok) {
          toast.error(res.error || `Failed to verify skill: ${name}`);
          return;
        }
        setState((s) => {
          const nextSkills = s.profile.skills.includes(skillId)
            ? s.profile.skills
            : [...s.profile.skills, skillId];
          const nextXp = res.xp !== undefined ? res.xp : s.profile.xp;
          const nextTalentScore =
            res.talent_score !== undefined ? res.talent_score : s.profile.talentScore;
          return {
            ...s,
            profile: {
              ...s.profile,
              skills: nextSkills,
              xp: nextXp,
              talentScore: nextTalentScore,
            },
          };
        });
        toast.success(`Skill Mastered: ${name} (+30 XP)`);
      } else {
        setState((s) => ({
          ...s,
          profile: {
            ...s.profile,
            skills: [...s.profile.skills, skillId],
            xp: s.profile.xp + 30,
          },
        }));
        toast.success(`Skill Mastered: ${name} (+30 XP)`);
      }
    },
    [state.liveStudentId, state.profile.skills],
  );

  const completePlacementDay = useCallback(
    async (day: number) => {
      if (state.liveStudentId) {
        const res = await completeLivePlacementDay(state.liveStudentId, day);
        if (!res.ok) {
          toast.error(res.error || `Failed to complete placement day ${day}`);
          return;
        }
        setState((s) => {
          const nextAtt = s.profile.attendance.includes(day)
            ? s.profile.attendance
            : [...s.profile.attendance, day];
          const nextDay = res.placement_day ?? Math.min(day + 1, 90);
          const nextXp = res.xp !== undefined ? res.xp : s.profile.xp;
          const nextTalentScore =
            res.talent_score !== undefined ? res.talent_score : s.profile.talentScore;
          return {
            ...s,
            profile: {
              ...s.profile,
              attendance: nextAtt,
              placementDay: nextDay,
              xp: nextXp,
              talentScore: nextTalentScore,
            },
          };
        });
        toast.success(`Placement Day ${day} completed! (+20 XP)`);
      } else {
        setState((s) => {
          const nextAtt = s.profile.attendance.includes(day)
            ? s.profile.attendance
            : [...s.profile.attendance, day];
          return {
            ...s,
            profile: {
              ...s.profile,
              attendance: nextAtt,
              placementDay: Math.min(day + 1, 90),
              xp: s.profile.xp + 20,
            },
          };
        });
        toast.success(`Placement Day ${day} completed! (+20 XP)`);
      }
    },
    [state.liveStudentId],
  );

  const completeTechDay = useCallback(
    async (day: number) => {
      if (state.profile.completedTechDays.includes(day)) return;

      if (state.liveStudentId) {
        const res = await completeLiveTechnicalDay(state.liveStudentId, day);
        if (!res.ok) {
          toast.error(res.error || `Failed to verify technical day ${day}`);
          return;
        }
        setState((s) => {
          const nextTechDays = s.profile.completedTechDays.includes(day)
            ? s.profile.completedTechDays
            : [...s.profile.completedTechDays, day];
          const nextXp = res.xp !== undefined ? res.xp : s.profile.xp;
          const nextTalentScore =
            res.talent_score !== undefined ? res.talent_score : s.profile.talentScore;
          return {
            ...s,
            profile: {
              ...s.profile,
              completedTechDays: nextTechDays,
              xp: nextXp,
              talentScore: nextTalentScore,
            },
          };
        });
        toast.success(`Technical Day ${day} verified! (+50 XP)`);
      } else {
        setState((s) => ({
          ...s,
          profile: {
            ...s.profile,
            completedTechDays: [...s.profile.completedTechDays, day],
            xp: s.profile.xp + 50,
          },
        }));
        toast.success(`Technical Day ${day} verified! (+50 XP)`);
      }
    },
    [state.liveStudentId, state.profile.completedTechDays],
  );

  const completeLab = useCallback(
    async (labId: string) => {
      if (state.profile.completedLabs.includes(labId)) return;

      if (state.liveStudentId) {
        try {
          const res = await completeLiveLab(state.liveStudentId, labId, labId);
          if (res.ok) {
            setState((s) => {
              const nextLabs = s.profile.completedLabs.includes(labId)
                ? s.profile.completedLabs
                : [...s.profile.completedLabs, labId];
              const nextXp = res.xp !== undefined ? res.xp : s.profile.xp + 50;
              const nextTalentScore =
                res.talent_score !== undefined ? res.talent_score : s.profile.talentScore;
              return {
                ...s,
                profile: {
                  ...s.profile,
                  completedLabs: nextLabs,
                  xp: nextXp,
                  talentScore: nextTalentScore,
                },
              };
            });
            toast.success(`Lab Challenge Mastered! (+50 XP)`);
            return;
          }
        } catch {
          // Fall through to local update
        }
      }

      // Local sandbox practice fallback
      setState((s) => ({
        ...s,
        profile: {
          ...s.profile,
          completedLabs: s.profile.completedLabs.includes(labId)
            ? s.profile.completedLabs
            : [...s.profile.completedLabs, labId],
          xp: s.profile.xp + 50,
        },
      }));
      toast.success(`Lab Challenge Mastered! (+50 XP)`);
    },
    [state.liveStudentId, state.profile.completedLabs],
  );

  const recalculateAllScores = useCallback(async () => {
    try {
      const res = await triggerLiveTalentScoreRecalculation();
      if (res.ok) {
        toast.success(
          `Talent scores recalculated authoritatively across ${res.recalculated_count ?? "all"} active learners`,
        );
      } else {
        toast.error(res.error || "Failed to recalculate talent scores");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error recalculating talent scores");
    }
  }, []);

  const recalculateStudentScore = useCallback(
    async (_emailOrId?: string) => {
      await recalculateAllScores();
    },
    [recalculateAllScores],
  );

  const submitAssessment = useCallback(
    async (day: number, score: number) => {
      if (state.liveStudentId) {
        const res = await submitLiveAssessment(state.liveStudentId, day, score);
        if (!res.ok) {
          toast.error(res.error || `Failed to submit day ${day} assessment`);
          return;
        }
        setState((s) => {
          const nextAss = { ...s.profile.assessments, [String(day)]: score };
          const nextXp = res.xp !== undefined ? res.xp : s.profile.xp;
          const nextTalentScore =
            res.talent_score !== undefined ? res.talent_score : s.profile.talentScore;
          return {
            ...s,
            profile: {
              ...s.profile,
              assessments: nextAss,
              xp: nextXp,
              talentScore: nextTalentScore,
            },
          };
        });
        toast.success(`Day ${day} Assessment Submitted: ${score}% (+40 XP)`);
      } else {
        setState((s) => ({
          ...s,
          profile: {
            ...s.profile,
            assessments: { ...s.profile.assessments, [String(day)]: score },
            xp: s.profile.xp + 40,
          },
        }));
        toast.success(`Day ${day} Assessment Submitted: ${score}% (+40 XP)`);
      }
    },
    [state.liveStudentId],
  );

  const completeMock = useCallback(
    async (id: string, score: number) => {
      if (state.liveStudentId) {
        const res = await completeLiveMock(state.liveStudentId, id, score);
        if (!res.ok) {
          toast.error(res.error || "Failed to record mock interview");
          return;
        }
        setState((s) => {
          const nextMocks = { ...s.profile.mocks, [id]: score };
          const nextXp = res.xp !== undefined ? res.xp : s.profile.xp;
          const nextTalentScore =
            res.talent_score !== undefined ? res.talent_score : s.profile.talentScore;
          return {
            ...s,
            profile: {
              ...s.profile,
              mocks: nextMocks,
              xp: nextXp,
              talentScore: nextTalentScore,
            },
          };
        });
        toast.success(`Mock Interview Recorded: ${score}% (+50 XP)`);
      } else {
        setState((s) => ({
          ...s,
          profile: {
            ...s.profile,
            mocks: { ...s.profile.mocks, [id]: score },
            xp: s.profile.xp + 50,
          },
        }));
        toast.success(`Mock Interview Recorded: ${score}% (+50 XP)`);
      }
    },
    [state.liveStudentId],
  );

  const issueCertificate = useCallback(
    async (label: string) => {
      if (state.profile.certifications.includes(label)) return;

      if (state.liveStudentId) {
        const res = await issueLiveCertificate(state.liveStudentId, label);
        if (!res.ok) {
          toast.error(res.error || `Failed to issue certificate: ${label}`);
          return;
        }
        setState((s) => {
          const nextCerts = s.profile.certifications.includes(label)
            ? s.profile.certifications
            : [...s.profile.certifications, label];
          const nextXp = res.xp !== undefined ? res.xp : s.profile.xp;
          const nextTalentScore =
            res.talent_score !== undefined ? res.talent_score : s.profile.talentScore;
          return {
            ...s,
            profile: {
              ...s.profile,
              certifications: nextCerts,
              xp: nextXp,
              talentScore: nextTalentScore,
            },
          };
        });
        toast.success(`Certification Issued: ${label} (+100 XP)`);
      } else {
        setState((s) => ({
          ...s,
          profile: {
            ...s.profile,
            certifications: [...s.profile.certifications, label],
            xp: s.profile.xp + 100,
          },
        }));
        toast.success(`Certification Issued: ${label} (+100 XP)`);
      }
    },
    [state.liveStudentId, state.profile.certifications],
  );

  const recordKnowledgeCheck = useCallback(
    async (
      dayNum: number,
      trackId: string,
      topic: string,
      selectedOption: number,
      isCorrect: boolean,
    ): Promise<{ ok: boolean; alreadyAnswered?: boolean; xpAwarded?: boolean }> => {
      const userKey = state.liveStudentId || state.sessionEmail || "anon";
      const qKey = `day_${dayNum}_${trackId}`;
      const storageKey = `santoge_knowledge_check_${userKey}_${qKey}`;

      // Synchronously verify if answer is already locked in storage
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && parsed.isLocked) {
              return { ok: true, alreadyAnswered: true, xpAwarded: false };
            }
          }
        } catch {
          /* ignore */
        }
      }

      if (state.profile.knowledgeChecks?.[qKey]?.isLocked) {
        return { ok: true, alreadyAnswered: true, xpAwarded: false };
      }

      const shouldAwardXp = isCorrect;
      let newXp: number | undefined;
      let newTalentScore: number | undefined;

      if (isCorrect && state.liveStudentId) {
        // Enforce server-side authoritative completion & XP through Supabase flow
        const res = await completeLiveDailyStep(state.liveStudentId, "english");
        if (res.ok) {
          newXp = res.xp;
          newTalentScore = res.talent_score;
        }
      }

      const record: KnowledgeCheckRecord = {
        selectedOption,
        isCorrect,
        isLocked: true,
        xpAwarded: shouldAwardXp,
        submittedAt: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(record));
        } catch {
          /* ignore */
        }
      }

      setState((s) => ({
        ...s,
        profile: {
          ...s.profile,
          knowledgeChecks: {
            ...(s.profile.knowledgeChecks || {}),
            [qKey]: record,
          },
          ...(newXp !== undefined
            ? { xp: newXp }
            : shouldAwardXp && !s.liveStudentId
              ? { xp: s.profile.xp + 15 }
              : {}),
          ...(newTalentScore !== undefined ? { talentScore: newTalentScore } : {}),
        },
      }));

      return { ok: true, alreadyAnswered: false, xpAwarded: shouldAwardXp };
    },
    [state.liveStudentId, state.sessionEmail, state.profile.knowledgeChecks],
  );

  const getKnowledgeCheck = useCallback(
    (dayNum: number, trackId: string): KnowledgeCheckRecord | null => {
      const userKey = state.liveStudentId || state.sessionEmail || "anon";
      const qKey = `day_${dayNum}_${trackId}`;
      const storageKey = `santoge_knowledge_check_${userKey}_${qKey}`;

      if (state.profile.knowledgeChecks?.[qKey]) {
        return state.profile.knowledgeChecks[qKey]!;
      }

      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed.selectedOption === "number") {
              return parsed as KnowledgeCheckRecord;
            }
          }
        } catch {
          /* ignore */
        }
      }

      return null;
    },
    [state.liveStudentId, state.sessionEmail, state.profile.knowledgeChecks],
  );

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
  const isAuthed =
    !!state.sessionEmail &&
    !!state.supabaseSession &&
    (state.role === "admin" || (state.role === "student" && !!state.liveStudentId));

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

  const placementComplete = profile.placementDay >= 90;
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

  const phase1Complete = placementComplete;
  const gateUnlocked = placementComplete && technicalComplete;

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
    recordKnowledgeCheck,
    getKnowledgeCheck,
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
