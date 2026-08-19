import React, { useState, useEffect } from 'react';
import { recruiterService } from '../../services/recruiterService';
import { CandidateApplication, PipelineStage } from '../../types/recruiter';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  Users,
  Award,
  Calendar,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Clock,
} from 'lucide-react';
import clsx from 'clsx';

const STAGES: { id: PipelineStage; label: string; color: string }[] = [
  { id: 'DISCOVERED', label: '1. Discovered', color: 'border-slate-300' },
  { id: 'SHORTLISTED', label: '2. Shortlisted', color: 'border-brand-300' },
  { id: 'ASSESSMENT', label: '3. Assessment', color: 'border-cyan-300' },
  { id: 'INTERVIEW', label: '4. Interview', color: 'border-purple-300' },
  { id: 'SELECTED', label: '5. Selected', color: 'border-amber-300' },
  { id: 'OFFER', label: '6. Offer Extended', color: 'border-emerald-400' },
  { id: 'JOINED', label: '7. Joined', color: 'border-teal-500' },
];

export const KanbanPipeline: React.FC = () => {
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<CandidateApplication | null>(null);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState('2026-08-22T15:00');
  const [offeredCtc, setOfferedCtc] = useState('16.5');
  const [joiningDate, setJoiningDate] = useState('2026-07-01');

  useEffect(() => {
    const load = async () => {
      const list = await recruiterService.getApplications();
      setApplications(list);
    };
    load();
  }, []);

  const handleAdvanceStage = async (appId: string, nextStage: PipelineStage) => {
    const updated = await recruiterService.updateApplicationStage(appId, nextStage);
    if (updated) {
      const validUpdated = updated;
      setApplications(prev => prev.map(a => (a.id === appId ? validUpdated : a)));
      if (selectedApp?.id === appId) {
        setSelectedApp(validUpdated);
      }
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    const updated = await recruiterService.scheduleInterview(selectedApp.id, interviewDate);
    if (updated) {
      const validUpdated = updated;
      setApplications(prev => prev.map(a => (a.id === validUpdated.id ? validUpdated : a)));
      setSelectedApp(validUpdated);
      setIsInterviewModalOpen(false);
    }
  };

  const handleReleaseOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    const updated = await recruiterService.releaseOffer(selectedApp.id, Number(offeredCtc), joiningDate);
    if (updated) {
      const validUpdated = updated;
      setApplications(prev => prev.map(a => (a.id === validUpdated.id ? validUpdated : a)));
      setSelectedApp(validUpdated);
      setIsOfferModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5 mb-1">
            <Users className="w-3.5 h-3.5" /> Candidate Hiring Workflow
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Interactive Recruitment Kanban Pipeline
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Drag, evaluate, schedule interviews, and issue offer letters across 7 recruitment stages.
          </p>
        </div>

        <Badge variant="primary" size="md">
          {applications.length} Total Applicants Active
        </Badge>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3 min-h-[600px] overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const stageApps = applications.filter(a => a.stage === stage.id);
          return (
            <div
              key={stage.id}
              className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200 flex flex-col min-w-[220px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                <span className="font-bold text-slate-900 text-xs truncate">{stage.label}</span>
                <span className="px-2 py-0.5 rounded-full bg-white text-slate-700 text-[10px] font-bold font-mono shadow-soft-sm">
                  {stageApps.length}
                </span>
              </div>

              {/* Application Cards */}
              <div className="space-y-2.5 flex-1">
                {stageApps.map(app => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="bg-white rounded-xl p-3 border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer space-y-2 text-xs hover:border-brand-300"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold text-[11px] flex items-center justify-center uppercase shrink-0">
                        {app.studentName?.charAt(0) || 'S'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 truncate">{app.studentName}</p>
                        <p className="text-[10px] text-slate-500 truncate">{app.collegeName}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono bg-slate-50 p-1.5 rounded border border-slate-100">
                      <span className="text-slate-500">Score: <strong className="text-brand-600">{app.talentScore}</strong></span>
                      <span className="text-slate-500">IRI: <strong className="text-emerald-600">{app.iriScore}%</strong></span>
                    </div>

                    {app.interviewDate && (
                      <p className="text-[10px] text-purple-700 font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(app.interviewDate).toLocaleDateString()}
                      </p>
                    )}

                    {app.offerDetails && (
                      <p className="text-[10px] text-emerald-700 font-bold font-mono">
                        Offer: ₹{app.offerDetails.ctcLPA} LPA ({app.offerDetails.status})
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidate Action Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Candidate Pipeline Action: ${selectedApp.studentName}`}
          description={`${selectedApp.jobTitle} • Current Stage: ${selectedApp.stage}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs font-sans">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Talent Score</span>
                <span className="text-xl font-bold font-mono text-brand-600 block">{selectedApp.talentScore}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase">IRI Index</span>
                <span className="text-xl font-bold font-mono text-emerald-600 block">{selectedApp.iriScore}%</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase">Academic CGPA</span>
                <span className="text-xl font-bold font-mono text-slate-900 block">{selectedApp.cgpa}</span>
              </div>
            </div>

            {/* Stage Actions */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Move to Next Stage:</span>
              <div className="flex flex-wrap gap-2">
                <Button size="xs" variant="outline" onClick={() => handleAdvanceStage(selectedApp.id, 'SHORTLISTED')}>
                  → Shortlist
                </Button>
                <Button size="xs" variant="outline" onClick={() => handleAdvanceStage(selectedApp.id, 'ASSESSMENT')}>
                  → Assessment
                </Button>
                <Button size="xs" variant="primary" onClick={() => setIsInterviewModalOpen(true)}>
                  📅 Schedule Interview
                </Button>
                <Button size="xs" variant="success" onClick={() => setIsOfferModalOpen(true)}>
                  🎉 Release Offer
                </Button>
                <Button size="xs" variant="success" onClick={() => handleAdvanceStage(selectedApp.id, 'JOINED')}>
                  ✔ Mark Joined
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        title="Schedule Technical Interview Round"
        description="Select interview date and send calendar invite to candidate."
      >
        <form onSubmit={handleScheduleInterview} className="space-y-4 text-xs">
          <Input
            label="Interview Date & Time"
            type="datetime-local"
            value={interviewDate}
            onChange={e => setInterviewDate(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setIsInterviewModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Confirm & Notify Candidate</Button>
          </div>
        </form>
      </Modal>

      {/* Release Offer Modal */}
      <Modal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        title="Release Official Employment Offer"
        description="Specify compensation CTC and tentative joining date."
      >
        <form onSubmit={handleReleaseOffer} className="space-y-4 text-xs">
          <Input
            label="Offered Annual CTC (LPA)"
            type="number"
            step="0.5"
            value={offeredCtc}
            onChange={e => setOfferedCtc(e.target.value)}
            required
          />
          <Input
            label="Joining Date"
            type="date"
            value={joiningDate}
            onChange={e => setJoiningDate(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" type="button" onClick={() => setIsOfferModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Dispatch Offer Letter</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
