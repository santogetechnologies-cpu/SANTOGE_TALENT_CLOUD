import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useState, useMemo } from "react";
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

export const Route = createFileRoute("/student/")({
  head: () => ({
    meta: [
      { title: "Today's Learning — SantoGe Talent Cloud" },
      {
        name: "description",
        content:
          "Unified 20-minute daily learning journey: 10-minute Technical Skill Lab and 10-minute Placement Accelerator drill.",
      },
      { property: "og:title", content: "Today's Learning — SantoGe Talent Cloud" },
      {
        property: "og:description",
        content:
          "20-minute daily routine combining technical mastery and placement readiness.",
      },
    ],
  }),
  component: TodayLearningPage,
});

export function getScoreTier(score: number) {
  if (score >= 850)
    return {
      label: "Elite Tier",
      tone: "emerald" as const,
      desc: "Top 5% · Direct Placement Shortlist",
    };
  if (score >= 700)
    return { label: "Advanced", tone: "cyan" as const, desc: "High Requisition Matching Rate" };
  if (score >= 550)
    return {
      label: "Intermediate",
      tone: "purple" as const,
      desc: "Standard Campus Drive Eligibility",
    };
  return { label: "Foundational", tone: "amber" as const, desc: "Accelerating Core Competency" };
}

function TodayLearningPage() {
  const store = useAppStore();
  const queryClient = useQueryClient();

  const [isJourneyActive, setIsJourneyActive] = useState(false);

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

  const cohortDay = liveProfileData?.profile?.placement_day ?? store.placementDay ?? 1;

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

  // Today's Syllabus Data
  const placementPlan: AcceleratorDay = useMemo(
    () => getAcceleratorDay(cohortDay),
    [cohortDay],
  );
  const weekIdx = Math.floor((cohortDay - 1) / 5);
  const dayInWeekIdx = (cohortDay - 1) % 5;
  const currentWeekPlan = technicalSyllabus.weeks[weekIdx] || technicalSyllabus.weeks[0]!;
  const currentTechDay = currentWeekPlan.days[dayInWeekIdx] || currentWeekPlan.days[0]!;

  const isTechDone = completedTechDays.includes(cohortDay);
  const isPlacementDone = attendance.includes(cohortDay);

  const handleCompleteTechnicalLab = async () => {
    await store.completeTechDay(cohortDay);
    if (liveStudentId) {
      queryClient.invalidateQueries({
        queryKey: ["live", "student-progress", liveStudentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
      });
    }
  };

  const handleRecordVoicePitch = async () => {
    await store.completeDailyStep("practice");
    await store.completePlacementDay(cohortDay);
    if (liveStudentId) {
      queryClient.invalidateQueries({
        queryKey: ["live", "student-progress", liveStudentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["live", "student-profile", store.supabaseSession?.user?.id],
      });
    }
  };

  if (isJourneyActive) {
    return (
      <DailyJourneyRunner
        dayNum={cohortDay}
        trackId={selectedTrackId}
        trackName={primaryTrack.name}
        trackShort={primaryTrack.short}
        labTitle={primaryTrack.labTitle}
        techTopic={currentTechDay.topic}
        techPractice={currentTechDay.practice}
        weekTheme={currentWeekPlan.theme}
        workplaceSkill={currentWeekPlan.workplaceSkill}
        placementPlan={placementPlan}
        isLabCompleted={isTechDone}
        isPlacementCompleted={isPlacementDone}
        streak={streak}
        talentScore={talentScore}
        onCompleteTechnicalLab={handleCompleteTechnicalLab}
        onRecordVoicePitch={handleRecordVoicePitch}
        onExit={() => setIsJourneyActive(false)}
      />
    );
  }

  return (
    <DailyHomeScreen
      studentName={studentName}
      cohortDay={cohortDay}
      primaryTrack={primaryTrack}
      techTopic={currentTechDay.topic}
      techPractice={currentTechDay.practice}
      weekTheme={currentWeekPlan.theme}
      placementPlan={placementPlan}
      isTechDone={isTechDone}
      isPlacementDone={isPlacementDone}
      streak={streak}
      talentScore={talentScore}
      assignedTracks={activeTracks}
      onSelectTrack={handleSelectTrack}
      onStartJourney={() => setIsJourneyActive(true)}
    />
  );
}
