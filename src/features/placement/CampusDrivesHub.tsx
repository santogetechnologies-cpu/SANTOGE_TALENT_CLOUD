import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { collegeService } from '../../services/collegeService';
import { studentService } from '../../services/studentService';
import { CampusDrive } from '../../types/college';
import { Student } from '../../types/student';
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
  Sparkles,
  Search,
  Filter,
  UserCheck,
  Mail,
  Clock,
  Send,
  FileCheck2,
  ShieldCheck,
  PhoneCall,
  ExternalLink,
} from 'lucide-react';
import clsx from 'clsx';

interface CandidateApplication {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  departmentName: string;
  cgpa: number;
  talentScore: number;
  iriScore: number;
  status: 'APPLIED' | 'SHORTLISTED' | 'INTERVIEW_SCHEDULED' | 'SELECTED' | 'OFFER_ISSUED' | 'REJECTED';
  interviewRound?: string;
  interviewDate?: string;
  offeredCTC?: number;
}

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

  // Candidate Pipeline State for Selected Drive
  const [candidates, setCandidates] = useState<CandidateApplication[]>([
    {
      id: 'app-1',
      studentId: 'stu-1',
      studentName: 'Rahul Sharma',
      rollNumber: '961822CS01',
      departmentName: 'Computer Science & Engineering',
      cgpa: 8.9,
      talentScore: 840,
      iriScore: 88,
      status: 'OFFER_ISSUED',
      interviewRound: 'HR Final Discussion',
      interviewDate: '2026-08-18',
      offeredCTC: 14.5,
    },
    {
      id: 'app-2',
      studentId: 'stu-2',
      studentName: 'Sneha Patel',
      rollNumber: '961822IT04',
      departmentName: 'Information Technology',
      cgpa: 8.5,
      talentScore: 810,
      iriScore: 84,
      status: 'SELECTED',
      interviewRound: 'Technical Round 2',
      interviewDate: '2026-08-19',
    },
    {
      id: 'app-3',
      studentId: 'stu-3',
      studentName: 'Aditya Varma',
      rollNumber: '961822CS12',
      departmentName: 'Computer Science & Engineering',
      cgpa: 7.8,
      talentScore: 760,
      iriScore: 80,
      status: 'INTERVIEW_SCHEDULED',
      interviewRound: 'Round 1: Technical & DSA',
      interviewDate: '2026-08-22 10:30 AM',
    },
    {
      id: 'app-4',
      studentId: 'stu-4',
      studentName: 'Pooja Nair',
      rollNumber: '961822IT18',
      departmentName: 'Information Technology',
      cgpa: 8.2,
      talentScore: 780,
      iriScore: 82,
      status: 'SHORTLISTED',
    },
  ]);

  // Invite Recruiter Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteCompanyName, setInviteCompanyName] = useState('');
  const [inviteRecruiterEmail, setInviteRecruiterEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Schedule Interview Modal
  const [schedulingCandidate, setSchedulingCandidate] = useState<CandidateApplication | null>(null);
  const [interviewRoundName, setInterviewRoundName] = useState('Round 1: Technical & Problem Solving');
  const [interviewDateVal, setInterviewDateVal] = useState('2026-08-25 10:00 AM');
  const [interviewInterviewer, setInterviewInterviewer] = useState('Senior Tech Lead');

  // Issue Offer Modal
  const [offeringCandidate, setOfferingCandidate] = useState<CandidateApplication | null>(null);
  const [offeredCTCAmount, setOfferedCTCAmount] = useState('12.0');

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
      collegeId: user?.dataScope?.collegeId || 'col-apex',
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

  const handleSendRecruiterInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteSuccess(true);
    setTimeout(() => {
      setIsInviteModalOpen(false);
      setInviteCompanyName('');
      setInviteRecruiterEmail('');
      setInviteRole('');
      setInviteSuccess(false);
    }, 1500);
  };

  const handleScheduleInterviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingCandidate) return;

    setCandidates(prev =>
      prev.map(c =>
        c.id === schedulingCandidate.id
          ? {
              ...c,
              status: 'INTERVIEW_SCHEDULED',
              interviewRound: interviewRoundName,
              interviewDate: interviewDateVal,
            }
          : c
      )
    );
    setSchedulingCandidate(null);
  };

  const handleRecordOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offeringCandidate) return;

    setCandidates(prev =>
      prev.map(c =>
        c.id === offeringCandidate.id
          ? {
              ...c,
              status: 'OFFER_ISSUED',
              offeredCTC: parseFloat(offeredCTCAmount) || 12.0,
            }
          : c
      )
    );
    setOfferingCandidate(null);
  };

  const handleMarkSelected = (candidateId: string) => {
    setCandidates(prev =>
      prev.map(c => (c.id === candidateId ? { ...c, status: 'SELECTED' } : c))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <Award className="w-3.5 h-3.5" /> Institutional Placement Hub
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Campus Placement Drives, Applications & Selections
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Create placement drives, invite recruiters, track applications, schedule interviews, record selections, and issue job offers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="md"
            leftIcon={<Send className="w-4 h-4" />}
            onClick={() => setIsInviteModalOpen(true)}
          >
            Invite Recruiter
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create New Campus Drive
          </Button>
        </div>
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
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-brand-600 text-white shadow-soft-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Drives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drives.map(drive => (
          <Card key={drive.id} hoverable className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">{drive.companyName}</h3>
                  <p className="text-xs font-semibold text-brand-600">{drive.roleTitle}</p>
                </div>
                <Badge
                  variant={
                    drive.status === 'COMPLETED'
                      ? 'success'
                      : drive.status === 'INTERVIEWING'
                      ? 'primary'
                      : 'warning'
                  }
                  size="sm"
                >
                  {drive.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">CTC Package</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-600" /> ₹{drive.ctcLPA} LPA
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Drive Date</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-brand-600" /> {drive.driveDate}
                  </span>
                </div>
              </div>

              {/* Automated Eligibility Thresholds */}
              <div className="text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block text-xs">Eligibility Cutoffs:</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded border border-brand-200">
                    Min Talent: {drive.eligibility.minTalentScore}
                  </span>
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200">
                    Min IRI: {drive.eligibility.minIRI}%
                  </span>
                </div>
              </div>

              {/* Live Funnel Stats */}
              <div className="grid grid-cols-4 gap-1 p-2.5 bg-slate-100 rounded-xl text-center text-xs font-mono">
                <div>
                  <span className="text-[9px] text-slate-500 block">Applied</span>
                  <span className="font-bold text-slate-900">{drive.stats?.registeredCount || 0}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Shortlisted</span>
                  <span className="font-bold text-brand-600">{drive.stats?.shortlistedCount || 0}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Interview</span>
                  <span className="font-bold text-purple-600">{drive.stats?.interviewedCount || 0}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Offers</span>
                  <span className="font-bold text-emerald-600">{drive.stats?.selectedCount || 0}</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full justify-between"
              onClick={() => setSelectedDrive(drive)}
            >
              <span>Manage Candidates & Pipeline</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        ))}
      </div>

      {/* 1. Drive Candidate Funnel Modal */}
      {selectedDrive && (
        <Modal
          isOpen={!!selectedDrive}
          onClose={() => setSelectedDrive(null)}
          title={`Campus Drive Funnel: ${selectedDrive.companyName}`}
          description={`Hiring for ${selectedDrive.roleTitle} • ₹${selectedDrive.ctcLPA} LPA • Status: ${selectedDrive.status}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Stage Transition Control */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Advance Drive Stage:</span>
                <span className="text-[11px] text-slate-500">Current Phase: {selectedDrive.status}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handleAdvanceStage(selectedDrive, 'SHORTLISTING')}
                >
                  Shortlisting
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handleAdvanceStage(selectedDrive, 'INTERVIEWING')}
                >
                  Interviews
                </Button>
                <Button
                  size="xs"
                  variant="success"
                  onClick={() => handleAdvanceStage(selectedDrive, 'COMPLETED')}
                >
                  Finalize Drive
                </Button>
              </div>
            </div>

            {/* Candidate Applications List */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Candidate Applications & Selection Pipeline ({candidates.length})
                </span>
              </div>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {candidates.map(c => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-brand-300 transition-colors space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">{c.studentName}</span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {c.rollNumber} • {c.departmentName}
                        </span>
                      </div>
                      <Badge
                        variant={
                          c.status === 'OFFER_ISSUED'
                            ? 'success'
                            : c.status === 'SELECTED'
                            ? 'primary'
                            : c.status === 'INTERVIEW_SCHEDULED'
                            ? 'primary'
                            : 'outline'
                        }
                        size="sm"
                      >
                        {c.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 font-mono text-[11px] p-2 bg-slate-50 rounded-lg">
                      <div>CGPA: <strong>{c.cgpa}</strong></div>
                      <div>Talent: <strong className="text-brand-600">{c.talentScore}</strong></div>
                      <div>IRI: <strong className="text-purple-600">{c.iriScore}%</strong></div>
                    </div>

                    {c.interviewDate && (
                      <p className="text-[11px] text-brand-700 bg-brand-50 p-1.5 rounded font-mono">
                        🗓️ {c.interviewRound}: <strong>{c.interviewDate}</strong>
                      </p>
                    )}

                    {c.offeredCTC && (
                      <p className="text-[11px] text-emerald-800 bg-emerald-50 p-1.5 rounded font-mono font-bold">
                        🎉 Job Offer Confirmed: ₹{c.offeredCTC} LPA Package
                      </p>
                    )}

                    {/* Candidate Actions */}
                    <div className="flex justify-end gap-2 pt-1 border-t border-slate-100">
                      {c.status === 'SHORTLISTED' && (
                        <Button
                          size="xs"
                          variant="primary"
                          leftIcon={<Clock className="w-3 h-3" />}
                          onClick={() => setSchedulingCandidate(c)}
                        >
                          Schedule Interview
                        </Button>
                      )}
                      {c.status === 'INTERVIEW_SCHEDULED' && (
                        <Button
                          size="xs"
                          variant="primary"
                          leftIcon={<CheckCircle2 className="w-3 h-3" />}
                          onClick={() => handleMarkSelected(c.id)}
                        >
                          Mark Selected
                        </Button>
                      )}
                      {c.status === 'SELECTED' && (
                        <Button
                          size="xs"
                          variant="success"
                          leftIcon={<Award className="w-3 h-3" />}
                          onClick={() => setOfferingCandidate(c)}
                        >
                          Issue Job Offer
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
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

      {/* 2. Create Drive Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule New Campus Placement Drive"
        description="Define hiring company, role title, CTC compensation, and automated Talent Score criteria."
      >
        <form onSubmit={handleCreateDrive} className="space-y-4 text-xs">
          <Input
            label="Company Name"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="e.g. Google, Cisco, Deloitte, TCS Digital"
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

      {/* 3. Invite Recruiter Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Corporate Recruiter to Campus"
        description="Send official institutional drive invitation with verified candidate talent metrics."
      >
        <form onSubmit={handleSendRecruiterInvite} className="space-y-4 text-xs">
          <Input
            label="Recruiter Company Name"
            value={inviteCompanyName}
            onChange={e => setInviteCompanyName(e.target.value)}
            placeholder="e.g. Amazon AWS, Infosys, Zoho"
            required
          />
          <Input
            label="Official Recruiter / HR Email"
            type="email"
            value={inviteRecruiterEmail}
            onChange={e => setInviteRecruiterEmail(e.target.value)}
            placeholder="hr.recruitment@company.com"
            required
          />
          <Input
            label="Proposed Roles / Hiring Positions"
            value={inviteRole}
            onChange={e => setInviteRole(e.target.value)}
            placeholder="e.g. Graduate Trainee Engineer, SDE-1"
            required
          />

          {inviteSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Drive invitation dispatched to recruiter!</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" leftIcon={<Send className="w-3.5 h-3.5" />}>
              Send Placement Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* 4. Schedule Interview Modal */}
      {schedulingCandidate && (
        <Modal
          isOpen={!!schedulingCandidate}
          onClose={() => setSchedulingCandidate(null)}
          title={`Schedule Interview: ${schedulingCandidate.studentName}`}
          description={`Roll No: ${schedulingCandidate.rollNumber} • ${schedulingCandidate.departmentName}`}
        >
          <form onSubmit={handleScheduleInterviewSubmit} className="space-y-4 text-xs">
            <Input
              label="Interview Round Name"
              value={interviewRoundName}
              onChange={e => setInterviewRoundName(e.target.value)}
              placeholder="e.g. Round 1: Technical & DSA"
              required
            />
            <Input
              label="Interview Date & Time Slot"
              value={interviewDateVal}
              onChange={e => setInterviewDateVal(e.target.value)}
              placeholder="e.g. 2026-08-25 10:00 AM"
              required
            />
            <Input
              label="Lead Interviewer"
              value={interviewInterviewer}
              onChange={e => setInterviewInterviewer(e.target.value)}
              placeholder="e.g. Senior Tech Lead / HR Panel"
              required
            />

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={() => setSchedulingCandidate(null)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" leftIcon={<Calendar className="w-3.5 h-3.5" />}>
                Confirm Interview Slot
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 5. Issue Job Offer Modal */}
      {offeringCandidate && (
        <Modal
          isOpen={!!offeringCandidate}
          onClose={() => setOfferingCandidate(null)}
          title={`Issue Placement Offer: ${offeringCandidate.studentName}`}
          description={`Confirm selection and register official offer package for ${offeringCandidate.rollNumber}.`}
        >
          <form onSubmit={handleRecordOfferSubmit} className="space-y-4 text-xs">
            <Input
              label="Offered CTC Package (LPA)"
              type="number"
              step="0.1"
              value={offeredCTCAmount}
              onChange={e => setOfferedCTCAmount(e.target.value)}
              placeholder="14.5"
              required
            />

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs">
              <p className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Offer Record & Student Portfolio Sync
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                This will officially mark the student as placed in the college placement audit report.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={() => setOfferingCandidate(null)}>
                Cancel
              </Button>
              <Button variant="success" type="submit" leftIcon={<Award className="w-3.5 h-3.5" />}>
                Confirm Job Offer
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
