import React, { useState } from 'react';
import {
  Code2,
  Bug,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  AlertTriangle,
  Lightbulb,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Tabs } from '../../../components/ui/Tabs';
import { CodeChallenge, DebugChallenge } from '../../../types/learning';
import clsx from 'clsx';

const DAILY_CHALLENGE: CodeChallenge = {
  id: 'code-chal-1',
  title: 'LRU Cache with O(1) Get and Put Operations',
  trackName: 'Python Backend & Microservices',
  difficulty: 'Medium',
  timeLimitMinutes: 20,
  description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the LRUCache class with get(key) and put(key, value) operations running in average O(1) time complexity.',
  starterCode: `class LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = {}\n\n    def get(self, key: int) -> int:\n        # Write your O(1) solution\n        return self.cache.get(key, -1)\n\n    def put(self, key: int, value: int) -> None:\n        # Evict least recently used key if capacity exceeded\n        self.cache[key] = value\n`,
  hints: [
    'Consider using a Doubly Linked List paired with a Hash Map for O(1) lookup and removal.',
    'In Python, collections.OrderedDict provides built-in move_to_end() functionality.',
  ],
  testCases: [
    { input: 'LRUCache(2); put(1,1); put(2,2); get(1)', expectedOutput: '1' },
    { input: 'put(3,3); get(2)', expectedOutput: '-1 (evicted)' },
  ],
  xp: 75,
};

const DEBUG_INCIDENT: DebugChallenge = {
  id: 'debug-1',
  title: 'FastAPI Concurrency Lock on Shared Balance Update',
  category: 'Concurrency',
  symptom: 'Account balances went negative under concurrent parallel withdrawal stress tests in production.',
  scenario: 'Under high concurrent load (>5,000 requests/sec), users were able to double-spend account balances due to non-atomic read-then-write database updates.',
  brokenCode: `# BUGGY SERVICE FUNCTION
async def withdraw_funds(account_id: str, amount: float, db: AsyncSession):
    # Bug: SELECT without FOR UPDATE allows parallel transactions to read same balance
    account = await db.get(Account, account_id)
    if account.balance >= amount:
        await asyncio.sleep(0.05) # Simulates network latency
        account.balance -= amount
        await db.commit()
        return {"status": "success", "new_balance": account.balance}
    raise HTTPException(status_code=400, detail="Insufficient funds")`,
  fixedCodeSnippet: `async def withdraw_funds(account_id: str, amount: float, db: AsyncSession):
    # Fix: SELECT with row-level locking (FOR UPDATE)
    result = await db.execute(select(Account).where(Account.id == account_id).with_for_update())
    account = result.scalar_one_or_none()
    if account and account.balance >= amount:
        account.balance -= amount
        await db.commit()
        return {"status": "success", "new_balance": account.balance}
    raise HTTPException(status_code=400, detail="Insufficient funds")`,
  explanationExpected: 'Use row-level database locking (SELECT ... WITH FOR UPDATE) or atomic SQL decrement (UPDATE account SET balance = balance - amount WHERE balance >= amount) to prevent race condition.',
  xpReward: 50,
};

export const CodingArena: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'arena' | 'debugging' | 'review'>('arena');

  // Coding Challenge State
  const challenge = DAILY_CHALLENGE;
  const [userCode, setUserCode] = useState(challenge.starterCode);
  const [showHint, setShowHint] = useState(false);
  const [testResults, setTestResults] = useState<{ passed: boolean; message: string }[] | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Debugging Workspace State
  const debugChallenge = DEBUG_INCIDENT;
  const [debugCode, setDebugCode] = useState(debugChallenge.brokenCode);
  const [explanation, setExplanation] = useState('');
  const [debugScore, setDebugScore] = useState<number | null>(null);

  // Code Review State
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleRunTestCases = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      setIsRunningTests(false);
      setTestResults([
        { passed: true, message: 'Test Case 1: LRUCache(2); put(1,1); put(2,2); get(1) -> Expected: 1, Output: 1 [Passed in 1.4ms]' },
        { passed: true, message: 'Test Case 2: Eviction Check; put(3,3); get(2) -> Expected: -1, Output: -1 [Passed in 1.1ms]' },
        { passed: true, message: 'Test Case 3: Update Value; put(4,4); get(1) -> Expected: -1, Output: -1 [Passed in 0.9ms]' },
      ]);
    }, 600);
  };

  const handleEvaluateDebug = () => {
    setDebugScore(95);
  };

  const handleRequestReview = () => {
    setReviewSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Algorithms & Code Quality Engine
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Daily Coding Arena & Live Debugging Workspace
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Algorithmic problem-solving, real production incident debugging, and automated code quality review rubrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="primary">+{challenge.xp} XP Available</Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        variant="pills"
        activeTab={activeTab}
        onChange={tabId => setActiveTab(tabId as any)}
        tabs={[
          { id: 'arena', label: '1. Daily Coding Arena', icon: <Code2 className="w-4 h-4" /> },
          { id: 'debugging', label: '2. Live Incident Debugging', icon: <Bug className="w-4 h-4" /> },
          { id: 'review', label: '3. Professional Code Review', icon: <ShieldCheck className="w-4 h-4" /> },
        ]}
      />

      {/* Tab 1: Coding Arena */}
      {activeTab === 'arena' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Problem Statement */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <Badge variant="warning">{challenge.difficulty}</Badge>
              <span className="flex items-center gap-1 text-slate-500 font-mono">
                <Clock className="w-3.5 h-3.5" /> 20:00 Mins Timer
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900">{challenge.title}</h2>
            <p className="text-slate-600 leading-relaxed">{challenge.description}</p>

            {/* Test Case Previews */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-900 block">Example Test Cases:</span>
              {challenge.testCases.map((tc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px]">
                  <p className="text-slate-500">Input: <span className="text-slate-900 font-bold">{tc.input}</span></p>
                  <p className="text-slate-500">Expected: <span className="text-emerald-600 font-bold">{tc.expectedOutput}</span></p>
                </div>
              ))}
            </div>

            {/* Hint Box */}
            <div className="pt-2">
              {showHint ? (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                  <p className="font-bold flex items-center gap-1.5 mb-1"><Lightbulb className="w-4 h-4" /> Hint:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {challenge.hints.map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                </div>
              ) : (
                <Button variant="ghost" size="xs" onClick={() => setShowHint(true)} leftIcon={<Lightbulb className="w-3.5 h-3.5" />}>
                  Need a Hint? (Costs 5 XP)
                </Button>
              )}
            </div>
          </div>

          {/* Code Workspace */}
          <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 shadow-2xl p-4 flex flex-col font-mono text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-brand-400 font-bold">solution.py (Python 3.11)</span>
              <div className="flex items-center gap-2">
                <Button size="xs" variant="ghost" onClick={() => setUserCode(challenge.starterCode)} className="text-slate-400">
                  <RotateCcw className="w-3 h-3" />
                </Button>
                <Button size="xs" variant="success" leftIcon={<Play className="w-3 h-3" />} onClick={handleRunTestCases} isLoading={isRunningTests}>
                  Run Tests & Submit
                </Button>
              </div>
            </div>

            <textarea
              value={userCode}
              onChange={e => setUserCode(e.target.value)}
              className="flex-1 min-h-[300px] bg-slate-950 p-3 rounded-xl border border-slate-800 text-emerald-400 resize-none outline-none leading-relaxed"
              spellCheck={false}
            />

            {/* Test Results Output */}
            {testResults && (
              <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30 space-y-1.5">
                <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> All 3 Test Cases Passed! (+75 XP Earned)
                </p>
                {testResults.map((tr, idx) => (
                  <p key={idx} className="text-[11px] text-slate-400">{tr.message}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Live Incident Debugging */}
      {activeTab === 'debugging' && (
        <div className="space-y-6">
          <div className="p-5 bg-rose-950/20 border border-rose-500/30 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <h3 className="font-bold text-rose-400 text-sm">Active Incident: {debugChallenge.title}</h3>
              <p className="text-slate-300"><strong className="text-white">Symptom:</strong> {debugChallenge.symptom}</p>
              <p className="text-slate-400"><strong className="text-slate-300">Scenario:</strong> {debugChallenge.scenario}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 font-mono text-xs space-y-2">
              <span className="text-rose-400 font-bold block">Broken Production Code Snippet:</span>
              <textarea
                value={debugCode}
                onChange={e => setDebugCode(e.target.value)}
                className="w-full h-72 bg-slate-950 p-3 rounded-xl border border-slate-800 text-rose-300 resize-none outline-none leading-relaxed"
                spellCheck={false}
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">Root Cause Explanation & Fix Proposal</h3>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Explain the root cause of this bug:</label>
                <textarea
                  value={explanation}
                  onChange={e => setExplanation(e.target.value)}
                  placeholder="Describe why the race condition occurs under high concurrency..."
                  className="w-full h-32 p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-brand-500 outline-none text-xs"
                />
              </div>

              <Button variant="primary" size="md" className="w-full font-bold" onClick={handleEvaluateDebug}>
                Submit Fix & Score Solution
              </Button>

              {debugScore !== null && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">Debugging Score: {debugScore}/100</span>
                    <Badge variant="success">Incident Resolved</Badge>
                  </div>
                  <p className="text-xs text-emerald-800">
                    {debugChallenge.explanationExpected}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Code Review Simulator */}
      {activeTab === 'review' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Automated Enterprise Code Review Rubric</h2>
              <p className="text-xs text-slate-500">Evaluates submitted repository across 8 professional software engineering criteria.</p>
            </div>
            <Button variant="primary" size="sm" onClick={handleRequestReview}>
              Trigger Automated Review
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { title: 'Naming & Semantics', score: '10/10', color: 'text-emerald-600' },
              { title: 'Code Structure / Modular', score: '9/10', color: 'text-emerald-600' },
              { title: 'Core Logic & Accuracy', score: '10/10', color: 'text-emerald-600' },
              { title: 'Docstrings & Comments', score: '9/10', color: 'text-emerald-600' },
              { title: 'Readability & PEP 8', score: '10/10', color: 'text-emerald-600' },
              { title: 'Performance & Big-O', score: '9/10', color: 'text-emerald-600' },
              { title: 'Security & Sanity Check', score: '9/10', color: 'text-emerald-600' },
              { title: 'Cloud Best Practices', score: '10/10', color: 'text-emerald-600' },
            ].map(r => (
              <div key={r.title} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold block">{r.title}</span>
                <span className={clsx('text-xl font-bold font-mono mt-1 block', r.color)}>{r.score}</span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-900">Reviewer Recommendations:</h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              <li>Used type hints and Pydantic v2 schemas consistently throughout all router endpoints.</li>
              <li>Graph simplification algorithm for debt settlement is optimal $O(V+E)$.</li>
              <li>Database migrations handled flawlessly with Alembic.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
