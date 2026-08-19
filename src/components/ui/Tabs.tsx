import React from 'react';
import clsx from 'clsx';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills' | 'enclosed';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}) => {
  if (variant === 'pills') {
    return (
      <div className={clsx('flex gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto', className)}>
        {tabs.map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                'flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer',
                isActive
                  ? 'bg-white text-brand-700 shadow-soft-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={clsx(
                    'px-1.5 py-0.2 text-[10px] rounded-full font-bold',
                    isActive ? 'bg-brand-50 text-brand-700' : 'bg-slate-200 text-slate-700'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={clsx('border-b border-slate-200 overflow-x-auto', className)}>
      <nav className="flex space-x-6">
        {tabs.map(tab => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                'group inline-flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer',
                isActive
                  ? 'border-brand-600 text-brand-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={clsx(
                    'ml-1.5 py-0.5 px-2 rounded-full text-xs font-semibold',
                    isActive ? 'bg-brand-100 text-brand-800' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
