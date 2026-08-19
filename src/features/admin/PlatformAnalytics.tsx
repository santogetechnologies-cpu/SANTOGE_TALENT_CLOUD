import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { TalentScoreRadar } from '../../components/charts/TalentScoreRadar';
import { IRITrendChart } from '../../components/charts/IRITrendChart';
import { PlacementFunnel } from '../../components/charts/PlacementFunnel';
import { BarChart3, TrendingUp, Users, Building, Award, Sparkles } from 'lucide-react';
import { analyticsService, PlatformDeepAnalytics } from '../../services/analyticsService';

export const PlatformAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<PlatformDeepAnalytics>({
    funnelData: [],
    trendData: [],
    radarData: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await analyticsService.getPlatformDeepAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Error loading deep analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <BarChart3 className="w-3.5 h-3.5" /> Platform Intelligence
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Cross-Institution Talent & Hiring Analytics
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Multi-tenant comparative placement performance, track enrollment distributions, and recruiter conversion metrics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Platform-Wide Placement Funnel</h3>
            <Badge variant="primary">All Colleges</Badge>
          </div>
          <PlacementFunnel data={analytics.funnelData} />
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Average IRI Progression Across Batches</h3>
            <Badge variant="success">Trajectory</Badge>
          </div>
          <IRITrendChart data={analytics.trendData} />
        </Card>
      </div>

      <Card className="p-6 space-y-3">
        <h3 className="text-base font-bold text-slate-900">Platform Talent Competency Matrix</h3>
        <TalentScoreRadar data={analytics.radarData} />
      </Card>
    </div>
  );
};
