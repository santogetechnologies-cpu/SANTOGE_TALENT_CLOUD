import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Compass,
  BookOpen,
  Terminal,
  Code2,
  FolderGit2,
  Award,
  BarChart3,
  Briefcase,
  Building2,
  Users,
  ShieldCheck,
  DollarSign,
  FileCheck2,
  MessageSquare,
  Sparkles,
  Layers,
  Settings,
  Flame,
} from 'lucide-react';
import clsx from 'clsx';

export interface NavSection {
  title?: string;
  items: {
    label: string;
    path: string;
    icon: React.ReactNode;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<{ isOpen: boolean; onClose?: () => void }> = ({ isOpen, onClose }) => {
  const { role, user } = useAuth();

  const getNavSections = (): NavSection[] => {
    switch (role) {
      case 'SUPER_ADMIN':
        return [
          {
            title: 'Platform Overview',
            items: [
              { label: 'Admin Dashboard', path: '/admin', icon: <Layers className="w-4 h-4" /> },
              { label: 'Platform Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
              { label: 'User Management', path: '/admin/users', icon: <ShieldCheck className="w-4 h-4" /> },
            ],
          },
          {
            title: 'Institution & Talent',
            items: [
              { label: 'All Students', path: '/admin/students', icon: <Users className="w-4 h-4" /> },
              { label: 'Bulk Student Import', path: '/admin/bulk-import', icon: <FileCheck2 className="w-4 h-4" />, badge: 'Wizard' },
              { label: 'Colleges Management', path: '/admin/colleges', icon: <Building2 className="w-4 h-4" /> },
              { label: 'Batches & Mentors', path: '/admin/batches', icon: <Compass className="w-4 h-4" /> },
            ],
          },
          {
            title: 'Ecosystem & Governance',
            items: [
              { label: 'Campus Drives', path: '/placement/drives', icon: <Award className="w-4 h-4" /> },
              { label: 'Content Management', path: '/content/manage', icon: <BookOpen className="w-4 h-4" /> },
              { label: 'Finance & Payments', path: '/finance/payments', icon: <DollarSign className="w-4 h-4" /> },
              { label: 'Recruiter Network', path: '/recruiter/talent', icon: <Briefcase className="w-4 h-4" /> },
              { label: 'System Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
            ],
          },
        ];

      case 'OPERATIONS_MANAGER':
        return [
          {
            title: 'Operations Hub',
            items: [
              { label: 'Operations Dashboard', path: '/operations', icon: <Layers className="w-4 h-4" /> },
              { label: 'At-Risk Student Center', path: '/operations/at-risk', icon: <ShieldCheck className="w-4 h-4" />, badge: 'Alert' },
              { label: 'Batches & Cohorts', path: '/operations/batches', icon: <Compass className="w-4 h-4" /> },
              { label: 'Mentors & Faculty', path: '/operations/mentors', icon: <Users className="w-4 h-4" /> },
              { label: 'Daily Attendance Sync', path: '/operations/attendance', icon: <FileCheck2 className="w-4 h-4" /> },
            ],
          },
        ];

      case 'FINANCE_ADMIN':
        return [
          {
            title: 'Finance & Revenue',
            items: [
              { label: 'Payment Verification', path: '/finance/payments', icon: <DollarSign className="w-4 h-4" />, badge: 'Queue' },
              { label: 'Student Invoices', path: '/finance/invoices', icon: <FileCheck2 className="w-4 h-4" /> },
              { label: 'College Subscriptions', path: '/finance/subscriptions', icon: <Building2 className="w-4 h-4" /> },
            ],
          },
        ];

      case 'CONTENT_MANAGER':
        return [
          {
            title: 'Curriculum & Content',
            items: [
              { label: 'Content Lifecycle Hub', path: '/content/manage', icon: <BookOpen className="w-4 h-4" /> },
              { label: 'Learning Cards & Labs', path: '/content/labs', icon: <Terminal className="w-4 h-4" /> },
              { label: 'Coding Challenges', path: '/content/challenges', icon: <Code2 className="w-4 h-4" /> },
              { label: 'Placement Question Bank', path: '/content/placement', icon: <Award className="w-4 h-4" /> },
            ],
          },
        ];

      case 'COLLEGE_SUPER_ADMIN':
      case 'COLLEGE_PLACEMENT_OFFICER':
      case 'DEPARTMENT_COORDINATOR':
        return [
          {
            title: 'College CPOS',
            items: [
              { label: 'College Dashboard', path: '/college/dashboard', icon: <Layers className="w-4 h-4" /> },
              { label: 'Student Directory', path: '/college/students', icon: <Users className="w-4 h-4" /> },
              { label: 'Department Performance', path: '/college/departments', icon: <Building2 className="w-4 h-4" /> },
            ],
          },
          {
            title: 'Placement & Drives',
            items: [
              { label: 'Campus Drives Hub', path: '/placement/drives', icon: <Award className="w-4 h-4" />, badge: 'Live' },
              { label: 'Company CRM', path: '/placement/companies', icon: <Briefcase className="w-4 h-4" /> },
              { label: 'Recruiter Outreach', path: '/placement/outreach', icon: <MessageSquare className="w-4 h-4" /> },
              { label: 'Job Market Intel', path: '/placement/market-intel', icon: <BarChart3 className="w-4 h-4" /> },
            ],
          },
        ];

      case 'MENTOR':
        return [
          {
            title: 'Mentorship Ops',
            items: [
              { label: 'Mentor Dashboard', path: '/mentor/dashboard', icon: <Layers className="w-4 h-4" /> },
              { label: 'My Assigned Batches', path: '/mentor/batches', icon: <Compass className="w-4 h-4" /> },
              { label: 'Student Interventions', path: '/mentor/interventions', icon: <ShieldCheck className="w-4 h-4" />, badge: 'Action' },
              { label: 'Mock Interviews', path: '/mentor/mock-interviews', icon: <Award className="w-4 h-4" /> },
              { label: 'Interactive Labs', path: '/student/labs', icon: <Terminal className="w-4 h-4" /> },
            ],
          },
        ];

      case 'BATCH_COORDINATOR':
        return [
          {
            title: 'Batch Management',
            items: [
              { label: 'Coordinator Dashboard', path: '/batch/dashboard', icon: <Layers className="w-4 h-4" /> },
              { label: 'Daily Completion Sync', path: '/batch/completion', icon: <FileCheck2 className="w-4 h-4" /> },
              { label: 'Telegram & Announcements', path: '/batch/announcements', icon: <MessageSquare className="w-4 h-4" /> },
              { label: 'Batch Leaderboard', path: '/student/placement', icon: <Award className="w-4 h-4" /> },
            ],
          },
        ];

      case 'RECRUITER':
        return [
          {
            title: 'Talent Acquisition',
            items: [
              { label: 'Recruiter Dashboard', path: '/recruiter/dashboard', icon: <Layers className="w-4 h-4" /> },
              { label: 'Talent Discovery', path: '/recruiter/talent', icon: <Compass className="w-4 h-4" />, badge: 'AI Match' },
              { label: 'Job Postings', path: '/recruiter/jobs', icon: <Briefcase className="w-4 h-4" /> },
              { label: 'Kanban Hiring Pipeline', path: '/recruiter/pipeline', icon: <Users className="w-4 h-4" /> },
              { label: 'Interview Scheduler', path: '/recruiter/interviews', icon: <FileCheck2 className="w-4 h-4" /> },
            ],
          },
        ];

      case 'STUDENT':
      default:
        return [
          {
            title: 'My Talent Space',
            items: [
              { label: 'Student Dashboard', path: '/student/dashboard', icon: <Compass className="w-4 h-4" /> },
            ],
          },
          {
            title: 'Technical Skill Engine',
            items: [
              { label: 'Career Tracks (15+)', path: '/student/learning', icon: <BookOpen className="w-4 h-4" /> },
              { label: 'Interactive Simulators', path: '/student/labs', icon: <Terminal className="w-4 h-4" />, badge: '6 Labs' },
              { label: 'Coding Arena & Debug', path: '/student/coding', icon: <Code2 className="w-4 h-4" /> },
              { label: 'Project Studio & Git', path: '/student/projects', icon: <FolderGit2 className="w-4 h-4" /> },
            ],
          },
          {
            title: 'Placement Accelerator',
            items: [
              { label: 'Daily 40m Placement Cycle', path: '/student/placement', icon: <Award className="w-4 h-4" />, badge: 'Daily' },
              { label: 'Talent Intelligence & IRI', path: '/student/performance', icon: <BarChart3 className="w-4 h-4" /> },
              { label: 'ATS Resume & Jobs', path: '/student/career', icon: <Briefcase className="w-4 h-4" /> },
            ],
          },
        ];
    }
  };

  const sections = getNavSections();

  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out shrink-0 lg:static lg:translate-x-0 h-full select-none',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-glow-brand">
            S
          </div>
          <div>
            <span className="font-extrabold text-white text-sm tracking-tight flex items-center gap-1">
              SantoGe <span className="text-brand-400 font-semibold text-xs">TALENT</span>
            </span>
            <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-mono">
              Campus to Career OS
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        )}
      </div>

      {/* Scoped Context Pill */}
      {user?.dataScope.collegeName && role !== 'STUDENT' && (
        <div className="px-4 py-2 bg-slate-850 border-b border-slate-800 text-[11px] flex items-center gap-1.5 text-brand-300 font-medium">
          <Building2 className="w-3.5 h-3.5 shrink-0 text-brand-400" />
          <span className="truncate">{user.dataScope.collegeName}</span>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                {section.title}
              </p>
            )}
            {section.items.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group',
                    isActive
                      ? 'bg-brand-600 text-white font-bold shadow-soft-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  )
                }
              >
                <div className="flex items-center gap-2.5">
                  <span className="shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Streak / XP Quick Widget (for Student) or Role Summary */}
      {role === 'STUDENT' ? (
        <div className="p-3 m-3 bg-gradient-to-br from-slate-850 to-slate-950 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <Flame className="w-3.5 h-3.5 fill-amber-400" /> 28 Day Streak
            </span>
            <span className="text-brand-400 font-mono font-bold">14,250 XP</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-amber-400 to-brand-500 h-full w-[84%]" />
          </div>
          <p className="mt-1.5 text-[10px] text-slate-400">Level 4 Talent • Tier: Premium</p>
        </div>
      ) : (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 text-xs flex items-center justify-between">
          <div className="truncate">
            <p className="text-white font-semibold text-xs truncate">{user?.name}</p>
            <p className="text-[10px] text-brand-400 font-mono truncate">{user?.roleTitle}</p>
          </div>
        </div>
      )}
    </aside>
  );
};
