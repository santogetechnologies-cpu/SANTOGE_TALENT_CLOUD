import React, { useState, useEffect } from 'react';
import { recruiterService } from '../../services/recruiterService';
import { Student } from '../../types/student';
import { RecruiterFilterState } from '../../types/recruiter';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { TalentScoreRadar } from '../../components/charts/TalentScoreRadar';
import {
  Search,
  Filter,
  Sparkles,
  Award,
  Github,
  CheckCircle2,
  ExternalLink,
  Briefcase,
  FileText,
  Building2,
  Flame,
} from 'lucide-react';
import clsx from 'clsx';

export const TalentDiscovery: React.FC = () => {
  const [candidates, setCandidates] = useState<Student[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Student | null>(null);
  const [filters, setFilters] = useState<RecruiterFilterState>({
    searchQuery: '',
    colleges: [],
    departments: [],
    skills: [],
    minTalentScore: 700,
    minIRI: 75,
    minCgpa: 7.0,
    graduationYears: [2026],
    availability: 'Immediate / 2026 Batch',
  });

  useEffect(() => {
    const load = async () => {
      const list = await recruiterService.getTalentPool(filters);
      setCandidates(list);
    };
    load();
  }, [filters]);

  const handleToggleSkill = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> AI Talent Sourcing Engine
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Find Verified Campus Talent
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Search pre-screened graduates based on verified algorithmic Talent Scores, code quality reviews, and simulated lab performance.
          </p>
        </div>

        <Badge variant="success" size="md">
          {candidates.length} Verified Candidates Match
        </Badge>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-soft space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name, skill, college..."
              value={filters.searchQuery}
              onChange={e => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Min Talent Score */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Min Talent Score ({filters.minTalentScore}+)
            </label>
            <input
              type="range"
              min="500"
              max="900"
              step="50"
              value={filters.minTalentScore}
              onChange={e => setFilters({ ...filters, minTalentScore: Number(e.target.value) })}
              className="w-full cursor-pointer"
            />
          </div>

          {/* Min IRI */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Min IRI % ({filters.minIRI}%)
            </label>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={filters.minIRI}
              onChange={e => setFilters({ ...filters, minIRI: Number(e.target.value) })}
              className="w-full cursor-pointer"
            />
          </div>

          {/* Min CGPA */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Min CGPA ({filters.minCgpa})
            </label>
            <input
              type="range"
              min="6.0"
              max="9.0"
              step="0.5"
              value={filters.minCgpa}
              onChange={e => setFilters({ ...filters, minCgpa: Number(e.target.value) })}
              className="w-full cursor-pointer"
            />
          </div>
        </div>

        {/* Skill Pills Filter */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Filter by Skill:</span>
          {['Python', 'FastAPI / REST', 'AWS Cloud', 'PostgreSQL', 'React / TypeScript', 'PyTorch / ML', 'Medical Coding'].map(sk => {
            const isSelected = filters.skills.includes(sk);
            return (
              <button
                key={sk}
                onClick={() => handleToggleSkill(sk)}
                className={clsx(
                  'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap',
                  isSelected
                    ? 'bg-brand-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {sk}
              </button>
            );
          })}
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map(candidate => (
          <Card key={candidate.id} hoverable className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-base flex items-center justify-center uppercase ring-2 ring-brand-500/20 shrink-0 shadow-soft-sm">
                  {candidate.name?.charAt(0) || 'C'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-900 truncate">{candidate.name}</h3>
                  <p className="text-slate-500 text-[11px] truncate">{candidate.collegeName}</p>
                  <span className="text-slate-400 text-[10px] font-mono">{candidate.departmentName}</span>
                </div>
              </div>

              {/* Verified Scores Badge Grid */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Talent Score</span>
                  <span className="text-lg font-bold text-brand-600">{candidate.talentScore.overallScore}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">IRI Index</span>
                  <span className="text-lg font-bold text-emerald-600">{candidate.iri.overallIRI}%</span>
                </div>
              </div>

              {/* Skills Tags */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Top Verified Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {candidate.skills.slice(0, 4).map(sk => (
                    <span key={sk.name} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700">
                      {sk.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Recommendation Snippet */}
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-900">
                <strong className="block text-[10px] text-emerald-700 uppercase">AI Recommendation:</strong>
                {candidate.iri.strengths.slice(0, 2).join(' • ')}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">CGPA: {candidate.cgpa}</span>
              <Button size="sm" variant="primary" onClick={() => setSelectedCandidate(candidate)}>
                View Verified Profile
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Verified Candidate Profile Deep View Modal */}
      {selectedCandidate && (
        <Modal
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          title={`Verified Talent Profile: ${selectedCandidate.name}`}
          description={`${selectedCandidate.collegeName} • ${selectedCandidate.departmentName}`}
          maxWidth="4xl"
        >
          <div className="space-y-6 text-xs font-sans">
            {/* Top Score Matrix */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase block">Talent Score</span>
                <span className="text-2xl font-bold font-mono text-brand-600">{selectedCandidate.talentScore.overallScore}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase block">Industry Readiness</span>
                <span className="text-2xl font-bold font-mono text-emerald-600">{selectedCandidate.iri.overallIRI}%</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase block">GitHub Quality</span>
                <span className="text-2xl font-bold font-mono text-slate-900">{selectedCandidate.githubStats?.qualityRating || 'A+'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[10px] uppercase block">Academic CGPA</span>
                <span className="text-2xl font-bold font-mono text-purple-600">{selectedCandidate.cgpa}</span>
              </div>
            </div>

            {/* Radar & Strengths */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">Verified Competency Radar:</h4>
                <TalentScoreRadar />
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 space-y-1.5">
                  <span className="font-bold text-emerald-900 block text-xs">AI Hiring Recommendation:</span>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Strong hire for backend engineering and cloud development roles. Exceptional understanding of asynchronous concurrency and database indexing.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 block text-xs">GitHub Repository Verification:</span>
                  <p className="text-slate-600">Username: <strong className="text-slate-900 font-mono">@{selectedCandidate.githubUsername}</strong></p>
                  <p className="text-slate-600">{selectedCandidate.githubStats?.commitsThisMonth} commits this month • 100% test coverage verified</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedCandidate(null)}>
                Close
              </Button>
              <Button variant="primary" leftIcon={<Award className="w-4 h-4" />}>
                Shortlist Candidate to Pipeline
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
