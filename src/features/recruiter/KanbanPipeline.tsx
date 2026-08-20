import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
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
  Download,
  MessageSquare,
  Star,
  FileText,
  UserCheck,
  Building2,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';
import clsx from 'clsx';

const STAGES: { id: PipelineStage; label: string; color: string; bgBadge: string }[] = [
  { id: 'DISCOVERED', label: '1. Discovered', color: 'border-slate-300', bgBadge: 'bg-slate-100 text-slate-700' },
  { id: 'SHORTLISTED', label: '2. Shortlisted', color: 'border-brand-300', bgBadge: 'bg-brand-50 text-brand-700' },
  { id: 'ASSESSMENT', label: '3. Assessment', color: 'border-cyan-300', bgBadge: 'bg-cyan-50 text-cyan-700' },
  { id: 'INTERVIEW', label: '4. Interview', color: 'border-purple-300', bgBadge: 'bg-purple-50 text-purple-700' },
  { id: 'SELECTED', label: '5. Selected', color: 'border-amber-300', bgBadge: 'bg-amber-50 text-amber-700' },
  { id: 'OFFER', label: '6. Offer', color: 'border-emerald-400', bgBadge: 'bg-emerald-50 text-emerald-700' },
  { id: 'JOINED', label: '7. Joined', color: 'border-teal-500', bgBadge: 'bg-teal-50 text-teal-700' },
];

export const KanbanPipeline: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<CandidateApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals State
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState('2026-08-25T14:30');
  const [interviewRound, setInterviewRound] = useState('Technical Round 1');
  const [interviewerName, setInterviewerName] = useState(user?.name || 'Senior Architect');

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [techRating, setTechRating] = useState(4);
  const [commRating, setCommRating] = useState(4);
  const [feedbackVerdict, setFeedbackVerdict] = useState<'STRONG_HIRE' | 'HIRE' | 'HOLD' | 'REJECT'>('HIRE');
  const [feedbackNotes, setFeedbackNotes] = useState('');

  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offeredCtc, setOfferedCtc] = useState('16.5');
  const [joiningDate, setJoiningDate] = useState('2026-07-01');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await recruiterService.getApplications();
      setApplications(list);
    } catch (err) {
      console.error('Error loading applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Realtime subscription on candidate applications
  useEffect(() => {
    const channel = supabase
      .channel('kanban-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidate_applications' }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAdvanceStage = async (appId: string, nextStage: PipelineStage) => {
    const updated = await recruiterService.updateApplicationStage(appId, nextStage);
    if (updated) {
      setApplications(prev => prev.map(a => (a.id === appId ? updated : a)));
      if (selectedApp?.id === appId) {
        setSelectedApp(updated);
      }
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    const updated = await recruiterService.scheduleInterview(selectedApp.id, interviewDate, interviewRound);
    if (updated) {
      setApplications(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      setSelectedApp(updated);
      setIsInterviewModalOpen(false);
      loadData();
    }
  };

  const handleRecordFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    const ok = await recruiterService.recordInterviewFeedback(selectedApp.id, {
      technicalRating: techRating,
      communicationRating: commRating,
      verdict: feedbackVerdict,
      notes: feedbackNotes || 'Candidate performed well across DSA and System Design.',
      interviewerName,
    });

    if (ok) {
      setIsFeedbackModalOpen(false);
      setSelectedApp(null);
      setFeedbackNotes('');
      loadData();
    }
  };

  const handleReleaseOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    const updated = await recruiterService.releaseOffer(selectedApp.id, Number(offeredCtc), joiningDate);
    if (updated) {
      setApplications(prev => prev.map(a => (a.id === updated.id ? updated : a)));
      setSelectedApp(updated);
      setIsOfferModalOpen(false);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Candidate Hiring Workflow
            </span>
            <Badge variant="primary">7-Stage Recruitment Funnel</Badge>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Realtime Database Sync
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Interactive Recruitment Kanban Pipeline
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Discovered → Shortlisted → Assessment → Interview → Selected → Offer → Joined
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={loadData}
          >
            Refresh
          </Button>
          <Badge variant="success" size="md">
            {applications.length} Total Pipeline Candidates
          </Badge>
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3 min-h-[600px] overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const stageApps = applications.filter(a => a.stage === stage.id);
          return (
            <div
              key={stage.id}
              className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200 flex flex-col min-w-[210px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                <span className="font-bold text-slate-900 text-xs truncate">{stage.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono shadow-soft-sm ${stage.bgBadge}`}>
                  {stageApps.length}
                </span>
              </div>

              {/* Application Cards */}
              <div className="space-y-2.5 flex-1">
                {stageApps.map(app => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className="bg-white rounded-xl p-3 border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer space-y-2 text-xs hover:border-emerald-400"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center justify-center uppercase shrink-0">
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

                    {app.stage === 'INTERVIEW' && app.interviewDate && (
                      <div className="text-[10px] text-purple-700 bg-purple-50 p-1 rounded font-mono font-semibold flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {app.interviewDate.split('T')[0]}
                      </div>
                    )}

                    {app.stage === 'OFFER' && app.offerDetails && (
                      <div className="text-[10px] text-emerald-700 bg-emerald-50 p-1 rounded font-mono font-bold flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> ₹{app.offerDetails.ctcLPA} LPA
                      </div>
                    )}
                  </div>
                ))}
                {stageApps.length === 0 && (
                  <div className="h-24 rounded-xl border border-dashed border-slate-300/80 flex items-center justify-center text-[11px] text-slate-400">
                    No candidates
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Candidate Evaluation & Stage Transition Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`Candidate Dossier: ${selectedApp.studentName}`}
          description={`Applied for: ${selectedApp.jobTitle} • Current Stage: ${selectedApp.stage}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            {/* Candidate Header Summary */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">{selectedApp.studentName}</h3>
                <p className="text-slate-500 font-mono text-xs">{selectedApp.studentEmail}</p>
                <p className="text-slate-600 text-[11px] mt-0.5">{selectedApp.collegeName}</p>
              </div>
              <div className="text-right font-mono">
                <span className="text-2xl font-black text-emerald-600">{selectedApp.talentScore}</span>
                <span className="text-[10px] text-slate-500 block">Talent Score (IRI {selectedApp.iriScore}%)</span>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={() => window.open(selectedApp.resumeUrl || 'https://santoge.com/resume.pdf', '_blank')}
              >
                Download Resume PDF
              </Button>
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Calendar className="w-3.5 h-3.5" />}
                onClick={() => setIsInterviewModalOpen(true)}
              >
                Schedule Interview
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<MessageSquare className="w-3.5 h-3.5 text-purple-600" />}
                onClick={() => setIsFeedbackModalOpen(true)}
              >
                Add Interview Feedback
              </Button>
              <Button
                size="sm"
                variant="primary"
                leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                onClick={() => setIsOfferModalOpen(true)}
              >
                Release Offer Letter
              </Button>
            </div>

            {/* Stage Progression Selector */}
            <div>
              <span className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Move Candidate to Stage:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STAGES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleAdvanceStage(selectedApp.id, s.id)}
                    className={clsx(
                      'p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left',
                      selectedApp.stage === s.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-soft-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* 1. Schedule Interview Modal */}
      {isInterviewModalOpen && selectedApp && (
        <Modal
          isOpen={isInterviewModalOpen}
          onClose={() => setIsInterviewModalOpen(false)}
          title={`Schedule Interview: ${selectedApp.studentName}`}
          description="Advances candidate to INTERVIEW stage and logs calendar slot."
        >
          <form onSubmit={handleScheduleInterview} className="space-y-4 text-xs">
            <Input
              label="Interview Round Title"
              value={interviewRound}
              onChange={e => setInterviewRound(e.target.value)}
              placeholder="e.g. System Design & Algorithmic Optimization"
              required
            />
            <Input
              label="Lead Interviewer Name / Panel"
              value={interviewerName}
              onChange={e => setInterviewerName(e.target.value)}
              placeholder="e.g. Anand R, Tech Lead"
              required
            />
            <Input
              label="Interview Date & Time"
              type="datetime-local"
              value={interviewDate}
              onChange={e => setInterviewDate(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsInterviewModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" leftIcon={<Calendar className="w-4 h-4" />}>
                Confirm Interview
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 2. Add Interview Feedback Modal */}
      {isFeedbackModalOpen && selectedApp && (
        <Modal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          title={`Interview Feedback: ${selectedApp.studentName}`}
          description="Record scoring rubric and hiring recommendation."
        >
          <form onSubmit={handleRecordFeedbackSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Technical Rating (1 - 5)
                </label>
                <select
                  value={techRating}
                  onChange={e => setTechRating(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                >
                  <option value={5}>5 - Outstanding (Exceeds Bar)</option>
                  <option value={4}>4 - Strong Hire</option>
                  <option value={3}>3 - Acceptable / Meets Bar</option>
                  <option value={2}>2 - Weak / Gaps Observed</option>
                  <option value={1}>1 - Reject</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Communication Rating (1 - 5)
                </label>
                <select
                  value={commRating}
                  onChange={e => setCommRating(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none"
                >
                  <option value={5}>5 - Articulate & Clear</option>
                  <option value={4}>4 - Good Communication</option>
                  <option value={3}>3 - Average</option>
                  <option value={2}>2 - Needs Coaching</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Hiring Verdict
              </label>
              <select
                value={feedbackVerdict}
                onChange={e => setFeedbackVerdict(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none"
              >
                <option value="STRONG_HIRE">STRONG HIRE (Move to Selected)</option>
                <option value="HIRE">HIRE (Move to Selected)</option>
                <option value="HOLD">HOLD (Requires Next Round)</option>
                <option value="REJECT">REJECT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Panel Feedback Notes
              </label>
              <textarea
                value={feedbackNotes}
                onChange={e => setFeedbackNotes(e.target.value)}
                placeholder="Candidate wrote clean modular code, correctly handled concurrency edge cases..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none min-h-[90px]"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsFeedbackModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                Save Verdict
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 3. Release Offer Modal */}
      {isOfferModalOpen && selectedApp && (
        <Modal
          isOpen={isOfferModalOpen}
          onClose={() => setIsOfferModalOpen(false)}
          title={`Release Job Offer: ${selectedApp.studentName}`}
          description="Advances candidate to OFFER stage with package terms."
        >
          <form onSubmit={handleReleaseOffer} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Annual CTC Package (in INR LPA)"
                type="number"
                step="0.5"
                value={offeredCtc}
                onChange={e => setOfferedCtc(e.target.value)}
                required
              />
              <Input
                label="Tentative Joining Date"
                type="date"
                value={joiningDate}
                onChange={e => setJoiningDate(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsOfferModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" leftIcon={<DollarSign className="w-4 h-4" />}>
                Confirm & Issue Offer
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
