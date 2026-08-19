import React, { useState, useEffect } from 'react';
import { Search, Compass, BookOpen, Code2, Briefcase, Building, DollarSign, Layers, Award, Terminal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface CommandItem {
  id: string;
  title: string;
  category: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
}

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const commands: CommandItem[] = [
    { id: '1', title: 'Student Dashboard', category: 'Student Portal', path: '/student/dashboard', icon: <Compass className="w-4 h-4 text-brand-600" /> },
    { id: '2', title: 'Technical Skill Engine & Career Tracks', category: 'Student Portal', path: '/student/learning', icon: <BookOpen className="w-4 h-4 text-brand-600" /> },
    { id: '3', title: 'Interactive Simulators (Python, SQL, AWS, SAP, Net, Med)', category: 'Interactive Labs', path: '/student/labs', icon: <Terminal className="w-4 h-4 text-emerald-600" /> },
    { id: '4', title: 'Daily Coding Arena & Live Debugging', category: 'Coding', path: '/student/coding', icon: <Code2 className="w-4 h-4 text-violet-600" /> },
    { id: '5', title: 'Placement Accelerator (Daily 40m Cycle)', category: 'Placement', path: '/student/placement', icon: <Award className="w-4 h-4 text-amber-600" /> },
    { id: '6', title: 'Talent Intelligence & IRI Score', category: 'Performance', path: '/student/performance', icon: <Compass className="w-4 h-4 text-cyan-600" /> },
    { id: '7', title: 'Career, ATS Resume & Opportunities', category: 'Career', path: '/student/career', icon: <Briefcase className="w-4 h-4 text-brand-600" /> },
    { id: '8', title: 'Campus Drives & Company CRM', category: 'College CPOS', path: '/placement/drives', icon: <Building className="w-4 h-4 text-indigo-600" /> },
    { id: '9', title: 'Recruiter Talent Discovery & Kanban Pipeline', category: 'Recruiter', path: '/recruiter/talent', icon: <Briefcase className="w-4 h-4 text-emerald-600" /> },
    { id: '10', title: 'Super Admin Overview & Global KPIs', category: 'Platform Admin', path: '/admin', icon: <Layers className="w-4 h-4 text-slate-700" /> },
    { id: '11', title: 'Bulk Student Import Wizard', category: 'Platform Admin', path: '/admin/bulk-import', icon: <Layers className="w-4 h-4 text-slate-700" /> },
    { id: '12', title: 'Finance & Payment Verification Queue', category: 'Finance', path: '/finance/payments', icon: <DollarSign className="w-4 h-4 text-emerald-600" /> },
    { id: '13', title: 'Content Manager (Draft → Publish)', category: 'Curriculum', path: '/content/manage', icon: <BookOpen className="w-4 h-4 text-violet-600" /> },
    { id: '14', title: 'Mentor Interventions & At-Risk Queue', category: 'Operations', path: '/mentor/interventions', icon: <Compass className="w-4 h-4 text-amber-600" /> },
  ];

  const filtered = commands.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-start justify-center p-4 pt-16 text-center sm:p-0">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-xl border border-slate-200">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Type a command or jump to page... (e.g. 'lab', 'drive', 'talent')"
              className="w-full bg-transparent border-none text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <kbd className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-500 rounded border border-slate-200">
              ESC
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No matching commands found</div>
            ) : (
              filtered.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.path)}
                  className="w-full text-left p-3 rounded-xl text-xs hover:bg-slate-100/80 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-soft-sm">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-500">{item.category}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-brand-600">Jump →</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
