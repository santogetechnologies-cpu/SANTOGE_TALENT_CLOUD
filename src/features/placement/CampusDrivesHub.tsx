import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collegeService } from '../../services/collegeService';
import { CampusDrive } from '../../types/college';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  Award,
  Plus,
  Calendar,
  Users,
  Building,
  CheckCircle2,
  DollarSign,
  Briefcase,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import clsx from 'clsx';

export const CampusDrivesHub: React.FC = () => {
  const { user } = useAuth();
  const [drives, setDrives] = useState<CampusDrive[]>([]);
  const [selectedDrive, setSelectedDrive] = useState<CampusDrive | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // New Drive Form State
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [ctcLPA, setCtcLPA] = useState('12.0');
  const [minTalentScore, setMinTalentScore] = useState('750');
  const [minIRI, setMinIRI] = useState('80');
  const [minCgpa, setMinCgpa] = useState('7.5');
  const [driveDate, setDriveDate] = useState('2026-09-20');

  useEffect(() => {
    const load = async () => {
      const data = await collegeService.getCampusDrives(user?.dataScope?.collegeId, activeFilter);
      setDrives(data);
    };
    load();
  }, [user, activeFilter]);

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await collegeService.createCampusDrive({
      collegeId: user?.dataScope.collegeId || 'col-apex',
      companyName,
      roleTitle,
      ctcLPA: Number(ctcLPA),
      driveDate,
      eligibility: {
        minTalentScore: Number(minTalentScore),
        minIRI: Number(minIRI),
        minCgpa: Number(minCgpa),
        allowedDepartments: ['dept-apex-cse', 'dept-apex-aids'],
        maxBacklogs: 0,
      },
    });
    if (created) {
      setDrives(prev => [created, ...prev]);
    }
    setIsCreateModalOpen(false);
    // Reset
    setCompanyName('');
    setRoleTitle('');
  };

  const handleAdvanceStage = async (drive: CampusDrive, nextStatus: CampusDrive['status']) => {
    const updated = await collegeService.updateDriveStatus(drive.id, nextStatus);
    if (updated) {
      setDrives(prev => prev.map(d => (d.id === drive.id ? { ...d, status: nextStatus } : d)));
      if (selectedDrive?.id === drive.id) {
        setSelectedDrive({ ...selectedDrive, status: nextStatus });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <Award className="w-3.5 h-3.5" /> Placement Operations
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Campus Drive Lifecycle & Shortlisting Hub
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Create drives, enforce Talent Score & IRI criteria, manage registrations, schedule interviews, and issue offers.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create New Campus Drive
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs overflow-x-auto">
        {[
          { id: 'ALL', label: 'All Drives' },
          { id: 'REGISTRATION_OPEN', label: 'Registration Open' },
          { id: 'SHORTLISTING', label: 'Shortlisting Phase' },
          { id: 'INTERVIEWING', label: 'Interviews Ongoing' },
          { id: 'COMPLETED', label: 'Completed' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={clsx(
              'px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap',
              activeFilter === tab.id
                ? 'bg-brand-600 text-white shadow-soft-sm'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Drives Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {drives.map(drive => (
          <Card key={drive.id} hoverable className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{drive.companyName}</h3>
                  <p className="text-xs font-semibold text-brand-600">{drive.roleTitle}</p>
                </div>
                <Badge
                  variant={
                    drive.status === 'COMPLETED'
                      ? 'success'
                      : drive.status === 'REGISTRATION_OPEN'
                      ? 'primary'
                      : 'warning'
                  }
                >
                  {drive.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">CTC Package</span>
                  <span className="font-bold text-emerald-600">₹{drive.ctcLPA} LPA</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Min Score</span>
                  <span className="font-bold text-brand-600">≥ {drive.eligibility.minTalentScore}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Min IRI</span>
                  <span className="font-bold text-purple-600">≥ {drive.eligibility.minIRI}%</span>
                </div>
              </div>

              {/* Lifecycle Stats */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                <div className="p-2 rounded-lg bg-slate-100">
                  <span className="text-[10px] text-slate-500 block">Registered</span>
                  <span className="font-bold text-slate-900">{drive.stats.registeredCount}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-100">
                  <span className="text-[10px] text-slate-500 block">Shortlisted</span>
                  <span className="font-bold text-brand-600">{drive.stats.shortlistedCount}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-100">
                  <span className="text-[10px] text-slate-500 block">Interviewed</span>
                  <span className="font-bold text-amber-600">{drive.stats.interviewedCount}</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 block">Offers</span>
                  <span className="font-bold text-emerald-600">{drive.stats.offersReleasedCount}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Drive Date: {drive.driveDate}
              </span>
              <Button size="sm" variant="outline" onClick={() => setSelectedDrive(drive)}>
                Manage Drive & Rounds
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Drive Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule New Campus Placement Drive"
        description="Define hiring role, CTC compensation, and automated Talent Score criteria."
      >
        <form onSubmit={handleCreateDrive} className="space-y-4 text-xs">
          <Input
            label="Company Name"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="e.g. Google, Cisco, Deloitte"
            required
          />
          <Input
            label="Job / Role Title"
            value={roleTitle}
            onChange={e => setRoleTitle(e.target.value)}
            placeholder="e.g. Software Development Engineer - 1"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="CTC Offered (LPA)"
              type="number"
              value={ctcLPA}
              onChange={e => setCtcLPA(e.target.value)}
              required
            />
            <Input
              label="Drive Date"
              type="date"
              value={driveDate}
              onChange={e => setDriveDate(e.target.value)}
              required
            />
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-900 block">Automated Eligibility Criteria:</span>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Min Talent Score"
                type="number"
                value={minTalentScore}
                onChange={e => setMinTalentScore(e.target.value)}
              />
              <Input
                label="Min IRI %"
                type="number"
                value={minIRI}
                onChange={e => setMinIRI(e.target.value)}
              />
              <Input
                label="Min CGPA"
                type="number"
                step="0.1"
                value={minCgpa}
                onChange={e => setMinCgpa(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Publish & Open Drive Registration
            </Button>
          </div>
        </form>
      </Modal>

      {/* Drive Detail & Action Drawer/Modal */}
      {selectedDrive && (
        <Modal
          isOpen={!!selectedDrive}
          onClose={() => setSelectedDrive(null)}
          title={`Campus Drive Management: ${selectedDrive.companyName}`}
          description={`Role: ${selectedDrive.roleTitle} • Status: ${selectedDrive.status}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Rounds List */}
            <div>
              <span className="font-bold text-slate-900 block mb-2">Drive Assessment & Interview Rounds:</span>
              <div className="space-y-2">
                {selectedDrive.rounds.map((r, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">Round {i + 1}: {r.name}</span>
                      <span className="text-[11px] text-slate-500 block">Date: {r.date} • Type: {r.type}</span>
                    </div>
                    <Badge variant={r.completed ? 'success' : 'outline'}>
                      {r.completed ? 'Completed' : 'Pending'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage Transition Control */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Lifecycle Stage Transition:</span>
              <div className="flex gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handleAdvanceStage(selectedDrive, 'SHORTLISTING')}
                >
                  Move to Shortlisting
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handleAdvanceStage(selectedDrive, 'INTERVIEWING')}
                >
                  Start Interviews
                </Button>
                <Button
                  size="xs"
                  variant="success"
                  onClick={() => handleAdvanceStage(selectedDrive, 'COMPLETED')}
                >
                  Finalize & Close Drive
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedDrive(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
