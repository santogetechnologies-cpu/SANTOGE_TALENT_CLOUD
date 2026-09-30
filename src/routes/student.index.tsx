import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppStore } from "@/lib/app-store";
import { trackById, type TrackId } from "@/lib/tracks";
import { getAcceleratorDay, type AcceleratorDay } from "@/lib/placement-accelerator-data";
import { getTrackSyllabus } from "@/lib/syllabus-data";
import {
  useLiveStudentProfile,
  useLiveStudentProgress,
  isStudentTrackAssigned,
} from "@/lib/data";
import { DailyHomeScreen } from "@/components/daily-journey/DailyHomeScreen";
import { DailyJourneyRunner } from "@/components/daily-journey/DailyJourneyRunner";
import type { JourneyStepId } from "@/components/daily-journey/JourneyProgressBar";
import { getLessonForDay } from "@/lib/course-curricula";

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Today's Learning — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Authoritative 90-Day Technical Mastery and synchronized Placement Accelerator for career readiness.",
      },
      { property: "og:title", content: "Today's Learning — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content:
          "90-Day specialized technical curriculum and daily placement readiness journey.",
      },
    ],
  }),
  component: TodayLearningPage,
});

function TodayLearningPage() {
  const store = useAppStore();
  const queryClient = useQueryClient();

  // Live Supabase student profile & progress
  const { data: liveProfileData } = useLiveStudentProfile(
    store.supabaseSession?.user?.id,
    !!store.supabaseSession?.user?.id,
  );
  const liveStudentId = liveProfileData?.profile?.id || store.liveStudentId;
  const { data: liveProgressData } = useLiveStudentProgress(
    liveStudentId || undefined,
    !!liveStudentId,
  );

  const syncDailyProgress = store.syncDailyProgress;

  // Authoritative realtime synchronization into store
  useEffect(() => {
    if (liveProgressData) {
      syncDailyProgress(
        liveProgressData.daily,
        liveProgressData.completedTechDays,
        liveProgressData.attendance,
      );
    }
  }, [liveProgressData, syncDailyProgress]);

  // Synchronized cohort placement day (always >= 1)
  const cohortDay = Math.max(
    1,
    liveProfileData?.profile?.placement_day ?? store.placementDay ?? 1,
  );

  const activeTracks: TrackId[] = useMemo(
    () => liveProfileData?.tracks || store.activeTracks,
    [liveProfileData?.tracks, store.activeTracks],
  );

  const streak = liveProfileData?.profile?.streak ?? store.streak;
  const talentScore = liveProfileData?.profile?.talent_score ?? store.talentScore;
  const studentName = liveProfileData?.profile?.name || store.student?.name || "Student";

  const attendance = useMemo(
    () => liveProgressData?.attendance || store.attendance,
    [liveProgressData?.attendance, store.attendance],
  );
  const completedTechDays = useMemo(
    () => liveProgressData?.completedTechDays || store.completedTechDays || [],
    [liveProgressData?.completedTechDays, store.completedTechDays],
  );

  // Highest unlocked technical day
  const maxCompletedTechDay = useMemo(
    () => (completedTechDays.length > 0 ? Math.max(...completedTechDays) : 0),
    [completedTechDays],
  );

  const currentTechnicalDay = useMemo(
    () => Math.min(90, maxCompletedTechDay + 1),
    [maxCompletedTechDay],
  );

  // Allow student to select a day to view/review (defaults to currentTechnicalDay)
  const [selectedDayOverride, setSelectedDayOverride] = useState<number | null>(null);
  const selectedDay = selectedDayOverride ?? currentTechnicalDay;

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const requestedTrack = searchParams.get("track") as TrackId | null;

  const [selectedTrackOverride, setSelectedTrackOverride] = useState<TrackId | null>(null);

  // Active technical track (verified against student's assigned tracks)
  const selectedTrackId: TrackId = useMemo(() => {
    if (selectedTrackOverride && isStudentTrackAssigned(activeTracks, selectedTrackOverride)) {
      return selectedTrackOverride;
    }
    if (requestedTrack && isStudentTrackAssigned(activeTracks, requestedTrack)) {
      return requestedTrack;
    }
    return activeTracks[0] ?? "java";
  }, [selectedTrackOverride, requestedTrack, activeTracks]);

  const primaryTrack = trackById(selectedTrackId);
  const technicalSyllabus = useMemo(() => getTrackSyllabus(selectedTrackId), [selectedTrackId]);

  const handleSelectTrack = (trackId: TrackId) => {
    if (isStudentTrackAssigned(activeTracks, trackId)) {
      setSelectedTrackOverride(trackId);
      const url = new URL(window.location.href);
      url.searchParams.set("track", trackId);
      window.history.replaceState({}, "", url.toString());
      toast.info(`Switched active course to ${trackById(trackId).name}`);
    }
  };

  const weekIdx = Math.floor((selectedDay - 1) / 5);
  const dayInWeekIdx = (selectedDay - 1) % 5;
  const currentWeekPlan = technicalSyllabus.weeks[weekIdx] || technicalSyllabus.weeks[0]!;
  const currentTechDay = currentWeekPlan.days[dayInWeekIdx] || currentWeekPlan.days[0]!;

  // Journey Runner state
  const [journeyConfig, setJourneyConfig] = useState<{
    isActive: boolean;
    mode: "technical" | "placement" | "all";
    dayNum: number;
    initialStep?: JourneyStepId;
  }>({
    isActive: false,
    mode: "technical",
    dayNum: 1,
  });

  const handleCompleteTechnicalLab = async () => {
    const res = await store.completeTechDay(journeyConfig.dayNum);
    if (res?.ok) {
      if (liveStudentId) {
        queryClient.invalidateQueries({
          queryKey: ["live", "student-progress", liveStudentId],
        });
        queryClient.invalidateQueries({
          queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
        });
      }

      // Automatically advance to the next technical day if completed current day
      if (journeyConfig.dayNum >= currentTechnicalDay) {
        setSelectedDayOverride(Math.min(90, journeyConfig.dayNum + 1));
      }
    }
  };

  const handleCompletePlacement = async () => {
    const stepRes = await store.completeDailyStep("practice");
    const dayRes = await store.completePlacementDay(journeyConfig.dayNum);
    if (dayRes?.ok) {
      if (liveStudentId) {
        queryClient.invalidateQueries({
          queryKey: ["live", "student-progress", liveStudentId],
        });
        queryClient.invalidateQueries({
          queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
        });
      }
    }
  };

  const handleStartTechnicalLesson = (stepTypeOrId?: string) => {
    let initialStep: JourneyStepId | undefined;
    if (
      stepTypeOrId === "concept-visual" ||
      stepTypeOrId === "animated-intro" ||
      stepTypeOrId === "tech-visual"
    ) {
      initialStep = "tech-visual";
    } else if (stepTypeOrId === "mini-game" || stepTypeOrId === "tech-minigame") {
      initialStep = "tech-minigame";
    } else if (stepTypeOrId === "knowledge-check" || stepTypeOrId === "tech-check") {
      initialStep = "tech-check";
    } else if (
      stepTypeOrId === "guided-sandbox" ||
      stepTypeOrId === "practical-challenge" ||
      stepTypeOrId === "tech-sandbox"
    ) {
      initialStep = "tech-sandbox";
    } else if (stepTypeOrId === "capstone-project") {
      initialStep = "capstone-project";
    } else if (stepTypeOrId === "final-assessment") {
      initialStep = "final-assessment";
    } else {
      initialStep = "tech-concept";
    }

    setJourneyConfig({
      isActive: true,
      mode: "technical",
      dayNum: selectedDay,
      initialStep,
    });
  };

  const handleStartPlacementDrill = (drillType: "english" | "aptitude" | "logic" | "all") => {
    let initialStep: JourneyStepId = "placement-communication";
    if (drillType === "aptitude") initialStep = "placement-aptitude";
    else if (drillType === "logic") initialStep = "placement-logic";

    setJourneyConfig({
      isActive: true,
      mode: "placement",
      dayNum: cohortDay,
      initialStep,
    });
  };

  if (journeyConfig.isActive) {
    const activeLesson = getLessonForDay(selectedTrackId, journeyConfig.dayNum);
    const activePlacementPlan: AcceleratorDay = getAcceleratorDay(journeyConfig.dayNum, selectedTrackId);
    const isLabDone = completedTechDays.includes(journeyConfig.dayNum);
    const isPlacementComplete = attendance.includes(journeyConfig.dayNum);

    return (
      <DailyJourneyRunner
        dayNum={journeyConfig.dayNum}
        trackId={selectedTrackId}
        trackName={primaryTrack.name}
        trackShort={primaryTrack.short}
        labTitle={primaryTrack.labTitle}
        techTopic={activeLesson?.title || currentTechDay.topic}
        techPractice={activeLesson?.description || currentTechDay.practice}
        weekTheme={activeLesson ? `${activeLesson.phaseName} (Phase ${activeLesson.phase})` : currentWeekPlan.theme}
        workplaceSkill={currentWeekPlan.workplaceSkill}
        placementPlan={activePlacementPlan}
        isLabCompleted={isLabDone}
        isPlacementCompleted={isPlacementComplete}
        streak={streak}
        talentScore={talentScore}
        initialStepOverride={journeyConfig.initialStep}
        mode={journeyConfig.mode}
        onStepChange={(step) => {
          setJourneyConfig((prev) => ({ ...prev, initialStep: step }));
        }}
        onCompleteTechnicalLab={handleCompleteTechnicalLab}
        onCompletePlacement={handleCompletePlacement}
        onExit={() => {
          setJourneyConfig((prev) => ({ ...prev, isActive: false }));
        }}
      />
    );
  }

  return (
    <DailyHomeScreen
      studentName={studentName}
      selectedDay={selectedDay}
      currentTechnicalDay={currentTechnicalDay}
      cohortDay={cohortDay}
      primaryTrack={primaryTrack}
      completedTechDays={completedTechDays}
      attendance={attendance}
      streak={streak}
      talentScore={talentScore}
      assignedTracks={activeTracks}
      onSelectTrack={handleSelectTrack}
      onSelectDay={(day) => setSelectedDayOverride(day)}
      onStartTechnicalLesson={handleStartTechnicalLesson}
      onStartPlacementDrill={handleStartPlacementDrill}
    />
  );
}
