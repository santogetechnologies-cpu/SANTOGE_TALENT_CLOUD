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
import { useNavigate } from 'react-router-dom';

export const CollegeCreationWizard: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [collegeName, setCollegeName] = useState('');
  const [collegeCode, setCollegeCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [createdCollege, setCreatedCollege] = useState<College | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const created = await collegeService.createCollege({
        name: collegeName,
        code: collegeCode,
        city,
        state,
        adminName,
        adminEmail,
      });
      setCreatedCollege(created);
      setStep(3);
    } catch (err) {
      console.error('Error creating college:', err);
    } finally {
      setIsSubmitting(false);
    }
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
            Provision new college portal and configure College Super Admin credentials.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate('/admin/colleges')}>
          ← Back to Colleges Directory
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto p-8 space-y-6 text-xs">
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Step 1: College Profile & Location</h3>
              <Badge variant="primary">Step 1 of 2</Badge>
            </div>

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
                Continue to College Super Admin
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleFinalize} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Step 2: Assign College Super Admin</h3>
              <Badge variant="purple">Step 2 of 2</Badge>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div>
                <span className="font-bold text-slate-900 text-sm block">College Super Admin (Principal / Dean / Administrator):</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  The primary administrator who will govern this college instance, provision departments, and manage institutional staff.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Admin Full Name"
                  value={adminName}
                  onChange={e => setAdminName(e.target.value)}
                  placeholder="Dr. K. Ramaswamy"
                  required
                />
                <Input
                  label="Official Email Address"
                  type="email"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  placeholder="principal@nitt.edu"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between pt-3 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="primary" type="submit" isLoading={isSubmitting} leftIcon={<ShieldCheck className="w-4 h-4" />}>
                Provision & Activate College Portal
              </Button>
            </div>
          </form>
        )}

        {step === 3 && createdCollege && (
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">{createdCollege.name} Activated!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Institutional portal provisioned with isolated data scope. College Super Admin account configured for <strong>{createdCollege.adminEmail}</strong>.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-3">
              <Button variant="outline" size="sm" onClick={() => {
                setStep(1);
                setCollegeName('');
                setCollegeCode('');
                setCity('');
                setState('');
                setAdminName('');
                setAdminEmail('');
              }}>
                Onboard Another College
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/admin/colleges')}>
                View in Directory →
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
