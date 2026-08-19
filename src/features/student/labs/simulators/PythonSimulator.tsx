import React, { useState } from 'react';
import { Play, RotateCcw, Bug, Terminal, FolderTree, FileCode, CheckCircle2, Download, PackageCheck } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import clsx from 'clsx';

const DEFAULT_FILES: Record<string, string> = {
  'main.py': `from fastapi import FastAPI, HTTPException
import uvicorn
from pydantic import BaseModel

app = FastAPI(title="SantoGe Talent API")

class Candidate(BaseModel):
    name: str
    talent_score: int
    skill: str

# Sample in-memory candidates
candidates_db = [
    {"id": 1, "name": "Rahul Sharma", "talent_score": 845, "skill": "Python/FastAPI"},
    {"id": 2, "name": "Ananya Iyer", "talent_score": 915, "skill": "PyTorch/ML"}
]

@app.get("/")
def read_root():
    return {"message": "Welcome to SantoGe Talent Cloud Microservice", "status": "ONLINE"}

@app.get("/candidates")
def get_candidates():
    return {"total": len(candidates_db), "data": candidates_db}

@app.post("/candidates")
def create_candidate(candidate: Candidate):
    new_id = len(candidates_db) + 1
    record = {"id": new_id, **candidate.dict()}
    candidates_db.append(record)
    return {"status": "SUCCESS", "record": record}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)`,
  'models.py': `from pydantic import BaseModel, Field

class CandidateProfile(BaseModel):
    student_id: str
    talent_score: int = Field(..., ge=0, le=1000)
    iri_score: float = Field(..., ge=0.0, le=100.0)
    is_interview_ready: bool = True`,
  'utils.py': `def calculate_placement_tier(talent_score: int) -> str:
    if talent_score >= 800:
        return "Tier 1: Premium Product Companies"
    elif talent_score >= 650:
        return "Tier 2: Enterprise IT & Consulting"
    return "Tier 3: Foundation Accelerator"`,
};

export const PythonSimulator: React.FC = () => {
  const [files, setFiles] = useState<Record<string, string>>(DEFAULT_FILES);
  const [activeFile, setActiveFile] = useState<string>('main.py');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'SantoGe Virtual Python Environment v3.11.4 [Linux x86_64]',
    'Type "run" or click ▶ Run Application to start the server.',
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [debuggerActive, setDebuggerActive] = useState(false);
  const [installedPackages, setInstalledPackages] = useState<string[]>(['fastapi==0.110.0', 'uvicorn==0.28.0', 'pydantic==2.6.4']);
  const [newPackageInput, setNewPackageInput] = useState('');

  const handleRunCode = () => {
    setIsRunning(true);
    setTerminalLogs(prev => [
      ...prev,
      `$ python ${activeFile}`,
      'INFO:     Started server process [PID 4120]',
      'INFO:     Waiting for application startup.',
      'INFO:     Application startup complete.',
      'INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)',
      'HTTP GET / 200 OK (0.84ms) -> {"message": "Welcome to SantoGe Talent Cloud Microservice", "status": "ONLINE"}',
      'HTTP GET /candidates 200 OK (1.12ms) -> Returned 2 candidate records.',
      '✔ Test suite passed: 3 test cases completed with 0 errors.',
    ]);
    setTimeout(() => setIsRunning(false), 800);
  };

  const handleInstallPackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackageInput.trim()) return;
    const pkg = newPackageInput.trim();
    setInstalledPackages(prev => [...prev, `${pkg}==latest`]);
    setTerminalLogs(prev => [
      ...prev,
      `$ pip install ${pkg}`,
      `Collecting ${pkg}...`,
      `Successfully installed ${pkg}`,
    ]);
    setNewPackageInput('');
  };

  const handleReset = () => {
    setFiles(DEFAULT_FILES);
    setActiveFile('main.py');
    setTerminalLogs(['Environment reset to baseline.']);
  };

  return (
    <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-mono text-xs flex flex-col h-[700px]">
      {/* VS Code Titlebar */}
      <div className="h-10 bg-slate-950 px-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-slate-400 font-sans text-xs ml-2 font-semibold">
            SantoGe VS Code Simulator — {activeFile}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="success"
            leftIcon={<Play className="w-3 h-3" />}
            onClick={handleRunCode}
            isLoading={isRunning}
          >
            Run Script
          </Button>
          <Button
            size="xs"
            variant={debuggerActive ? 'danger' : 'outline'}
            leftIcon={<Bug className="w-3 h-3" />}
            onClick={() => setDebuggerActive(!debuggerActive)}
            className="text-slate-300 border-slate-700 bg-slate-800 hover:bg-slate-700"
          >
            {debuggerActive ? 'Stop Debug' : 'Debug'}
          </Button>
          <Button
            size="xs"
            variant="ghost"
            leftIcon={<RotateCcw className="w-3 h-3" />}
            onClick={handleReset}
            className="text-slate-400 hover:text-white"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Main Workspace: Sidebar + Editor + Output */}
      <div className="flex flex-1 min-h-0">
        {/* Left Explorer & Package Panel */}
        <div className="w-56 bg-slate-950 border-r border-slate-800 flex flex-col">
          <div className="p-3 border-b border-slate-800/80 flex items-center gap-2 text-slate-400 font-sans font-bold text-[11px] uppercase tracking-wider">
            <FolderTree className="w-3.5 h-3.5" /> Explorer
          </div>

          <div className="p-2 space-y-1">
            {Object.keys(files).map(fileName => (
              <button
                key={fileName}
                onClick={() => setActiveFile(fileName)}
                className={clsx(
                  'w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer text-xs',
                  activeFile === fileName
                    ? 'bg-brand-600/30 text-brand-300 border border-brand-500/40 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                )}
              >
                <FileCode className="w-3.5 h-3.5 text-brand-400" />
                <span>{fileName}</span>
              </button>
            ))}
          </div>

          {/* Virtual Package Manager */}
          <div className="mt-auto p-3 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              <PackageCheck className="w-3.5 h-3.5 text-emerald-400" /> Virtual Packages
            </div>
            <div className="space-y-1 max-h-24 overflow-y-auto mb-2 text-[10px] text-slate-300">
              {installedPackages.map(pkg => (
                <div key={pkg} className="flex items-center justify-between bg-slate-800/80 px-2 py-0.5 rounded">
                  <span>{pkg.split('==')[0]}</span>
                  <span className="text-slate-500">{pkg.split('==')[1]}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleInstallPackage} className="flex gap-1">
              <input
                type="text"
                placeholder="pip install pkg"
                value={newPackageInput}
                onChange={e => setNewPackageInput(e.target.value)}
                className="w-full bg-slate-800 text-[10px] px-2 py-1 rounded border border-slate-700 text-white placeholder-slate-500 outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="bg-brand-600 px-2 py-1 rounded text-[10px] font-bold text-white hover:bg-brand-700 cursor-pointer"
              >
                +
              </button>
            </form>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 flex flex-col bg-slate-900 min-w-0">
          <div className="flex items-center bg-slate-950 px-3 border-b border-slate-800 gap-1 overflow-x-auto">
            <div className="bg-slate-900 text-brand-300 px-3 py-1.5 text-xs font-semibold border-t-2 border-brand-500 flex items-center gap-2">
              <FileCode className="w-3.5 h-3.5" />
              <span>{activeFile}</span>
            </div>
          </div>

          <textarea
            value={files[activeFile] || ''}
            onChange={e =>
              setFiles(prev => ({ ...prev, [activeFile]: e.target.value }))
            }
            className="flex-1 p-4 bg-slate-900 text-emerald-400 font-mono text-xs leading-relaxed resize-none outline-none selection:bg-brand-600 selection:text-white"
            spellCheck={false}
          />

          {/* Terminal / Output Console */}
          <div className="h-48 bg-slate-950 border-t border-slate-800 flex flex-col">
            <div className="px-3 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-slate-400 font-sans text-[11px]">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-brand-400" />
                <span className="font-bold">Integrated Terminal / Stdout</span>
              </div>
              <button
                onClick={() => setTerminalLogs([])}
                className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                Clear
              </button>
            </div>
            <div className="flex-1 p-3 overflow-y-auto space-y-1 font-mono text-[11px] text-slate-300">
              {terminalLogs.map((log, i) => (
                <div
                  key={i}
                  className={clsx(
                    log.startsWith('$') && 'text-brand-400 font-bold',
                    log.includes('200 OK') && 'text-emerald-400',
                    log.includes('INFO:') && 'text-slate-400',
                    log.includes('✔') && 'text-emerald-300 font-bold'
                  )}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
