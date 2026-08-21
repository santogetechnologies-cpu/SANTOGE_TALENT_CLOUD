import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { collegeService } from '../../services/collegeService';
import { College } from '../../types/college';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import {
  Building2,
  Plus,
  Users,
  Award,
  MapPin,
  ExternalLink,
  School,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CollegesList: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [collegeToDelete, setCollegeToDelete] = useState<College | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await collegeService.getColleges();
      setColleges(data);
    } catch (err) {
      console.error('Error loading colleges:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Real-time synchronization on public.colleges
  useEffect(() => {
    const channel = supabase
      .channel('admin-colleges-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'colleges' }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeleteConfirm = async () => {
    if (!collegeToDelete) return;
    setIsDeleting(true);
    setDeleteError('');

    try {
      const ok = await collegeService.deleteCollege(collegeToDelete.id);
      if (ok) {
        setColleges(prev => prev.filter(c => c.id !== collegeToDelete.id));
        setCollegeToDelete(null);
      } else {
        setDeleteError('Failed to delete college. Ensure all dependent records are clear.');
      }
    } catch (err: any) {
      console.error('Error deleting college:', err);
      setDeleteError(err.message || 'Error executing real-time college deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredColleges = colleges.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.adminName.toLowerCase().includes(q) ||
      c.adminEmail.toLowerCase().includes(q)
    );
  });

  const totalStudents = colleges.reduce((sum, c) => sum + (c.totalStudents || 0), 0);
  const avgPlacement = colleges.length > 0
    ? (colleges.reduce((sum, c) => sum + (Number(c.placementPercentage) || 0), 0) / colleges.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Institutional Network Governance
            </span>
            <Badge variant="purple">Super Admin Scope</Badge>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Realtime Database Sync
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Partner University & College Directory
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Oversee multi-tenant college instances, department branches, placement officers, and manage partner lifecycle in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={load}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/admin/create-college')}
          >
            Onboard New College
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Colleges</span>
          <span className="text-2xl font-black text-slate-900 font-mono">{colleges.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Enrolled Students</span>
          <span className="text-2xl font-black text-brand-600 font-mono">{totalStudents.toLocaleString()}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Average Placement %</span>
          <span className="text-2xl font-black text-emerald-600 font-mono">{avgPlacement}%</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Active Subscriptions</span>
          <span className="text-2xl font-black text-purple-600 font-mono">
            {colleges.filter(c => c.subscriptionStatus.includes('ACTIVE')).length}
          </span>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-soft flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search college by name, code, city, or admin email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-bold text-slate-900">{filteredColleges.length}</span> of {colleges.length} Colleges
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <Building2 className="w-8 h-8 mx-auto animate-bounce mb-2 text-brand-500" />
          <p className="text-sm font-medium">Loading partner institutions in real time...</p>
        </div>
      ) : filteredColleges.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {searchQuery ? 'No Colleges Match Search' : 'No Colleges Onboarded Yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {searchQuery
                ? 'Try refining your search keyword or reset the filter.'
                : 'Your platform database is clean and ready. Onboard your first partner university to begin.'}
            </p>
          </div>
          {!searchQuery && (
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => navigate('/admin/create-college')}
            >
              Onboard First College
            </Button>
          )}
        </Card>
      ) : (
        /* Colleges Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredColleges.map(c => (
            <Card key={c.id} hoverable className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-slate-900 truncate">{c.name}</h3>
                    <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" /> {c.city}, {c.state}
                    </span>
                  </div>
                  <Badge variant="primary" size="sm">{c.code}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Total Students</span>
                    <span className="font-bold text-slate-900">{c.totalStudents || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Placement %</span>
                    <span className="font-bold text-emerald-600">{c.placementPercentage || 0}%</span>
                  </div>
                </div>

                <div className="space-y-1 text-slate-600 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100 font-sans">
                  <p className="truncate"><strong>Admin:</strong> {c.adminName} ({c.adminEmail})</p>
                  <p className="truncate"><strong>Placement Officer:</strong> {c.placementOfficerName}</p>
                  <p><strong>Departments:</strong> {(c.departments || []).length} Academic Branches</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <Button
                  size="xs"
                  variant="danger"
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={() => setCollegeToDelete(c)}
                >
                  Delete College
                </Button>

                <Button
                  size="xs"
                  variant="outline"
                  leftIcon={<ExternalLink className="w-3 h-3" />}
                  onClick={() => navigate('/college/dashboard')}
                >
                  CPOS Portal →
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete College Confirmation Modal */}
      {collegeToDelete && (
        <Modal
          isOpen={!!collegeToDelete}
          onClose={() => !isDeleting && setCollegeToDelete(null)}
          title="Confirm College Deletion"
          description={`Permanently remove ${collegeToDelete.name} from the platform.`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Destructive Action Warning</span>
              </div>
              <p className="text-xs leading-relaxed">
                You are about to delete <strong>{collegeToDelete.name} ({collegeToDelete.code})</strong>. This will permanently remove its institutional records, departments, and user scope associations across PostgreSQL.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Institution Code:</span>
                <span className="font-bold text-slate-900">{collegeToDelete.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Campus Location:</span>
                <span className="font-bold text-slate-900">{collegeToDelete.city}, {collegeToDelete.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Administrator:</span>
                <span className="font-bold text-slate-900">{collegeToDelete.adminEmail}</span>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-100 text-rose-800 rounded-xl font-semibold text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => setCollegeToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                isLoading={isDeleting}
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={handleDeleteConfirm}
              >
                Delete College Realtime
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
