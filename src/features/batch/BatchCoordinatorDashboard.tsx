import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { operationsService } from '../../services/operationsService';
import { Batch, BatchAnnouncement } from '../../types/operations';
import { StatCard } from '../../components/shared/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  Users,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Plus,
  Compass,
  FileCheck2,
} from 'lucide-react';

export const BatchCoordinatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [announcements, setAnnouncements] = useState<BatchAnnouncement[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');

  useEffect(() => {
    const load = async () => {
      const b = await operationsService.getBatches(user?.dataScope);
      const a = await operationsService.getAnnouncements();
      setBatches(b);
      setAnnouncements(a);
    };
    load();
  }, [user]);

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAnn = await operationsService.postAnnouncement({
      batchId: 'batch-ai-2026-a',
      authorName: user?.name || 'Priya Deshmukh',
      authorRole: 'Batch Coordinator',
      title: postTitle,
      content: postContent,
      isPinned: true,
      publishedToTelegram: true,
    });
    if (newAnn) {
      setAnnouncements(prev => [newAnn, ...prev]);
    }
    setIsPostModalOpen(false);
    setPostTitle('');
    setPostContent('');
  };

  const primaryBatch = batches[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Batch Synchronization & Telegram Community
            </span>
            <Badge variant="primary">Batch Coordinator</Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Batch Coordination Hub — {primaryBatch?.name || 'Batch Alpha (2026)'}
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Assigned Mentor: {primaryBatch?.mentorName} • Telegram: <a href={primaryBatch?.telegramGroupUrl} target="_blank" rel="noreferrer" className="text-brand-600 font-semibold underline">{primaryBatch?.telegramGroupUrl}</a>
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsPostModalOpen(true)}
        >
          Publish Batch Announcement
        </Button>
      </div>

      {/* Operational Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Cohort Size"
          value={primaryBatch?.totalStudents || 85}
          subtitle="Enrolled Students"
          icon={<Users className="w-5 h-5" />}
          iconBgColor="bg-brand-50 text-brand-600"
        />
        <StatCard
          title="Completed Today"
          value={primaryBatch?.activeToday || 78}
          subtitle="Daily Cycle Finished"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Attendance Rate"
          value={`${primaryBatch?.attendancePercent || 92.4}%`}
          subtitle="Daily Synchronization"
          icon={<FileCheck2 className="w-5 h-5" />}
          iconBgColor="bg-violet-50 text-violet-600"
        />
        <StatCard
          title="At-Risk Learners"
          value={(primaryBatch?.riskSummary.strugglingCount || 4) + (primaryBatch?.riskSummary.inactiveCount || 2)}
          subtitle="Inactivity Reminders Sent"
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBgColor="bg-rose-50 text-rose-600"
        />
      </div>

      {/* Announcements & Telegram Broadcast Stream */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Broadcast Announcements & Telegram Sync</h3>
            <p className="text-xs text-slate-500">Automated synchronization between SantoGe web app and Telegram batch channel</p>
          </div>
        </div>

        <div className="space-y-3">
          {announcements.map(ann => (
            <div
              key={ann.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{ann.title}</span>
                <span className="text-[10px] text-brand-700 font-bold bg-brand-50 border border-brand-200 px-2 py-0.5 rounded flex items-center gap-1">
                  <Send className="w-3 h-3 text-brand-600" /> Telegram Synced
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">{ann.content}</p>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                <span>By {ann.authorName} ({ann.authorRole})</span>
                <span className="font-mono">{ann.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post Announcement Modal */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        title="Broadcast Announcement to Batch & Telegram"
        description="Pushes high-priority announcement to student portal and Telegram channel."
      >
        <form onSubmit={handlePostAnnouncement} className="space-y-4 text-xs">
          <Input
            label="Announcement Title"
            value={postTitle}
            onChange={e => setPostTitle(e.target.value)}
            placeholder="e.g. 🚀 Saturday Mock Assessment Schedule"
            required
          />
          <div>
            <label className="block font-bold text-slate-700 mb-1">Message Content:</label>
            <textarea
              value={postContent}
              onChange={e => setPostContent(e.target.value)}
              placeholder="Enter announcement instructions for batch..."
              className="w-full h-32 p-3 border border-slate-300 rounded-xl outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsPostModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" leftIcon={<Send className="w-4 h-4" />}>
              Broadcast to App & Telegram
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
