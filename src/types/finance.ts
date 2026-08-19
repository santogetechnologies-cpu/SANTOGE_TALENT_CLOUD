export interface PaymentRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  collegeName: string;
  amountINR: number;
  transactionRef: string;
  paymentMethod: 'UPI' | 'Credit Card' | 'Net Banking' | 'College Sponsored';
  status: 'PENDING_VERIFICATION' | 'VERIFIED_ACTIVE' | 'FAILED' | 'REFUNDED';
  invoiceNumber: string;
  paymentDate: string;
  verifiedBy?: string;
  verifiedAt?: string;
  remarks?: string;
}

export interface SubscriptionPlan {
  id: string;
  collegeId: string;
  collegeName: string;
  planName: 'Enterprise Campus 360' | 'Placement Accelerator Pro' | 'Standard LMS';
  totalLicenses: number;
  usedLicenses: number;
  renewalDate: string;
  billingCycle: 'Annual' | 'Bi-Annual';
  amountINR: number;
  status: 'ACTIVE' | 'PAYMENT_PENDING' | 'EXPIRED';
}
