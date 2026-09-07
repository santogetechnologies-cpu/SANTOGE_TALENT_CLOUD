import type { TrackId } from "./tracks";
import type { ReadinessInputs } from "./app-store";

export type StudentAccount = {
  email: string;
  password: string;
  name: string;
  firstName: string;
  rollNo: string;
  dept: string;
  batchId: string;
  college: string;
  tracks: [TrackId, TrackId, TrackId];
  xp: number;
  streak: number;
  /** demo seed: completed skills per selected track */
  seedOffsets: number[];
  /** current day in the 90-day batch Placement Accelerator */
  placementDay: number;
  readiness: ReadinessInputs;
};

export const STUDENT_ACCOUNTS: StudentAccount[] = [
  {
    email: "ajay@santoge.dev",
    seedOffsets: [7, 4, 2],
    placementDay: 42,
    password: "student1",
    name: "Ajay Kumar",
    firstName: "Ajay",
    rollNo: "ABC22CSE014",
    dept: "CSE",
    batchId: "BATCH-2026-ABC-CSE-01",
    college: "ABC Institute of Technology",
    tracks: ["mern", "cloud", "aiml"],
    xp: 1250,
    streak: 26,
    readiness: { T: 72, C: 88, A: 64, E: 58, R: 40, M: 35 },
  },
  {
    email: "priya@santoge.dev",
    seedOffsets: [9, 6, 3],
    placementDay: 55,
    password: "student2",
    name: "Priya Sharma",
    firstName: "Priya",
    rollNo: "ABC22IT073",
    dept: "IT",
    batchId: "BATCH-2026-ABC-IT-02",
    college: "ABC Institute of Technology",
    tracks: ["java", "datascience", "cyber"],
    xp: 1620,
    streak: 34,
    readiness: { T: 81, C: 76, A: 79, E: 70, R: 55, M: 48 },
  },
  {
    email: "rahul@santoge.dev",
    seedOffsets: [4, 3, 1],
    placementDay: 21,
    password: "student3",
    name: "Rahul Verma",
    firstName: "Rahul",
    rollNo: "XYZ22ECE102",
    dept: "ECE",
    batchId: "BATCH-2026-XYZ-ECE-01",
    college: "XYZ College of Engineering",
    tracks: ["sre", "uiux", "qa"],
    xp: 890,
    streak: 12,
    readiness: { T: 58, C: 66, A: 52, E: 61, R: 34, M: 22 },
  },
  {
    email: "sneha@santoge.dev",
    seedOffsets: [11, 8, 5],
    placementDay: 68,
    password: "student4",
    name: "Sneha Iyer",
    firstName: "Sneha",
    rollNo: "ABC22CSE188",
    dept: "CSE",
    batchId: "BATCH-2026-ABC-CSE-01",
    college: "ABC Institute of Technology",
    tracks: ["mobile", "medical", "marketing"],
    xp: 2040,
    streak: 41,
    readiness: { T: 69, C: 92, A: 71, E: 84, R: 66, M: 59 },
  },
  {
    email: "karthik@santoge.dev",
    seedOffsets: [6, 5, 2],
    placementDay: 37,
    password: "student5",
    name: "Karthik Raj",
    firstName: "Karthik",
    rollNo: "XYZ22ECE045",
    dept: "ECE",
    batchId: "BATCH-2026-XYZ-ECE-01",
    college: "XYZ College of Engineering",
    tracks: ["sap", "hr", "bianalytics"],
    xp: 1410,
    streak: 19,
    readiness: { T: 64, C: 74, A: 68, E: 63, R: 72, M: 44 },
  },
];

export const ADMIN_ACCOUNT = {
  email: "admin@santoge.dev",
  password: "admin",
  name: "Platform Super Admin",
};

export const studentByEmail = (email: string) =>
  STUDENT_ACCOUNTS.find((s) => s.email.toLowerCase() === email.trim().toLowerCase());
