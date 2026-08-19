import React, { useState } from 'react';
import { collegeService } from '../../services/collegeService';
import { College } from '../../types/college';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import {
  Building2,
  CheckCircle2,
  Users,
  ShieldCheck,
  Award,
  ArrowRight,
  Plus,
} from 'lucide-react';

export const CollegeCreationWizard: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [collegeName, setCollegeName] = useState('');
  const [collegeCode, setCollegeCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [cpoName, setCpoName] = useState('');
  const [cpoEmail, setCpoEmail] = useState('');
  const [createdCollege, setCreatedCollege] = useState<College | null>(null);

  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await collegeService.createCollege({
      name: collegeName,
      code: collegeCode,
      city,
      state,
      adminName,
      adminEmail,
      placementOfficerName: cpoName,
      placementOfficerEmail: cpoEmail,
    });
    setCreatedCollege(created);
    setStep(3);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <Building2 className="w-3.5 h-3.5" /> Institutional Provisioning
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            College Onboarding & CPOS Creation Wizard
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Provision new college portal, configure administrator permissions, and establish placement officer workspaces.
          </p>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto p-8 space-y-6 text-xs">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Step 1: College Profile & Location</h3>
            <Input
              label="College / University Name"
              value={collegeName}
              onChange={e => setCollegeName(e.target.value)}
              placeholder="e.g. National Institute of Technology, Trichy"
              required
            />
            <Input
              label="Institutional Code"
              value={collegeCode}
              onChange={e => setCollegeCode(e.target.value)}
              placeholder="e.g. NITT-TN"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Tiruchirappalli"
                required
              />
              <Input
                label="State"
                value={state}
                onChange={e => setState(e.target.value)}
                placeholder="Tamil Nadu"
                required
              />
            </div>
            <div className="flex justify-end pt-3">
              <Button
                variant="primary"
                onClick={() => setStep(2)}
                disabled={!collegeName || !collegeCode}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Stakeholders
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleFinalize} className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Step 2: Assign College Super Admin & CPO</h3>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-900 block">1. College Super Admin (Principal / Dean):</span>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Admin Full Name"
                  value={adminName}
                  onChange={e => setAdminName(e.target.value)}
                  placeholder="Dr. K. Ramaswamy"
                  required
                />
                <Input
                  label="Official Email"
                  type="email"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  placeholder="principal@nitt.edu"
                  required
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="font-bold text-slate-900 block">2. College Placement Officer (CPO):</span>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Placement Officer Name"
                  value={cpoName}
                  onChange={e => setCpoName(e.target.value)}
                  placeholder="Prof. S. Venkatesh"
                  required
                />
                <Input
                  label="CPO Email"
                  type="email"
                  value={cpoEmail}
                  onChange={e => setCpoEmail(e.target.value)}
                  placeholder="cpo@nitt.edu"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="primary" type="submit">
                Provision & Activate College Portal
              </Button>
            </div>
          </form>
        )}

        {step === 3 && createdCollege && (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{createdCollege.name} Activated!</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Institutional portal provisioned with isolated data scope. Login credentials dispatched to {createdCollege.adminEmail} and {createdCollege.placementOfficerEmail}.
            </p>
            <Button variant="primary" size="sm" onClick={() => setStep(1)}>
              Onboard Another College
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
