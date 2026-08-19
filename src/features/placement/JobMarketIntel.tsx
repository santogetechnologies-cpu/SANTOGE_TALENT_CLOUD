import React, { useState, useEffect } from 'react';
import { collegeService } from '../../services/collegeService';
import { MarketSkillTrend } from '../../types/college';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  TrendingUp,
  BarChart3,
  Briefcase,
  DollarSign,
  Sparkles,
  Search,
} from 'lucide-react';

export const JobMarketIntel: React.FC = () => {
  const [trends, setTrends] = useState<MarketSkillTrend[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await collegeService.getMarketTrends();
      setTrends(data);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5" /> Market Demand & Compensation Radar
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Real-Time Job Market Intelligence
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Track industry skill surges, hiring sector volumes, and national entry-level compensation benchmarks.
          </p>
        </div>
      </div>

      {/* Top Skills In Demand Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trends.map(t => (
          <Card key={t.skillName} hoverable className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">{t.skillName}</h3>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                  <TrendingUp className="w-3.5 h-3.5" /> +{t.demandGrowthPercent}% YoY Surge
                </span>
              </div>
              <Badge variant="primary" size="sm">
                Score: {t.relevanceScore}/100
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-center">
              <div>
                <span className="text-[10px] text-slate-500 block">Avg Salary</span>
                <span className="font-bold text-emerald-600">₹{t.averageSalaryLPA} LPA</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Openings</span>
                <span className="font-bold text-brand-600">{t.openingsCount.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Top Hiring Industries:</span>
              <div className="flex flex-wrap gap-1.5">
                {t.topHiringSectors.map(sec => (
                  <span key={sec} className="px-2 py-0.5 rounded text-[10px] bg-slate-100 font-medium text-slate-700">
                    {sec}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
