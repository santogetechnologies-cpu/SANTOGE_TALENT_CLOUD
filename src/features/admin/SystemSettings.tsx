import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Settings, ShieldCheck, Sparkles, Sliders, CheckCircle2, Save, RefreshCw } from 'lucide-react';

interface ScoringWeights {
  technical: number;
  aptitude: number;
  projects: number;
}

interface SecurityPolicies {
  multiTenantIsolation: boolean;
  mentorScoreEditing: boolean;
  recruiterContactMasking: boolean;
}

export const SystemSettings: React.FC = () => {
  const [weights, setWeights] = useState<ScoringWeights>({
    technical: 30,
    aptitude: 30,
    projects: 40,
  });
  const [policies, setPolicies] = useState<SecurityPolicies>({
    multiTenantIsolation: true,
    mentorScoreEditing: false,
    recruiterContactMasking: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { data, error } = await (supabase
        .from('system_settings') as any)
        .select('*');

      if (error) {
        console.warn('system_settings fetch notice:', error.message);
      }

      if (data && data.length > 0) {
        data.forEach((row: any) => {
          if (row.key === 'talent_score_weights' && row.value) {
            setWeights(row.value);
          }
          if (row.key === 'security_policies' && row.value) {
            setPolicies(row.value);
          }
        });
      }
    } catch (err: any) {
      console.error('Error loading system settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    const total = Number(weights.technical) + Number(weights.aptitude) + Number(weights.projects);
    if (total !== 100) {
      setErrorMessage(`Total weight must equal 100%. Current total: ${total}%.`);
      setIsSaving(false);
      return;
    }

    try {
      await Promise.all([
        (supabase.from('system_settings') as any).upsert({
          key: 'talent_score_weights',
          value: weights,
          updated_at: new Date().toISOString(),
        }),
        (supabase.from('system_settings') as any).upsert({
          key: 'security_policies',
          value: policies,
          updated_at: new Date().toISOString(),
        }),
      ]);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setErrorMessage(err.message || 'Failed to persist settings to Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <Settings className="w-3.5 h-3.5" /> Platform Governance
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            System Settings & Scoring Algorithm Configuration
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage dynamic Talent Score weights, security scopes, and algorithmic placement parameters persisted in Supabase.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          onClick={loadSettings}
        >
          Reload Configuration
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Dynamic Scoring Weights Card */}
        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Talent Score (1000-Point Model) Dynamic Weights</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Configure percentage breakdown for student readiness and talent index computation.
              </p>
            </div>
            <Badge variant="primary">Persisted in Supabase</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 uppercase text-[11px]">Technical Skills & Labs</span>
                <span className="font-mono font-extrabold text-brand-600 text-sm">{weights.technical}% ({weights.technical * 10} Pts)</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={weights.technical}
                onChange={e => setWeights({ ...weights, technical: Number(e.target.value) })}
                className="w-full accent-brand-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">FastAPI, PostgreSQL concurrency, AWS microservices, and Docker labs.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 uppercase text-[11px]">Placement & Aptitude</span>
                <span className="font-mono font-extrabold text-emerald-600 text-sm">{weights.aptitude}% ({weights.aptitude * 10} Pts)</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={weights.aptitude}
                onChange={e => setWeights({ ...weights, aptitude: Number(e.target.value) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Quantitative problem solving, verbal reasoning, and speaking diagnostics.</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700 uppercase text-[11px]">Projects & Consistency</span>
                <span className="font-mono font-extrabold text-purple-600 text-sm">{weights.projects}% ({weights.projects * 10} Pts)</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={weights.projects}
                onChange={e => setWeights({ ...weights, projects: Number(e.target.value) })}
                className="w-full accent-purple-600 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">Industry capstones, GitHub review quality, and daily streak consistency.</p>
            </div>
          </div>

          <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-200 flex justify-between items-center">
            <span className="text-brand-900 font-semibold text-xs">Total Normalized Weight:</span>
            <span className={`font-mono font-bold text-sm ${weights.technical + weights.aptitude + weights.projects === 100 ? 'text-emerald-700' : 'text-rose-600'}`}>
              {weights.technical + weights.aptitude + weights.projects}% / 100%
            </span>
          </div>
        </Card>

        {/* Security Policies */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Role & Security Policy Engine</h3>
            <Badge variant="purple">Active Governance</Badge>
          </div>

          <div className="space-y-3 text-slate-700">
            <label className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100/70 transition-colors">
              <div>
                <p className="font-bold text-slate-900 text-xs">Multi-Tenant College Isolation Enforcement</p>
                <p className="text-[11px] text-slate-500">Isolate student records and placement schedules strictly to assigned college scopes.</p>
              </div>
              <input
                type="checkbox"
                checked={policies.multiTenantIsolation}
                onChange={e => setPolicies({ ...policies, multiTenantIsolation: e.target.checked })}
                className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
              />
            </label>

            <label className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100/70 transition-colors">
              <div>
                <p className="font-bold text-slate-900 text-xs">Mentor Direct Score Editing</p>
                <p className="text-[11px] text-slate-500">Allow mentors to override algorithmic IRI scores directly without review.</p>
              </div>
              <input
                type="checkbox"
                checked={policies.mentorScoreEditing}
                onChange={e => setPolicies({ ...policies, mentorScoreEditing: e.target.checked })}
                className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
              />
            </label>

            <label className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100/70 transition-colors">
              <div>
                <p className="font-bold text-slate-900 text-xs">Recruiter Private Contact Masking</p>
                <p className="text-[11px] text-slate-500">Mask student direct phone and email until an application reaches the shortlist stage.</p>
              </div>
              <input
                type="checkbox"
                checked={policies.recruiterContactMasking}
                onChange={e => setPolicies({ ...policies, recruiterContactMasking: e.target.checked })}
                className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
              />
            </label>
          </div>

          {errorMessage && (
            <p className="text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200 font-semibold text-xs text-center">
              {errorMessage}
            </p>
          )}

          {saveSuccess && (
            <p className="text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200 font-bold text-xs text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Platform configuration saved successfully to Supabase.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="primary"
              type="submit"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Platform Configuration
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
