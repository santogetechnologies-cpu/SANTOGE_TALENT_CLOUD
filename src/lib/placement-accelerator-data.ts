export type AcceleratorDay = {
  day: number;
  week: number;
  dayOfWeek: "Day 1 (Mon)" | "Day 2 (Tue)" | "Day 3 (Wed)" | "Day 4 (Thu)" | "Day 5 (Fri)";
  theme: string;
  isFridayAssessment?: boolean;

  // 10 Mins English Instructor Plan
  english: {
    title: string;
    instructorBrief: string;
    keyVocabulary: string[];
    grammarRule: string;
    deliveryTimeline: string; // "00:00-03:00 Concept | 03:00-07:00 Demonstration | 07:00-10:00 Student Choral Drill"
  };

  // 10 Mins Aptitude Instructor Plan
  aptitude: {
    title: string;
    instructorBrief: string;
    formulaShortcut: string;
    solvedExample: string;
    deliveryTimeline: string; // "00:00-03:00 Core Model | 03:00-07:00 Fast Shortcut | 07:00-10:00 Rapid-Fire Question"
  };

  // 10 Mins In-App Guided Practice (Students practice both)
  practice: {
    duration: string;
    instructions: string;
    mcqs: {
      q: string;
      options: string[];
      answer: number;
      explanation: string;
      category: "English" | "Aptitude" | "Logic";
    }[];
    puzzle: {
      q: string;
      options: string[];
      answer: number;
      explanation: string;
    };
    voicePrompt: {
      prompt: string;
      targetKeywords: string[];
      starCategory: "Situation" | "Task" | "Action" | "Result" | "Full STAR";
    };
  };
};

export type AcceleratorWeek = {
  week: number;
  title: string;
  focus: string;
  days: AcceleratorDay[];
  fridayMilestone: string;
};

/* ==========================================================================
   WEEK 1 TO 18 (90 DAYS) MASTER PLACEMENT ACCELERATOR CURRICULUM
   ========================================================================== */

const WEEK_THEMES = [
  {
    week: 1,
    title: "Self-Introduction & Number System Foundations",
    focus: "Basic Corporate Introductions & Speed Arithmetic Shortcuts",
  },
  {
    week: 2,
    title: "Tenses in Workplace Communication & Percentages",
    focus: "Past/Present/Future Accuracy & Fast Fraction-to-Percentage Rules",
  },
  {
    week: 3,
    title: "Professional Email Etiquette & Profit, Loss & Discount",
    focus: "Formal Correspondence & Markup/Margin Calculations",
  },
  {
    week: 4,
    title: "Active Listening & Ratio, Proportion & Mixtures",
    focus: "Clarification Queries & Weighted Average Ratios",
  },
  {
    week: 5,
    title: "Telephone & Video Call Fluency & Time and Work I",
    focus: "Virtual Meeting Protocols & Unitary Method/Efficiency Ratios",
  },
  {
    week: 6,
    title: "Group Discussion Openers & Time and Work II (Pipes & Cisterns)",
    focus: "Polite Interjections & Negative Work Capacities",
  },
  {
    week: 7,
    title: "Persuasive Articulation & Time, Speed and Distance I",
    focus: "Structuring Arguments & Relative Speed Principles",
  },
  {
    week: 8,
    title: "Cross-Cultural Communication & Trains and Boats/Streams",
    focus: "Global Client Sensitivity & Upstream/Downstream Physics",
  },
  {
    week: 9,
    title: "Describing Technical Projects & Permutation and Combination",
    focus: "Translating Jargon to Business Value & Fundamental Counting Principles",
  },
  {
    week: 10,
    title: "Handling Conflict & Probability Basics",
    focus: "De-escalation Language & Independent vs Dependent Events",
  },
  {
    week: 11,
    title: "STAR Method (Situation & Task) & Simple and Compound Interest",
    focus: "Setting Context in Interviews & Effective Annual Rate Formulas",
  },
  {
    week: 12,
    title: "STAR Method (Action & Result) & Blood Relations and Direction Sense",
    focus: "Quantifying Achievements & Family Tree / Cardinal Navigation",
  },
  {
    week: 13,
    title: "Executive Presentations & Seating Arrangements (Linear & Circular)",
    focus: "Slide Delivery & Multi-Variable Constraint Solving",
  },
  {
    week: 14,
    title: "Negotiation & Salary Conversations & Data Interpretation (Tables/Bars)",
    focus: "Value Anchoring & Rapid Data Extraction",
  },
  {
    week: 15,
    title: "Handling Difficult Questions & Data Interpretation (Pie/Line)",
    focus: "Reframing Weaknesses & Angle-to-Value Conversions",
  },
  {
    week: 16,
    title: "Technical Defense Clarity & Syllogisms and Logical Deductions",
    focus: "Defending Architecture Decisions & Venn Diagram Truth Trees",
  },
  {
    week: 17,
    title: "HR & Leadership Round Readiness & Critical Reasoning",
    focus: "Cultural Alignment & Assumption/Inference Identification",
  },
  {
    week: 18,
    title: "Final Placement Capstone & Comprehensive Mock Board Assessment",
    focus: "Day 90 Full Board Simulation & Real-Time Offer Readiness",
  },
];

const ENGLISH_TOPICS_POOL = [
  {
    t: "The 60-Second Elevator Pitch",
    v: ["Specialization", "Value proposition", "Core competencies", "Impact"],
    g: "Present Simple for current roles; Present Perfect for accomplishments.",
    brief: "Teach the 3-part intro formula: Who I Am + What I Build + What Value I Bring.",
    timeline: "00:00-03:00 Formula | 03:00-07:00 Demo Pitch | 07:00-10:00 Live Choral Drill",
  },
  {
    t: "Tenses: Past Simple vs Present Perfect",
    v: ["Implemented", "Architected", "Spearheaded", "Optimized"],
    g: "Use Past Simple for completed milestones with dates; Present Perfect for open-ended achievements.",
    brief: "Eliminate 'I have done this yesterday' errors. Contrast specific vs ongoing results.",
    timeline:
      "00:00-03:00 Tense Matrix | 03:00-07:00 Action Verb Drill | 07:00-10:00 Error Correction",
  },
  {
    t: "Corporate Email Structure & Subject Lines",
    v: ["Action Required", "Follow-up", "Deliverable", "Pertaining to"],
    g: "Modal verbs (Could, Would, May) for polite requests; avoid demanding imperatives.",
    brief:
      "Teach 5-point email anatomy: Catchy Subject + Salutation + Core Message + Action Item + Sign-off.",
    timeline:
      "00:00-03:00 5-Point Structure | 03:00-07:00 Good vs Bad Email | 07:00-10:00 Rapid Subject Line Drill",
  },
  {
    t: "Active Listening & Paraphrasing Techniques",
    v: ["If I understand correctly", "To clarify", "In other words", "Reiterate"],
    g: "Reported speech constructions when summarizing interviewer questions.",
    brief: "How to buy time and demonstrate deep comprehension before responding.",
    timeline:
      "00:00-03:00 Paraphrase Stems | 03:00-07:00 Roleplay Demo | 07:00-10:00 Student Query Repetition",
  },
  {
    t: "Virtual Meeting & Video Etiquette",
    v: ["You're on mute", "Bandwidth", "Screen share", "Floor is yours"],
    g: "Conditional sentences for technical contingencies (e.g. 'If my screen freezes...').",
    brief: "Eye contact via lens, lighting, speaking pace, and professional turn-taking.",
    timeline:
      "00:00-03:00 Video Habits | 03:00-07:00 Meeting Stems | 07:00-10:00 Audio Check Drill",
  },
  {
    t: "GD Openers & Polite Disagreements",
    v: [
      "Building on that point",
      "I respectfully offer a different angle",
      "Consensus",
      "Key bottleneck",
    ],
    g: "Concessive clauses (Although, Even though, While I agree with X...).",
    brief: "How to enter a group discussion within the first 60 seconds without shouting.",
    timeline:
      "00:00-03:00 GD Entry Framework | 03:00-07:00 Disagreement Stems | 07:00-10:00 Fishbowl Drill",
  },
  {
    t: "Structuring Arguments with PREP (Point, Reason, Example, Point)",
    v: ["Fundamentally", "Specifically", "Illustrated by", "To summarize"],
    g: "Cohesive discourse markers (Consequently, Furthermore, In contrast).",
    brief: "Deliver concise 45-second answers that never ramble.",
    timeline:
      "00:00-03:00 PREP Architecture | 03:00-07:00 45s Model Response | 07:00-10:00 Student PREP Sprint",
  },
  {
    t: "Overcoming Filler Words (Um, Uh, Basically, Actually)",
    v: ["Deliberate pause", "Articulation", "Measured cadence", "Pacing"],
    g: "Sentence pauses instead of phonological fillers.",
    brief: "The 2-second breath pause technique to look thoughtful rather than hesitant.",
    timeline:
      "00:00-03:00 Pause Power | 03:00-07:00 Filler Trap Elimination | 07:00-10:00 30s Zero-Filler Challenge",
  },
  {
    t: "Translating Technical Jargon for Non-Tech Stakeholders",
    v: ["In layman's terms", "Business impact", "User experience", "Scalability"],
    g: "Analogy constructions (e.g., 'Just like a traffic controller, this load balancer...').",
    brief: "How to explain complex code/infrastructure to an HR interviewer or client manager.",
    timeline:
      "00:00-03:00 Analogy Framework | 03:00-07:00 Code-to-Business Translation | 07:00-10:00 Peer Translation Drill",
  },
  {
    t: "Handling Behavioral Questions with the STAR Method (Situation)",
    v: ["Context", "Production environment", "Legacy codebase", "Constraint"],
    g: "Setting temporal anchors with past continuous and past perfect.",
    brief: "Framing the background under 15 seconds without losing the listener.",
    timeline:
      "00:00-03:00 STAR Context Rules | 03:00-07:00 15s Situation Framing | 07:00-10:00 Student Pitch",
  },
  {
    t: "STAR Method: Articulating the Specific Task",
    v: ["Objective", "Deliverable", "SLA deadline", "Accountability"],
    g: "Clear subject-verb agreement denoting individual ownership vs team role.",
    brief: "Differentiating 'My team had to' vs 'My specific mandate was'.",
    timeline:
      "00:00-03:00 Task Ownership | 03:00-07:00 Ownership Verbs | 07:00-10:00 Student Mandate Pitch",
  },
  {
    t: "STAR Method: Detailing Decisive Actions Taken",
    v: ["Engineered", "Refactored", "Automated", "Triaged"],
    g: "Strong transitive action verbs in active voice.",
    brief: "Highlighting personal technical decision-making and overcoming roadblocks.",
    timeline:
      "00:00-03:00 Action Catalog | 03:00-07:00 High-Impact Phrases | 07:00-10:00 30s Action Sprint",
  },
  {
    t: "STAR Method: Quantifying Business Results & Impact",
    v: ["Latency reduced by 40%", "Zero downtime", "Clean claim rate", "Efficiency increased"],
    g: "Comparative adjectives and metrics expressions.",
    brief: "Never end a story without a measurable number or key organizational win.",
    timeline:
      "00:00-03:00 Metrics Framing | 03:00-07:00 Metric Formulation | 07:00-10:00 Result Showcase Drill",
  },
  {
    t: "Framing Weaknesses as Growth Trajectories",
    v: ["Areas of enhancement", "Proactive upskilling", "Self-awareness", "Mitigation"],
    g: "Reframing past limitations using progressive development verbs.",
    brief: "How to answer 'What is your greatest weakness?' without clichés.",
    timeline:
      "00:00-03:00 Authentic Weakness Formula | 03:00-07:00 Good vs Bad Example | 07:00-10:00 45s Defense Drill",
  },
  {
    t: "Asking Insightful Questions at the End of the Interview",
    v: [
      "Engineering culture",
      "Deployment frequency",
      "Success metrics in 90 days",
      "Team roadmap",
    ],
    g: "Inversion in formal question formation.",
    brief: "Leave a lasting impression with strategic questions that show deep interest.",
    timeline:
      "00:00-03:00 Strategic Questions | 03:00-07:00 3 Golden Closing Questions | 07:00-10:00 Closing Roleplay",
  },
];

const APTITUDE_TOPICS_POOL = [
  {
    t: "Vedic Math & Rapid Multiplication Shortcuts",
    f: "Base 100 multiplication & Criss-cross 2x2 method",
    s: "Multiply 98 × 97: (100 - 2 - 3) = 95, (-2 × -3) = 06 -> 9506.",
    brief: "Speed multiplication and squaring techniques to save 40 seconds per question.",
    timeline:
      "00:00-03:00 Base Technique | 03:00-07:00 5 Mental Calculations | 07:00-10:00 Speed Sprint",
  },
  {
    t: "Fraction to Percentage Equivalents & Multipliers",
    f: "1/6 = 16.66%, 1/7 = 14.28%, 1/8 = 12.5%, 1/9 = 11.11%, 1/12 = 8.33%",
    s: "Calculate 14.28% of 4900: Simply 4900 / 7 = 700.",
    brief: "Memorize fractional fractions to solve percentages in under 10 seconds.",
    timeline:
      "00:00-03:00 Fractional Table | 03:00-07:00 Direct Substitution | 07:00-10:00 Flashcard Drill",
  },
  {
    t: "Profit, Loss & Successive Discount Formula",
    f: "Net Change = a + b + (ab/100) | SP = CP × (100 + P%)/100",
    s: "Successive discounts of 20% and 10%: -20 - 10 + (200/100) = -28% overall discount.",
    brief: "Shortcut formulas for single equivalent discounts and marked price equations.",
    timeline:
      "00:00-03:00 Successive Formula | 03:00-07:00 Markup vs Margin | 07:00-10:00 3-Question Sprint",
  },
  {
    t: "Ratio, Proportion & Rule of Alligation",
    f: "Quantity A / Quantity B = (Price B - Mean) / (Mean - Price A)",
    s: "Mix tea of $30/kg with $40/kg to get $33/kg: Ratio = (40-33)/(33-30) = 7:3.",
    brief: "Use Alligation cross-method to solve mixtures and weighted averages in 15 seconds.",
    timeline:
      "00:00-03:00 Cross-Diagram Method | 03:00-07:00 2 Worked Examples | 07:00-10:00 Instant Solution Drill",
  },
  {
    t: "Time & Work: LCM & Efficiency Method",
    f: "Total Work = LCM of individual days | Daily Efficiency = Total Work / Days",
    s: "A takes 12 days, B takes 15 days. Total work = 60 units. A=5 units/day, B=4 units/day. Together = 60 / 9 = 6.67 days.",
    brief: "Replace complex fractions with integer LCM work units.",
    timeline:
      "00:00-03:00 LCM Efficiency Rule | 03:00-07:00 Pipe/Worker Problem | 07:00-10:00 Speed Drill",
  },
  {
    t: "Pipes & Cisterns: Positive & Negative Inflow",
    f: "Net Rate = Inflow Rates - Leak Outflow Rate",
    s: "Pipe A fills in 10h, Pipe B in 15h, Leak empties in 30h. Total 30 units: +3 + 2 - 1 = +4 units/h. Time = 30/4 = 7.5h.",
    brief: "Treat drainage pipes as negative efficiency units.",
    timeline:
      "00:00-03:00 Negative Work Concept | 03:00-07:00 Alternating Pipes | 07:00-10:00 Rapid Solve",
  },
  {
    t: "Time, Speed & Distance: Relative Speed & Average Speed",
    f: "Avg Speed = 2xy / (x + y) | Relative Speed (Opposite) = S1 + S2, (Same) = S1 - S2",
    s: "Travel to office at 60 km/h and return at 40 km/h: Avg Speed = 2(60)(40)/(100) = 48 km/h.",
    brief: "Why average speed is NEVER the simple arithmetic mean (60+40)/2.",
    timeline:
      "00:00-03:00 Harmonic Mean Rule | 03:00-07:00 Train Crossing Problem | 07:00-10:00 2-Min Problem",
  },
  {
    t: "Boats, Streams & Escalator Problems",
    f: "Downstream Speed = u + v | Upstream Speed = u - v | Speed in Still Water = (D + U)/2",
    s: "Downstream 18 km/h, Upstream 12 km/h. Speed of boat = (18+12)/2 = 15 km/h; Stream = (18-12)/2 = 3 km/h.",
    brief: "Simple 2-variable linear equations for river currents and moving walkways.",
    timeline:
      "00:00-03:00 Current Formulas | 03:00-07:00 Linear Decomposition | 07:00-10:00 Problem Sprint",
  },
  {
    t: "Permutations vs Combinations (Arrangement vs Selection)",
    f: "nPr = n! / (n - r)! | nCr = n! / (r! (n - r)!)",
    s: "Select 3 leaders from 8 candidates: 8C3 = (8 × 7 × 6) / (3 × 2 × 1) = 56 ways.",
    brief: "Decision tree: Does order matter? If YES -> Permutation; If NO -> Combination.",
    timeline:
      "00:00-03:00 Order Matrix | 03:00-07:00 Fast Factorial Reduction | 07:00-10:00 Committee Selection",
  },
  {
    t: "Probability: Independent, Mutually Exclusive & Dice/Cards",
    f: "P(A or B) = P(A) + P(B) - P(A and B) | P(At least one) = 1 - P(None)",
    s: "Probability of getting at least one 6 in two dice rolls: 1 - (5/6 × 5/6) = 1 - 25/36 = 11/36.",
    brief: "Use the '1 - Complement' trick for all 'At least one' problems.",
    timeline:
      "00:00-03:00 Complement Rule | 03:00-07:00 Dice & Card Shortcuts | 07:00-10:00 3-Probability Drills",
  },
  {
    t: "Simple & Compound Interest: 2-Year & 3-Year Differences",
    f: "CI - SI (2 Years) = P × (R / 100)²",
    s: "If difference between CI and SI on $10,000 for 2 years at 10% is: 10000 × (10/100)² = $100.",
    brief:
      "Direct formula to solve CI-SI difference problems without calculating full compound interest.",
    timeline:
      "00:00-03:00 Delta Formula | 03:00-07:00 Tree Method for 3 Years | 07:00-10:00 Rapid Solve",
  },
  {
    t: "Blood Relations & Coded Family Trees",
    f: "Symbols: + Male, - Female, = Spouse, | Generation gap",
    s: "Pointing to a man, A said: 'He is the son of my mother's only brother.' -> Maternal Uncle's son = Cousin.",
    brief: "Draw generation diagrams step-by-step from right to left.",
    timeline:
      "00:00-03:00 Symbol Mapping | 03:00-07:00 Reverse Decoding | 07:00-10:00 3-Puzzle Sprint",
  },
  {
    t: "Direction Sense & Pythagorean Distance Traversal",
    f: "Distance = √(Δx² + Δy²) | Clockwise vs Anti-clockwise turns",
    s: "Walks 6m North, turns Right 8m: Shortest distance from origin = √(6² + 8²) = 10m North-East.",
    brief: "Triplets: 3-4-5, 5-12-13, 7-24-25, 8-15-17 to calculate distances mentally.",
    timeline:
      "00:00-03:00 Pythagorean Triplets | 03:00-07:00 Compass Mapping | 07:00-10:00 Navigation Drill",
  },
  {
    t: "Syllogisms & Venn Diagram Truth Evaluation",
    f: "All A are B (A ⊆ B) | Some A are B (A ∩ B ≠ ∅) | No A is B (A ∩ B = ∅)",
    s: "Statement: All cats are animals. Some animals are pets. Conclusion: Some cats are pets -> (False, not definite).",
    brief:
      "Differentiate between 'Definite Conclusion' vs 'Possibility' across multi-statement logic.",
    timeline:
      "00:00-03:00 Venn Trees | 03:00-07:00 Either-Or Rules | 07:00-10:00 3-Syllogism Drill",
  },
  {
    t: "Data Interpretation: Rapid Table & Bar Graph Analysis",
    f: "Growth Rate = (Final - Initial) / Initial × 100% | Ratio Comparison",
    s: "Company sales rose from 40M to 52M: (12 / 40) × 100 = 30% increase.",
    brief:
      "Approximate large digits (e.g. 41,892 -> 42k) to calculate ratios mentally without scratchpad lag.",
    timeline:
      "00:00-03:00 Approximation Rules | 03:00-07:00 Bar Chart Extraction | 07:00-10:00 Speed Calculation",
  },
];

export function generateAccelerator90Days(): AcceleratorWeek[] {
  const weeks: AcceleratorWeek[] = [];

  for (let w = 1; w <= 18; w++) {
    const weekTheme = WEEK_THEMES[w - 1] ?? {
      week: w,
      title: `Placement Acceleration Phase ${w}`,
      focus: "Comprehensive Verbal & Logical Preparedness",
    };
    const days: AcceleratorDay[] = [];

    const dayLabels: (
      "Day 1 (Mon)" | "Day 2 (Tue)" | "Day 3 (Wed)" | "Day 4 (Thu)" | "Day 5 (Fri)"
    )[] = ["Day 1 (Mon)", "Day 2 (Tue)", "Day 3 (Wed)", "Day 4 (Thu)", "Day 5 (Fri)"];

    for (let d = 1; d <= 5; d++) {
      const overallDayNumber = (w - 1) * 5 + d;
      const isFriday = d === 5;
      const engPoolIdx = (overallDayNumber - 1) % ENGLISH_TOPICS_POOL.length;
      const aptPoolIdx = (overallDayNumber - 1) % APTITUDE_TOPICS_POOL.length;
      const engItem = ENGLISH_TOPICS_POOL[engPoolIdx]!;
      const aptItem = APTITUDE_TOPICS_POOL[aptPoolIdx]!;

      days.push({
        day: overallDayNumber,
        week: w,
        dayOfWeek: dayLabels[d - 1]!,
        theme: `${engItem.t} + ${aptItem.t}`,
        isFridayAssessment: isFriday,
        english: {
          title: `English 10m: ${engItem.t}`,
          instructorBrief: engItem.brief,
          keyVocabulary: engItem.v,
          grammarRule: engItem.g,
          deliveryTimeline: engItem.timeline,
        },
        aptitude: {
          title: `Aptitude 10m: ${aptItem.t}`,
          instructorBrief: aptItem.brief,
          formulaShortcut: aptItem.f,
          solvedExample: aptItem.s,
          deliveryTimeline: aptItem.timeline,
        },
        practice: {
          duration: "10 min In-App Guided Practice",
          instructions:
            "Complete 3 rapid MCQs, 1 Logical Brainteaser, and record your 60-second AI Voice Pitch.",
          mcqs: [
            {
              q: `[Aptitude Drill] Based on today's formula (${aptItem.f.split("|")[0]}): If a worker completes an assignment in 15 hours and their teammate in 30 hours, how long do they take together?`,
              options: ["8 hours", "10 hours", "12 hours", "15 hours"],
              answer: 1,
              explanation:
                "Using LCM = 30 units: Efficiencies are 2 u/h and 1 u/h = 3 u/h. Time = 30 / 3 = 10 hours.",
              category: "Aptitude",
            },
            {
              q: `[Grammar & Corporate English] Identify the most professional sentence to communicate a project delay:`,
              options: [
                "Sorry, we can't finish this because the API is down.",
                "Due to unexpected API latency, we anticipate a 24-hour revision to the deliverable timeline.",
                "The task will be late. Will update when done.",
                "Blame the backend team for not deploying on time.",
              ],
              answer: 1,
              explanation:
                "Option 2 uses diplomatic language, identifies root cause constructively, and offers an updated SLA.",
              category: "English",
            },
            {
              q: `[Verbal Aptitude] Choose the correct synonym for the word '${engItem.v[0] ?? "Articulate"}':`,
              options: ["Hesitant", "Coherent & Expressive", "Ambiguous", "Passive"],
              answer: 1,
              explanation:
                "To articulate means to express ideas clearly, coherently, and effectively in spoken or written format.",
              category: "English",
            },
          ],
          puzzle: {
            q: `[Logic Brainteaser] If today is ${dayLabels[d - 1]}, and a release pipeline runs every 3 days starting today, how many total deployments take place in the next 30 calendar days?`,
            options: ["9 deployments", "10 deployments", "11 deployments", "12 deployments"],
            answer: 2,
            explanation:
              "Day 1, 4, 7, 10, 13, 16, 19, 22, 25, 28 = exactly 10 future deployments + day 1 = 11 total deployments.",
          },
          voicePrompt: {
            prompt: `Deliver a 60-second response to: 'Describe a challenging technical situation you encountered and how you resolved it using: ${engItem.v.slice(0, 2).join(", ")}.'`,
            targetKeywords: engItem.v,
            starCategory: "Full STAR",
          },
        },
      });
    }

    weeks.push({
      week: w,
      title: weekTheme.title,
      focus: weekTheme.focus,
      days,
      fridayMilestone: `Week ${w} Friday Combined Assessment & Live Workplace Drill`,
    });
  }

  return weeks;
}

export const ACCELERATOR_90_DAYS = generateAccelerator90Days();
export const getAcceleratorDay = (dayNum: number): AcceleratorDay => {
  const clamped = Math.max(1, Math.min(90, dayNum));
  const weekIdx = Math.floor((clamped - 1) / 5);
  const dayIdx = (clamped - 1) % 5;
  const week = ACCELERATOR_90_DAYS[weekIdx] ?? ACCELERATOR_90_DAYS[0]!;
  return week.days[dayIdx] ?? week.days[0]!;
};
