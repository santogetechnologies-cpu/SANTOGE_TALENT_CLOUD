import React, { useState } from 'react';
import { HeartPulse, FileText, CheckCircle2, AlertTriangle, Search, Stethoscope, ShieldCheck, DollarSign } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import clsx from 'clsx';

export const MedicalCodingSimulator: React.FC = () => {
  const [selectedIcd, setSelectedIcd] = useState<string[]>(['J18.9', 'I10']);
  const [selectedCpt, setSelectedCpt] = useState<string[]>(['99214', '71045']);
  const [scrubberPassed, setScrubberPassed] = useState(false);
  const [claimStatus, setClaimStatus] = useState<string | null>(null);

  const ICD_DATABASE = [
    { code: 'J18.9', desc: 'Pneumonia, unspecified organism', category: 'Respiratory' },
    { code: 'I10', desc: 'Essential (primary) hypertension', category: 'Circulatory' },
    { code: 'E11.9', desc: 'Type 2 diabetes mellitus without complications', category: 'Endocrine' },
    { code: 'A41.9', desc: 'Sepsis, unspecified organism', category: 'Infectious' },
    { code: 'M54.5', desc: 'Low back pain, unspecified', category: 'Musculoskeletal' },
  ];

  const CPT_DATABASE = [
    { code: '99214', desc: 'Office or other outpatient visit (Moderate MDM, 30-39 mins)', fee: '₹3,200' },
    { code: '71045', desc: 'Radiologic examination, chest; single view', fee: '₹1,500' },
    { code: '94010', desc: 'Spirometry, including graphic record, total capability', fee: '₹2,400' },
    { code: '80053', desc: 'Comprehensive metabolic panel (CMP)', fee: '₹1,800' },
  ];

  const handleToggleIcd = (code: string) => {
    setSelectedIcd(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleToggleCpt = (code: string) => {
    setSelectedCpt(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const handleRunScrubber = () => {
    // Check if correct codes are selected for pneumonia scenario (J18.9 + 99214 + 71045)
    if (selectedIcd.includes('J18.9') && selectedCpt.includes('99214') && selectedCpt.includes('71045')) {
      setScrubberPassed(true);
      setClaimStatus('✔ Clean Claim Validated: 100% Medical Necessity Met. Estimated Reimbursement: ₹4,700.');
    } else {
      setScrubberPassed(false);
      setClaimStatus('⚠ Scrubber Alert: Missing Chest X-Ray procedure (CPT 71045) or Primary Diagnosis (ICD-10 J18.9).');
    }
  };

  return (
    <div className="bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans text-xs flex flex-col h-[700px]">
      {/* Titlebar */}
      <div className="h-12 bg-slate-950 px-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-sm text-rose-400">
          <HeartPulse className="w-5 h-5" /> Hospital EHR Clinical Chart & Medical Coding Scrubber
        </div>
        <Badge variant="primary" size="sm">
          AAPC / AHIMA Simulator Standard
        </Badge>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-slate-900 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Patient Clinical Encounter Chart */}
        <div className="space-y-4">
          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Patient Encounter #94821</span>
                <h3 className="text-sm font-bold text-white">Ramesh K., 58 Yrs Male</h3>
              </div>
              <Badge variant="warning">Inpatient Admission</Badge>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p>
                <span className="font-bold text-rose-400">Chief Complaint:</span> 4-day history of worsening cough, productive rust-colored sputum, fever of 102.4°F, and right-sided pleuritic chest pain.
              </p>
              <p>
                <span className="font-bold text-slate-400">Past Medical History:</span> Essential primary hypertension managed with Amlodipine 5mg.
              </p>
              <p>
                <span className="font-bold text-cyan-400">Diagnostic Findings:</span> Single view chest radiograph demonstrates focal consolidation in right lower lobe consistent with community-acquired pneumonia.
              </p>
              <p>
                <span className="font-bold text-emerald-400">Physician Plan:</span> Moderate medical decision making (MDM), prescribed Ceftriaxone IV and Azithromycin.
              </p>
            </div>
          </div>

          {/* Real-time Scrubber Result Box */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> CMS-1500 Claim Scrubber
              </span>
              <Button size="xs" variant="primary" onClick={handleRunScrubber}>
                Audit & Scrub Claim
              </Button>
            </div>
            {claimStatus && (
              <p className={clsx('p-3 rounded-xl text-xs font-semibold', scrubberPassed ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950/60 text-rose-300 border border-rose-500/40')}>
                {claimStatus}
              </p>
            )}
          </div>
        </div>

        {/* Right: Code Pickers */}
        <div className="space-y-4">
          {/* ICD-10 Diagnosis Picker */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs">1. Select ICD-10-CM Diagnosis Codes</span>
              <span className="text-[10px] text-slate-400">{selectedIcd.length} selected</span>
            </div>
            <div className="space-y-1.5">
              {ICD_DATABASE.map(item => {
                const isSelected = selectedIcd.includes(item.code);
                return (
                  <button
                    key={item.code}
                    onClick={() => handleToggleIcd(item.code)}
                    className={clsx(
                      'w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors cursor-pointer',
                      isSelected ? 'bg-brand-950/60 border-brand-500/50 text-white font-bold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    )}
                  >
                    <div>
                      <span className="font-mono text-brand-400 mr-2">{item.code}</span>
                      <span>{item.desc}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{item.category}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CPT Procedure Code Picker */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs">2. Select CPT Procedure Codes</span>
              <span className="text-[10px] text-slate-400">{selectedCpt.length} selected</span>
            </div>
            <div className="space-y-1.5">
              {CPT_DATABASE.map(item => {
                const isSelected = selectedCpt.includes(item.code);
                return (
                  <button
                    key={item.code}
                    onClick={() => handleToggleCpt(item.code)}
                    className={clsx(
                      'w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors cursor-pointer',
                      isSelected ? 'bg-emerald-950/60 border-emerald-500/50 text-white font-bold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                    )}
                  >
                    <div>
                      <span className="font-mono text-emerald-400 mr-2">{item.code}</span>
                      <span>{item.desc}</span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-300 font-bold">{item.fee}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
