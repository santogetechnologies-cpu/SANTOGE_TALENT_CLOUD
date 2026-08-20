import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { recruiterService } from '../../services/recruiterService';
import { Student } from '../../types/student';
import { RecruiterFilterState, JobPosting } from '../../types/recruiter';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
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
  Download,
  Send,
  UserCheck,
  GraduationCap,
  MapPin,
  Code2,
  Layers,
  MessageSquare,
  Clock,
  RotateCcw,
  Plus,
} from 'lucide-react';
import clsx from 'clsx';

const POPULAR_SKILLS = [
  'Python',
  'React',
  'Node.js',
  'PostgreSQL',
  'Docker',
  'AWS',
  'Kubernetes',
  'TypeScript',
  'Java',
  'FastAPI',
];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Artificial Intelligence & Data Science',
  'Mechanical Engineering',
];

const COLLEGES = [
  'Ponjesly College of Engineering',
  'Apex Institute of Technology',
  'Chennai Institute of Engineering',
];

export const TalentDiscovery: React.FC = () => {
  const { user } = useAuth();
  const [candidates, setCandidates] = useState<Student[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Shortlist Modal State
  const [shortlistCandidate, setShortlistCandidate] = useState<Student | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [isShortlisting, setIsShortlisting] = useState(false);
  const [shortlistSuccessMsg, setShortlistSuccessMsg] = useState('');

  // 12 Filter Dimensions
  const [filters, setFilters] = useState<RecruiterFilterState>({
    searchQuery: '',
    colleges: [],
    departments: [],
    skills: [],
    minTalentScore: 650,
    minIRI: 60,
    minCgpa: 6.5,
    graduationYears: [2026],
    availability: 'Immediate / 2026 Batch',
    experienceLevel: 'Freshers (2025/2026)',
    location: 'ALL',
    minCommunicationScore: 60,
    hasGithubOnly: false,
    minProjects: 0,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [candidateList, jobList] = await Promise.all([
        recruiterService.getTalentPool(filters),
        recruiterService.getJobPostings(user?.dataScope.recruiterId),
      ]);
      setCandidates(candidateList);
      setJobs(jobList);
      if (jobList.length > 0 && !selectedJobId) {
        setSelectedJobId(jobList[0].id);
      }
    } catch (err) {
      console.error('Error loading talent pool:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  // Realtime subscription on candidates and applications
  useEffect(() => {
    const channel = supabase
      .channel('recruiter-talent-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidate_applications' }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleToggleSkill = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleToggleDept = (dept: string) => {
    setFilters(prev => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter(d => d !== dept)
        : [...prev.departments, dept],
    }));
  };

  const handleToggleCollege = (college: string) => {
    setFilters(prev => ({
      ...prev,
      colleges: prev.colleges.includes(college)
        ? prev.colleges.filter(c => c !== college)
        : [...prev.colleges, college],
    }));
  };

  const handleShortlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortlistCandidate) return;
    setIsShortlisting(true);

    const targetJob = jobs.find(j => j.id === selectedJobId) || jobs[0];
    const jobTitle = targetJob ? targetJob.title : 'Software Development Engineer';

    try {
      const res = await recruiterService.shortlistCandidate(
        shortlistCandidate,
        selectedJobId || 'job-1',
        jobTitle,
        'SHORTLISTED'
      );

      if (res) {
        setShortlistSuccessMsg(`Successfully invited ${shortlistCandidate.name} to ${jobTitle}!`);
        setTimeout(() => {
          setShortlistCandidate(null);
          setShortlistSuccessMsg('');
        }, 1500);
      }
    } catch (err) {
      console.error('Error shortlisting candidate:', err);
    } finally {
      setIsShortlisting(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      colleges: [],
      departments: [],
      skills: [],
      minTalentScore: 600,
      minIRI: 50,
      minCgpa: 6.0,
      graduationYears: [2026],
      availability: 'Immediate / 2026 Batch',
      experienceLevel: 'Freshers (2025/2026)',
      location: 'ALL',
      minCommunicationScore: 50,
      hasGithubOnly: false,
      minProjects: 0,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Talent Sourcing Engine
            </span>
            <Badge variant="success">Verified Campus Sourcing</Badge>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Realtime Database Sync
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Find & Shortlist Verified Campus Talent
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Search pre-screened graduates based on verified algorithmic Talent Scores, code quality reviews, and simulated lab performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" leftIcon={<RotateCcw className="w-3.5 h-3.5" />} onClick={handleResetFilters}>
            Reset Filters
          </Button>
          <Badge variant="success" size="md">
            {candidates.length} Verified Match
          </Badge>
        </div>
      </div>

      {/* 12 Filter Dimensions Control Panel */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-5 text-xs">
        {/* Row 1: Search & Score Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Search Query */}
          <div className="relative">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Candidate Keyword Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search candidate name, skills, college..."
                value={filters.searchQuery}
                onChange={e => setFilters({ ...filters, searchQuery: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 2. Min Talent Score */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Min Talent Score
              </label>
              <span className="font-mono font-bold text-brand-600 text-xs">{filters.minTalentScore}+ / 990</span>
            </div>
            <input
              type="range"
              min="500"
              max="950"
              step="25"
              value={filters.minTalentScore}
              onChange={e => setFilters({ ...filters, minTalentScore: Number(e.target.value) })}
              className="w-full accent-brand-600 cursor-pointer"
            />
          </div>

          {/* 3. Min Industry Readiness Index (IRI) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Min IRI Readiness
              </label>
              <span className="font-mono font-bold text-emerald-600 text-xs">{filters.minIRI}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="95"
              step="5"
              value={filters.minIRI}
              onChange={e => setFilters({ ...filters, minIRI: Number(e.target.value) })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* 4. Min CGPA Cutoff */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Min CGPA Cutoff
              </label>
              <span className="font-mono font-bold text-slate-900 text-xs">{filters.minCgpa.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="5.0"
              max="9.0"
              step="0.5"
              value={filters.minCgpa}
              onChange={e => setFilters({ ...filters, minCgpa: Number(e.target.value) })}
              className="w-full accent-slate-800 cursor-pointer"
            />
          </div>
        </div>

        {/* Row 2: Location, Experience, Graduation Year, Communication, Projects & GitHub */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100">
          {/* 5. Location */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Location / Region
            </label>
            <select
              value={filters.location}
              onChange={e => setFilters({ ...filters, location: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold outline-none"
            >
              <option value="ALL">All Locations</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Chennai">Chennai</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Pune">Pune</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          {/* 6. Experience Level */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Experience
            </label>
            <select
              value={filters.experienceLevel}
              onChange={e => setFilters({ ...filters, experienceLevel: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold outline-none"
            >
              <option value="Freshers (2025/2026)">Freshers (2026 Batch)</option>
              <option value="0-1 Years">0-1 Years</option>
              <option value="1-3 Years">1-3 Years</option>
            </select>
          </div>

          {/* 7. Graduation Year */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Graduation Year
            </label>
            <select
              value={filters.graduationYears[0] || 2026}
              onChange={e => setFilters({ ...filters, graduationYears: [Number(e.target.value)] })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold outline-none"
            >
              <option value={2026}>2026 Batch</option>
              <option value={2025}>2025 Batch</option>
              <option value={2027}>2027 Batch</option>
            </select>
          </div>

          {/* 8. Communication Score */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Min Communication ({filters.minCommunicationScore}%)
            </label>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={filters.minCommunicationScore || 60}
              onChange={e => setFilters({ ...filters, minCommunicationScore: Number(e.target.value) })}
              className="w-full accent-purple-600 cursor-pointer mt-1"
            />
          </div>

          {/* 9. Verified Projects */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Min Projects Count
            </label>
            <select
              value={filters.minProjects || 0}
              onChange={e => setFilters({ ...filters, minProjects: Number(e.target.value) })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold outline-none"
            >
              <option value={0}>Any Projects (0+)</option>
              <option value={1}>1+ Verified Project</option>
              <option value={2}>2+ Verified Projects</option>
              <option value={3}>3+ Verified Projects</option>
            </select>
          </div>

          {/* 10. GitHub Profile Only */}
          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="githubToggle"
              checked={filters.hasGithubOnly || false}
              onChange={e => setFilters({ ...filters, hasGithubOnly: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="githubToggle" className="text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1">
              <Github className="w-3.5 h-3.5" /> GitHub Only
            </label>
          </div>
        </div>

        {/* Row 3: Skills Filter Pills */}
        <div className="space-y-2 pt-3 border-t border-slate-100">
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px]">
              11. Technical Skills Multi-Select
            </span>
            {filters.skills.length > 0 && (
              <button
                onClick={() => setFilters({ ...filters, skills: [] })}
                className="text-emerald-600 font-bold hover:underline cursor-pointer text-[10px]"
              >
                Clear Skills
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_SKILLS.map(skill => {
              const isSelected = filters.skills.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => handleToggleSkill(skill)}
                  className={clsx(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border',
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-soft-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  )}
                >
                  {skill}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 4: Colleges & Departments Multi-Select */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
          <div>
            <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px] block mb-1.5">
              12. Target Partner Colleges
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COLLEGES.map(col => {
                const isSelected = filters.colleges.includes(col);
                return (
                  <button
                    key={col}
                    onClick={() => handleToggleCollege(col)}
                    className={clsx(
                      'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border',
                      isSelected
                        ? 'bg-brand-600 text-white border-brand-600 shadow-soft-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    )}
                  >
                    {col}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px] block mb-1.5">
              Course / Department
            </span>
            <div className="flex flex-wrap gap-1.5">
              {DEPARTMENTS.map(dept => {
                const isSelected = filters.departments.includes(dept);
                return (
                  <button
                    key={dept}
                    onClick={() => handleToggleDept(dept)}
                    className={clsx(
                      'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border',
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-soft-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    )}
                  >
                    {dept.split('&')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map(candidate => (
          <Card key={candidate.id} hoverable className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Header Info */}
              <div className="flex items-start gap-3">
                <img
                  src={candidate.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={candidate.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-extrabold text-slate-900 text-sm truncate">{candidate.name}</h3>
                    <Badge variant="success" size="sm">
                      {candidate.graduationYear} Batch
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{candidate.collegeName}</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{candidate.departmentName}</p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center font-mono text-xs">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">Talent Score</span>
                  <span className="font-extrabold text-brand-600 text-sm">
                    {candidate.talentScore?.overallScore || 750}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">IRI Readiness</span>
                  <span className="font-extrabold text-emerald-600 text-sm">
                    {candidate.iri?.overallIRI || 80}%
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase">CGPA</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {candidate.cgpa?.toFixed(1) || '8.5'}
                  </span>
                </div>
              </div>

              {/* Top Verified Skills */}
              <div className="flex flex-wrap gap-1">
                {(candidate.skills || []).slice(0, 4).map(s => (
                  <span
                    key={s.name}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold"
                  >
                    {s.name} ({s.score}%)
                  </span>
                ))}
              </div>
            </div>

            {/* Recruiter Actions */}
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                leftIcon={<FileText className="w-3.5 h-3.5 text-slate-500" />}
                onClick={() => setSelectedCandidate(candidate)}
              >
                View Profile
              </Button>
              <Button
                size="sm"
                variant="primary"
                className="flex-1"
                leftIcon={<Send className="w-3.5 h-3.5" />}
                onClick={() => setShortlistCandidate(candidate)}
              >
                Shortlist & Invite
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* 1. Verified Candidate Profile Inspection Modal */}
      {selectedCandidate && (
        <Modal
          isOpen={!!selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          title={`Verified Talent Profile: ${selectedCandidate.name}`}
          description={`${selectedCandidate.departmentName} • ${selectedCandidate.collegeName}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCandidate.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={selectedCandidate.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedCandidate.name}</h3>
                  <p className="text-slate-500 font-mono text-xs">{selectedCandidate.email}</p>
                  <p className="text-emerald-700 font-semibold text-[11px] flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Background & Score Verified by SantoGe Cloud
                  </p>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className="text-2xl font-black text-brand-600 block">
                  {selectedCandidate.talentScore?.overallScore || 750}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-500">Talent Score (Percentile 96%)</span>
              </div>
            </div>

            {/* Radar / Core Competencies */}
            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wide text-xs mb-2">
                Verified Skill Competencies
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono">
                {(selectedCandidate.skills || []).map(s => (
                  <div key={s.name} className="p-2.5 bg-white rounded-xl border border-slate-200 flex justify-between items-center">
                    <span className="font-semibold text-slate-800">{s.name}</span>
                    <span className="font-bold text-brand-600">{s.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                leftIcon={<Download className="w-4 h-4 text-brand-600" />}
                onClick={() => window.open(selectedCandidate.resumeUrl || 'https://santoge.com/resume.pdf', '_blank')}
              >
                Download Verified Resume PDF
              </Button>
              <Button
                variant="primary"
                leftIcon={<Send className="w-4 h-4" />}
                onClick={() => {
                  setShortlistCandidate(selectedCandidate);
                  setSelectedCandidate(null);
                }}
              >
                Shortlist Candidate
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 2. Shortlist & Invite to Job Modal */}
      {shortlistCandidate && (
        <Modal
          isOpen={!!shortlistCandidate}
          onClose={() => setShortlistCandidate(null)}
          title={`Shortlist ${shortlistCandidate.name}`}
          description="Invite candidate directly into your 7-stage hiring pipeline."
        >
          {shortlistSuccessMsg ? (
            <div className="p-6 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">{shortlistSuccessMsg}</h3>
            </div>
          ) : (
            <form onSubmit={handleShortlistSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Target Job Opening
                </label>
                <select
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.location} • ₹{j.ctcMinLPA}-{j.ctcMaxLPA} LPA)
                    </option>
                  ))}
                  {jobs.length === 0 && (
                    <option value="job-default">Senior Software Engineer (Bangalore • ₹14-18 LPA)</option>
                  )}
                </select>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1 text-xs">
                <span className="font-bold block">Pipeline Action</span>
                <p>
                  Candidate will be added directly into the <strong>SHORTLISTED</strong> stage with an invitation notification sent.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setShortlistCandidate(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={isShortlisting} leftIcon={<UserCheck className="w-4 h-4" />}>
                  Confirm Shortlist
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
