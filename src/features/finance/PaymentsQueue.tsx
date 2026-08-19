import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { financeService } from '../../services/financeService';
import { PaymentRecord, SubscriptionPlan } from '../../types/finance';
import { DataTable } from '../../components/shared/DataTable';
import { StatCard } from '../../components/shared/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { Card } from '../../components/ui/Card';
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
} from 'lucide-react';
import clsx from 'clsx';

export const PaymentsQueue: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionPlan[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'payments' | 'subscriptions'>('payments');
  const [statusFilter, setStatusFilter] = useState<PaymentRecord['status'] | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [p, s] = await Promise.all([
          financeService.getPayments(statusFilter !== 'ALL' ? statusFilter : undefined),
          financeService.getSubscriptions(),
        ]);
        setPayments(p);
        setSubscriptions(s);
      } catch (err) {
        console.error('Error loading finance records:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [statusFilter]);

  const handleVerify = async (paymentId: string) => {
    const res = await financeService.verifyPayment(
      paymentId,
      user?.name || 'Finance Admin',
      'Transaction verified against bank settlement batch.'
    );
    if (res) {
      setPayments(prev => prev.map(p => (p.id === paymentId ? res : p)));
      setSelectedPayment(null);
    }
  };

  const handleReject = async (paymentId: string) => {
    const res = await financeService.rejectPayment(paymentId, 'Invalid UTR reference number.');
    if (res) {
      setPayments(prev => prev.map(p => (p.id === paymentId ? res : p)));
      setSelectedPayment(null);
    }
  };

  const pendingCount = payments.filter(p => p.status === 'PENDING_VERIFICATION').length;
  const verifiedCount = payments.filter(p => p.status === 'VERIFIED_ACTIVE').length;
  const failedCount = payments.filter(p => p.status === 'FAILED' || p.status === 'REFUNDED').length;

  const totalRevenue =
    payments
      .filter(p => p.status === 'VERIFIED_ACTIVE')
      .reduce((sum, p) => sum + (Number(p.amountINR) || 0), 0) +
    subscriptions
      .filter(s => s.status === 'ACTIVE')
      .reduce((sum, s) => sum + (Number(s.amountINR) || 0), 0);

  const settlementRate =
    payments.length > 0
      ? `${((verifiedCount / payments.length) * 100).toFixed(1)}%`
      : '100.0%';

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
      render: (p: PaymentRecord) => <span className="text-xs text-slate-700">{p.collegeName}</span>,
      sortable: true,
    },
    {
      key: 'amountINR',
      header: 'Amount',
      render: (p: PaymentRecord) => (
        <span className="font-mono font-bold text-slate-900 text-sm">
          ₹{p.amountINR.toLocaleString()}
        </span>
      ),
      sortable: true,
    },
    {
      key: 'transactionRef',
      header: 'Transaction Ref (UTR)',
      render: (p: PaymentRecord) => <span className="font-mono text-xs text-brand-600 font-semibold">{p.transactionRef}</span>,
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
          {p.status === 'PENDING_VERIFICATION' ? (
            <>
              <Button size="xs" variant="success" onClick={() => handleVerify(p.id)}>
                Approve
              </Button>
              <Button size="xs" variant="danger" onClick={() => handleReject(p.id)}>
                Reject
              </Button>
            </>
          ) : (
            <Button size="xs" variant="outline" onClick={() => setSelectedPayment(p)}>
              View Invoice
            </Button>
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
              <DollarSign className="w-3.5 h-3.5" /> Financial Governance
            </span>
            <Badge variant="purple">Finance Administrator</Badge>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Payment Verification & Revenue Operations
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Audit student registration fees, verify UTR settlement references, and manage institutional campus licenses.
          </p>
        </div>

        <Badge variant={pendingCount > 0 ? 'warning' : 'success'} size="md">
          {pendingCount} Verification(s) Pending
        </Badge>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Ingested Revenue"
          value={isLoading ? '...' : `₹${totalRevenue.toLocaleString()}`}
          subtitle="Verified Student & Campus Fees"
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Pending Verifications"
          value={isLoading ? '...' : pendingCount.toString()}
          subtitle="Awaiting Bank Match"
          icon={<AlertCircle className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Active Subscriptions"
          value={isLoading ? '...' : subscriptions.length.toString()}
          subtitle="Enterprise Campus Licenses"
          icon={<Building className="w-5 h-5" />}
          iconBgColor="bg-brand-50 text-brand-600"
        />
        <StatCard
          title="Settlement Rate"
          value={isLoading ? '...' : settlementRate}
          subtitle={`${failedCount} Disputed Transaction(s)`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Tabs */}
      <Tabs
        variant="pills"
        activeTab={activeTab}
        onChange={tabId => setActiveTab(tabId as any)}
        tabs={[
          { id: 'payments', label: 'Student Payment Queue', icon: <DollarSign className="w-4 h-4" /> },
          { id: 'subscriptions', label: 'College Institutional Plans', icon: <Building className="w-4 h-4" /> },
        ]}
      />

      {activeTab === 'payments' && (
        <DataTable
          columns={paymentColumns}
          data={payments}
          searchPlaceholder="Search by student name, email, or UTR number..."
        />
      )}

      {activeTab === 'subscriptions' && (
        subscriptions.length === 0 ? (
          <Card className="p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">No Active Subscriptions Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Institutional subscription agreements and campus license tiers will appear here once configured for partner colleges.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {subscriptions.map(sub => (
              <div key={sub.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-soft space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{sub.collegeName}</h3>
                    <span className="text-xs text-brand-600 font-semibold">{sub.planName}</span>
                  </div>
                  <Badge variant="success" size="sm">{sub.status}</Badge>
                </div>

                <div className="space-y-2 text-xs text-slate-600 font-mono">
                  <div className="flex justify-between">
                    <span>License Capacity:</span>
                    <span className="font-bold text-slate-900">{sub.usedLicenses} / {sub.totalLicenses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Billing Amount:</span>
                    <span className="font-bold text-emerald-600">₹{sub.amountINR.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Renewal Date:</span>
                    <span className="text-slate-800">{sub.renewalDate}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">{sub.billingCycle} Cycle</span>
                  <Button size="xs" variant="outline">
                    View Agreement
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Invoice Modal */}
      {selectedPayment && (
        <Modal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          title={`Official Invoice: ${selectedPayment.invoiceNumber}`}
          description={`Payment Record #${selectedPayment.id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-900">{selectedPayment.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">College:</span>
                <span className="font-bold text-slate-900">{selectedPayment.collegeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Paid:</span>
                <span className="font-mono font-bold text-emerald-600">₹{selectedPayment.amountINR.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Ref (UTR):</span>
                <span className="font-mono text-slate-900">{selectedPayment.transactionRef}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedPayment(null)}>Close</Button>
              <Button variant="primary" leftIcon={<Download className="w-4 h-4" />}>Download PDF Invoice</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
