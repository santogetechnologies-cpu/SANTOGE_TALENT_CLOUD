import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import { collegeService } from '../../services/collegeService';
import { placementService } from '../../services/placementService';
import { Student } from '../../types/student';
import { College, CampusDrive } from '../../types/college';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  FileText,
  Printer,
  Download,
  Building2,
  Award,
  DollarSign,
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PlacementReports: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [college, setCollege] = useState<College | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [drives, setDrives] = useState<CampusDrive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const col = await collegeService.getCollegeById(user?.dataScope?.collegeId || 'col-apex');
        const stu = await studentService.getStudents(user?.dataScope);
        const drv = await collegeService.getCampusDrives(user?.dataScope?.collegeId);
        setCollege(col);
        setStudents(stu);
        setDrives(drv);
      } catch (err) {
        console.error('Error loading placement report data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const placedStudents = students.filter(s => s.placementReadiness.offersCount > 0);
  const totalStudentsCount = students.length || college?.totalStudents || 840;
  const placedCount = placedStudents.length || college?.placedCount || 658;
  const placementRate = totalStudentsCount > 0 ? Math.round((placedCount / totalStudentsCount) * 100) : 78;

  const handleExportCSV = () => {
    const headers = ['Roll Number', 'Student Name', 'Department', 'CGPA', 'Talent Score', 'Status', 'Offers'];
    const rows = students.map(s => [
      s.rollNumber,
      `"${s.name}"`,
      `"${s.departmentName}"`,
      s.cgpa,
      s.talentScore.overallScore,
      s.riskStatus,
      s.placementReadiness.offersCount,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `placement_report_${college?.code || 'campus'}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto print:p-0">
      {/* Header Actions */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Institutional Placement Intelligence
            </span>
            <Badge variant="primary">{college?.code || 'CPOS-2026'}</Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Campus Placement & Career Outcome Report
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Certified campus placement audit and company hiring breakdown for <strong>{college?.name || user?.dataScope?.collegeName}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4 text-brand-600" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Print Official PDF Report
          </Button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-soft space-y-8 print:border-none print:shadow-none">
        {/* Document Letterhead */}
        <div className="border-b-2 border-slate-900 pb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white font-black flex items-center justify-center text-base">
                S
              </div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">
                SantoGe Talent Cloud OS
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900">{college?.name || 'ABC Engineering College'}</h2>
            <p className="text-xs text-slate-600 font-medium">
              Autonomous Institutional Placement & Career Development Cell • {college?.city}, {college?.state}
            </p>
          </div>

          <div className="text-right text-xs font-mono text-slate-600 space-y-1">
            <p className="font-bold text-slate-900">Academic Year: 2025–2026</p>
            <p>Generated: {new Date().toLocaleDateString()}</p>
            <p>CPO: {college?.placementOfficerName || 'Prof. Placement Officer'}</p>
          </div>
        </div>

        {/* Executive Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center font-mono">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Total Graduating Batch</span>
            <span className="text-2xl font-black text-slate-900">{totalStudentsCount}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Placement Conversion</span>
            <span className="text-2xl font-black text-emerald-600">{placementRate}%</span>
            <span className="text-[10px] text-slate-500 block">({placedCount} Students Placed)</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Average CTC Package</span>
            <span className="text-2xl font-black text-brand-600">₹{college?.averagePackageLPA || 8.4} LPA</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block font-semibold">Highest CTC Package</span>
            <span className="text-2xl font-black text-purple-600">₹{college?.highestPackageLPA || 24.0} LPA</span>
          </div>
        </div>

        {/* Department Placement Breakdown Table */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-600" /> Department-Wise Placement Performance
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Department Name</th>
                  <th className="p-3">Code</th>
                  <th className="p-3">Department Coordinator</th>
                  <th className="p-3 text-right">Students</th>
                  <th className="p-3 text-right">Avg Talent Score</th>
                  <th className="p-3 text-right">Placement Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(college?.departments || []).map(d => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{d.name}</td>
                    <td className="p-3 font-mono text-slate-600">{d.code}</td>
                    <td className="p-3 text-slate-700">{d.coordinatorName}</td>
                    <td className="p-3 font-mono text-right">{d.totalStudents}</td>
                    <td className="p-3 font-mono text-right text-brand-600 font-bold">{d.averageTalentScore}</td>
                    <td className="p-3 font-mono text-right text-emerald-600 font-bold">{d.placementRate || 80}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Campus Placement Drives & Partner Companies */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-brand-600" /> Campus Drives & Recruiter Cohort
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {drives.map(drive => (
              <div key={drive.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1 font-mono">
                <div className="flex justify-between items-start font-sans">
                  <strong className="text-slate-900 font-bold">{drive.companyName}</strong>
                  <Badge variant="primary" size="sm">₹{drive.ctcLPA} LPA</Badge>
                </div>
                <p className="text-[11px] text-slate-600 font-sans">Role: {drive.roleTitle}</p>
                <p className="text-[10px] text-slate-500">Date: {drive.driveDate} • Status: {drive.status}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Signoff */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
          <div>
            <p className="font-bold text-slate-900 mb-8">Verified By:</p>
            <div className="border-t border-slate-400 pt-1 font-mono text-slate-700">
              {college?.placementOfficerName || 'Placement Director / CPO'}
              <span className="block text-[10px] text-slate-500">Head — Corporate Relations & Placement</span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900 mb-8">Approved By:</p>
            <div className="border-t border-slate-400 pt-1 font-mono text-slate-700">
              {college?.adminName || 'Dr. Principal / Director'}
              <span className="block text-[10px] text-slate-500">Principal / Institutional Head</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
