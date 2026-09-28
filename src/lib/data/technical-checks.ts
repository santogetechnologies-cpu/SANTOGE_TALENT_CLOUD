/**
 * technical-checks.ts
 * Deterministic generator for Day 1 to 90 Technical Knowledge Checks across all 15 tracks.
 * Provides authentic, topic-specific MCQs with deterministic shuffling and clear explanations.
 */

export interface TechnicalCheckOption {
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface TechnicalCheckData {
  question: string;
  options: TechnicalCheckOption[];
  correctIndex: number;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generate a technical knowledge check question based on track, day, topic, and practice.
 */
export function getTechnicalCheckQuestion(
  dayNum: number,
  trackId: string,
  trackName: string,
  topic: string,
  practice: string,
): TechnicalCheckData {
  const seed = hashString(`${dayNum}:${trackId}:${topic}`);
  const lowerTopic = (topic + " " + practice).toLowerCase();

  let question = `In ${trackName}, when implementing "${topic}", which engineering practice is paramount?`;
  let correctText = `Adhering to standard contracts and structured patterns as outlined in "${practice}" to prevent operational regressions.`;
  let correctExplanation = `Correct! Following deterministic protocols and established interfaces ensures testability, maintainability, and clean system boundaries.`;

  let distractor1Text = `Bypassing validation layers to reduce instruction latency and eliminate error-checking overhead.`;
  let distractor1Explanation = `Incorrect. Bypassing validation introduces security flaws, silent data corruption, and catastrophic production failures.`;

  let distractor2Text = `Coupling internal implementation details directly to external caller components to speed up development.`;
  let distractor2Explanation = `Incorrect. Tight coupling violates separation of concerns and makes regression testing virtually impossible.`;

  let distractor3Text = `Suppressing caught exceptions globally to ensure execution always appears successful to upstream services.`;
  let distractor3Explanation = `Incorrect. Swallowing exceptions hides critical system failures and prevents automated alerting and rollback.`;

  // Domain-specific question refinements
  if (lowerTopic.includes("async") || lowerTopic.includes("thread") || lowerTopic.includes("concurrent") || lowerTopic.includes("parallel")) {
    question = `When implementing asynchronous or concurrent flows for "${topic}" in ${trackName}, what is the critical design constraint?`;
    correctText = `Ensuring thread-safe state mutations and handling non-blocking errors without deadlocks or race conditions.`;
    correctExplanation = `Correct! Concurrency requires strict isolation, immutable state transfers, and robust cancellation or timeout propagation.`;
    distractor1Text = `Executing blocking synchronized blocks inside every worker loop to guarantee single-threaded execution.`;
    distractor1Explanation = `Incorrect. Global blocking locks negate concurrency benefits and lead to thread starvation and deadlocks.`;
    distractor2Text = `Assuming asynchronous background tasks will always resolve in the exact order they were dispatched.`;
    distractor2Explanation = `Incorrect. Asynchronous execution is inherently non-deterministic regarding completion timing.`;
    distractor3Text = `Ignoring unhandled promise/future rejections since worker pools automatically discard failed tasks.`;
    distractor3Explanation = `Incorrect. Unhandled rejections cause memory leaks, orphaned processes, and silent job loss.`;
  } else if (lowerTopic.includes("sql") || lowerTopic.includes("database") || lowerTopic.includes("data") || lowerTopic.includes("schema") || lowerTopic.includes("orm")) {
    question = `Regarding data persistence and schema integrity for "${topic}" in ${trackName}, which principle must be enforced?`;
    correctText = `Applying transactional boundaries (ACID) and indexing foreign keys to preserve relational consistency.`;
    correctExplanation = `Correct! Proper transaction scopes prevent partial writes, and appropriate indexing ensures optimal query performance under load.`;
    distractor1Text = `Performing full table scans without indexes to avoid indexing storage overhead.`;
    distractor1Explanation = `Incorrect. Missing indexes cause severe performance degradation and database timeouts as data scales.`;
    distractor2Text = `Executing raw string concatenation for dynamic queries directly from user inputs.`;
    distractor2Explanation = `Incorrect. String concatenation opens severe SQL injection vulnerabilities. Parameterized queries are mandatory.`;
    distractor3Text = `Disabling database-level constraints and relying solely on optimistic client assumptions.`;
    distractor3Explanation = `Incorrect. Without database constraints, concurrent writes can violate data integrity and corrupt records.`;
  } else if (lowerTopic.includes("api") || lowerTopic.includes("rest") || lowerTopic.includes("endpoint") || lowerTopic.includes("http") || lowerTopic.includes("microservice")) {
    question = `What is the primary architectural rule when structuring API contracts for "${topic}" in ${trackName}?`;
    correctText = `Exposing idempotent, versioned endpoints with strict input validation and standard status response codes.`;
    correctExplanation = `Correct! Idempotency guarantees safe retries, versioning prevents breaking existing clients, and schema validation blocks invalid payloads.`;
    distractor1Text = `Returning HTTP 200 OK for all responses and embedding error messages inside arbitrary body strings.`;
    distractor1Explanation = `Incorrect. Overriding standard HTTP status codes breaks API gateway routing, monitoring alarms, and client error handling.`;
    distractor2Text = `Allowing callers to request unbounded page sizes without server-side pagination limits.`;
    distractor2Explanation = `Incorrect. Unbounded queries can exhaust server memory and trigger denial-of-service vulnerabilities.`;
    distractor3Text = `Modifying existing public endpoint contracts without semantic versioning or deprecation notices.`;
    distractor3Explanation = `Incorrect. Breaking public contract schemas crashes dependent production consumer services.`;
  } else if (lowerTopic.includes("security") || lowerTopic.includes("auth") || lowerTopic.includes("token") || lowerTopic.includes("jwt") || lowerTopic.includes("permission")) {
    question = `In security architecture for "${topic}" in ${trackName}, how must authorization and data access be verified?`;
    correctText = `Enforcing least-privilege role validation server-side on every request and never trusting client claims implicitly.`;
    correctExplanation = `Correct! Authorization must always be evaluated server-side. Client-side checks are purely for UX and easily bypassed.`;
    distractor1Text = `Storing unencrypted secret tokens directly in local browser storage or public client variables.`;
    distractor1Explanation = `Incorrect. Secrets in client storage are vulnerable to XSS extraction and tampering.`;
    distractor2Text = `Accepting expired tokens if the user was authenticated earlier in the same calendar day.`;
    distractor2Explanation = `Incorrect. Expired tokens must be strictly rejected to prevent session hijacking and replay attacks.`;
    distractor3Text = `Bypassing role authorization for read-only queries under the assumption that viewing data carries no risk.`;
    distractor3Explanation = `Incorrect. Read authorization is critical to prevent horizontal and vertical privilege escalation (IDOR).`;
  } else if (lowerTopic.includes("test") || lowerTopic.includes("mock") || lowerTopic.includes("unit") || lowerTopic.includes("ci") || lowerTopic.includes("coverage")) {
    question = `When writing robust test suites for "${topic}" in ${trackName}, what ensures test reliability?`;
    correctText = `Structuring isolated, deterministic unit tests that assert both expected outputs and boundary edge conditions without environmental side effects.`;
    correctExplanation = `Correct! Tests must be independent, fast, and repeatable across different environments and CI pipelines.`;
    distractor1Text = `Writing tests that depend on the execution order of previous tests in the test suite.`;
    distractor1Explanation = `Incorrect. Interdependent tests produce flaky builds and cascade false positives when run in parallel.`;
    distractor2Text = `Testing only the happy path and skipping error branches to maximize code coverage metrics quickly.`;
    distractor2Explanation = `Incorrect. Real production failures almost always occur in error branches and edge conditions.`;
    distractor3Text = `Hardcoding production database connection credentials directly inside integration test fixtures.`;
    distractor3Explanation = `Incorrect. Tests must run against isolated test databases or mocks to avoid destructive alterations to production.`;
  } else if (trackId === "medical" || lowerTopic.includes("medical") || lowerTopic.includes("clinical") || lowerTopic.includes("icd") || lowerTopic.includes("cpt")) {
    question = `In medical coding standards for "${topic}", which documentation principle is strictly required?`;
    correctText = `Assigning codes supported by explicit clinical documentation and adhering to official ICD-10-CM/CPT sequencing guidelines.`;
    correctExplanation = `Correct! All diagnostic and procedural codes must have clear physician documentation in the health record without assumption.`;
    distractor1Text = `Inferring unstated secondary diagnoses based on lab results without confirmed provider diagnosis.`;
    distractor1Explanation = `Incorrect. Coders cannot diagnose based solely on abnormal test values unless verified by the provider.`;
    distractor2Text = `Choosing the highest reimbursing procedural code regardless of service documentation specificity.`;
    distractor2Explanation = `Incorrect. Upcoding is a severe federal compliance violation under False Claims and HIPAA regulations.`;
    distractor3Text = `Ignoring payer-specific medical necessity guidelines during pre-billing claims scrubbing.`;
    distractor3Explanation = `Incorrect. Disregarding medical necessity causes immediate claim rejections and revenue cycle delays.`;
  }

  const rawOptions: TechnicalCheckOption[] = [
    { text: correctText, isCorrect: true, explanation: correctExplanation },
    { text: distractor1Text, isCorrect: false, explanation: distractor1Explanation },
    { text: distractor2Text, isCorrect: false, explanation: distractor2Explanation },
    { text: distractor3Text, isCorrect: false, explanation: distractor3Explanation },
  ];

  // Deterministically shuffle options based on seed
  const shuffled: TechnicalCheckOption[] = [...rawOptions];
  const shift = seed % 4;
  for (let i = 0; i < shift; i++) {
    const item = shuffled.shift()!;
    shuffled.push(item);
  }

  const correctIndex = shuffled.findIndex((o) => o.isCorrect);

  return {
    question,
    options: shuffled,
    correctIndex,
  };
}
