export interface PlanSummaryDTO {
  id: string;
  key: string;
  nameEn: string;
  nameBn: string | null;
}
export interface SubscriptionDTO {
  id: string;
  status: string;
  billingCycle: "MONTHLY" | "YEARLY";
  source: string;
  plan: PlanSummaryDTO;
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  graceEndsAt: string | null;
  cancelAtPeriodEnd: boolean;
  pendingPlan: PlanSummaryDTO | null;
  pendingBillingCycle: "MONTHLY" | "YEARLY" | null;
  autoRenew: boolean;
  openRenewalInvoiceId: string | null;
}
export interface FeatureEntitlementDTO {
  key: string;
  type: "BOOLEAN" | "LIMIT";
  resetPeriod: "NONE" | "MONTHLY";
  enabled: boolean;
  unlimited: boolean;
  limit: number | null;
  used: number | null;
  source: string;
}
export interface EntitlementsDTO {
  planKey: string;
  planNameEn: string;
  planNameBn: string | null;
  isLaunchMode: boolean;
  period: string;
  subscription: SubscriptionDTO;
  features: Record<string, FeatureEntitlementDTO>;
}
