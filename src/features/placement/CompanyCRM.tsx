import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { collegeService } from '../../services/collegeService';
import { CompanyCRMRecord } from '../../types/college';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  Briefcase,
  Building,
  Plus,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Clock,
} from 'lucide-react';

export const CompanyCRM: React.FC = () => {
  const { user } = useAuth();
  const [crmList, setCrmList] = useState<CompanyCRMRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<CompanyCRMRecord | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [interactionSummary, setInteractionSummary] = useState('');
  const [interactionChannel, setInteractionChannel] = useState<'Email' | 'Phone' | 'Meeting' | 'Campus Visit'>('Meeting');

  useEffect(() => {
    const load = async () => {
      const data = await collegeService.getCRMRecords(user?.dataScope);
      setCrmList(data);
    };
    load();
  }, [user]);

  const handleLogInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !interactionSummary.trim()) return;
    const updated = await collegeService.logCRMInteraction(
      selectedRecord.id,
      user?.name || 'Prof. Ananya Sen',
      interactionChannel,
      interactionSummary
    );
    if (updated) {
      setCrmList(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      setSelectedRecord(updated);
      setIsLogModalOpen(false);
      setInteractionSummary('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <Briefcase className="w-3.5 h-3.5" /> Corporate Relations Management
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            College Company CRM & Recruiter Outreach
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Maintain corporate hiring histories, HR key contacts, follow-up queues, and past salary trends.
          </p>
        </div>
      </div>

      {/* CRM Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {crmList.map(item => (
          <Card key={item.id} hoverable className="space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                  <span className="text-xs text-slate-500">{item.industry}</span>
                </div>
                <Badge
                  variant={
                    item.relationshipStatus === 'ACTIVE_PARTNER'
                      ? 'success'
                      : 'warning'
                  }
                  size="sm"
                >
                  {item.tier}
                </Badge>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <p className="font-semibold text-slate-900">HR Contact: {item.contactPerson}</p>
                <p className="text-slate-500 flex items-center gap-1"><Mail className="w-3 h-3" /> {item.contactEmail}</p>
                <p className="text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {item.contactPhone}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-700 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block">Avg Salary</span>
                  <span className="font-bold text-emerald-600">₹{item.averageCtcLPA} LPA</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Past Offers</span>
                  <span className="font-bold text-slate-900">{item.averageOffers} Students</span>
                </div>
              </div>

              {item.notes.length > 0 && (
                <p className="text-xs text-slate-600 italic bg-brand-50/50 p-2.5 rounded-lg border border-brand-100">
                  "{item.notes[0]}"
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Follow-up: {item.followUpDate || 'Aug 25'}
              </span>
              <Button size="sm" variant="outline" onClick={() => { setSelectedRecord(item); setIsLogModalOpen(true); }}>
                Log Interaction
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Log Interaction Modal */}
      {selectedRecord && (
        <Modal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          title={`Corporate Outreach: ${selectedRecord.name}`}
          description="Record call notes, campus visit feedback, or schedule drive dates."
        >
          <form onSubmit={handleLogInteraction} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Interaction Channel:</label>
              <select
                value={interactionChannel}
                onChange={e => setInteractionChannel(e.target.value as any)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg outline-none"
              >
                <option value="Meeting">Formal Meeting / Zoom Call</option>
                <option value="Campus Visit">Campus Visit / University Round</option>
                <option value="Email">Email Communication</option>
                <option value="Phone">Phone Discussion</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Meeting Summary & Action Items:</label>
              <textarea
                value={interactionSummary}
                onChange={e => setInteractionSummary(e.target.value)}
                placeholder="Discussed minimum Talent Score cutoff for the upcoming drive..."
                className="w-full h-32 p-3 border border-slate-300 rounded-xl outline-none text-xs focus:ring-2 focus:ring-brand-500"
                required
              />
            </div>

            {/* Interaction History */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 block text-[11px]">Past Timeline Logs:</span>
              <div className="space-y-1.5 max-h-32 overflow-y-auto text-[11px] text-slate-600">
                {selectedRecord.interactionLogs.map(l => (
                  <div key={l.id} className="p-2 bg-white rounded border border-slate-200">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{l.officerName} • {l.channel}</span>
                      <span className="font-mono text-slate-400">{l.date}</span>
                    </div>
                    <p className="mt-0.5">{l.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" type="button" onClick={() => setIsLogModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Interaction Log
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
