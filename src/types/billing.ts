import type { PlanSummaryDTO, SubscriptionDTO } from "@/types/entitlement";

export type BillingCycle = "MONTHLY" | "YEARLY";
export type InvoiceKind = "NEW" | "RENEWAL" | "UPGRADE";
export type InvoiceStatus = "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";
export type PaymentProvider = "SSLCOMMERZ" | "BKASH" | "MANUAL";
export type PaymentStatus =
  | "INITIATED"
  | "PENDING_VERIFICATION"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "REJECTED";
export type ManualPaymentMethod = "BKASH" | "NAGAD";

export interface PaymentDTO {
  id: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  amountPaisa: number;
  providerTxnId: string | null;
  manualMethod: ManualPaymentMethod | null;
  senderNumber: string | null;
  rejectReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  lastCheckedAt: string | null;
}

export interface InvoiceDTO {
  id: string;
  number: string;
  kind: InvoiceKind;
  plan: PlanSummaryDTO;
  billingCycle: BillingCycle;
  subtotalPaisa: number;
  discountPaisa: number;
  creditPaisa: number;
  totalPaisa: number;
  couponCode: string | null;
  status: InvoiceStatus;
  periodStart: string;
  periodEnd: string;
  dueAt: string | null;
  paidAt: string | null;
  createdAt: string;
  payments: PaymentDTO[];
}

export interface BillingPreviewDTO {
  kind: InvoiceKind | "DOWNGRADE";
  plan: PlanSummaryDTO;
  billingCycle: BillingCycle;
  subtotalPaisa: number;
  discountPaisa: number;
  creditPaisa: number;
  totalPaisa: number;
  periodStart: string;
  periodEnd: string;
  currentPlan: PlanSummaryDTO | null;
}

export interface ManualInstructionsDTO {
  bkashNumber: string | null;
  nagadNumber: string | null;
  noteEn: string | null;
  noteBn: string | null;
  amountPaisa: number;
  reference: string;
}

export interface CheckoutResultDTO {
  invoice: InvoiceDTO;
  paymentId: string;
  redirectUrl: string | null;
  manualInstructions: ManualInstructionsDTO | null;
}

export interface CouponCheckDTO {
  valid: boolean;
  code: string;
  discountPaisa: number;
  totalPaisa: number;
  reason: string | null;
}

export interface BillingProvidersDTO {
  providers: { provider: PaymentProvider; enabled: boolean }[];
  manual: Omit<ManualInstructionsDTO, "amountPaisa" | "reference"> | null;
}

export interface BillingInvoicePage {
  items: InvoiceDTO[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BillingSelection {
  planKey: string;
  billingCycle: BillingCycle;
  couponCode?: string;
}

export interface ManualPaymentInput {
  manualMethod: ManualPaymentMethod;
  senderNumber: string;
  transactionId: string;
}

export type { SubscriptionDTO };
