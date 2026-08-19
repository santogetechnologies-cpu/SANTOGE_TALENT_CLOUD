import React, { useState } from 'react';
import { Database, Play, Table, Cpu, Zap, RotateCcw, CheckCircle, Info } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import clsx from 'clsx';

const DEFAULT_QUERY = `-- SantoGe Placement Intelligence Query
-- Find top candidates with Talent Score >= 800 and their verified placement status
SELECT 
    s.id,
    s.name,
    s.roll_number,
    s.talent_score,
    s.iri_score,
    c.name as college_name,
    d.role_title as placed_role
FROM students s
JOIN colleges c ON s.college_id = c.id
LEFT JOIN campus_drives d ON s.placed_drive_id = d.id
WHERE s.talent_score >= 800
ORDER BY s.talent_score DESC
LIMIT 5;`;

const SIMULATOR_SCHEMA_TABLES = [
  {
    name: 'students',
    rowsCount: 4250,
    columns: ['id (UUID)', 'name (VARCHAR)', 'roll_number (VARCHAR)', 'talent_score (INT)', 'iri_score (FLOAT)', 'college_id (UUID)', 'placed_drive_id (UUID)'],
  },
  {
    name: 'colleges',
    rowsCount: 3,
    columns: ['id (UUID)', 'name (VARCHAR)', 'code (VARCHAR)', 'placement_rate (FLOAT)'],
  },
  {
    name: 'campus_drives',
    rowsCount: 24,
    columns: ['id (UUID)', 'company_name (VARCHAR)', 'role_title (VARCHAR)', 'ctc_lpa (FLOAT)', 'status (VARCHAR)'],
  },
  {
    name: 'skills',
    rowsCount: 140,
    columns: ['id (UUID)', 'student_id (UUID)', 'skill_name (VARCHAR)', 'score (INT)', 'verified (BOOLEAN)'],
  },
];

const QUERY_RESULTS = [
  { id: 'stu-102', name: 'Ananya Iyer', roll_number: 'AIT2022CSE018', talent_score: 915, iri_score: 94.6, college_name: 'Apex Institute of Technology', placed_role: 'Full Stack Python & Cloud' },
  { id: 'stu-301', name: 'Dr. Megha Nair', roll_number: 'ZIMTS2022BME014', talent_score: 880, iri_score: 87.5, college_name: 'Zenith Institute of MedTech', placed_role: 'Medical Coding Specialist' },
  { id: 'stu-201', name: 'Varun Hegde', roll_number: 'HEC2022CSE099', talent_score: 865, iri_score: 89.9, college_name: 'Horizon Engineering College', placed_role: 'Cloud Support Associate' },
  { id: 'stu-101', name: 'Rahul Sharma', roll_number: 'AIT2022CSE042', talent_score: 845, iri_score: 89.2, college_name: 'Apex Institute of Technology', placed_role: 'Software Development Engineer - 1' },
];

export const SQLSimulator: React.FC = () => {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [activeTab, setActiveTab] = useState<'results' | 'execution_plan' | 'advisor'>('results');
  const [isExecuting, setIsExecuting] = useState(false);
  const [hasRun, setHasRun] = useState(true);

  const handleRunQuery = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setHasRun(true);
    }, 400);
  };

  return (
    <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-mono text-xs flex flex-col h-[700px]">
      {/* Titlebar */}
      <div className="h-10 bg-slate-950 px-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-brand-400" />
          <span className="text-white font-sans text-xs font-bold">
            PostgreSQL Studio & Query Plan Simulator
          </span>
          <Badge variant="primary" size="sm" className="ml-2 font-mono">
            DB: santoge_production
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="success"
            leftIcon={<Play className="w-3 h-3" />}
            onClick={handleRunQuery}
            isLoading={isExecuting}
          >
            Execute (F5)
          </Button>
          <Button
            size="xs"
            variant="ghost"
            leftIcon={<RotateCcw className="w-3 h-3" />}
            onClick={() => setQuery(DEFAULT_QUERY)}
            className="text-slate-400 hover:text-white"
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left: Schema Explorer */}
        <div className="w-60 bg-slate-950 border-r border-slate-800 flex flex-col">
          <div className="p-3 border-b border-slate-800/80 text-slate-400 font-sans font-bold text-[11px] uppercase tracking-wider flex items-center gap-2">
            <Table className="w-3.5 h-3.5" /> Schema Tables
          </div>
          <div className="p-2 space-y-3 overflow-y-auto flex-1">
            {SIMULATOR_SCHEMA_TABLES.map(table => (
              <div key={table.name} className="bg-slate-900/80 rounded-xl p-2.5 border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-brand-300 text-xs">{table.name}</span>
                  <span className="text-[10px] text-slate-500">{table.rowsCount} rows</span>
                </div>
                <div className="space-y-0.5 text-[10px] text-slate-400">
                  {table.columns.map(col => (
                    <div key={col} className="truncate hover:text-slate-200">
                      • {col}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Editor & Execution Results */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
          {/* Query Editor */}
          <div className="h-48 border-b border-slate-800 flex flex-col">
            <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>SQL Query Editor</span>
              <span className="text-[10px] text-emerald-400 font-mono">Autocommit: ON</span>
            </div>
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 p-3 bg-slate-900 text-cyan-300 font-mono text-xs leading-relaxed resize-none outline-none selection:bg-brand-600"
              spellCheck={false}
            />
          </div>

          {/* Results Tabs */}
          <div className="h-9 bg-slate-950 border-b border-slate-800 flex items-center px-2 gap-2 text-xs">
            <button
              onClick={() => setActiveTab('results')}
              className={clsx(
                'px-3 py-1 rounded-md font-sans text-xs font-semibold cursor-pointer transition-colors',
                activeTab === 'results' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              Data Grid (4 rows • 1.2ms)
            </button>
            <button
              onClick={() => setActiveTab('execution_plan')}
              className={clsx(
                'px-3 py-1 rounded-md font-sans text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1',
                activeTab === 'execution_plan' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Cpu className="w-3.5 h-3.5" /> Visual EXPLAIN Plan
            </button>
            <button
              onClick={() => setActiveTab('advisor')}
              className={clsx(
                'px-3 py-1 rounded-md font-sans text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1',
                activeTab === 'advisor' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Index Advisor
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-3 overflow-y-auto bg-slate-900/60 font-sans text-xs">
            {activeTab === 'results' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-800 divide-y divide-slate-800">
                  <thead className="bg-slate-950 text-[11px] font-mono text-slate-400">
                    <tr>
                      <th className="p-2">id</th>
                      <th className="p-2">name</th>
                      <th className="p-2">roll_number</th>
                      <th className="p-2">talent_score</th>
                      <th className="p-2">iri_score</th>
                      <th className="p-2">college_name</th>
                      <th className="p-2">placed_role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-slate-300">
                    {QUERY_RESULTS.map(r => (
                      <tr key={r.id} className="hover:bg-slate-800/60">
                        <td className="p-2 text-brand-400">{r.id}</td>
                        <td className="p-2 font-bold text-white">{r.name}</td>
                        <td className="p-2 text-slate-400">{r.roll_number}</td>
                        <td className="p-2 text-emerald-400 font-bold">{r.talent_score}</td>
                        <td className="p-2 text-amber-400">{r.iri_score}%</td>
                        <td className="p-2 text-slate-300">{r.college_name}</td>
                        <td className="p-2 text-cyan-300">{r.placed_role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'execution_plan' && (
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <p className="text-emerald-400 font-bold mb-1">Limit (cost=8.42..8.43 rows=5 width=92)</p>
                  <p className="text-slate-400 ml-4">-&gt; Sort (cost=8.42..8.43 rows=5 width=92) [Sort Key: s.talent_score DESC]</p>
                  <p className="text-slate-400 ml-8">-&gt; Hash Left Join (cost=4.20..8.32 rows=5 width=92)</p>
                  <p className="text-brand-400 ml-12">-&gt; Index Scan using idx_students_talent_score on students s (cost=0.28..4.15 rows=5)</p>
                  <p className="text-amber-400 ml-12">   Filter: (talent_score &gt;= 800)</p>
                </div>
                <div className="grid grid-cols-3 gap-3 font-sans text-xs">
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Planning Time</span>
                    <span className="font-bold text-emerald-400">0.14 ms</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Execution Time</span>
                    <span className="font-bold text-emerald-400">1.08 ms</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Buffer Hit Ratio</span>
                    <span className="font-bold text-emerald-400">100.0%</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advisor' && (
              <div className="space-y-3 font-sans text-xs">
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-start gap-2 text-emerald-300">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <div>
                    <p className="font-bold">Index Optimization: Optimal (Score 98/100)</p>
                    <p className="text-[11px] text-emerald-400/80 mt-0.5">
                      Query leveraged B-Tree index <code className="font-mono bg-slate-950 px-1 py-0.5 rounded">idx_students_talent_score</code> avoiding expensive Sequential Table Scan across 4,250 records.
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
                  <p className="font-bold text-slate-100 mb-1">Recommended Next Query Challenge:</p>
                  <p className="text-xs text-slate-400">
                    Write a Recursive Common Table Expression (CTE) to calculate the cumulative percentile distribution of Talent Scores per department.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
