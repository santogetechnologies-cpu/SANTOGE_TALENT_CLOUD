import React from 'react';
import clsx from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  padding = 'md',
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-slate-200/80 shadow-soft transition-all duration-200',
        hoverable && 'hover:shadow-soft-md hover:border-slate-300',
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
