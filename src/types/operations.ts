import { RiskStatus } from './student';

export interface Batch {
  id: string;
  name: string;
  code: string;
  collegeId: string;
  collegeName: string;
  departmentId?: string;
  trackName: string;
  mentorId: string;
  mentorName: string;
  coordinatorId: string;
  coordinatorName: string;
  telegramGroupUrl?: string;
  totalStudents: number;
  activeToday: number;
  averageTalentScore: number;
  averagePlacementReadiness: number;
  attendancePercent: number;
  status: 'ACTIVE' | 'UPCOMING' | 'COMPLETED';
  startDate: string;
  endDate: string;
  riskSummary: {
    onTrackCount: number;
    partialCount: number;
    strugglingCount: number;
    inactiveCount: number;
  };
}

export interface MentorIntervention {
  id: string;
  mentorId: string;
  mentorName: string;
  studentId: string;
  studentName: string;
  batchId: string;
  type: 'ACADEMIC_DOUBT' | 'ATTENDANCE_WARNING' | 'REMEDIAL_PRACTICE' | 'MOCK_FEEDBACK' | 'MOTIVATION_CALL';
  notes: string;
  assignedPracticeTopic?: string;
  scheduledFollowUpDate?: string;
  resolved: boolean;
  createdAt: string;
}

export interface BatchAnnouncement {
  id: string;
  batchId: string;
  authorName: string;
  authorRole: string;
  title: string;
  content: string;
  isPinned: boolean;
  publishedToTelegram: boolean;
  createdAt: string;
}
