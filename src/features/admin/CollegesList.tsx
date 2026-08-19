import React, { useState, useEffect } from 'react';
import { collegeService } from '../../services/collegeService';
import { College } from '../../types/college';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Building2, Plus, Users, Award, MapPin, ExternalLink, School } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CollegesList: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await collegeService.getColleges();
      setColleges(data);
    } catch (err) {
      console.error('Error loading colleges:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <Building2 className="w-3.5 h-3.5" /> Institutional Network
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Partner University & College Management
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Oversee multi-tenant college instances, department branches, and placement officer assignments.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/admin/create-college')}
        >
          Onboard New College
        </Button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <Building2 className="w-8 h-8 mx-auto animate-bounce mb-2 text-brand-500" />
          <p className="text-sm font-medium">Loading partner institutions...</p>
        </div>
      ) : colleges.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Colleges Onboarded Yet</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Your platform database is clean and empty. Get started by onboarding your first university or college partner.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/admin/create-college')}
          >
            Onboard First College
          </Button>
        </Card>
      ) : (
        /* Colleges Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {colleges.map(c => (
            <Card key={c.id} hoverable className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{c.name}</h3>
                    <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" /> {c.city}, {c.state}
                    </span>
                  </div>
                  <Badge variant="primary" size="sm">{c.code}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Students</span>
                    <span className="font-bold text-slate-900">{c.totalStudents}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Placement %</span>
                    <span className="font-bold text-emerald-600">{c.placementPercentage}%</span>
                  </div>
                </div>

                <div className="space-y-1 text-slate-600">
                  <p><strong>Admin:</strong> {c.adminName} ({c.adminEmail})</p>
                  <p><strong>Placement Officer:</strong> {c.placementOfficerName}</p>
                  <p><strong>Departments:</strong> {c.departments.length} Academic Branches</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <Badge variant="success" size="sm">{c.subscriptionStatus}</Badge>
                <Button size="xs" variant="outline" onClick={() => navigate('/college/dashboard')}>
                  Access CPOS Portal →
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
