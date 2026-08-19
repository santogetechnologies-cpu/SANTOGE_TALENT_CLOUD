import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { operationsService } from '../../services/operationsService';
import { studentService } from '../../services/studentService';
import { Batch, MentorIntervention } from '../../types/operations';
import { Student } from '../../types/student';
import { StatCard } from '../../components/shared/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { RiskBadge } from '../../components/shared/RiskBadge';
import {
  Compass,
  Users,
  ShieldAlert,
  MessageSquare,
  Award,
  CheckCircle2,
  Plus,
  Calendar,
  Sparkles,
  Lock,
} from 'lucide-react';

export const MentorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [interventions, setInterventions] = useState<MentorIntervention[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [interventionNotes, setInterventionNotes] = useState('');
  const [assignedPractice, setAssignedPractice] = useState('');
  const [interventionType, setInterventionType] = useState<MentorIntervention['type']>('ACADEMIC_DOUBT');

  useEffect(() => {
    const load = async () => {
      const b = await operationsService.getBatches(user?.dataScope);
      const i = await operationsService.getInterventions();
      const s = await studentService.getStudents(user?.dataScope);
      setBatches(b);
      setInterventions(i);
      setStudents(s);
    };
    load();
  }, [user]);

  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === selectedStudentId);
    const created = await operationsService.recordIntervention({
      mentorId: user?.id || 'user-mentor-suresh',
      mentorName: user?.name || 'Suresh Nambiar',
      studentId: selectedStudentId,
      studentName: st?.name || 'Student Candidate',
      batchId: st?.batchId || 'batch-ai-2026-a',
      type: interventionType,
      notes: interventionNotes,
      assignedPracticeTopic: assignedPractice,
    });
    if (created) {
      setInterventions(prev => [created, ...prev]);
    }
    setIsInterventionModalOpen(false);
    setInterventionNotes('');
  };

  const handleResolve = async (id: string) => {
    const res = await operationsService.resolveIntervention(id);
    if (res) {
      setInterventions(prev => prev.map(i => (i.id === id ? { ...i, resolved: true } : i)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> Technical & Placement Mentorship Workspace
            </span>
            <Badge variant="primary">Mentor Role</Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Mentor Workspace — {user?.name}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Assigned Cohorts: Batch Alpha & Batch Beta • Strictly non-administrative guidance & remedial interventions.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsInterventionModalOpen(true)}
        >
          Record Student Intervention
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Batches"
          value={batches.length}
          subtitle="Batch Alpha & Beta"
          icon={<Compass className="w-5 h-5" />}
          iconBgColor="bg-brand-50 text-brand-600"
        />
        <StatCard
          title="Total Mentees"
          value={students.length}
          subtitle="Active Learners"
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Active Interventions"
          value={interventions.filter(i => !i.resolved).length}
          subtitle="Pending Remedial Follow-up"
          icon={<ShieldAlert className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600"
        />
        <StatCard
          title="Score Editing Access"
          value="Locked (System)"
          subtitle="Strict Integrity Engine"
          icon={<Lock className="w-5 h-5" />}
          iconBgColor="bg-slate-100 text-slate-700"
        />
      </div>

      {/* Interventions Queue & Mentee Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Interventions */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Mentorship Interventions & Remedials</h3>
              <p className="text-xs text-slate-500">Recorded academic doubts, attendance warnings, and mock reviews</p>
            </div>
          </div>

          <div className="space-y-3">
            {interventions.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{item.studentName}</span>
                  <Badge variant={item.resolved ? 'success' : 'warning'} size="sm">
                    {item.type.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-slate-600 leading-relaxed">{item.notes}</p>
                {item.assignedPracticeTopic && (
                  <p className="text-[11px] text-brand-700 font-semibold bg-brand-50 p-2 rounded-lg border border-brand-100">
                    📌 Assigned Remedial: {item.assignedPracticeTopic}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-400">
                  <span>Logged on: {item.createdAt}</span>
                  {!item.resolved && (
                    <Button size="xs" variant="outline" onClick={() => handleResolve(item.id)}>
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Batch Students */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Mentee Performance Roster</h3>
              <p className="text-xs text-slate-500">Track daily consistency and flag struggling students</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {students.map(s => (
              <div
                key={s.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    {s.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">{s.name}</span>
                    <span className="text-[10px] text-slate-500 block">Streak: {s.streakDays}d • Talent: {s.talentScore.overallScore}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RiskBadge status={s.riskStatus} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Record Intervention Modal */}
      <Modal
        isOpen={isInterventionModalOpen}
        onClose={() => setIsInterventionModalOpen(false)}
        title="Record Mentor Intervention / Remedial Action"
        description="Log notes, prescribe remedial practice topics, and schedule follow-ups."
      >
        <form onSubmit={handleCreateIntervention} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Student:</label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none"
              required
            >
              <option value="">-- Choose Mentee --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.rollNumber}) — {s.riskStatus}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Intervention Type:</label>
            <select
              value={interventionType}
              onChange={e => setInterventionType(e.target.value as any)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none"
            >
              <option value="ACADEMIC_DOUBT">Academic / Code Doubt Session</option>
              <option value="ATTENDANCE_WARNING">Attendance / Inactivity Alert</option>
              <option value="REMEDIAL_PRACTICE">Prescribe Remedial Practice</option>
              <option value="MOCK_FEEDBACK">Mock Interview Feedback</option>
              <option value="MOTIVATION_CALL">1-on-1 Motivation Call</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Assigned Practice Topic (Optional):</label>
            <input
              type="text"
              value={assignedPractice}
              onChange={e => setAssignedPractice(e.target.value)}
              placeholder="e.g. Python Dictionaries & Sets"
              className="w-full p-2 border border-slate-300 rounded-lg outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Mentor Observation Notes:</label>
            <textarea
              value={interventionNotes}
              onChange={e => setInterventionNotes(e.target.value)}
              placeholder="Detailed feedback and progress plan..."
              className="w-full h-28 p-3 border border-slate-300 rounded-xl outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsInterventionModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Intervention Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
