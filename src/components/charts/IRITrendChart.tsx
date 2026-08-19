import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface IRITrendChartProps {
  data?: { month: string; iri: number; benchmark: number }[];
  className?: string;
}

export const IRITrendChart: React.FC<IRITrendChartProps> = ({
  data = [],
  className,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center ${className || 'h-72'}`}>
        <p className="text-xs font-semibold text-slate-700">No Historical IRI Trajectory Logged Yet</p>
        <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
          Daily lab evaluations and mock interview scores will generate real-time progression curves.
        </p>
      </div>
    );
  }

  return (
    <div className={className || 'w-full h-72'}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="iriGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0c87eb" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#0c87eb" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="benchGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '8px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="iri"
            name="Batch Average IRI"
            stroke="#0c87eb"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#iriGradient)"
          />
          <Area
            type="monotone"
            dataKey="benchmark"
            name="Target Benchmark"
            stroke="#10b981"
            strokeWidth={2}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#benchGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
