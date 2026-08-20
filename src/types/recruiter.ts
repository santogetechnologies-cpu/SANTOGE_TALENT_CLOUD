export type PipelineStage =
  | 'DISCOVERED'
  | 'SHORTLISTED'
  | 'ASSESSMENT'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'OFFER'
  | 'JOINED';

export interface CandidateApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  avatarUrl: string;
  collegeName: string;
  departmentName: string;
  talentScore: number;
  iriScore: number;
  skills: string[];
  cgpa: number;
  stage: PipelineStage;
  appliedDate: string;
  interviewDate?: string;
  interviewRound?: string;
  interviewFeedback?: {
    technicalRating: number; // 1 - 5
    communicationRating: number; // 1 - 5
    notes: string;
    interviewerName: string;
    verdict: 'STRONG_HIRE' | 'HIRE' | 'HOLD' | 'REJECT';
  };
  offerDetails?: {
    ctcLPA: number;
    joiningDate: string;
    status: 'OFFERED' | 'ACCEPTED' | 'DECLINED';
  };
  resumeUrl?: string;
  githubUrl?: string;
  projectsCount?: number;
}

export interface JobPosting {
  id: string;
  recruiterId: string;
  companyName: string;
  companyLogoUrl?: string;
  title: string;
  location: string;
  jobType: 'Full-time' | 'Internship' | 'Remote' | 'Hybrid';
  ctcMinLPA: number;
  ctcMaxLPA: number;
  description: string;
  requiredSkills: string[];
  experienceLevel: 'Freshers (2025/2026)' | '0-1 Years' | '1-3 Years';
  eligibility: {
    minTalentScore: number;
    minIRI: number;
    minCgpa: number;
    targetColleges?: string[];
    targetDepartments?: string[];
  };
  applicantsCount: number;
  shortlistedCount: number;
  hiredCount: number;
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  createdAt: string;
}

export interface RecruiterFilterState {
  searchQuery: string;
  colleges: string[];
  departments: string[];
  skills: string[];
  minTalentScore: number;
  minIRI: number;
  minCgpa: number;
  graduationYears: number[];
  availability: string;
  experienceLevel?: string;
  location?: string;
  minCommunicationScore?: number;
  hasGithubOnly?: boolean;
  minProjects?: number;
}
