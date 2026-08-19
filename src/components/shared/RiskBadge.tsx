import React from 'react';
import { RiskStatus } from '../../types/student';
import clsx from 'clsx';

export const RiskBadge: React.FC<{ status: RiskStatus; className?: string }> = ({ status, className }) => {
  const configs = {
    ON_TRACK: {
      label: 'On Track',
      dotColor: 'bg-emerald-500',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    PARTIAL: {
      label: 'Partial',
      dotColor: 'bg-amber-500',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    STRUGGLING: {
      label: 'Struggling',
      dotColor: 'bg-orange-500',
      badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    INACTIVE: {
      label: 'Inactive',
      dotColor: 'bg-rose-500',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  };

  const config = configs[status] || configs.ON_TRACK;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        config.badgeClass,
        className
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full animate-pulse', config.dotColor)} />
      {config.label}
    </span>
  );
};
