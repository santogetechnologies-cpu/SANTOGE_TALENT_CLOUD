import React, { useState } from "react";
import {
  FolderGit2,
  CheckSquare,
  Square,
  ExternalLink,
  Send,
  Award,
  BookOpen,
  CheckCircle2,
  Code2,
  Layers,
  Sparkles,
} from "lucide-react";
import type { ProjectConfig } from "@/lib/course-curricula/types";

interface ProjectModeProps {
  projectConfig: ProjectConfig;
  day: number;
  courseTitle: string;
  onComplete: (deliverableUrl: string, notes: string) => void;
  onBack?: () => void;
}

export function ProjectMode({
  projectConfig,
  day,
  courseTitle,
  onComplete,
  onBack,
}: ProjectModeProps) {
  const { milestone, evaluationRubric, techStack, projectTitle, overview } = projectConfig;

  const [checkedCriteria, setCheckedCriteria] = useState<Record<number, boolean>>({});
  const [repoUrl, setRepoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleCriteria = (idx: number) => {
    setCheckedCriteria((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const allCriteriaMet =
    milestone.acceptanceCriteria.length > 0 &&
    milestone.acceptanceCriteria.every((_, idx) => checkedCriteria[idx]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allCriteriaMet) return;
    setSubmitted(true);
    setTimeout(() => {
      onComplete(repoUrl || "https://github.com/santoge/capstone-deliverable", notes);
    }, 1200);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto my-auto animate-in fade-in zoom-in-95 duration-400">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/5">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-bold text-foreground">Capstone Milestone Submitted!</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Your Day {day} deliverable has been recorded in your Talent Cloud portfolio.
        </p>
        <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>+100 Capstone XP & Verification Badge</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 flex flex-col gap-6">
      {/* Top Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 uppercase tracking-wider font-semibold">
              Capstone Engineering Project • Day {day} of 90
            </span>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{projectTitle}</h2>
          </div>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Project Overview & Tech Stack */}
      <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Layers className="w-4 h-4 text-primary" />
          <span>System Overview & Tech Stack</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{overview}</p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-0.5 rounded-md bg-muted/60 border border-border/60 text-xs font-mono text-foreground"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Today's Milestone & Deliverable */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-5">
          {/* Milestone Details */}
          <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-primary uppercase tracking-wider font-medium">
                  Milestone Objective
                </span>
                <h3 className="text-lg font-bold text-foreground mt-0.5">{milestone.title}</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                Phase 6
              </span>
            </div>

            <p className="text-xs md:text-sm text-muted-foreground bg-muted/30 p-3.5 rounded-xl border border-border/40">
              {milestone.deliverable}
            </p>

            {/* Acceptance Criteria Checklist */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-primary" />
                <span>Acceptance Criteria (Check all to proceed):</span>
              </span>
              {milestone.acceptanceCriteria.map((crit, idx) => {
                const isChecked = !!checkedCriteria[idx];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleCriteria(idx)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left text-xs md:text-sm transition-all ${
                      isChecked
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200"
                        : "bg-muted/30 hover:bg-muted/60 border-border/60 text-foreground"
                    }`}
                  >
                    <span className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400">
                      {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                    </span>
                    <span className={isChecked ? "line-through opacity-80" : ""}>{crit}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex flex-col gap-4">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">
              Submit Milestone Deliverable
            </h4>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Deliverable URL (GitHub repo, PR link, Colab notebook, or architecture URL)
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://github.com/your-username/santoge-capstone-project"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs md:text-sm rounded-xl bg-background border border-border/60 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 pl-9"
                />
                <ExternalLink className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Implementation Notes & Key Architecture Decisions (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe your approach, edge cases handled, and test results..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs md:text-sm rounded-xl bg-background border border-border/60 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!allCriteriaMet}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all mt-1"
            >
              <Send className="w-4 h-4" />
              <span>Submit Day {day} Deliverable</span>
            </button>

            {!allCriteriaMet && (
              <p className="text-[11px] text-amber-500 text-center">
                Check off all acceptance criteria above to unlock milestone submission.
              </p>
            )}
          </form>
        </div>

        {/* Sidebar: Evaluation Rubric */}
        <div className="flex flex-col gap-4">
          <div className="p-5 rounded-2xl bg-card border border-border/60 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Evaluation Rubric</span>
            </div>
            <div className="flex flex-col gap-2.5 mt-1">
              {evaluationRubric.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-border/30 last:border-0">
                  <span className="text-muted-foreground">{item.criteria}</span>
                  <span className="font-mono font-bold text-foreground">{item.weight}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-primary block mb-1">Dual Gate Graduation Note</span>
            Successful completion of all Phase 6 milestones is required to unlock your verified talent score and recruiter marketplace credential.
          </div>
        </div>
      </div>
    </div>
  );
}
