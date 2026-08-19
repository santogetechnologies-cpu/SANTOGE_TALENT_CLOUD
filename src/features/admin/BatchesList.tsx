import React, { useState, useEffect } from 'react';
import { operationsService } from '../../services/operationsService';
import { Batch } from '../../types/operations';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Compass, Users, CheckCircle2, Award, Calendar, Send } from 'lucide-react';

export const BatchesList: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await operationsService.getBatches();
      setBatches(data);
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <Compass className="w-3.5 h-3.5" /> Synchronized Learning Cohorts
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Placement Accelerator Batches & Mentors
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Each batch has a max capacity of 100 students, dedicated mentor, batch coordinator, Telegram channel, and daily learning calendar.
          </p>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {batches.map(b => (
          <Card key={b.id} hoverable className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{b.name}</h3>
                  <span className="text-brand-600 font-semibold">{b.trackName}</span>
                </div>
                <Badge variant="primary" size="sm">{b.code}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">Total Cohort</span>
                  <span className="font-bold text-slate-900">{b.totalStudents} / 100</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Avg Talent Score</span>
                  <span className="font-bold text-brand-600">{b.averageTalentScore}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Attendance</span>
                  <span className="font-bold text-emerald-600">{b.attendancePercent}%</span>
                </div>
              </div>

              <div className="space-y-1 text-slate-600">
                <p><strong>College:</strong> {b.collegeName}</p>
                <p><strong>Mentor:</strong> {b.mentorName}</p>
                <p><strong>Coordinator:</strong> {b.coordinatorName}</p>
                <p className="flex items-center gap-1 text-brand-600 font-semibold">
                  <Send className="w-3.5 h-3.5" /> Telegram: {b.telegramGroupUrl}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Calendar: {b.startDate} to {b.endDate}</span>
              <Badge variant="success" size="sm">{b.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
