import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { recruiterService } from '../../services/recruiterService';
import { JobPosting } from '../../types/recruiter';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  Briefcase,
  Plus,
  Calendar,
  Users,
  Building,
  CheckCircle2,
  DollarSign,
  Sparkles,
} from 'lucide-react';

export const JobPostings: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Bengaluru / Hybrid');
  const [ctcMin, setCtcMin] = useState('12.0');
  const [ctcMax, setCtcMax] = useState('18.0');
  const [minTalentScore, setMinTalentScore] = useState('780');
  const [minIRI, setMinIRI] = useState('80');
  const [skills, setSkills] = useState('Python, FastAPI, PostgreSQL, Docker');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const load = async () => {
      const list = await recruiterService.getJobPostings(user?.dataScope.recruiterId);
      setJobs(list);
    };
    load();
  }, [user]);

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await recruiterService.createJobPosting({
      recruiterId: user?.dataScope.recruiterId || 'rec-sarah',
      companyName: 'TechCorp Solutions',
      title,
      location,
      ctcMinLPA: Number(ctcMin),
      ctcMaxLPA: Number(ctcMax),
      description,
      requiredSkills: skills.split(',').map(s => s.trim()),
      eligibility: {
        minTalentScore: Number(minTalentScore),
        minIRI: Number(minIRI),
        minCgpa: 7.0,
      },
    });
    if (created) {
      setJobs(prev => [created, ...prev]);
    }
    setIsCreateModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5 mb-1">
            <Briefcase className="w-3.5 h-3.5" /> Job Requisitions
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Active Job Openings & Eligibility Filters
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Publish openings with algorithmically guarded Talent Score and IRI cutoff thresholds.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create New Job Opening
        </Button>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map(job => (
          <Card key={job.id} hoverable className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                  <span className="text-slate-500 font-mono text-[11px]">{job.location} • ₹{job.ctcMinLPA} - {job.ctcMaxLPA} LPA</span>
                </div>
                <Badge variant="success" size="sm">{job.status}</Badge>
              </div>

              <p className="text-slate-600 leading-relaxed line-clamp-3">{job.description}</p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1 pt-1">
                {job.requiredSkills.map(sk => (
                  <span key={sk} className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-700">
                    {sk}
                  </span>
                ))}
              </div>

              {/* Automated Eligibility Filter Box */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 flex justify-between items-center text-xs font-mono">
                <span>Min Talent Score: <strong>≥ {job.eligibility.minTalentScore}</strong></span>
                <span>Min IRI: <strong>≥ {job.eligibility.minIRI}%</strong></span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{job.applicantsCount} Total Applicants</span>
              <span className="font-semibold text-slate-900">Posted on: {job.createdAt}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Job Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Post New Job Opening"
        description="Specify compensation, location, and automatic Talent Score criteria."
      >
        <form onSubmit={handleCreateJob} className="space-y-4 text-xs">
          <Input
            label="Job Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Full Stack Python & Cloud Developer"
            required
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              required
            />
            <Input
              label="Min CTC (LPA)"
              type="number"
              value={ctcMin}
              onChange={e => setCtcMin(e.target.value)}
              required
            />
            <Input
              label="Max CTC (LPA)"
              type="number"
              value={ctcMax}
              onChange={e => setCtcMax(e.target.value)}
              required
            />
          </div>

          <Input
            label="Required Skills (Comma separated)"
            value={skills}
            onChange={e => setSkills(e.target.value)}
            placeholder="Python, FastAPI, SQL, Docker, AWS"
            required
          />

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block text-xs">Automated Talent Gate:</span>
            <div className="grid grid-cols-2 gap-3">
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
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Job Description & Responsibilities:</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Outline role responsibilities, team structure, and growth opportunities..."
              className="w-full h-28 p-3 border border-slate-300 rounded-xl outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" type="button" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Publish Job Opening</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
