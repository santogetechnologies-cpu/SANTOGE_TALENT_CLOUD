import { TRACKS, trackById, type TrackId } from "./tracks";

export type Skill = { id: string; name: string };
export type Module = { id: string; name: string; skills: Skill[] };

/** Individual technical curriculum — built per track, never per batch. */
export function modulesFor(trackId: TrackId): Module[] {
  const t = trackById(trackId);
  const keywords = t.tagline
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  const mk = (mi: number, name: string, skills: string[]): Module => ({
    id: `${trackId}-m${mi}`,
    name,
    skills: skills.map((s, si) => ({ id: `${trackId}-m${mi}-s${si}`, name: s })),
  });
  return [
    mk(
      1,
      "Foundations",
      keywords.slice(0, 3).map((k) => `${k} fundamentals`),
    ),
    mk(2, "Sandbox practice", [
      "Guided sandbox drill",
      "Debugging challenge",
      `${t.labTitle} walkthrough`,
    ]),
    mk(3, "Applied build", [
      "Project scaffold",
      "Feature implementation",
      "Code review & refactor",
    ]),
    mk(4, "Competency evidence", [
      `${t.labTitle} validation`,
      "Practical task submission",
      "Competency interview",
    ]),
  ];
}

export const skillsFor = (trackId: TrackId): Skill[] =>
  modulesFor(trackId).flatMap((m) => m.skills);

export const trackProgress = (trackId: TrackId, done: string[]) => {
  const all = skillsFor(trackId);
  const hit = all.filter((s) => done.includes(s.id)).length;
  return Math.round((hit / Math.max(all.length, 1)) * 100);
};

export const nextSkill = (trackId: TrackId, done: string[]) =>
  skillsFor(trackId).find((s) => !done.includes(s.id)) ?? null;

/** Deterministic seed so each demo student starts mid-journey. */
export function seedSkills(tracks: TrackId[], offsets: number[] = [7, 4, 2]) {
  const out: string[] = [];
  tracks.forEach((t, i) => {
    out.push(
      ...skillsFor(t)
        .slice(0, offsets[i] ?? 1)
        .map((s) => s.id),
    );
  });
  return out;
}

/* ---------- Placement Accelerator (batch-synchronised) ---------- */

const ENGLISH = [
  "Corporate email etiquette",
  "Group discussion openers",
  "Telephone & video call clarity",
  "Describing your project in 90 seconds",
  "Tenses under pressure",
  "Vocabulary for interviews",
  "Handling behavioural questions",
];
const APTITUDE = [
  "Time, speed & distance",
  "Percentages & profit-loss",
  "Ratio & proportion",
  "Number series",
  "Blood relations & seating",
  "Probability basics",
  "Data interpretation",
];
const PRACTICE = [
  "5 MCQ + 2 logic + voice pitch",
  "Mock GD round",
  "Rapid-fire quant sprint",
  "Peer speaking drill",
];

export type PlacementDay = {
  day: number;
  week: number;
  weekday: string;
  english: string;
  aptitude: string;
  practice: string;
  milestone: string | null;
  assessment: boolean;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function placementDay(day: number): PlacementDay {
  const idx = day - 1;
  const weekday = WEEKDAYS[idx % 7] ?? "Mon";
  const milestone =
    day === 30
      ? "Foundation Assessment"
      : day === 60
        ? "Application Assessment"
        : day === 90
          ? "Final Placement Readiness Assessment"
          : null;
  return {
    day,
    week: Math.floor(idx / 7) + 1,
    weekday,
    english: `English ${String(day).padStart(2, "0")} · ${ENGLISH[idx % ENGLISH.length]}`,
    aptitude: `Aptitude ${String(day).padStart(2, "0")} · ${APTITUDE[idx % APTITUDE.length]}`,
    practice: PRACTICE[idx % PRACTICE.length]!,
    milestone,
    assessment: weekday === "Fri" || milestone !== null,
  };
}

export const PLACEMENT_DAYS = Array.from({ length: 90 }, (_, i) => placementDay(i + 1));

/* ---------- Batch leaderboard (placement only) ---------- */

export type LeaderRow = {
  name: string;
  attendance: number;
  english: number;
  aptitude: number;
  communication: number;
  improvement: number;
};

const NAMES = [
  "Ajay Kumar",
  "Sneha Iyer",
  "Divya Menon",
  "Arun Prasad",
  "Kiran Babu",
  "Meera Nair",
  "Vikram S",
  "Harish R",
  "Lakshmi P",
  "Naveen Kumar",
  "Fathima A",
  "Sandeep V",
];

const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 9973, 7);

export function leaderboard(batchId: string, includeName?: string): LeaderRow[] {
  const names =
    includeName && !NAMES.includes(includeName) ? [includeName, ...NAMES.slice(0, 11)] : NAMES;
  return names.map((name) => {
    const h = hash(name + batchId);
    return {
      name,
      attendance: 70 + (h % 30),
      english: 55 + (h % 45),
      aptitude: 50 + ((h * 3) % 50),
      communication: 58 + ((h * 7) % 42),
      improvement: 4 + ((h * 5) % 26),
    };
  });
}

export const TRACK_DISTRIBUTION = (total: number) => {
  const shares = [20, 30, 25, 40, 35, 30, 25, 20, 20, 25, 10, 8, 6, 4, 2];
  const sum = shares.reduce((a, b) => a + b, 0);
  return TRACKS.map((t, i) => ({
    track: t,
    students: Math.max(1, Math.round((shares[i]! / sum) * total)),
  }));
};
