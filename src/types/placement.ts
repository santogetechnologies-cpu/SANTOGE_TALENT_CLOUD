export interface PlacementWeights {
  videoAttendance: number; // 15%
  englishPractice: number; // 15%
  aptitudePractice: number; // 20%
  reasoningPractice: number; // 15%
  hrPractice: number; // 10%
  speakingPractice: number; // 10%
  consistency: number; // 10%
  dailyStreak: number; // 5%
  assignments: number; // 10%
  overallScore: number;
}

export interface PlacementDaySchedule {
  id: string;
  dayNumber: number;
  date: string;
  theme: string;
  englishTopic: string;
  aptitudeTopic: string;
  reasoningTopic: string;
  hrQuestionPrompt: string;
  speakingPrompt: string;
  isCompleted: boolean;
  scoreEarned?: number;
}

export interface BatchLeaderboardEntry {
  rank: number;
  previousRank: number;
  studentId: string;
  studentName: string;
  avatarUrl: string;
  collegeName: string;
  departmentName: string;
  totalScore: number;
  aptitudeScore: number;
  englishScore: number;
  communicationScore: number;
  streakDays: number;
  improvementDelta: number;
}

export type SmartPromotionStage =
  | 'FOUNDATION'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'INTERVIEW_READY'
  | 'RECRUITER_POOL';

export interface SmartPromotionStatus {
  currentStage: SmartPromotionStage;
  targetStage: SmartPromotionStage;
  progressPercent: number;
  criteriaMet: { name: string; required: number; current: number; isPassed: boolean }[];
  recommendedActions: string[];
}
