import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
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
  PlaySquare,
  HelpCircle,
  Briefcase,
  Layers,
  FileText,
  Video,
  CheckSquare,
  AlertTriangle,
  RotateCcw,
  Upload,
  RefreshCw,
  ExternalLink,
  Tag,
  Search,
  Filter,
} from 'lucide-react';
import clsx from 'clsx';

const CONTENT_TYPES: { id: ContentType; label: string; icon: React.ReactNode; color: string }[] = [
  { id: 'LEARNING_CARD', label: 'Learning Cards', icon: <BookOpen className="w-4 h-4" />, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'VIDEO', label: 'Videos', icon: <Video className="w-4 h-4" />, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'QUESTION', label: 'Questions', icon: <HelpCircle className="w-4 h-4" />, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'CODING_CHALLENGE', label: 'Coding Challenges', icon: <Code2 className="w-4 h-4" />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'LAB', label: 'Interactive Labs', icon: <Terminal className="w-4 h-4" />, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'ASSIGNMENT', label: 'Assignments', icon: <FileCheck2 className="w-4 h-4" />, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'PROJECT', label: 'Projects', icon: <Layers className="w-4 h-4" />, color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { id: 'QUIZ', label: 'Quizzes', icon: <CheckSquare className="w-4 h-4" />, color: 'bg-lime-50 text-lime-700 border-lime-200' },
  { id: 'INDUSTRY_SCENARIO', label: 'Industry Scenarios', icon: <Briefcase className="w-4 h-4" />, color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'PLACEMENT_ENGLISH', label: 'English Content', icon: <Award className="w-4 h-4" />, color: 'bg-violet-50 text-violet-700 border-violet-200' },
  { id: 'PLACEMENT_APTITUDE', label: 'Aptitude Content', icon: <Sparkles className="w-4 h-4" />, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { id: 'PLACEMENT_REASONING', label: 'Reasoning Content', icon: <Sparkles className="w-4 h-4" />, color: 'bg-teal-50 text-teal-700 border-teal-200' },
];

interface ContentWorkflowHubProps {
  initialType?: string;
}

export const ContentWorkflowHub: React.FC<ContentWorkflowHubProps> = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [activeStage, setActiveStage] = useState<ContentWorkflowState | 'ALL'>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<ContentType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ContentType>('LEARNING_CARD');
  const [newTrack, setNewTrack] = useState('Full Stack Cloud Architecture');
  const [newModule, setNewModule] = useState('Core CS Fundamentals');
  const [newDescription, setNewDescription] = useState('');
  const [newCodeSnippet, setNewCodeSnippet] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newXp, setNewXp] = useState('50');
  const [newEstimatedMin, setNewEstimatedMin] = useState('20');
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);

  // Review / Reject Modal State
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await contentService.getContentItems(activeStage);
      setItems(data);
    } catch (err) {
      console.error('Error loading content items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeStage]);

  // Realtime synchronization on content_items
  useEffect(() => {
    const channel = supabase
      .channel('content-realtime-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content_items' }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCreate(true);
    try {
      const created = await contentService.createContentItem({
        title: newTitle.trim(),
        type: newType,
        trackName: newTrack,
        moduleName: newModule,
        authorName: user?.name || 'Content Manager',
        authorId: user?.id || 'usr-content',
      });

      if (created) {
        setItems(prev => [created, ...prev]);
      }
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewCodeSnippet('');
      setNewVideoUrl('');
      loadData();
    } catch (err) {
      console.error('Error creating content item:', err);
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleAdvanceStatus = async (item: ContentItem, nextStatus: ContentWorkflowState, notes?: string) => {
    const updated = await contentService.updateWorkflowState(
      item.id,
      nextStatus,
      user?.name || 'Content Reviewer',
      notes || `Workflow advanced to ${nextStatus}`
    );
    if (updated) {
      setItems(prev => prev.map(i => (i.id === item.id ? updated : i)));
      if (selectedItem?.id === item.id) {
        setSelectedItem(updated);
      }
      loadData();
    }
  };

  const handleRejectToDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    await handleAdvanceStatus(selectedItem, 'DRAFT', reviewNotes || 'Returned to Draft for revisions.');
    setIsRejectModalOpen(false);
    setSelectedItem(null);
    setReviewNotes('');
  };

  // Metrics
  const draftCount = items.filter(i => i.status === 'DRAFT').length;
  const reviewCount = items.filter(i => i.status === 'REVIEW').length;
  const approvedCount = items.filter(i => i.status === 'APPROVED').length;
  const publishedCount = items.filter(i => i.status === 'PUBLISHED').length;

  const filteredItems = items.filter(i => {
    const matchesSearch =
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.trackName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.moduleName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedTypeFilter === 'ALL' || i.type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Curriculum & Content Management
            </span>
            <Badge variant="primary">Content Manager</Badge>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Realtime Database Sync
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Publishing Governance: Draft → Review → Approved → Published
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Author and verify learning cards, videos, coding arena challenges, interactive labs, projects, quizzes, and placement question banks.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={loadData}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Author Content Item
          </Button>
        </div>
      </div>

      {/* 4-Stage Workflow Pipeline Progress Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveStage('DRAFT')}
          className={clsx(
            'p-4 rounded-2xl border transition-all cursor-pointer shadow-soft',
            activeStage === 'DRAFT'
              ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/20'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          )}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">1. Draft Workspace</span>
            <Badge variant={activeStage === 'DRAFT' ? 'outline' : 'default'} size="sm">Authoring</Badge>
          </div>
          <p className="text-2xl font-black font-mono mt-2">{draftCount}</p>
          <span className="text-[11px] opacity-75 mt-0.5 block">Under construction by authors</span>
        </div>

        <div
          onClick={() => setActiveStage('REVIEW')}
          className={clsx(
            'p-4 rounded-2xl border transition-all cursor-pointer shadow-soft',
            activeStage === 'REVIEW'
              ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-600/20'
              : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300'
          )}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">2. QA & Peer Review</span>
            <Badge variant={activeStage === 'REVIEW' ? 'outline' : 'warning'} size="sm">In QA</Badge>
          </div>
          <p className="text-2xl font-black font-mono mt-2">{reviewCount}</p>
          <span className="text-[11px] opacity-75 mt-0.5 block">Submitted for quality inspection</span>
        </div>

        <div
          onClick={() => setActiveStage('APPROVED')}
          className={clsx(
            'p-4 rounded-2xl border transition-all cursor-pointer shadow-soft',
            activeStage === 'APPROVED'
              ? 'bg-brand-600 text-white border-brand-600 ring-2 ring-brand-600/20'
              : 'bg-white text-slate-800 border-slate-200 hover:border-brand-300'
          )}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">3. Approved & Signed</span>
            <Badge variant={activeStage === 'APPROVED' ? 'outline' : 'primary'} size="sm">Ready</Badge>
          </div>
          <p className="text-2xl font-black font-mono mt-2">{approvedCount}</p>
          <span className="text-[11px] opacity-75 mt-0.5 block">Verified by Lead Reviewer</span>
        </div>

        <div
          onClick={() => setActiveStage('PUBLISHED')}
          className={clsx(
            'p-4 rounded-2xl border transition-all cursor-pointer shadow-soft',
            activeStage === 'PUBLISHED'
              ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-600/20'
              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
          )}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">4. Live Published</span>
            <Badge variant={activeStage === 'PUBLISHED' ? 'outline' : 'success'} size="sm">Live</Badge>
          </div>
          <p className="text-2xl font-black font-mono mt-2">{publishedCount}</p>
          <span className="text-[11px] opacity-75 mt-0.5 block">Active on student learning engine</span>
        </div>
      </div>

      {/* Content Categories Filter Carousel */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Content Type Categories (12 Categories)
          </span>
          {selectedTypeFilter !== 'ALL' && (
            <button
              onClick={() => setSelectedTypeFilter('ALL')}
              className="text-brand-600 font-bold hover:underline cursor-pointer"
            >
              Clear Category Filter
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 text-xs">
          <button
            onClick={() => setSelectedTypeFilter('ALL')}
            className={clsx(
              'px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer whitespace-nowrap',
              selectedTypeFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-soft-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            )}
          >
            All Types ({items.length})
          </button>
          {CONTENT_TYPES.map(cat => {
            const count = items.filter(i => i.type === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedTypeFilter(cat.id)}
                className={clsx(
                  'px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap border',
                  selectedTypeFilter === cat.id
                    ? 'bg-brand-600 text-white border-brand-600 shadow-soft-sm'
                    : `${cat.color} hover:opacity-90`
                )}
              >
                {cat.icon}
                <span>{cat.label} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Filter State Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search content by title, track, or module..."
            className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Viewing <span className="font-bold text-slate-900">{filteredItems.length}</span> items in <span className="font-bold text-brand-600">{activeStage}</span> phase
        </div>
      </div>

      {/* Content Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => {
          const typeMeta = CONTENT_TYPES.find(c => c.id === item.type) || CONTENT_TYPES[0];
          return (
            <Card key={item.id} hoverable className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase font-mono border flex items-center gap-1 ${typeMeta.color}`}>
                    {typeMeta.icon}
                    {item.type.replace('_', ' ')}
                  </span>
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

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 line-clamp-2">{item.title}</h3>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{item.trackName} • {item.moduleName}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between font-mono text-[11px]">
                    <span className="text-slate-500">Author:</span>
                    <span className="font-semibold text-slate-900">{item.authorName}</span>
                  </div>
                  {item.reviewedBy && (
                    <div className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-500">Reviewer:</span>
                      <span className="font-semibold text-brand-600">{item.reviewedBy}</span>
                    </div>
                  )}
                  {item.reviewNotes && (
                    <p className="text-[10px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 italic">
                      "{item.reviewNotes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Workflow State Controls */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {item.status === 'DRAFT' && (
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-full justify-center"
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                    onClick={() => handleAdvanceStatus(item, 'REVIEW', 'Submitted for peer QA review.')}
                  >
                    Submit for QA Review →
                  </Button>
                )}

                {item.status === 'REVIEW' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="danger"
                      className="flex-1"
                      leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setSelectedItem(item);
                        setIsRejectModalOpen(true);
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      className="flex-1"
                      leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      onClick={() => handleAdvanceStatus(item, 'APPROVED', 'Quality standards verified and approved.')}
                    >
                      Approve
                    </Button>
                  </div>
                )}

                {item.status === 'APPROVED' && (
                  <Button
                    size="sm"
                    variant="success"
                    className="w-full justify-center"
                    leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                    onClick={() => handleAdvanceStatus(item, 'PUBLISHED', 'Published live to student learning engine.')}
                  >
                    🚀 Publish Live to Students
                  </Button>
                )}

                {item.status === 'PUBLISHED' && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Live on Platform
                    </span>
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleAdvanceStatus(item, 'DRAFT', 'Rolled back to draft for revisions.')}
                    >
                      Rollback to Draft
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* 1. Author Content Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Author Curriculum Content Item"
        description="Creates a new module in DRAFT phase with 4-stage governance."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <Input
            label="Module / Content Title"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="e.g. Distributed Caching with Redis & Memory Clusters"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Content Category Type
              </label>
              <select
                value={newType}
                onChange={e => setNewType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer"
              >
                {CONTENT_TYPES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Career Track
              </label>
              <select
                value={newTrack}
                onChange={e => setNewTrack(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="Full Stack Cloud Architecture">Full Stack Cloud Architecture</option>
                <option value="Data Science & ML Engineering">Data Science & ML Engineering</option>
                <option value="DevOps & Site Reliability">DevOps & Site Reliability</option>
                <option value="Placement Accelerator & Soft Skills">Placement Accelerator & Soft Skills</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Module Topic Name"
              value={newModule}
              onChange={e => setNewModule(e.target.value)}
              placeholder="e.g. Memory Caching"
              required
            />
            <Input
              label="XP Reward Points"
              type="number"
              value={newXp}
              onChange={e => setNewXp(e.target.value)}
              required
            />
            <Input
              label="Est. Duration (Mins)"
              type="number"
              value={newEstimatedMin}
              onChange={e => setNewEstimatedMin(e.target.value)}
              required
            />
          </div>

          {newType === 'VIDEO' && (
            <Input
              label="Video Embed URL / Cloud Stream Link"
              value={newVideoUrl}
              onChange={e => setNewVideoUrl(e.target.value)}
              placeholder="https://stream.santoge.com/videos/redis-cache.mp4"
            />
          )}

          {newType === 'CODING_CHALLENGE' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Initial Code Boilerplate / Solution Template
              </label>
              <textarea
                value={newCodeSnippet}
                onChange={e => setNewCodeSnippet(e.target.value)}
                placeholder="def solve_cache_eviction(capacity: int, queries: list) -> list:&#10;    # Write algorithm here&#10;    pass"
                className="w-full bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl p-3 outline-none min-h-[100px]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Curriculum Description & Learning Objective
            </label>
            <textarea
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              placeholder="Define core competencies and expected student takeaways..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmittingCreate} leftIcon={<Plus className="w-4 h-4" />}>
              Create Draft Module
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Reject to Draft with Notes Modal */}
      {isRejectModalOpen && selectedItem && (
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title="Return Content to Draft"
          description={`Provide QA feedback for ${selectedItem.title} to the author.`}
        >
          <form onSubmit={handleRejectToDraft} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                QA Rejection Feedback & Correction Instructions
              </label>
              <textarea
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
                placeholder="e.g. Test case #3 in the coding challenge has an edge case timeout. Please update unit test criteria."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none min-h-[100px]"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
                Return to Draft
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
