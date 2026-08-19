import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { contentService } from '../../services/contentService';
import { ContentItem, ContentWorkflowState, ContentType } from '../../types/content';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  BookOpen,
  Terminal,
  Code2,
  Award,
  Sparkles,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Send,
  FileCheck2,
} from 'lucide-react';
import clsx from 'clsx';

export const ContentWorkflowHub: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [activeStatus, setActiveStatus] = useState<ContentWorkflowState | 'ALL'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ContentType>('LEARNING_CARD');
  const [newTrack, setNewTrack] = useState('Python Backend & Microservices');

  useEffect(() => {
    const load = async () => {
      const data = await contentService.getContentItems(activeStatus);
      setItems(data);
    };
    load();
  }, [activeStatus]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await contentService.createContentItem({
      title: newTitle,
      type: newType,
      trackName: newTrack,
      authorName: user?.name || 'Devika Krishnan',
      authorId: user?.id || 'user-content',
    });
    if (created) {
      setItems(prev => [created, ...prev]);
    }
    setIsCreateModalOpen(false);
    setNewTitle('');
  };

  const handleAdvanceStatus = async (item: ContentItem, nextStatus: ContentWorkflowState) => {
    const updated = await contentService.updateWorkflowState(
      item.id,
      nextStatus,
      user?.name || 'Devika Krishnan',
      'Advanced state along the curriculum publishing pipeline.'
    );
    if (updated) {
      setItems(prev => prev.map(i => (i.id === item.id ? updated : i)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <BookOpen className="w-3.5 h-3.5" /> Curriculum & Content Management
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Publishing Lifecycle: Draft → Review → Approved → Published
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Author and publish micro-skills, lab challenges, simulated scenarios, and synchronized placement questions.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Curriculum Item
        </Button>
      </div>

      {/* Workflow Stage Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs overflow-x-auto">
        {(['ALL', 'DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED'] as const).map(st => (
          <button
            key={st}
            onClick={() => setActiveStatus(st)}
            className={clsx(
              'px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap',
              activeStatus === st
                ? 'bg-brand-600 text-white shadow-soft-sm'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {st === 'ALL' ? 'All Content' : st}
          </button>
        ))}
      </div>

      {/* Content Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map(item => (
          <Card key={item.id} hoverable className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3 text-xs">
              <div className="flex items-start justify-between">
                <Badge variant="purple" size="sm">{item.type.replace('_', ' ')}</Badge>
                <Badge
                  variant={
                    item.status === 'PUBLISHED'
                      ? 'success'
                      : item.status === 'APPROVED'
                      ? 'primary'
                      : item.status === 'REVIEW'
                      ? 'warning'
                      : 'default'
                  }
                  size="sm"
                >
                  {item.status}
                </Badge>
              </div>

              <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
              <p className="text-slate-500 font-mono text-[11px]">{item.trackName} • {item.moduleName}</p>
              <p className="text-slate-600 leading-relaxed">{item.contentData.description}</p>

              {item.reviewNotes && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-[11px]">
                  <strong>Review Note:</strong> {item.reviewNotes}
                </div>
              )}
            </div>

            {/* Stage Action Controls */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[10px]">Updated: {item.updatedAt}</span>
              <div className="flex gap-2">
                {item.status === 'DRAFT' && (
                  <Button size="xs" variant="primary" onClick={() => handleAdvanceStatus(item, 'REVIEW')}>
                    Submit for Review
                  </Button>
                )}
                {item.status === 'REVIEW' && (
                  <Button size="xs" variant="success" onClick={() => handleAdvanceStatus(item, 'APPROVED')}>
                    Approve Content
                  </Button>
                )}
                {item.status === 'APPROVED' && (
                  <Button size="xs" variant="success" onClick={() => handleAdvanceStatus(item, 'PUBLISHED')}>
                    Publish Live
                  </Button>
                )}
                {item.status === 'PUBLISHED' && (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Live in Student Portal
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Author New Curriculum Module"
        description="Draft new learning cards, interactive labs, or coding challenges."
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <Input
            label="Module Title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="e.g. AWS Multi-Region VPC Peering"
            required
          />

          <div>
            <label className="block font-bold text-slate-700 mb-1">Content Type:</label>
            <select
              value={newType}
              onChange={e => setNewType(e.target.value as any)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none"
            >
              <option value="LEARNING_CARD">Learning Card (5 Mins)</option>
              <option value="LAB">Interactive Browser Lab</option>
              <option value="CODING_CHALLENGE">Coding Challenge</option>
              <option value="PLACEMENT_ENGLISH">Placement English Exercise</option>
              <option value="PLACEMENT_APTITUDE">Placement Aptitude Problem</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Track:</label>
            <select
              value={newTrack}
              onChange={e => setNewTrack(e.target.value)}
              className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none"
            >
              <option value="Python Backend & Microservices">Python Backend & Microservices</option>
              <option value="AWS Cloud & DevOps Engineering">AWS Cloud & DevOps Engineering</option>
              <option value="Artificial Intelligence & Machine Learning">Artificial Intelligence & Machine Learning</option>
              <option value="Medical Coding & Health Informatics">Medical Coding & Health Informatics</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Draft Item</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
