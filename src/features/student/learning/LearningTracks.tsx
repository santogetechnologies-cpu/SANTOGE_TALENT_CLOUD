import React, { useState, useEffect } from 'react';
import { learningService } from '../../../services/learningService';
import { CareerTrack } from '../../../types/student';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Modal } from '../../../components/ui/Modal';
import {
  BookOpen,
  Sparkles,
  Layers,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  Brain,
  Code2,
  Cloud,
  Layout,
  Building2,
  HeartPulse,
  Shield,
  Network,
  Database,
  Coffee,
  BarChart3,
  CheckCircle,
  Cpu,
  CloudRain,
  Boxes,
} from 'lucide-react';
import clsx from 'clsx';

export const LearningTracks: React.FC = () => {
  const [tracks, setTracks] = useState<CareerTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<CareerTrack | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await learningService.getCareerTracks();
      setTracks(data);
    };
    load();
  }, []);

  const getTrackIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain': return <Brain className="w-5 h-5 text-violet-600" />;
      case 'Code2': return <Code2 className="w-5 h-5 text-brand-600" />;
      case 'Cloud': return <Cloud className="w-5 h-5 text-amber-600" />;
      case 'Layout': return <Layout className="w-5 h-5 text-emerald-600" />;
      case 'Building2': return <Building2 className="w-5 h-5 text-indigo-600" />;
      case 'HeartPulse': return <HeartPulse className="w-5 h-5 text-rose-600" />;
      case 'Shield': return <Shield className="w-5 h-5 text-red-600" />;
      case 'Network': return <Network className="w-5 h-5 text-cyan-600" />;
      case 'Database': return <Database className="w-5 h-5 text-blue-600" />;
      case 'Coffee': return <Coffee className="w-5 h-5 text-amber-700" />;
      case 'BarChart3': return <BarChart3 className="w-5 h-5 text-emerald-600" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-5 h-5 text-teal-600" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-violet-700" />;
      case 'CloudRain': return <CloudRain className="w-5 h-5 text-cyan-700" />;
      case 'Boxes': return <Boxes className="w-5 h-5 text-purple-600" />;
      default: return <BookOpen className="w-5 h-5 text-brand-600" />;
    }
  };

  const handleOpenTrackModal = (track: CareerTrack) => {
    setSelectedTrack(track);
    setSelectedSpec(track.activeSpecialization || track.specializations[0] || '');
    setIsModalOpen(true);
  };

  const handleEnrollOrSwitch = () => {
    if (selectedTrack) {
      setTracks(prev =>
        prev.map(t =>
          t.id === selectedTrack.id
            ? { ...t, isEnrolled: true, activeSpecialization: selectedSpec }
            : t
        )
      );
      setIsModalOpen(false);
    }
  };

  const enrolledCount = tracks.filter(t => t.isEnrolled).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Technical Skill Engine
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Career Tracks & Specializations (15+ Paths)
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Unlock micro-skills, simulated lab environments, coding arena challenges, and verified industry projects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="primary" size="md">
            Enrolled: {enrolledCount} / 3 Max Tracks
          </Badge>
        </div>
      </div>

      {/* Progressive Difficulty Banner */}
      <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <h3 className="font-bold text-sm text-white">Competency-Based Progressive Difficulty Engine</h3>
          <p className="text-slate-400 text-xs mt-0.5">Every skill builds systematically through 5 industry progression levels.</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="px-2.5 py-1 bg-slate-800 rounded font-bold text-slate-300">L1 Learn</span>
          <span>→</span>
          <span className="px-2.5 py-1 bg-slate-800 rounded font-bold text-slate-300">L2 Practice</span>
          <span>→</span>
          <span className="px-2.5 py-1 bg-slate-800 rounded font-bold text-slate-300">L3 Solve</span>
          <span>→</span>
          <span className="px-2.5 py-1 bg-brand-900/80 border border-brand-500/50 rounded font-bold text-brand-300">L4 Real Scenario</span>
          <span>→</span>
          <span className="px-2.5 py-1 bg-emerald-950 border border-emerald-500/50 rounded font-bold text-emerald-300">L5 Expert Verified</span>
        </div>
      </div>

      {/* Track Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map(track => {
          return (
            <Card
              key={track.id}
              hoverable
              className={clsx(
                'flex flex-col justify-between relative overflow-hidden transition-all',
                track.isEnrolled && 'border-brand-300 ring-2 ring-brand-500/20 bg-brand-50/10'
              )}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                    {getTrackIcon(track.icon)}
                  </div>
                  {track.isEnrolled ? (
                    <Badge variant="success" size="sm">
                      Enrolled (Level {track.level})
                    </Badge>
                  ) : (
                    <Badge variant="outline" size="sm">
                      {track.category}
                    </Badge>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900">{track.title}</h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {track.description}
                </p>

                {/* Specialization Badge */}
                {track.activeSpecialization && (
                  <div className="mt-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-brand-50 border border-brand-200 text-brand-800 text-[11px] font-semibold">
                    <Sparkles className="w-3 h-3 text-brand-600" /> Focus: {track.activeSpecialization}
                  </div>
                )}

                {/* Progress Bar (if enrolled) */}
                {track.isEnrolled && (
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-slate-600">Track Mastery</span>
                      <span className="text-brand-600 font-mono">{track.progressPercent}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-500 to-indigo-600 rounded-full transition-all"
                        style={{ width: `${track.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      {track.completedModules} of {track.totalModules} modules completed
                    </span>
                  </div>
                )}

                {/* Skills tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {track.skillsCovered.slice(0, 3).map(skill => (
                    <span
                      key={skill}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                  {track.skillsCovered.length > 3 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                      +{track.skillsCovered.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <Button
                  variant={track.isEnrolled ? 'primary' : 'outline'}
                  size="sm"
                  className="w-full"
                  onClick={() => handleOpenTrackModal(track)}
                >
                  {track.isEnrolled ? 'Resume Track & Labs' : 'Explore Specializations'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Track Detail & Specialization Selection Modal */}
      {selectedTrack && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedTrack.title}
          description="Select your specialized industry path and review curriculum modules."
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            <p className="text-slate-600 leading-relaxed">{selectedTrack.description}</p>

            {/* Specialization Picker */}
            <div>
              <label className="block font-bold text-slate-900 text-xs mb-2">
                Choose Track Specialization (Branch):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedTrack.specializations.map(spec => (
                  <button
                    key={spec}
                    onClick={() => setSelectedSpec(spec)}
                    className={clsx(
                      'p-3 rounded-xl border text-left transition-all cursor-pointer',
                      selectedSpec === spec
                        ? 'bg-brand-50 border-brand-400 text-brand-900 font-bold shadow-soft-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{spec}</span>
                      {selectedSpec === spec && <CheckCircle className="w-4 h-4 text-brand-600" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Skills & Simulator Requirements */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block">Required Competencies & Tools:</span>
              <div className="flex flex-wrap gap-2">
                {selectedTrack.skillsCovered.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 font-mono text-slate-800">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleEnrollOrSwitch}>
                {selectedTrack.isEnrolled ? 'Update Specialization' : 'Enroll in Track'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
