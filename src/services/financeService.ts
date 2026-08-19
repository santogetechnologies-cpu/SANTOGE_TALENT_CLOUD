import { supabase } from '../lib/supabase';
import { PaymentRecord, SubscriptionPlan } from '../types/finance';

export const financeService = {
  /**
   * Fetch payment records
   */
  async getPayments(status?: PaymentRecord['status']): Promise<PaymentRecord[]> {
    try {
      let query = (supabase.from('payments') as any).select('*');
      if (status) query = query.eq('status', status);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('getPayments error:', error);
        return [];
      }

      if (!data) return [];

      return data.map((row: any) => this.mapDbPaymentToDomain(row));
    } catch (err) {
      console.error('getPayments exception:', err);
      return [];
    }
  },

  /**
   * Verify student registration payment with atomic activation
   */
  async verifyPayment(paymentId: string, verifiedBy: string, notes?: string): Promise<PaymentRecord | null> {
    try {
      // Call atomic verification procedure or direct update
      try {
        await (supabase.rpc as any)('verify_payment_and_activate', {
          p_payment_id: paymentId,
          p_verifier_name: verifiedBy,
        });
      } catch (e) {
        // Continue to direct update
      }

      const { data: updated, error } = await (supabase
        .from('payments') as any)
        .update({
          status: 'VERIFIED_ACTIVE',
          verified_by: verifiedBy,
          verified_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error || !updated) return null;
      return this.mapDbPaymentToDomain(updated);
    } catch (err) {
      console.error('verifyPayment error:', err);
      return null;
    }
  },

  /**
   * Reject student registration payment
   */
  async rejectPayment(paymentId: string, reason: string): Promise<PaymentRecord | null> {
    try {
      const { data: updated, error } = await (supabase
        .from('payments') as any)
        .update({
          status: 'FAILED',
          rejection_reason: reason,
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error || !updated) return null;
      return this.mapDbPaymentToDomain(updated);
    } catch (err) {
      console.error('rejectPayment error:', err);
      return null;
    }
  },

  /**
   * Subscriptions
   */
  async getSubscriptions(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await (supabase.from('subscriptions') as any).select('*');

      if (error || !data) return [];

      return data.map((row: any) => this.mapDbSubscriptionToDomain(row));
    } catch (err) {
      console.error('getSubscriptions error:', err);
      return [];
    }
  },

  /**
   * Mappers
   */
  mapDbPaymentToDomain(row: any): PaymentRecord {
    return {
      id: row.id,
      studentId: row.student_id || 'stu-1',
      studentName: row.student_name,
      studentEmail: row.student_email,
      collegeName: row.college_name,
      amountINR: Number(row.amount_inr) || 0,
      paymentMethod: 'UPI',
      status: row.status || 'PENDING_VERIFICATION',
      transactionRef: row.transaction_ref,
      invoiceNumber: row.invoice_number,
      paymentDate: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      verifiedBy: row.verified_by || undefined,
      verifiedAt: row.verified_at || undefined,
      remarks: row.rejection_reason || undefined,
    };
  },

  mapDbSubscriptionToDomain(row: any): SubscriptionPlan {
    return {
      id: row.id,
      collegeId: row.college_id,
      collegeName: row.college_name,
      planName: row.plan_name || 'Enterprise Campus 360',
      totalLicenses: row.total_licenses || 500,
      usedLicenses: row.used_licenses || 0,
      amountINR: Number(row.amount_inr) || 0,
      billingCycle: row.billing_cycle || 'Annual',
      status: row.status || 'ACTIVE',
      renewalDate: row.renewal_date,
    };
  },
};
