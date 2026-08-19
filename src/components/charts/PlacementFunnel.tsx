import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export interface PlacementFunnelProps {
  data?: { stage: string; count: number }[];
  className?: string;
}

const COLORS = ['#94a3b8', '#0c87eb', '#8b5cf6', '#f59e0b', '#10b981'];

export const PlacementFunnel: React.FC<PlacementFunnelProps> = ({
  data = [],
  className,
}) => {
  const hasData = data.some(d => d.count > 0);

  if (!hasData) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center ${className || 'h-64'}`}>
        <p className="text-xs font-semibold text-slate-700">No Placement Pipeline Activity Yet</p>
        <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
          Applications, shortlists, and offer generation will populate this real-time funnel.
        </p>
      </div>
    );
  }

  return (
    <div className={className || 'w-full h-64'}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} />
          <YAxis dataKey="stage" type="category" stroke="#475569" fontSize={11} tickLine={false} width={80} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '8px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
