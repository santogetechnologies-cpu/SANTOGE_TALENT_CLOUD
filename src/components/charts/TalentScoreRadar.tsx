import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export interface TalentScoreRadarProps {
  data?: { skill: string; score: number; fullMark: number }[];
  className?: string;
}

export const TalentScoreRadar: React.FC<TalentScoreRadarProps> = ({
  data = [],
  className,
}) => {
  const hasData = data && data.length > 0 && data.some(d => d.score > 0);

  if (!hasData) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center ${className || 'h-72'}`}>
        <p className="text-xs font-semibold text-slate-700">No Competency Radar Data Available</p>
        <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
          Skill scores and assessment data will construct the multi-dimensional talent radar.
        </p>
      </div>
    );
  }

  return (
    <div className={className || 'w-full h-72'}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '8px',
              border: 'none',
              color: '#fff',
              fontSize: '12px',
            }}
          />
          <Radar
            name="Talent Competency Score"
            dataKey="score"
            stroke="#0c87eb"
            fill="#0c87eb"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
