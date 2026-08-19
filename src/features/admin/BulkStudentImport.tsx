import React, { useState } from 'react';
import { studentService } from '../../services/studentService';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  Key,
  Users,
  Building,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import clsx from 'clsx';

const SAMPLE_CSV_ROWS = [
  { name: 'Siddharth Rao', email: 'siddharth.r@apextech.edu', phone: '+91 98401 22334', rollNumber: 'AIT2022CSE101', college: 'Apex Institute of Technology', dept: 'Computer Science & Engineering', batch: 'AI & Full Stack Batch Alpha', course: 'Python & AI' },
  { name: 'Pooja Bhatt', email: 'pooja.b@apextech.edu', phone: '+91 98402 33445', rollNumber: 'AIT2022CSE102', college: 'Apex Institute of Technology', dept: 'Computer Science & Engineering', batch: 'AI & Full Stack Batch Alpha', course: 'Python & AI' },
  { name: 'Aditya Kulkarni', email: 'aditya.k@apextech.edu', phone: '+91 98403 44556', rollNumber: 'AIT2022ECE103', college: 'Apex Institute of Technology', dept: 'Electronics & Communication', batch: 'Full Stack & Cloud Systems', course: 'Full Stack Web' },
  { name: 'Meera Nambisan', email: 'meera.n@apextech.edu', phone: '+91 98404 55667', rollNumber: 'AIT2022CSE104', college: 'Apex Institute of Technology', dept: 'Computer Science & Engineering', batch: 'AI & Full Stack Batch Alpha', course: 'Python & AI' },
];

export const BulkStudentImport: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedCredentials, setImportedCredentials] = useState<any[]>([]);

  const handleUploadFile = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(2); // Preview & Validate
    }, 600);
  };

  const handleConfirmImport = async () => {
    setIsProcessing(true);
    const result = await studentService.bulkImportStudents(
      SAMPLE_CSV_ROWS.map(r => ({
        name: r.name,
        email: r.email,
        phone: r.phone,
        rollNumber: r.rollNumber,
      }))
    );
    const creds = result.imported.map(st => ({
      name: st.name,
      email: st.email,
      username: st.email.split('@')[0],
      tempPassword: `Santoge@${Math.floor(1000 + Math.random() * 9000)}`,
      college: st.collegeName,
      batch: st.batchName,
      status: 'Active (First Login Pending)',
    }));
    setImportedCredentials(creds);
    setIsProcessing(false);
    setStep(3); // Generated Credentials
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5 mb-1">
            <Users className="w-3.5 h-3.5" /> Platform Onboarding Engine
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Bulk Student Import & Credential Generator
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Automated multi-step ingestion with schema validation, college scoping, and temporary credentials provisioning.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={() => alert('Downloaded sample CSV template.')}
        >
          Download CSV Template
        </Button>
      </div>

      {/* Stepper Wizard Indicator */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-soft">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { num: 1, label: '1. Upload CSV / Excel' },
            { num: 2, label: '2. Schema & Validation' },
            { num: 3, label: '3. Provision Accounts' },
            { num: 4, label: '4. Download Credentials' },
          ].map(s => {
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div
                key={s.num}
                className={clsx(
                  'p-2.5 rounded-xl border transition-all font-semibold',
                  isCurrent
                    ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold shadow-soft-sm'
                    : isDone
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                )}
              >
                {s.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Upload File */}
      {step === 1 && (
        <Card className="p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto shadow-soft">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Upload Student Ingestion File</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Drag & drop your formatted .csv or .xlsx manifest containing student names, emails, colleges, and departments.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleUploadFile}
            isLoading={isProcessing}
            leftIcon={<FileSpreadsheet className="w-5 h-5" />}
          >
            Select File (Simulate "students_batch2026.csv")
          </Button>
        </Card>
      )}

      {/* Step 2: Validate & Preview */}
      {step === 2 && (
        <Card className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Validation Passed: 4 Valid Records Detected</h3>
              <p className="text-xs text-slate-500">0 duplicate emails • 0 schema errors • All department mappings matched</p>
            </div>
            <Badge variant="success">Validation 100% Clean</Badge>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">College</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Course Track</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {SAMPLE_CSV_ROWS.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3 font-sans font-bold text-slate-900">{r.name}</td>
                    <td className="p-3 text-brand-600">{r.email}</td>
                    <td className="p-3 text-slate-500">{r.rollNumber}</td>
                    <td className="p-3 font-sans text-slate-800">{r.college}</td>
                    <td className="p-3 font-sans text-slate-800">{r.dept}</td>
                    <td className="p-3 font-sans text-emerald-600 font-semibold">{r.course}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button variant="primary" onClick={handleConfirmImport} isLoading={isProcessing} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Confirm & Generate Credentials
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Generated Credentials & Export */}
      {step === 3 && (
        <Card className="space-y-6">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Ingestion Completed Successfully!</h4>
                <p className="text-xs text-emerald-800">4 student accounts created with temporary credentials.</p>
              </div>
            </div>
            <Button variant="primary" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={() => setStep(4)}>
              Download Credentials Manifest (.CSV)
            </Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Generated Username</th>
                  <th className="p-3">Temporary Password</th>
                  <th className="p-3">College</th>
                  <th className="p-3">Batch Assigned</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                {importedCredentials.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3 font-sans font-bold text-slate-900">{c.name}</td>
                    <td className="p-3 text-brand-600">{c.username}</td>
                    <td className="p-3 text-slate-800 bg-slate-100 font-bold px-2 rounded w-fit">{c.tempPassword}</td>
                    <td className="p-3 font-sans text-slate-800">{c.college}</td>
                    <td className="p-3 font-sans text-slate-800">{c.batch}</td>
                    <td className="p-3 font-sans"><Badge variant="primary" size="sm">{c.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Step 4: Finished */}
      {step === 4 && (
        <Card className="p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Credentials Manifest Downloaded!</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Credentials CSV has been dispatched. Students will be prompted to change their temporary password upon first login.
          </p>
          <Button variant="outline" size="sm" onClick={() => setStep(1)}>
            Import Another Cohort
          </Button>
        </Card>
      )}
    </div>
  );
};
