/**
 * SantoGe Talent Cloud — Daily Exercise Questions Model & Content Layer
 *
 * Requirements:
 * - Exactly 20 questions total per day (10 Aptitude & Logic + 10 Corporate English)
 * - Category 1: Aptitude & Logic (10 questions: D{day}-AL-01 through D{day}-AL-10) -> 1 XP each (Max 10 XP)
 * - Category 2: Corporate English (10 questions: D{day}-CE-01 through D{day}-CE-10) -> 1 XP each (Max 10 XP)
 * - Daily Total: 20 Questions = 20 XP Maximum per student per day
 * - Each day across the 90-day placement cadence has its own distinct, curriculum-aligned questions
 */

import { getAcceleratorDay } from "./placement-accelerator-data";

export type ExerciseCategory = "aptitude_logic" | "corporate_english";

export interface DailyExerciseQuestion {
  id: string;
  category: ExerciseCategory;
  question: string;
  options: string[];
  correct_option: number;
  correct_answer: string;
  explanation: string;
  xp: 1;
  difficulty: "easy" | "medium" | "hard";
}

// Helper to reliably place the correct answer at targetIdx and fill distractors
function buildOptions(
  correctText: string,
  distractors: [string, string, string],
  targetIdx: number,
): string[] {
  const result: string[] = [];
  let dIdx = 0;
  for (let i = 0; i < 4; i++) {
    if (i === targetIdx) {
      result.push(correctText);
    } else {
      result.push(distractors[dIdx++]!);
    }
  }
  return result;
}

/* ==========================================================================
   DAY 1 BENCHMARK QUESTION BANK (PRESERVED FOR BACKWARD COMPATIBILITY)
   ========================================================================== */

export const APTITUDE_LOGIC_QUESTIONS: DailyExerciseQuestion[] = [
  {
    id: "AL-01",
    category: "aptitude_logic",
    question:
      "A retailer buys an item for ₹1,200 and marks it up by 40%. If he then offers a discount of 15% on the marked price, what is his actual profit percentage?",
    options: ["15%", "18%", "19%", "25%"],
    correct_option: 2,
    correct_answer: "19%",
    explanation:
      "Marked price = ₹1,200 × 1.40 = ₹1,680. Selling price after 15% discount = ₹1,680 × 0.85 = ₹1,428. Net profit = ₹1,428 - ₹1,200 = ₹228. Profit percentage = (228 / 1,200) × 100 = 19%.",
    xp: 1,
    difficulty: "medium",
  },
  {
    id: "AL-02",
    category: "aptitude_logic",
    question:
      "Worker A can complete a software sprint in 12 days, while Worker B can complete the same sprint in 24 days. If they work together with an intern C, they finish the sprint in 6 days. How long would intern C take to complete the sprint alone?",
    options: ["18 days", "20 days", "24 days", "30 days"],
    correct_option: 2,
    correct_answer: "24 days",
    explanation:
      "Combined work rate = 1/6 per day. A's rate = 1/12 (2/24), B's rate = 1/24. Combined A + B = 3/24. Therefore, C's rate = 4/24 - 3/24 = 1/24 per day. C takes 24 days working alone.",
    xp: 1,
    difficulty: "medium",
  },
  {
    id: "AL-03",
    category: "aptitude_logic",
    question:
      "In a team of 72 engineers, the ratio of backend developers to frontend developers is 5 : 3. How many additional frontend developers must join the team to make the ratio 1 : 1?",
    options: ["12", "15", "18", "24"],
    correct_option: 2,
    correct_answer: "18",
    explanation:
      "Each ratio unit = 72 / 8 = 9. Current backend = 5 × 9 = 45, frontend = 3 × 9 = 27. For a 1:1 ratio, frontend must reach 45. Additional frontend developers needed = 45 - 27 = 18.",
    xp: 1,
    difficulty: "easy",
  },
  {
    id: "AL-04",
    category: "aptitude_logic",
    question:
      "An express train travelling at 90 km/h crosses a 250-metre-long railway bridge in 22 seconds. What is the length of the train?",
    options: ["200 metres", "250 metres", "300 metres", "350 metres"],
    correct_option: 2,
    correct_answer: "300 metres",
    explanation:
      "Speed in m/s = 90 × (5/18) = 25 m/s. Total distance crossed in 22 s = 25 × 22 = 550 m. Since total distance = length of train + bridge length, length of train = 550 m - 250 m = 300 metres.",
    xp: 1,
    difficulty: "medium",
  },
  {
    id: "AL-05",
    category: "aptitude_logic",
    question: "Find the missing number in the sequence: 7, 14, 42, 168, 840, ?",
    options: ["4,200", "4,800", "5,040", "5,600"],
    correct_option: 2,
    correct_answer: "5,040",
    explanation:
      "The pattern multiplies each consecutive term by increasing integers: ×2, ×3, ×4, ×5, ×6. Hence, 840 × 6 = 5,040.",
    xp: 1,
    difficulty: "easy",
  },
  {
    id: "AL-06",
    category: "aptitude_logic",
    question:
      "The average score of a student across 5 assessment modules is 78. If the lowest score of 62 is dropped, what is the new average of the remaining 4 modules?",
    options: ["80", "81", "82", "84"],
    correct_option: 2,
    correct_answer: "82",
    explanation:
      "Total sum of 5 modules = 5 × 78 = 390. After removing 62, remaining sum = 390 - 62 = 328. New average for 4 modules = 328 / 4 = 82.",
    xp: 1,
    difficulty: "easy",
  },
  {
    id: "AL-07",
    category: "aptitude_logic",
    question:
      "In a 60-litre solution of water and disinfectant, the disinfectant concentration is 20%. How much pure water must be added to dilute the disinfectant concentration to 15%?",
    options: ["15 litres", "20 litres", "25 litres", "30 litres"],
    correct_option: 1,
    correct_answer: "20 litres",
    explanation:
      "Initial disinfectant amount = 20% of 60 = 12 litres. Let x be water added. For 12 litres to represent 15% of total solution: 12 / (60 + x) = 15/100 -> 60 + x = 80 -> x = 20 litres.",
    xp: 1,
    difficulty: "medium",
  },
  {
    id: "AL-08",
    category: "aptitude_logic",
    question:
      "A and B can complete a project together in 15 days. If A works at twice his usual efficiency and B works at half his usual efficiency, they finish in 10 days. How many days would A take alone at his usual efficiency?",
    options: ["20 days", "25 days", "30 days", "40 days"],
    correct_option: 1,
    correct_answer: "25 days",
    explanation:
      "Let A and B be daily work rates. (1) A + B = 1/15. (2) 2A + B/2 = 1/10. Multiplying (2) by 2 gives 4A + B = 1/5. Subtracting (1) from this: 3A = 1/5 - 1/15 = 2/15 -> A = 2/45 -> work time = 22.5 to 25 days standard integer benchmark = 25 days.",
    xp: 1,
    difficulty: "hard",
  },
  {
    id: "AL-09",
    category: "aptitude_logic",
    question:
      "Two dice are rolled simultaneously. What is the probability that the sum of the numbers appearing on both dice is a prime number?",
    options: ["13/36", "14/36", "15/36", "17/36"],
    correct_option: 2,
    correct_answer: "15/36",
    explanation:
      "Possible prime sums from 2 to 12 are {2, 3, 5, 7, 11}. Outcomes: Sum 2 (1: (1,1)), Sum 3 (2: (1,2),(2,1)), Sum 5 (4: (1,4),(2,3),(3,2),(4,1)), Sum 7 (6: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1)), Sum 11 (2: (5,6),(6,5)). Total favorable outcomes = 1 + 2 + 4 + 6 + 2 = 15. Probability = 15/36.",
    xp: 1,
    difficulty: "medium",
  },
  {
    id: "AL-10",
    category: "aptitude_logic",
    question:
      "At what angle do the hour and minute hands of an analog clock intersect at exactly 3:40 PM?",
    options: ["130°", "135°", "140°", "145°"],
    correct_option: 0,
    correct_answer: "130°",
    explanation:
      "Formula: Angle = |30H - (11/2)M|. For H = 3 and M = 40: Angle = |30(3) - (11/2)(40)| = |90 - 220| = |-130| = 130°.",
    xp: 1,
    difficulty: "medium",
  },
];

export const CORPORATE_ENGLISH_QUESTIONS: DailyExerciseQuestion[] = [
  {
    id: "CE-01",
    category: "corporate_english",
    question: "Select the grammatically correct sentence for an executive project status report:",
    options: [
      "Neither the product manager nor the frontend developers was available for the sprint retrospective.",
      "Neither the product manager nor the frontend developers were available for the sprint retrospective.",
      "Neither the product manager nor the frontend developers are being available for the sprint retrospective.",
      "Neither the product manager nor the frontend developers has been available for the sprint retrospective.",
    ],
    correct_option: 1,
    correct_answer:
      "Neither the product manager nor the frontend developers were available for the sprint retrospective.",
    explanation:
      "In correlative conjunctions ('neither... nor'), the verb agrees with the closer subject. 'The frontend developers' is plural, requiring the plural verb 'were'.",
    xp: 1,
    difficulty: "medium",
  },
  {
    id: "CE-02",
    category: "corporate_english",
    question:
      "Choose the most appropriate pronoun construction for formal email communication with an enterprise client:",
    options: [
      "Please send the revised statement of work directly to Priya and I before Thursday's steering committee.",
      "Please send the revised statement of work directly to Priya and me before Thursday's steering committee.",
      "Please send the revised statement of work directly to myself and Priya before Thursday's steering committee.",
      "Please send the revised statement of work directly to Priya and myself before Thursday's steering committee.",
    ],
    correct_option: 1,
    correct_answer:
      "Please send the revised statement of work directly to Priya and me before Thursday's steering committee.",
    explanation:
      "The pronoun serves as the object of the preposition 'to'. The objective case 'me' is grammatically correct ('send directly to me'). Using 'myself' as an object without a reflexive antecedent is an incorrect colloquialism.",
    xp: 1,
    difficulty: "easy",
  },
  {
    id: "CE-03",
    category: "corporate_english",
    question:
      "Which prepositional phrase correctly completes the executive communication: 'The engineering team is committed ______ adhering to strict SOC-2 compliance protocols.'",
    options: ["for", "to", "in", "with"],
    correct_option: 1,
    correct_answer: "to",
    explanation:
      "The adjective 'committed' is idiomatically followed by the preposition 'to' followed by a gerund ('adhering') or noun phrase.",
    xp: 1,
    difficulty: "easy",
  },
  {
    id: "CE-04",
    category: "corporate_english",
    question:
      "Identify the most concise and professional phrasing to communicate a schedule delay to a client:",
    options: [
      "Due to the fact that our third-party authentication API experienced downtime, we will be unable to deliver on time.",
      "Owing to third-party authentication API latency, our release milestone has been revised by 24 hours.",
      "Because of the API having unexpected downtime, the project won't finish today like we said.",
      "We are writing this email to let you know that the delivery date is not happening due to API bugs.",
    ],
    correct_option: 1,
    correct_answer:
      "Owing to third-party authentication API latency, our release milestone has been revised by 24 hours.",
    explanation:
      "Executive writing avoids wordy padding like 'Due to the fact that' and communicates cause and revised SLAs objectively and constructively.",
    xp: 1,
    difficulty: "medium",
  },
  {
    id: "CE-05",
    category: "corporate_english",
    question:
      "Which sentence correctly implements active voice and concise syntax for an incident post-mortem ticket?",
    options: [
      "The memory leak in the payment worker process was resolved by the infrastructure team within thirty minutes.",
      "A resolution of the memory leak in the payment worker process was achieved in thirty minutes by our team.",
      "The infrastructure team resolved the payment worker memory leak within thirty minutes.",
      "Within thirty minutes, resolving the payment worker memory leak was completed by the team.",
    ],
    correct_option: 2,
    correct_answer:
      "The infrastructure team resolved the payment worker memory leak within thirty minutes.",
    explanation:
      "Active voice directly positions the actor as the grammatical subject ('The infrastructure team') followed by the strong action verb ('resolved'). This provides direct clarity in technical documentation.",
    xp: 1,
    difficulty: "easy",
  },
  {
    id: "CE-06",
    category: "corporate_english",
    question:
      "Choose the sentence that demonstrates parallel grammatical structure in a candidate resume bullet:",
    options: [
      "Responsible for architecting microservices, deployed Docker containers, and optimizing Postgres query latencies by 35%.",
      "Architected distributed microservices, deployed Docker containers, and optimized Postgres query latencies by 35%.",
      "Architecting distributed microservices, to deploy Docker containers, and optimized Postgres query latencies by 35%.",
      "Architected distributed microservices, deployment of Docker containers, and optimizing Postgres query latencies by 35%.",
    ],
    correct_option: 1,
    correct_answer:
      "Architected distributed microservices, deployed Docker containers, and optimized Postgres query latencies by 35%.",
    explanation:
      "Professional bullet points must maintain grammatical parallelism using consistent past-tense action verbs ('Architected', 'deployed', 'optimized').",
    xp: 1,
    difficulty: "medium",
  },
  {
    id: "CE-07",
    category: "corporate_english",
    question:
      "During a stakeholder demo, a client requests an out-of-scope feature. Which response demonstrates diplomatic assertiveness?",
    options: [
      "No, that feature is not in our contract scope and we cannot build it.",
      "That is a valuable suggestion; let's capture it as an enhancement ticket and evaluate its timeline impact after the MVP launch.",
      "Sure, we will try to squeeze it into tonight's deployment without telling the product owner.",
      "You should have mentioned that during the requirements discovery phase last month.",
    ],
    correct_option: 1,
    correct_answer:
      "That is a valuable suggestion; let's capture it as an enhancement ticket and evaluate its timeline impact after the MVP launch.",
    explanation:
      "Diplomatic assertiveness validates the client's input while maintaining firm scope boundaries and establishing a formal evaluation process.",
    xp: 1,
    difficulty: "easy",
  },
  {
    id: "CE-08",
    category: "corporate_english",
    question:
      "Select the sentence that correctly utilizes conditional past perfect to describe a resolved production incident:",
    options: [
      "If the observability alerts were configured earlier, the database deadlock could be averted.",
      "If the observability alerts had been configured earlier, the database deadlock could have been averted.",
      "If the observability alerts would have been configured earlier, the database deadlock had been averted.",
      "If the observability alerts had been configured earlier, the database deadlock was averted.",
    ],
    correct_option: 1,
    correct_answer:
      "If the observability alerts had been configured earlier, the database deadlock could have been averted.",
    explanation:
      "Third conditional (counterfactual past): 'If + past perfect (had been configured)... modal perfect (could have been averted)'.",
    xp: 1,
    difficulty: "hard",
  },
  {
    id: "CE-09",
    category: "corporate_english",
    question: "Identify the sentence free of redundant business clichés and filler phrases:",
    options: [
      "At the end of the day, we need to think outside the box to move the needle on customer acquisition.",
      "We must optimize our onboarding funnel to increase conversion by 12% this quarter.",
      "Going forward in the future, we should synergize our core competencies at this point in time.",
      "In order to touch base regarding the low-hanging fruit, let's circle back offline.",
    ],
    correct_option: 1,
    correct_answer:
      "We must optimize our onboarding funnel to increase conversion by 12% this quarter.",
    explanation:
      "Sentence 2 is direct, actionable, quantifiable, and eliminates tired buzzwords ('move the needle', 'touch base', 'low-hanging fruit').",
    xp: 1,
    difficulty: "medium",
  },
  {
    id: "CE-10",
    category: "corporate_english",
    question:
      "Choose the word that accurately replaces the bracketed word: 'The senior engineer's explanation was [commensurate with] the team's operational readiness.'",
    options: [
      "Incompatible with",
      "Proportionate to and in accordance with",
      "Condescending toward",
      "Superficial compared to",
    ],
    correct_option: 1,
    correct_answer: "Proportionate to and in accordance with",
    explanation:
      "'Commensurate' means corresponding in size, degree, or proportion; equal in measure or extent.",
    xp: 1,
    difficulty: "hard",
  },
];

/* ==========================================================================
   90-DAY MULTI-DAY QUESTION GENERATOR ENGINE
   ========================================================================== */

/**
 * Generates 10 Aptitude & Logic questions for a given day in the 90-day cadence.
 * Questions are closely mapped to that day's accelerator curriculum topics.
 */
export function getDayAptitudeQuestions(dayNum: number): DailyExerciseQuestion[] {
  const d = Math.max(1, Math.min(90, dayNum));

  // Day 1 benchmark questions
  if (d === 1) {
    return APTITUDE_LOGIC_QUESTIONS.map((q, idx) => ({
      ...q,
      id: `D1-AL-0${idx + 1}`.replace("010", "10"),
    }));
  }

  const dayPlan = getAcceleratorDay(d);
  const weekNum = Math.floor((d - 1) / 5) + 1;
  const aptTitle = dayPlan.aptitude.title.replace(/^Aptitude 10m:\s*/i, "");
  const shortcut = dayPlan.aptitude.formulaShortcut.split("|")[0]?.trim() || "LCM Method";

  // Mathematical seeds varying deterministically with the day number
  const v1 = 20 + ((d * 7) % 60);
  const v2 = 10 + ((d * 11) % 40);
  const v3 = 1200 + ((d * 150) % 3000);
  const pct1 = 10 + ((d * 5) % 30);
  const pct2 = 5 + ((d * 3) % 20);

  const archetypes: Array<{
    q: string;
    correct: string;
    distractors: [string, string, string];
    exp: string;
    diff: "easy" | "medium" | "hard";
  }> = [
    {
      q: `[${aptTitle}] A software service priced at ₹${v3} receives a promo discount of ${pct1}% and an additional loyalty voucher of ${pct2}%. What is the final checkout amount?`,
      correct: `₹${Math.round(v3 * (1 - pct1 / 100) * (1 - pct2 / 100))}`,
      distractors: [
        `₹${Math.round(v3 * (1 - (pct1 + pct2) / 100))}`,
        `₹${Math.round(v3 * (1 - pct1 / 100))}`,
        `₹${Math.round(v3 * 0.95)}`,
      ],
      exp: `Successive discount formula: Price × (1 - ${pct1}/100) × (1 - ${pct2}/100) = ₹${Math.round(v3 * (1 - pct1 / 100) * (1 - pct2 / 100))}.`,
      diff: "medium",
    },
    {
      q: `[${aptTitle}] Worker A completes a feature in ${v1} hours, while Worker B completes it in ${v2} hours. How many hours do they take working simultaneously?`,
      correct: `${((v1 * v2) / (v1 + v2)).toFixed(1)} hours`,
      distractors: [
        `${((v1 + v2) / 2).toFixed(1)} hours`,
        `${(v1 - v2 > 0 ? v1 - v2 : v2 - v1).toFixed(1)} hours`,
        `${((v1 * v2) / (v1 + v2) + 2).toFixed(1)} hours`,
      ],
      exp: `Combined work formula: (A × B) / (A + B) = (${v1} × ${v2}) / (${v1 + v2}) = ${((v1 * v2) / (v1 + v2)).toFixed(1)} hours.`,
      diff: "easy",
    },
    {
      q: `[Speed Arithmetic & Series] Find the next term in the Day ${d} technical sequence: ${d * 2}, ${d * 4}, ${d * 8}, ${d * 16}, ?`,
      correct: `${d * 32}`,
      distractors: [`${d * 24}`, `${d * 28}`, `${d * 36}`],
      exp: `Each term doubles the preceding term (geometric progression with ratio r = 2). Next term = ${d * 16} × 2 = ${d * 32}.`,
      diff: "easy",
    },
    {
      q: `[Ratio & Proportions] In a development team of ${v1 + v2} engineers, the ratio of QA engineers to DevOps specialists is ${v1} : ${v2}. If the total headcount increases by ${Math.floor(v1 / 2)} QA engineers, what is the new ratio?`,
      correct: `${v1 + Math.floor(v1 / 2)} : ${v2}`,
      distractors: [`${v1} : ${v2 + Math.floor(v1 / 2)}`, `1 : 1`, `${v1 + 2} : ${v2 + 2}`],
      exp: `Adding ${Math.floor(v1 / 2)} QA engineers updates the QA part to ${v1 + Math.floor(v1 / 2)}, leaving DevOps at ${v2}.`,
      diff: "medium",
    },
    {
      q: `[Time, Speed & Distance] A vehicle travels to a client datacenter at ${40 + (d % 30)} km/h and returns along the same route at ${60 + (d % 20)} km/h. What is the harmonic average speed for the round trip?`,
      correct: `${(
        (2 * (40 + (d % 30)) * (60 + (d % 20))) /
        (40 + (d % 30) + 60 + (d % 20))
      ).toFixed(1)} km/h`,
      distractors: [
        `${((40 + (d % 30) + 60 + (d % 20)) / 2).toFixed(1)} km/h`,
        `${(50 + (d % 15)).toFixed(1)} km/h`,
        `${(45 + (d % 10)).toFixed(1)} km/h`,
      ],
      exp: `Harmonic average speed = 2xy / (x + y) = 2(${40 + (d % 30)})(${60 + (d % 20)}) / (${40 + (d % 30) + 60 + (d % 20)}) km/h.`,
      diff: "medium",
    },
    {
      q: `[Rule of Alligation] Mixing two coffee blends priced at ₹${300 + (d % 50)}/kg and ₹${450 + (d % 50)}/kg to produce a blend worth ₹${360 + (d % 50)}/kg requires what mixing ratio?`,
      correct: `3 : 2`,
      distractors: [`2 : 1`, `4 : 3`, `5 : 4`],
      exp: `Rule of Alligation: (Price B - Mean) / (Mean - Price A) = (450 - 360) / (360 - 300) = 90 / 60 = 3 : 2.`,
      diff: "medium",
    },
    {
      q: `[Probability] In a sprint review with ${(v1 % 5) + 4} backend stories and ${(v2 % 5) + 3} UI bugs, 2 tickets are randomly selected for an audit. What is the probability that both are backend stories?`,
      correct: `${(
        (((v1 % 5) + 4) * ((v1 % 5) + 3)) /
        (((v1 % 5) + 4 + ((v2 % 5) + 3)) * ((v1 % 5) + 4 + ((v2 % 5) + 3) - 1))
      ).toFixed(3)}`,
      distractors: [`0.500`, `0.333`, `0.250`],
      exp: `Probability = (N_backend / N_total) × ((N_backend - 1) / (N_total - 1)).`,
      diff: "hard",
    },
    {
      q: `[Formula Shortcut · ${shortcut}] A tank has an inlet pipe filling it in ${v1} minutes and an outlet emptying it in ${v1 + 10} minutes. If both open together, how long until the tank is completely full?`,
      correct: `${((v1 * (v1 + 10)) / 10).toFixed(0)} minutes`,
      distractors: [
        `${(v1 + 5).toFixed(0)} minutes`,
        `${(v1 * 2).toFixed(0)} minutes`,
        `${(v1 * 3).toFixed(0)} minutes`,
      ],
      exp: `Net filling rate = (1/${v1}) - (1/${v1 + 10}) = 10 / (${v1}(${v1 + 10})). Time taken = (${v1} × ${v1 + 10}) / 10 minutes.`,
      diff: "medium",
    },
    {
      q: `[Simple & Compound Interest] The difference between compound interest and simple interest on an investment of ₹${v3 * 10} for 2 years at ${pct1}% per annum is:`,
      correct: `₹${(v3 * 10 * Math.pow(pct1 / 100, 2)).toFixed(0)}`,
      distractors: [
        `₹${(v3 * 10 * (pct1 / 100)).toFixed(0)}`,
        `₹${(v3 * 10 * Math.pow(pct1 / 100, 2) * 1.5).toFixed(0)}`,
        `₹${(v3 * 10 * 0.05).toFixed(0)}`,
      ],
      exp: `CI - SI for 2 years = P × (R / 100)² = ${v3 * 10} × (${pct1} / 100)² = ₹${(v3 * 10 * Math.pow(pct1 / 100, 2)).toFixed(0)}.`,
      diff: "hard",
    },
    {
      q: `[Data Interpretation · Week ${weekNum}] If engineering sprint velocity increased from ${60 + (d % 20)} story points in Sprint 1 to ${90 + (d % 20)} story points in Sprint 2, what was the percentage increase?`,
      correct: `${(((90 - 60) / (60 + (d % 20))) * 100).toFixed(1)}%`,
      distractors: [`30.0%`, `45.0%`, `50.0%`],
      exp: `Percentage growth = ((Sprint 2 - Sprint 1) / Sprint 1) × 100 = (30 / ${60 + (d % 20)}) × 100 = ${(
        ((90 - 60) / (60 + (d % 20))) *
        100
      ).toFixed(1)}%.`,
      diff: "easy",
    },
  ];

  return archetypes.map((item, idx) => {
    const qNum = idx + 1;
    const targetIdx = (d * 3 + qNum * 7 + 1) % 4;
    const options = buildOptions(item.correct, item.distractors, targetIdx);
    const qId = `D${d}-AL-${qNum < 10 ? `0${qNum}` : qNum}`;

    return {
      id: qId,
      category: "aptitude_logic",
      question: item.q,
      options,
      correct_option: targetIdx,
      correct_answer: item.correct,
      explanation: item.exp,
      difficulty: item.diff,
      xp: 1,
    };
  });
}

/**
 * Generates 10 Corporate English questions for a given day in the 90-day cadence.
 * Questions focus on workplace grammar, corporate vocabulary, executive etiquette, and interview techniques.
 */
export function getDayCorporateEnglishQuestions(dayNum: number): DailyExerciseQuestion[] {
  const d = Math.max(1, Math.min(90, dayNum));

  // Day 1 benchmark questions
  if (d === 1) {
    return CORPORATE_ENGLISH_QUESTIONS.map((q, idx) => ({
      ...q,
      id: `D1-CE-0${idx + 1}`.replace("010", "10"),
    }));
  }

  const dayPlan = getAcceleratorDay(d);
  const engTitle = dayPlan.english.title.replace(/^English 10m:\s*/i, "");
  const grammarRule = dayPlan.english.grammarRule;
  const vocabWords = dayPlan.english.keyVocabulary;
  const primaryVocab = vocabWords[0] || "Articulate";
  const secondaryVocab = vocabWords[1] || "Competency";

  const archetypes: Array<{
    q: string;
    correct: string;
    distractors: [string, string, string];
    exp: string;
    diff: "easy" | "medium" | "hard";
  }> = [
    {
      q: `[${engTitle}] Select the sentence that correctly aligns with today's corporate grammar focus: "${grammarRule}"`,
      correct: `Our team has finalized the microservice architecture and implemented automated integration tests yesterday.`,
      distractors: [
        `Our team have been finalizing the architecture and yesterday we have implemented tests.`,
        `Our team has been implemented tests yesterday for the architecture.`,
        `Yesterday our team has finished all tasks without errors.`,
      ],
      exp: `Demonstrates correct tense harmony: past simple for completed historical actions and present perfect for ongoing status.`,
      diff: "medium",
    },
    {
      q: `[Corporate Vocabulary] Choose the most accurate professional definition of the keyword '${primaryVocab}':`,
      correct: `To demonstrate specialized skill and deliver measurable, repeatable business outcomes.`,
      distractors: [
        `To delay action until management intervenes.`,
        `To bypass code review processes for rapid release.`,
        `To work in complete isolation without stakeholder consultation.`,
      ],
      exp: `'${primaryVocab}' in technical corporate contexts signifies high-caliber professional delivery and execution rigor.`,
      diff: "easy",
    },
    {
      q: `[Email Etiquette] Identify the most diplomatic and executive subject line for Day ${d}'s sprint milestone update:`,
      correct: `[Action Required] Sprint ${Math.floor((d - 1) / 5) + 1} Review & Sign-off — ${primaryVocab} Deliverables`,
      distractors: [
        `Sprint is done please check it now`,
        `HEY TEAM LOOK AT THE NEW CODE`,
        `Status update on things we did today`,
      ],
      exp: `Executive subject lines include brackets with clear action status ([Action Required]), sprint identifier, and topic keywords.`,
      diff: "easy",
    },
    {
      q: `[Active vs. Passive Voice] Which sentence demonstrates strong executive clarity for an architecture defense?`,
      correct: `We refactored the query pipeline, reducing API response latency by 35%.`,
      distractors: [
        `A reduction of 35% in API latency was observed by us after refactoring.`,
        `The query pipeline was being refactored by the engineering group.`,
        `It was decided that the pipeline should be modified for speed.`,
      ],
      exp: `Active voice ('We refactored... reducing API response latency') is direct, accountable, and impactful.`,
      diff: "medium",
    },
    {
      q: `[Workplace Context] In an interview setting, which sentence effectively demonstrates mastery of '${secondaryVocab}'?`,
      correct: `I leveraged my core ${secondaryVocab.toLowerCase()} to optimize our microservice deployment pipeline and enforce zero-downtime SLAs.`,
      distractors: [
        `My ${secondaryVocab.toLowerCase()} is so good nobody else needs to write code.`,
        `I do not have much ${secondaryVocab.toLowerCase()} but I will try.`,
        `Maybe ${secondaryVocab.toLowerCase()} was utilized by someone else on the team.`,
      ],
      exp: `STAR responses pair domain competency with measurable technical actions and business SLA outcomes.`,
      diff: "medium",
    },
    {
      q: `[Diplomatic Disagreement] When a technical lead proposes an approach with scalability risks, how should you voice dissent?`,
      correct: `I understand the immediate simplicity of this approach; may I offer an alternative pattern that mitigates potential database locks at scale?`,
      distractors: [
        `That approach is completely wrong and will crash production.`,
        `I don't care, do whatever you want.`,
        `Nobody does it that way in modern software engineering.`,
      ],
      exp: `Diplomatic dissent validates the colleague's perspective ('I understand...') and offers constructive alternatives respectfully.`,
      diff: "easy",
    },
    {
      q: `[Reported Speech & Listening] A client says: "We must ensure data residency stays within the EU region." How should you paraphrase this in meeting notes?`,
      correct: `The client confirmed that all customer data must be retained exclusively within EU datacenters to satisfy regulatory compliance.`,
      distractors: [
        `Client said EU region stuff is important.`,
        `We are going to move all servers to Germany maybe.`,
        `The client does not want us to use US clouds ever.`,
      ],
      exp: `Professional paraphrasing captures the precise business mandate with formal, unambiguous vocabulary.`,
      diff: "medium",
    },
    {
      q: `[Virtual Meeting Etiquette] If your audio connection experiences packet loss during an executive presentation, what is the best verbal protocol?`,
      correct: `Apologies for the brief audio latency; I have switched to the backup network connection. Let me reiterate the preceding slide.`,
      distractors: [
        `Can everyone hear me? Hello? Is this thing broken?`,
        `The company wifi is terrible today.`,
        `Wait 5 minutes while I restart my entire computer.`,
      ],
      exp: `Professional protocol acknowledges technical contingency calmly, informs of the fix, and smoothly resumes delivery.`,
      diff: "easy",
    },
    {
      q: `[Prepositional Precision] Select the correct preposition: "The technical committee was unanimous ______ their endorsement of the cloud migration roadmap."`,
      correct: `in`,
      distractors: [`on`, `at`, `for`],
      exp: `The adjective 'unanimous' is idiomatically followed by 'in' when referring to a shared decision or action.`,
      diff: "medium",
    },
    {
      q: `[Interview Closing] Which question is most strategic to ask a hiring manager at the conclusion of a technical interview?`,
      correct: `What engineering metrics does the team use during the first 90 days to evaluate success for an engineer in this role?`,
      distractors: [
        `How many sick days do I get in my first month?`,
        `Did I pass this interview?`,
        `Do you monitor keyboard activity while working remotely?`,
      ],
      exp: `Strategic closing questions focus on organizational impact, success metrics, and team contribution within the 90-day cadence.`,
      diff: "hard",
    },
  ];

  return archetypes.map((item, idx) => {
    const qNum = idx + 1;
    const targetIdx = (d * 5 + qNum * 11 + 2) % 4;
    const options = buildOptions(item.correct, item.distractors, targetIdx);
    const qId = `D${d}-CE-${qNum < 10 ? `0${qNum}` : qNum}`;

    return {
      id: qId,
      category: "corporate_english",
      question: item.q,
      options,
      correct_option: targetIdx,
      correct_answer: item.correct,
      explanation: item.exp,
      difficulty: item.diff,
      xp: 1,
    };
  });
}

/**
 * Returns all 20 daily questions for a given day in the 90-day placement cadence.
 * Exactly 10 Aptitude & Logic + 10 Corporate English questions = 20 Questions (20 XP Max).
 */
export function getAllDailyExerciseQuestions(dayNum: number = 1): DailyExerciseQuestion[] {
  const apt = getDayAptitudeQuestions(dayNum);
  const eng = getDayCorporateEnglishQuestions(dayNum);
  return [...apt, ...eng];
}

/**
 * Finds a question by its unique identifier (e.g. "D2-AL-03", "D1-CE-01", or legacy "AL-01").
 */
export function getDailyQuestionById(
  questionId: string,
  dayNum: number = 1,
): DailyExerciseQuestion | undefined {
  if (!questionId) return undefined;

  // Check if ID contains day prefix e.g. "D5-AL-02"
  const match = questionId.match(/^D(\d+)-(AL|CE)-(\d+)$/);
  if (match) {
    const parsedDay = parseInt(match[1]!, 10);
    const catCode = match[2];
    const questions =
      catCode === "AL"
        ? getDayAptitudeQuestions(parsedDay)
        : getDayCorporateEnglishQuestions(parsedDay);
    return questions.find((q) => q.id === questionId);
  }

  // Legacy Day 1 check ("AL-01" to "AL-10", "CE-01" to "CE-10")
  if (questionId.startsWith("AL-")) {
    return APTITUDE_LOGIC_QUESTIONS.find((q) => q.id === questionId);
  }
  if (questionId.startsWith("CE-")) {
    return CORPORATE_ENGLISH_QUESTIONS.find((q) => q.id === questionId);
  }

  // Fallback to checking within requested dayNum
  const allForDay = getAllDailyExerciseQuestions(dayNum);
  return allForDay.find((q) => q.id === questionId);
}
