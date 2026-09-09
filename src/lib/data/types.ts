/**
 * SantoGe Talent Cloud — Database & Data Service TypeScript Types
 */

import type { TrackId } from "@/lib/tracks";

export type DbInstitution = {
  id: string;
  name: string;
  code: string;
  status: "active" | "inactive" | "archived";
  created_at: string;
  updated_at: string;
};

export type DbBatch = {
  id: string;
  institution_id: string | null;
  name: string;
  capacity: number;
  dept: string;
  status: "active" | "completed" | "archived";
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
  // Computed client-side or joined
  enrolled_count?: number;
};

export type DbUserRole = {
  id: string;
  auth_user_id: string;
  role: "student" | "admin";
  created_at: string;
};

export type DbStudentProfile = {
  id: string;
  auth_user_id: string;
  institution_id: string | null;
  batch_id: string | null;
  name: string;
  email: string;
  roll_no: string | null;
  dept: string;
  college: string;
  status: "active" | "suspended" | "deleted";
  xp: number;
  streak: number;
  placement_day: number;
  talent_score: number;
  readiness_t: number;
  readiness_c: number;
  readiness_a: number;
  readiness_e: number;
  readiness_r: number;
  readiness_m: number;
  created_at: string;
  updated_at: string;
};

export type DbStudentTrack = {
  id: string;
  student_id: string;
  track_id: TrackId;
  position: number;
  created_at: string;
  updated_at: string;
};

export type DbCurriculumTrack = {
  id: TrackId;
  name: string;
  short_name: string;
  category: string;
  total_skills: number;
  accent: string | null;
  created_at: string;
  updated_at: string;
};

export type DbCurriculumSkill = {
  id: string;
  track_id: TrackId;
  title: string;
  day: number;
  type: "video" | "lab" | "quiz" | "project";
  status: "published" | "draft" | "archived";
  created_at: string;
  updated_at: string;
};

export type DbSkillCompletion = {
  id: string;
  student_id: string;
  skill_id: string;
  track_id: string;
  completed_at: string;
};

export type DbLabCompletion = {
  id: string;
  student_id: string;
  lab_id: string;
  label: string;
  completed_at: string;
};

export type DbDailyProgress = {
  id: string;
  student_id: string;
  date: string;
  english_completed: boolean;
  aptitude_completed: boolean;
  practice_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type DbPlacementAttendance = {
  id: string;
  student_id: string;
  day: number;
  completed_at: string;
};

export type DbTechnicalDay = {
  id: string;
  student_id: string;
  day: number;
  completed_at: string;
};

export type DbAssessment = {
  id: string;
  student_id: string;
  day: number;
  score: number;
  submitted_at: string;
};

export type DbMockInterview = {
  id: string;
  student_id: string;
  mock_id: string;
  score: number;
  feedback_summary: string | null;
  completed_at: string;
};

export type DbCertification = {
  id: string;
  student_id: string;
  label: string;
  issued_at: string;
};

export type DbHiringDrive = {
  id: string;
  company: string;
  roles: string;
  ctc: string;
  min_score: number;
  open_slots: number;
  status: "Active Drive" | "Shortlisting" | "Interviews Live" | "Closed";
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type DbPlacement = {
  id: string;
  student_id: string;
  company_name: string;
  offer_date: string;
  package_lpa: number;
  status: "offered" | "accepted" | "declined";
  created_at: string;
  updated_at: string;
};

export type DbContentItem = {
  id: string;
  title: string;
  kind: "English video" | "Aptitude video" | "Guided practice" | "Lab brief";
  track: string;
  duration: string;
  status: "published" | "draft" | "scheduled";
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type DbPlatformSettings = {
  id: string;
  key: string;
  value: {
    completionRule?: "all-tracks" | "primary-plus-minimum";
    secondaryMinimum?: number;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
};

export type ReadinessInputs = {
  T: number;
  C: number;
  A: number;
  E: number;
  R: number;
  M: number;
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
