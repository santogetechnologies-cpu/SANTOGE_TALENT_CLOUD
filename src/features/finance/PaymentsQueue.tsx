import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { financeService } from '../../services/financeService';
import { PaymentRecord, SubscriptionPlan, InvoiceRecord } from '../../types/finance';
import { DataTable } from '../../components/shared/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import {
  DollarSign,
  CheckCircle2,
  XCircle,
  Building,
  FileCheck2,
  Sparkles,
  Download,
  AlertCircle,
  CreditCard,
  RefreshCw,
  Printer,
  RotateCcw,
  Clock,
  FileText,
  TrendingUp,
  ShieldAlert,
  Search,
  Filter,
  Layers,
  ArrowUpRight,
  Receipt,
  UserCheck,
  Plus,
} from 'lucide-react';

interface PaymentsQueueProps {
  initialTab?: 'payments' | 'pending' | 'failed' | 'refunds' | 'subscriptions' | 'invoices' | 'reports';
}

export const PaymentsQueue: React.FC<PaymentsQueueProps> = ({ initialTab = 'payments' }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionPlan[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'payments' | 'pending' | 'failed' | 'refunds' | 'subscriptions' | 'invoices' | 'reports'>(initialTab);
  const [statusFilter, setStatusFilter] = useState<PaymentRecord['status'] | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Record New Payment Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newCollegeName, setNewCollegeName] = useState('Ponjesly College of Engineering');
  const [newAmount, setNewAmount] = useState('15000');
  const [newPaymentMethod, setNewPaymentMethod] = useState('UPI');
  const [newTransactionRef, setNewTransactionRef] = useState('');
  const [newInvoiceNumber, setNewInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [newStatus, setNewStatus] = useState<'PENDING_VERIFICATION' | 'VERIFIED_ACTIVE'>('PENDING_VERIFICATION');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  // Verification & Reject Modal
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Refund Modal State
  const [refundPayment, setRefundPayment] = useState<PaymentRecord | null>(null);
  const [refundAmount, setRefundAmount] = useState('15000');
  const [refundReason, setRefundReason] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);

  // Invoice Inspection Modal
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);

  // Sync activeTab with URL route seamlessly
  useEffect(() => {
    const p = location.pathname;
    if (p.includes('/finance/pending')) {
      setActiveTab('pending');
    } else if (p.includes('/finance/failed')) {
      setActiveTab('failed');
    } else if (p.includes('/finance/refunds')) {
      setActiveTab('refunds');
    } else if (p.includes('/finance/subscriptions')) {
      setActiveTab('subscriptions');
    } else if (p.includes('/finance/invoices')) {
      setActiveTab('invoices');
    } else if (p.includes('/finance/reports')) {
      setActiveTab('reports');
    } else if (p.includes('/finance/payments') || p === '/finance' || p === '/finance/') {
      setActiveTab('payments');
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [location.pathname, initialTab]);

  const handleTabSelect = (tab: typeof activeTab) => {
    setActiveTab(tab);
    navigate(`/finance/${tab === 'payments' ? 'payments' : tab}`);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [p, s, inv] = await Promise.all([
        financeService.getPayments(statusFilter !== 'ALL' ? statusFilter : undefined),
        financeService.getSubscriptions(),
        financeService.getInvoices(),
      ]);
      setPayments(p);
      setSubscriptions(s);
      setInvoices(inv);
    } catch (err) {
      console.error('Error loading finance records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  // Realtime backend sync
  useEffect(() => {
    const channel = supabase
      .channel('finance-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRecordingPayment(true);
    try {
      await financeService.recordPayment({
        studentName: newStudentName,
        studentEmail: newStudentEmail,
        collegeName: newCollegeName,
        amountINR: parseFloat(newAmount) || 15000,
        paymentMethod: newPaymentMethod,
        transactionRef: newTransactionRef || `UPI_${Date.now()}`,
        invoiceNumber: newInvoiceNumber,
        status: newStatus,
      });

      setIsRecordModalOpen(false);
      setNewStudentName('');
      setNewStudentEmail('');
      setNewTransactionRef('');
      setNewInvoiceNumber(`INV-${Date.now().toString().slice(-6)}`);
      loadData();
    } catch (err) {
      console.error('Error recording payment:', err);
    } finally {
      setIsRecordingPayment(false);
    }
  };

  const handleVerify = async (paymentId: string) => {
    const res = await financeService.verifyPayment(
      paymentId,
      user?.name || 'Finance Admin',
      'Transaction verified against bank settlement batch.'
    );
    if (res) {
      setPayments(prev => prev.map(p => (p.id === paymentId ? res : p)));
      setSelectedPayment(null);
      loadData();
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    const res = await financeService.rejectPayment(selectedPayment.id, rejectReason || 'Invalid payment reference.');
    if (res) {
      setPayments(prev => prev.map(p => (p.id === selectedPayment.id ? res : p)));
      setSelectedPayment(null);
      setIsRejectModalOpen(false);
      setRejectReason('');
      loadData();
    }
  };

  const handleIssueRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundPayment) return;
    setIsRefunding(true);
    try {
      const res = await financeService.issueRefund(
        refundPayment.id,
        parseFloat(refundAmount) || refundPayment.amountINR,
        refundReason || 'Refund processed upon authorized request.'
      );
      if (res) {
        setPayments(prev => prev.map(p => (p.id === refundPayment.id ? res : p)));
      }
      setRefundPayment(null);
      setRefundReason('');
      loadData();
    } catch (err) {
      console.error('Refund error:', err);
    } finally {
      setIsRefunding(false);
    }
  };

  const handleApproveSubscription = async (subId: string) => {
    const ok = await financeService.approveSubscription(subId);
    if (ok) {
      setSubscriptions(prev =>
        prev.map(s => (s.id === subId ? { ...s, status: 'ACTIVE' } : s))
      );
      loadData();
    }
  };

  const handleExportCSV = () => {
    const headers = ['Transaction Ref', 'Student Name', 'Email', 'College', 'Amount (INR)', 'Method', 'Status', 'Date', 'Invoice'];
    const rows = payments.map(p => [
      `"${p.transactionRef}"`,
      `"${p.studentName}"`,
      `"${p.studentEmail}"`,
      `"${p.collegeName}"`,
      p.amountINR,
      `"${p.paymentMethod}"`,
      p.status,
      p.paymentDate,
      `"${p.invoiceNumber}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SantoGe_Finance_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metric Calculations
  const pendingPayments = payments.filter(p => p.status === 'PENDING_VERIFICATION');
  const verifiedPayments = payments.filter(p => p.status === 'VERIFIED_ACTIVE');
  const failedPayments = payments.filter(p => p.status === 'FAILED');
  const refundedPayments = payments.filter(p => p.status === 'REFUNDED');

  const totalCollectedRevenue = verifiedPayments.reduce((sum, p) => sum + (Number(p.amountINR) || 0), 0);
  const totalSubscriptionRevenue = subscriptions.filter(s => s.status === 'ACTIVE').reduce((sum, s) => sum + (Number(s.amountINR) || 0), 0);
  const grandTotalRevenue = totalCollectedRevenue + totalSubscriptionRevenue;
  const totalRefundedAmount = refundedPayments.reduce((sum, p) => sum + (Number(p.refundAmountINR || p.amountINR) || 0), 0);

  const settlementRate = payments.length > 0
    ? `${((verifiedPayments.length / payments.length) * 100).toFixed(1)}%`
    : '100.0%';

  const filteredPayments = payments.filter(p => {
    const q = searchQuery.toLowerCase();
    return (
      p.studentName.toLowerCase().includes(q) ||
      p.studentEmail.toLowerCase().includes(q) ||
      p.transactionRef.toLowerCase().includes(q) ||
      p.collegeName.toLowerCase().includes(q) ||
      p.invoiceNumber.toLowerCase().includes(q)
    );
  });

  const paymentColumns = [
    {
      key: 'studentName',
      header: 'Student & Email',
      render: (p: PaymentRecord) => (
        <div>
          <p className="font-bold text-slate-900">{p.studentName}</p>
          <p className="text-[11px] text-slate-500 font-mono">{p.studentEmail}</p>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'collegeName',
      header: 'College',
      render: (p: PaymentRecord) => <span className="text-xs text-slate-700 font-medium">{p.collegeName}</span>,
      sortable: true,
    },
    {
      key: 'amountINR',
      header: 'Fee Amount',
      render: (p: PaymentRecord) => (
        <span className="font-mono font-bold text-slate-900 text-sm">
          ₹{p.amountINR.toLocaleString()}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (p: PaymentRecord) => (
        <span className="px-2 py-0.5 rounded-lg bg-slate-100 font-mono text-[11px] text-slate-700">
          {p.paymentMethod}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'transactionRef',
      header: 'Transaction Ref (UTR)',
      render: (p: PaymentRecord) => (
        <span className="font-mono text-xs text-brand-600 font-semibold">{p.transactionRef}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (p: PaymentRecord) => (
        <Badge
          variant={
            p.status === 'VERIFIED_ACTIVE'
              ? 'success'
              : p.status === 'PENDING_VERIFICATION'
              ? 'warning'
              : p.status === 'REFUNDED'
              ? 'outline'
              : 'danger'
          }
          size="sm"
        >
          {p.status.replace('_', ' ')}
        </Badge>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (p: PaymentRecord) => (
        <div className="flex gap-2">
          {p.status === 'PENDING_VERIFICATION' && (
            <>
              <Button size="xs" variant="success" onClick={() => handleVerify(p.id)}>
                Approve
              </Button>
              <Button
                size="xs"
                variant="danger"
                onClick={() => {
                  setSelectedPayment(p);
                  setIsRejectModalOpen(true);
                }}
              >
                Reject
              </Button>
            </>
          )}
          {p.status === 'VERIFIED_ACTIVE' && (
            <Button
              size="xs"
              variant="outline"
              leftIcon={<RotateCcw className="w-3 h-3 text-amber-600" />}
              onClick={() => {
                setRefundPayment(p);
                setRefundAmount(p.amountINR.toString());
              }}
            >
              Refund
            </Button>
          )}
          {p.status === 'FAILED' && (
            <span className="text-[11px] text-rose-600 font-mono">{p.remarks || 'Gateway Failed'}</span>
          )}
          {p.status === 'REFUNDED' && (
            <span className="text-[11px] text-slate-500 font-mono">Refunded</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Finance & Revenue Management
            </span>
            <Badge variant="primary">Finance Admin</Badge>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Realtime Gateway Sync
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Payment Verification, Subscriptions & Invoicing Center
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Verify student fee transactions, activate college subscriptions, handle refunds, and manage GST tax invoices strictly via PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={loadData}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsRecordModalOpen(true)}
          >
            Record Payment
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCSV}
          >
            Export Manifest
          </Button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Revenue</span>
          <span className="text-2xl font-black text-slate-900 font-mono">₹{(grandTotalRevenue / 100000).toFixed(2)}L</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Pending Verification</span>
          <span className="text-2xl font-black text-amber-600 font-mono">{pendingPayments.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Verified Active</span>
          <span className="text-2xl font-black text-emerald-600 font-mono">{verifiedPayments.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Active Subscriptions</span>
          <span className="text-2xl font-black text-brand-600 font-mono">{subscriptions.filter(s => s.status === 'ACTIVE').length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Failed Payments</span>
          <span className="text-2xl font-black text-rose-600 font-mono">{failedPayments.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-soft">
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Settlement Rate</span>
          <span className="text-2xl font-black text-purple-600 font-mono">{settlementRate}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs overflow-x-auto">
        {[
          { id: 'payments' as const, label: `All Transactions (${payments.length})`, icon: <CreditCard className="w-3.5 h-3.5" /> },
          { id: 'pending' as const, label: `Pending Verification (${pendingPayments.length})`, icon: <Clock className="w-3.5 h-3.5" /> },
          { id: 'failed' as const, label: `Failed Payments (${failedPayments.length})`, icon: <XCircle className="w-3.5 h-3.5" /> },
          { id: 'refunds' as const, label: `Refunds (${refundedPayments.length})`, icon: <RotateCcw className="w-3.5 h-3.5" /> },
          { id: 'subscriptions' as const, label: `College Subscriptions (${subscriptions.length})`, icon: <Building className="w-3.5 h-3.5" /> },
          { id: 'invoices' as const, label: `Invoices & GST (${invoices.length})`, icon: <Receipt className="w-3.5 h-3.5" /> },
          { id: 'reports' as const, label: 'Revenue Reports', icon: <FileText className="w-3.5 h-3.5" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabSelect(tab.id)}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-soft-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. All Transactions Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {payments.length > 0 ? (
            <DataTable
              columns={paymentColumns}
              data={filteredPayments}
              searchPlaceholder="Search transactions by student name, UTR reference, or college..."
            />
          ) : (
            <div className="p-8 rounded-2xl border-2 border-dashed border-slate-200 bg-white text-center space-y-3">
              <CreditCard className="w-10 h-10 text-slate-400 mx-auto" />
              <div>
                <h3 className="font-bold text-slate-800 text-sm">No Payment Transactions Recorded in Database</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Transactions initiated by students or college fee collections will appear here in real time.
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsRecordModalOpen(true)}
              >
                + Record Transaction
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 2. Pending Verification Queue Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <span>Pending Settlement Queue: Match student UTR reference against bank credit statements.</span>
            </div>
            <Badge variant="warning">{pendingPayments.length} Payments Awaiting Verification</Badge>
          </div>

          <DataTable
            columns={paymentColumns}
            data={pendingPayments}
            searchPlaceholder="Filter pending transactions..."
          />
        </div>
      )}

      {/* 3. Failed Payments Tab */}
      {activeTab === 'failed' && (
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Failed & Dropped Transactions: Gateway timeouts, insufficient balance, or UTR mismatch.</span>
            </div>
            <Badge variant="danger">{failedPayments.length} Failed Records</Badge>
          </div>

          <DataTable
            columns={paymentColumns}
            data={failedPayments}
            searchPlaceholder="Filter failed payments..."
          />
        </div>
      )}

      {/* 4. Refunds Tab */}
      {activeTab === 'refunds' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <RotateCcw className="w-5 h-5 text-blue-600 shrink-0" />
              <span>Refund Settlement Log: Total ₹{totalRefundedAmount.toLocaleString()} refunded across {refundedPayments.length} transactions.</span>
            </div>
            <Badge variant="primary">{refundedPayments.length} Refunds Logged</Badge>
          </div>

          <DataTable
            columns={paymentColumns}
            data={refundedPayments}
            searchPlaceholder="Filter refund records..."
          />
        </div>
      )}

      {/* 5. College Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions.map(sub => (
            <div key={sub.id} className="p-6 bg-white rounded-2xl border border-slate-200 shadow-soft space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{sub.collegeName}</h3>
                    <p className="text-xs text-brand-600 font-semibold">{sub.planName}</p>
                  </div>
                  <Badge variant={sub.status === 'ACTIVE' ? 'success' : 'warning'} size="sm">
                    {sub.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Plan Value:</span>
                    <span className="font-bold text-slate-900">₹{sub.amountINR.toLocaleString()} / {sub.billingCycle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Student Seats:</span>
                    <span className="font-bold text-slate-900">{sub.usedLicenses} / {sub.totalLicenses} Used</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Renewal Date:</span>
                    <span className="font-bold text-brand-600">{sub.renewalDate}</span>
                  </div>
                </div>
              </div>

              {sub.status === 'PAYMENT_PENDING' ? (
                <Button
                  size="sm"
                  variant="success"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => handleApproveSubscription(sub.id)}
                >
                  Approve Subscription
                </Button>
              ) : (
                <div className="p-2 bg-emerald-50 text-emerald-800 text-center rounded-xl text-[11px] font-bold">
                  ✓ Enterprise License Active
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 6. Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-soft">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Invoice Number</th>
                  <th className="p-3.5">Billed Entity</th>
                  <th className="p-3.5 text-right">Base Amount</th>
                  <th className="p-3.5 text-right">GST (18%)</th>
                  <th className="p-3.5 text-right">Total Invoice</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50 font-sans">
                    <td className="p-3.5 font-bold text-brand-600 font-mono">{inv.invoiceNumber}</td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{inv.billedTo}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{inv.billingEmail}</p>
                    </td>
                    <td className="p-3.5 font-mono text-right text-slate-700">₹{inv.amountINR.toLocaleString()}</td>
                    <td className="p-3.5 font-mono text-right text-slate-500">₹{inv.gstINR.toLocaleString()}</td>
                    <td className="p-3.5 font-mono text-right font-black text-slate-900">₹{inv.totalAmountINR.toLocaleString()}</td>
                    <td className="p-3.5 text-center">
                      <Badge variant={inv.status === 'PAID' ? 'success' : inv.status === 'CANCELLED' ? 'danger' : 'warning'} size="sm">
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <Button size="xs" variant="outline" onClick={() => setSelectedInvoice(inv)}>
                        View Tax Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Revenue Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-soft space-y-6">
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 block">
                SantoGe Talent Cloud Finance
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Institutional Financial & Revenue Settlement Report
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Settlement Cycle: <strong>August 2026</strong> • Generated by Finance Admin: <strong>{user?.name || user?.email}</strong>
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Printer className="w-4 h-4" />}
              onClick={() => window.print()}
            >
              Print Revenue PDF
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl font-mono text-center text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block">Verified Fee Volume</span>
              <span className="font-bold text-emerald-600 text-lg">₹{(totalCollectedRevenue / 100000).toFixed(2)}L</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Enterprise Contracts</span>
              <span className="font-bold text-brand-600 text-lg">₹{(totalSubscriptionRevenue / 100000).toFixed(2)}L</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Pending UTR Queue</span>
              <span className="font-bold text-amber-600 text-lg">{pendingPayments.length}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Settlement Health</span>
              <span className="font-bold text-purple-600 text-lg">{settlementRate}</span>
            </div>
          </div>
        </div>
      )}

      {/* 1. Record New Payment Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Payment / Transaction Entry"
        description="Insert an official transaction record directly into PostgreSQL."
      >
        <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 text-xs">
          <Input
            label="Student Full Name"
            value={newStudentName}
            onChange={e => setNewStudentName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Student Email Address"
              type="email"
              value={newStudentEmail}
              onChange={e => setNewStudentEmail(e.target.value)}
              placeholder="rahul@ponjesly.edu"
              required
            />
            <Input
              label="Partner College"
              value={newCollegeName}
              onChange={e => setNewCollegeName(e.target.value)}
              placeholder="Ponjesly College of Engineering"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Fee Amount (INR)"
              type="number"
              value={newAmount}
              onChange={e => setNewAmount(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Payment Channel
              </label>
              <select
                value={newPaymentMethod}
                onChange={e => setNewPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Credit Card">Credit / Debit Card</option>
                <option value="Razorpay">Razorpay Gateway</option>
                <option value="College Sponsored">College Sponsored</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Transaction Ref / Bank UTR Number"
              value={newTransactionRef}
              onChange={e => setNewTransactionRef(e.target.value)}
              placeholder="e.g. UPI_984729103829"
              required
            />
            <Input
              label="Invoice Number"
              value={newInvoiceNumber}
              onChange={e => setNewInvoiceNumber(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Initial Status
            </label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="PENDING_VERIFICATION">Pending Verification (Needs UTR Matching)</option>
              <option value="VERIFIED_ACTIVE">Verified & Active (Instant Activation)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={() => setIsRecordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isRecordingPayment} leftIcon={<Plus className="w-4 h-4" />}>
              Save Transaction
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Reject Payment Modal */}
      {isRejectModalOpen && selectedPayment && (
        <Modal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          title="Reject Student Registration Payment"
          description={`Reject transaction ${selectedPayment.transactionRef} for ${selectedPayment.studentName}.`}
        >
          <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Reason for Rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="e.g. UTR reference not found in bank settlement log..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-rose-500 outline-none min-h-[90px]"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" leftIcon={<XCircle className="w-4 h-4" />}>
                Confirm Rejection
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 3. Issue Refund Modal */}
      {refundPayment && (
        <Modal
          isOpen={!!refundPayment}
          onClose={() => setRefundPayment(null)}
          title={`Process Refund: ${refundPayment.studentName}`}
          description={`Transaction Ref: ${refundPayment.transactionRef} • Amount Paid: ₹${refundPayment.amountINR.toLocaleString()}`}
        >
          <form onSubmit={handleIssueRefundSubmit} className="space-y-4 text-xs">
            <Input
              label="Refund Amount (INR)"
              type="number"
              value={refundAmount}
              onChange={e => setRefundAmount(e.target.value)}
              required
            />
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Refund Justification & Settlement Notes
              </label>
              <textarea
                value={refundReason}
                onChange={e => setRefundReason(e.target.value)}
                placeholder="e.g. Candidate withdrew registration or duplicate UPI transaction received."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:ring-2 focus:ring-brand-500 outline-none min-h-[90px]"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setRefundPayment(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isRefunding} leftIcon={<RotateCcw className="w-4 h-4" />}>
                Process & Issue Refund
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* 4. Tax Invoice Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Tax Invoice: ${selectedInvoice.invoiceNumber}`}
          description={`Billed to: ${selectedInvoice.billedTo}`}
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs p-2">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">SantoGe Technologies Pvt Ltd</h3>
                <p className="text-[11px] text-slate-500">GSTIN: 33AAECS1234F1Z5</p>
                <p className="text-[11px] text-slate-500">Bangalore, Karnataka, India</p>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-brand-600 block">{selectedInvoice.invoiceNumber}</span>
                <span className="text-slate-500 text-[11px]">Issue Date: {selectedInvoice.issueDate}</span>
                <span className="text-slate-500 text-[11px] block">Due Date: {selectedInvoice.dueDate}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500">Billed To</span>
              <p className="font-bold text-slate-900 text-xs">{selectedInvoice.billedTo}</p>
              <p className="text-slate-600 font-mono">{selectedInvoice.billingEmail}</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>{selectedInvoice.description}</span>
                <span className="font-bold">₹{selectedInvoice.amountINR.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>Central GST (9%) + State GST (9%)</span>
                <span>₹{selectedInvoice.gstINR.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 font-black text-slate-900 text-sm">
                <span>Total Amount Due / Paid:</span>
                <span className="text-brand-600">₹{selectedInvoice.totalAmountINR.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={() => window.print()}
              >
                Print Official Invoice PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
