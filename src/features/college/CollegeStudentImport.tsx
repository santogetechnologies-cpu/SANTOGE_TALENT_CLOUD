import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentService } from '../../services/studentService';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Upload,
  FileCheck2,
  Download,
  AlertCircle,
  CheckCircle2,
  Building2,
  Users,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CollegeStudentImport: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [csvText, setCsvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<{
    successCount: number;
    failureCount: number;
    errors: string[];
  } | null>(null);

  const sampleCsv = `Name,RollNumber,Email,Phone,Department,CGPA,GraduationYear,GitHub
Aarav Patel,2026-CSE-101,aarav.p@apextech.edu,+91 98765 11001,Computer Science & Engineering,8.75,2026,aarav-dev
Divya Reddy,2026-IT-102,divya.r@apextech.edu,+91 98765 11002,Information Technology,8.40,2026,divya-code
Rohan Sharma,2026-ECE-103,rohan.s@apextech.edu,+91 98765 11003,Electronics & Communication,7.95,2026,rohan-ece
Kavya Nair,2026-AIDS-104,kavya.n@apextech.edu,+91 98765 11004,Artificial Intelligence & Data Science,9.10,2026,kavya-ai`;

  const handleDownloadTemplate = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `student_import_template_${user?.dataScope?.collegeName?.replace(/\s+/g, '_') || 'college'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleProcessImport = async () => {
    if (!csvText.trim()) return;

    setIsProcessing(true);
    setImportResult(null);

    const lines = csvText
      .trim()
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      setImportResult({
        successCount: 0,
        failureCount: 1,
        errors: ['CSV must contain a header row and at least one data row.'],
      });
      setIsProcessing(false);
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < 3) continue;

      const record: any = {
        name: parts[0] || `Student ${i}`,
        rollNumber: parts[1] || `ROLL-${i}`,
        email: parts[2] || `student${i}@college.edu`,
        phone: parts[3] || '',
        departmentName: parts[4] || 'Computer Science & Engineering',
        cgpa: parseFloat(parts[5]) || 8.0,
        graduationYear: parseInt(parts[6]) || 2026,
        github: parts[7] || 'student-dev',
        collegeId: user?.dataScope?.collegeId,
        collegeName: user?.dataScope?.collegeName || 'ABC Engineering College',
      };
      records.push(record);
    }

    try {
      const res = await studentService.bulkImportStudents(records);
      setImportResult({
        successCount: res.successCount,
        failureCount: res.failureCount,
        errors: res.errors,
      });
    } catch (err: any) {
      console.error('Import failed:', err);
      setImportResult({
        successCount: 0,
        failureCount: records.length,
        errors: [err.message || 'Import failed'],
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5" /> Institutional Intake Engine
            </span>
            <Badge variant="primary">Multi-Tenant Scoped</Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Bulk Student Import & Enrollment
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Intake students for <strong className="text-slate-900">{user?.dataScope?.collegeName || 'Your College'}</strong> via standardized CSV format.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4 text-brand-600" />}
            onClick={handleDownloadTemplate}
          >
            Download CSV Template
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/college/students')}
          >
            View Student Directory →
          </Button>
        </div>
      </div>

      {/* Upload Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-5">
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
          <Upload className="w-10 h-10 text-brand-500 mx-auto mb-3" />
          <h3 className="font-extrabold text-slate-900 text-sm">Upload Student Manifest (CSV)</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Drag & drop your CSV file here, or browse from your computer.
          </p>

          <label className="inline-flex">
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="cursor-pointer px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-soft hover:bg-brand-700 transition-colors flex items-center gap-2">
              <Upload className="w-3.5 h-3.5" /> Browse CSV File
            </span>
          </label>
        </div>

        {/* Or Paste CSV Data */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase">
              Or Paste CSV Data Directly:
            </label>
            <button
              type="button"
              onClick={() => setCsvText(sampleCsv)}
              className="text-[11px] font-bold text-brand-600 hover:text-brand-800 underline"
            >
              Paste Sample Template Data
            </button>
          </div>
          <textarea
            rows={7}
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            placeholder="Name,RollNumber,Email,Phone,Department,CGPA,GraduationYear,GitHub..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-xs text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => {
              setCsvText('');
              setImportResult(null);
            }}
          >
            Clear
          </Button>
          <Button
            variant="primary"
            isLoading={isProcessing}
            disabled={!csvText.trim()}
            leftIcon={<Sparkles className="w-4 h-4" />}
            onClick={handleProcessImport}
          >
            Process & Enroll Students
          </Button>
        </div>

        {/* Import Results Box */}
        {importResult && (
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-900 text-sm">Import Processing Summary</h4>
              <div className="flex items-center gap-2">
                <Badge variant="success">✓ {importResult.successCount} Enrolled</Badge>
                {importResult.failureCount > 0 && (
                  <Badge variant="danger">✕ {importResult.failureCount} Failed</Badge>
                )}
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 text-xs space-y-1 font-mono">
                <p className="font-bold">Errors / Warnings:</p>
                {importResult.errors.slice(0, 5).map((err, i) => (
                  <p key={i}>• {err}</p>
                ))}
              </div>
            )}

            {importResult.successCount > 0 && (
              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  variant="primary"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => navigate('/college/students')}
                >
                  Go to Student Directory
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
