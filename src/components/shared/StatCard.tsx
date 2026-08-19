import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import clsx from 'clsx';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  iconBgColor?: string;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'positive',
  icon,
  iconBgColor = 'bg-brand-50 text-brand-600',
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-white rounded-xl border border-slate-200/80 p-5 shadow-soft transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-soft-md hover:border-slate-300 active:scale-[0.99]',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="mt-1.5 text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        {icon && (
          <div className={clsx('p-2.5 rounded-xl shrink-0 flex items-center justify-center', iconBgColor)}>
            {icon}
          </div>
        )}
      </div>

      {change && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs">
          {changeType === 'positive' && <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
          {changeType === 'negative' && <TrendingDown className="w-3.5 h-3.5 text-rose-600" />}
          <span
            className={clsx(
              'font-semibold',
              changeType === 'positive' && 'text-emerald-600',
              changeType === 'negative' && 'text-rose-600',
              changeType === 'neutral' && 'text-slate-500'
            )}
          >
            {change}
          </span>
          <span className="text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
};
