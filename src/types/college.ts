export interface Department {
  id: string;
  code: string;
  name: string;
  coordinatorId: string;
  coordinatorName: string;
  coordinatorEmail: string;
  totalStudents: number;
  placedStudents: number;
  placementRate: number;
  averageTalentScore: number;
  averagePackageLPA: number;
}

export interface College {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  logoUrl?: string;
  totalStudents: number;
  placedCount: number;
  placementPercentage: number;
  averagePackageLPA: number;
  highestPackageLPA: number;
  companiesVisitedCount: number;
  offersGeneratedCount: number;
  departments: Department[];
  subscriptionStatus: 'ACTIVE' | 'PENDING' | 'EXPIRED';
  adminName: string;
  adminEmail: string;
  placementOfficerName: string;
  placementOfficerEmail: string;
  createdAt: string;
}

export interface CampusDrive {
  id: string;
  collegeId: string;
  companyName: string;
  companyLogoUrl?: string;
  roleTitle: string;
  jobType: 'Full-time' | 'Internship' | 'Intern + PPO';
  ctcLPA: number;
  location: string;
  driveDate: string;
  registrationDeadline: string;
  status: 'UPCOMING' | 'REGISTRATION_OPEN' | 'SHORTLISTING' | 'INTERVIEWING' | 'COMPLETED';
  eligibility: {
    minTalentScore: number;
    minIRI: number;
    minCgpa: number;
    allowedDepartments: string[];
    maxBacklogs: number;
  };
  stats: {
    registeredCount: number;
    shortlistedCount: number;
    interviewedCount: number;
    selectedCount: number;
    offersReleasedCount: number;
  };
  rounds: {
    name: string;
    type: 'ONLINE_TEST' | 'TECHNICAL_INTERVIEW' | 'HR_INTERVIEW' | 'GROUP_DISCUSSION';
    date: string;
    completed: boolean;
  }[];
}

export interface CompanyCRMRecord {
  id: string;
  collegeId: string;
  name: string;
  industry: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  lastVisitedYear: number;
  averageOffers: number;
  averageCtcLPA: number;
  relationshipStatus: 'ACTIVE_PARTNER' | 'IN_DISCUSSION' | 'TARGET_OUTREACH' | 'DORMANT';
  targetDepartments: string[];
  notes: string[];
  followUpDate?: string;
  interactionLogs: {
    id: string;
    date: string;
    officerName: string;
    channel: 'Email' | 'Phone' | 'Meeting' | 'Campus Visit';
    summary: string;
  }[];
}

export interface MarketSkillTrend {
  skillName: string;
  demandGrowthPercent: number;
  averageSalaryLPA: number;
  topHiringSectors: string[];
  openingsCount: number;
  relevanceScore: number;
}
