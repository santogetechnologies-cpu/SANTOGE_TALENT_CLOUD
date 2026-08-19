import React, { useState } from 'react';
import { PythonSimulator } from './simulators/PythonSimulator';
import { SQLSimulator } from './simulators/SQLSimulator';
import { AWSSimulator } from './simulators/AWSSimulator';
import { SAPSimulator } from './simulators/SAPSimulator';
import { NetworkSimulator } from './simulators/NetworkSimulator';
import { MedicalCodingSimulator } from './simulators/MedicalCodingSimulator';
import { Terminal, Database, Cloud, Layers, Network, HeartPulse, Sparkles, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import clsx from 'clsx';

type LabTab = 'python' | 'sql' | 'aws' | 'sap' | 'network' | 'medical';

export const LabsHub: React.FC = () => {
  const [activeLab, setActiveLab] = useState<LabTab>('python');

  const labConfigs = [
    { id: 'python', label: 'Python VS Code', icon: <Terminal className="w-4 h-4 text-brand-500" />, desc: 'FastAPI, Debugger & Packages', badge: 'Full Stack' },
    { id: 'sql', label: 'SQL Studio', icon: <Database className="w-4 h-4 text-cyan-500" />, desc: 'Query Plan & Index Tuning', badge: 'PostgreSQL' },
    { id: 'aws', label: 'AWS Console', icon: <Cloud className="w-4 h-4 text-amber-500" />, desc: 'EC2, S3, IAM & CloudWatch', badge: 'Cloud' },
    { id: 'sap', label: 'SAP GUI', icon: <Layers className="w-4 h-4 text-indigo-500" />, desc: 'S/4HANA T-Codes (VA01/ME21N)', badge: 'ERP' },
    { id: 'network', label: 'Network Rack', icon: <Network className="w-4 h-4 text-emerald-500" />, desc: 'Packet Flow & Subnetting', badge: 'Cisco / CCNA' },
    { id: 'medical', label: 'Medical Coding', icon: <HeartPulse className="w-4 h-4 text-rose-500" />, desc: 'EHR Chart & Claim Scrubber', badge: 'ICD-10 / CPT' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Interactive Browser Simulators
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Professional Environment Labs
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Simulated enterprise consoles for real-world engineering, infrastructure, ERP, and healthcare workflows.
          </p>
        </div>
        <Badge variant="primary" size="md">
          6 Live Simulators Ready
        </Badge>
      </div>

      {/* Simulator Switcher Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {labConfigs.map(tab => {
          const isActive = activeLab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveLab(tab.id as LabTab)}
              className={clsx(
                'p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between',
                isActive
                  ? 'bg-slate-900 text-white border-slate-800 shadow-soft-lg ring-2 ring-brand-500/50'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-soft-sm'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={clsx('p-2 rounded-xl', isActive ? 'bg-slate-800' : 'bg-slate-100')}>
                  {tab.icon}
                </div>
                <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded', isActive ? 'bg-brand-900/80 text-brand-300' : 'bg-slate-100 text-slate-600')}>
                  {tab.badge}
                </span>
              </div>
              <div>
                <p className="font-bold text-xs">{tab.label}</p>
                <p className={clsx('text-[10px] mt-0.5 truncate', isActive ? 'text-slate-400' : 'text-slate-500')}>
                  {tab.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Simulator Container */}
      <div className="transition-all duration-200">
        {activeLab === 'python' && <PythonSimulator />}
        {activeLab === 'sql' && <SQLSimulator />}
        {activeLab === 'aws' && <AWSSimulator />}
        {activeLab === 'sap' && <SAPSimulator />}
        {activeLab === 'network' && <NetworkSimulator />}
        {activeLab === 'medical' && <MedicalCodingSimulator />}
      </div>
    </div>
  );
};
