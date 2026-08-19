export type LabSimulatorType =
  | 'PYTHON'
  | 'SQL'
  | 'AWS'
  | 'SAP'
  | 'NETWORKING'
  | 'MEDICAL_CODING';

export interface CodeChallenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  trackName: string;
  timeLimitMinutes: number;
  xp: number;
  description: string;
  starterCode: string;
  solutionCode?: string;
  testCases: { input: string; expectedOutput: string; isHidden?: boolean }[];
  hints: string[];
}

export interface DebugChallenge {
  id: string;
  title: string;
  symptom: string;
  scenario: string;
  brokenCode: string;
  fixedCodeSnippet: string;
  explanationExpected: string;
  xpReward: number;
  category: 'Logic' | 'Syntax' | 'Security' | 'Concurrency' | 'Performance';
}

export interface CodeReviewRubric {
  naming: number; // 0 - 10
  structure: number;
  logic: number;
  comments: number;
  readability: number;
  performance: number;
  security: number;
  bestPractices: number;
  overallScore: number;
  feedback: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  type: 'MINI_PROJECT' | 'INDUSTRY_PROJECT' | 'CAPSTONE';
  trackName: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Enterprise';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED' | 'REVIEWED' | 'VERIFIED';
  skillsGained: string[];
  description: string;
  architectureDiagram?: string;
  estimatedHours: number;
  githubRepo?: string;
  score?: number;
  reviewerNotes?: string;
  reviewRubric?: CodeReviewRubric;
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  category: 'Foundation' | 'Core' | 'Framework' | 'Database' | 'Cloud' | 'DevOps' | 'Security';
  status: 'MASTERED' | 'IN_PROGRESS' | 'UNLOCKED' | 'LOCKED';
  xpPoints: number;
  dependencies: string[]; // node IDs
  description: string;
}

export interface WeeklyHackMission {
  id: string;
  title: string;
  industryProblem: string;
  deadlineHoursRemaining: number;
  prizeXP: number;
  sponsorCompany: string;
  participantsCount: number;
  submissionsCount: number;
  status: 'LIVE' | 'JUDGING' | 'COMPLETED';
}
