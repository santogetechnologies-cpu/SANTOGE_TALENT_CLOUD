export interface SkillScore {
  name: string;
  category: 'technical' | 'communication' | 'aptitude' | 'soft_skills';
  score: number; // 0 - 100
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  verified: boolean;
  lastAssessed: string;
}

export interface IRIBreakdown {
  learningProgress: number; // 15%
  labPerformance: number; // 15%
  assignmentQuality: number; // 15%
  debuggingAbility: number; // 10%
  projectCompletion: number; // 15%
  gitHubActivity: number; // 10%
  consistency: number; // 10%
  mockInterview: number; // 5%
  problemSolving: number; // 5%
  teamChallenges: number; // 5%
  overallIRI: number; // 0 - 100
  trend: 'UP' | 'STABLE' | 'DOWN';
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface TalentScoreBreakdown {
  overallScore: number; // 0 - 1000
  technicalScore: number; // 0 - 1000
  placementScore: number; // 0 - 1000
  communicationScore: number; // 0 - 1000
  aptitudeScore: number; // 0 - 1000
  gitHubScore: number; // 0 - 1000
  consistencyStreak: number; // in days
  totalXP: number;
  unlockedOpportunitiesTier: 'Foundation' | 'ResumeUnlocked' | 'MockInterviewReady' | 'RecruiterVisible' | 'PremiumCompanies' | 'DirectInterviewPool';
  scoreTrend: { month: string; score: number }[];
}

export interface CareerTrack {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  totalModules: number;
  completedModules: number;
  progressPercent: number;
  level: number; // 1 - 5
  skillsCovered: string[];
  specializations: string[];
  activeSpecialization?: string;
  isEnrolled: boolean;
}

export interface DailyMissionTask {
  id: string;
  title: string;
  type: 'LEARNING_CARD' | 'INTERACTIVE_LAB' | 'DEBUG_CHALLENGE' | 'ASSIGNMENT' | 'MINI_PROJECT';
  durationMinutes: number;
  xpReward: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Industry_Grade';
  skillName: string;
  status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
  completedAt?: string;
}

export interface DailyMission {
  id: string;
  date: string;
  dayNumber: number;
  trackId: string;
  trackName: string;
  theme: string;
  tasks: DailyMissionTask[];
  isCompleted: boolean;
  totalXpEarned: number;
}

export type RiskStatus = 'ON_TRACK' | 'PARTIAL' | 'STRUGGLING' | 'INACTIVE';

export interface Student {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  rollNumber: string;
  collegeId: string;
  collegeName: string;
  departmentId: string;
  departmentName: string;
  graduationYear: number;
  cgpa: number;
  batchId: string;
  batchName: string;
  enrolledTracks: string[]; // up to 3
  talentScore: TalentScoreBreakdown;
  iri: IRIBreakdown;
  placementReadiness: {
    status: 'Foundation' | 'Intermediate' | 'Advanced' | 'InterviewReady' | 'RecruiterPool';
    readinessPercent: number;
    eligibleDrivesCount: number;
    offersCount: number;
  };
  skills: SkillScore[];
  riskStatus: RiskStatus;
  streakDays: number;
  githubUsername?: string;
  githubStats?: {
    repos: number;
    commitsThisMonth: number;
    verifiedContributions: number;
    qualityRating: 'A+' | 'A' | 'B' | 'C';
  };
  resumeUrl?: string;
  atsScore?: number;
  attendancePercent: number;
  joinedDate: string;
}
