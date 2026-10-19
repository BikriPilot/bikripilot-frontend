import type { OrderDTO, OrderListItemDTO } from "@/types/order";

export interface AdminPage<T> {
  items: T[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    totals?: {
      runs?: number;
      inputTokens?: number;
      outputTokens?: number;
      costMicroUsd?: number;
      blocked?: number;
      failed?: number;
    };
  };
}

export interface AdminOverviewDTO {
  shops: {
    total: number;
    active: number;
    suspended: number;
    newLast7Days: number;
    newLast30Days: number;
  };
  users: { total: number; newLast7Days: number };
  plans: { planKey: string; nameEn: string; shopCount: number }[];
  revenue: { thisMonthPaisa: number; lastMonthPaisa: number; mrrPaisa: number };
  pendingManualPayments: number;
  paymentsNeedingRefund: number;
  activity: {
    ordersToday: number;
    messagesToday: number;
    aiRunsToday: number;
    visitorsToday: number;
  };
  orders: {
    total: number;
    thisMonth: number;
    deliveredThisMonth: number;
    gmvThisMonthPaisa: number;
  };
  ai: { costThisMonthMicroUsd: number; runsThisMonth: number };
  system: {
    failedWebhooks24h: number;
    failedJobs24h: number;
    freeLaunchMode: boolean;
    maintenanceMode: boolean;
    appVersion: string | null;
    integrations: Record<string, boolean>;
  };
  signupsByDay: { date: string; count: number }[];
}

export interface AdminShopListItemDTO {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "SUSPENDED";
  owner: { id: string; name: string; email: string };
  plan: { id: string; key: string; nameEn: string; nameBn: string | null };
  subscriptionStatus: string;
  currentPeriodEnd: string | null;
  channelsCount: number;
  ordersThisMonth: number;
  aiRepliesThisMonth: number;
  lastActiveAt: string | null;
  createdAt: string;
}

export interface AdminShopDetailDTO extends AdminShopListItemDTO {
  businessCategory: string | null;
  websiteUrl: string | null;
  facebookPageUrl: string | null;
  district: string | null;
  phone: string | null;
  suspendedReason: string | null;
  subscription: Record<string, unknown>;
  entitlements: Record<string, unknown>;
  members: { userId: string; name: string; email: string; role: string }[];
  channels: { id: string; name: string; status: string; type: string }[];
  couriers: { id: string; provider: string; name: string; isActive: boolean }[];
  stats: {
    products: number;
    customers: number;
    ordersTotal: number;
    conversations: number;
  };
  recentPayments: AdminPaymentDTO[];
}

export interface AdminOverrideDTO {
  featureKey: string;
  enabled: boolean | null;
  limit: number | null;
  unlimited: boolean | null;
  reason: string;
  expiresAt: string | null;
  createdById: string;
  updatedAt: string;
}

export interface AdminUserDTO {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: "ACTIVE" | "SUSPENDED";
  suspendedReason: string | null;
  platformRole: "USER" | "SUPPORT" | "SUPER_ADMIN";
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lockedUntil: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  memberships: { shopId: string; shopName: string; role: string }[];
}

export interface AdminPlanDTO {
  id: string;
  key: string;
  nameEn: string;
  nameBn: string | null;
  descriptionEn: string | null;
  descriptionBn: string | null;
  priceMonthlyPaisa: number;
  priceYearlyPaisa: number;
  trialDays: number;
  isPublic: boolean;
  isDefault: boolean;
  isArchived: boolean;
  isHighlighted: boolean;
  sortOrder: number;
  isLaunchPlan: boolean;
  subscriberCount: number;
  features: {
    featureKey: string;
    enabled: boolean;
    limit: number | null;
    unlimited: boolean;
  }[];
}

export interface AdminFeatureDTO {
  key: string;
  type: "BOOLEAN" | "LIMIT";
  resetPeriod: "NONE" | "MONTHLY";
  group: string;
  nameEn: string;
  nameBn: string | null;
  descriptionEn: string | null;
  descriptionBn: string | null;
  globalEnabled: boolean;
  sortOrder: number;
  inCode: boolean;
}

export interface AdminSettingDTO {
  key: string;
  group:
    | "platform"
    | "billing"
    | "ai"
    | "integrations"
    | "sms"
    | "landing"
    | "security"
    | "analytics";
  labelEn: string;
  descriptionEn: string | null;
  input: "boolean" | "text" | "textarea" | "number" | "select" | "json" | "url";
  options: { value: string; label: string }[] | null;
  value: unknown;
  defaultValue: unknown;
  isPublic: boolean;
  updatedAt: string | null;
}

export interface AdminPaymentDTO {
  id: string;
  provider: string;
  status: string;
  amountPaisa: number;
  providerTxnId: string | null;
  manualMethod: "BKASH" | "NAGAD" | null;
  senderNumber: string | null;
  rejectReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  lastCheckedAt: string | null;
  shop: { id: string; name: string };
  invoice: {
    id: string;
    number: string;
    kind: string;
    totalPaisa: number;
    planKey: string;
    billingCycle: string;
  };
  riskFlag: boolean;
  needsRefund: boolean;
  checkAttempts: number;
}

export interface AdminInvoiceDTO {
  id: string;
  number: string;
  kind: string;
  plan: { id: string; key: string; nameEn: string; nameBn: string | null };
  billingCycle: string;
  subtotalPaisa: number;
  discountPaisa: number;
  creditPaisa: number;
  totalPaisa: number;
  couponCode: string | null;
  status: string;
  periodStart: string;
  periodEnd: string;
  dueAt: string | null;
  paidAt: string | null;
  createdAt: string;
  payments: unknown[];
  shopName: string;
}

export interface CouponDTO {
  id: string;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  maxRedemptions: number | null;
  redeemedCount: number;
  validFrom: string | null;
  validUntil: string | null;
  planKeys: string[];
  billingCycles: string[];
  isActive: boolean;
  createdAt: string;
}

export interface AdminAnnouncementDTO {
  id: string;
  titleEn: string;
  titleBn: string | null;
  bodyEn: string;
  bodyBn: string | null;
  variant: string;
  linkUrl: string | null;
  linkLabelEn: string | null;
  linkLabelBn: string | null;
  isDismissible: boolean;
  startsAt: string;
  endsAt: string | null;
  audience: string;
  planKey: string | null;
  shopId: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AdminContentDTO {
  id: string;
  type: "FAQ" | "TESTIMONIAL";
  titleEn: string;
  titleBn: string | null;
  bodyEn: string;
  bodyBn: string | null;
  authorName: string | null;
  authorRole: string | null;
  avatarUrl: string | null;
  rating: number | null;
  sortOrder: number;
}

export interface AdminOrderListItemDTO extends OrderListItemDTO {
  shop: { id: string; name: string };
}

export interface AdminOrderDTO extends OrderDTO {
  shop: { id: string; name: string; slug: string };
}

export interface VisitorSummaryDTO {
  from: string;
  to: string;
  pageViews: number;
  uniqueVisitors: number;
  uniqueIps: number;
  signups: number;
  byDay: { date: string; pageViews: number; uniqueVisitors: number }[];
  topPages: { path: string; views: number }[];
  topReferrers: { referrer: string; views: number }[];
  topCampaigns: {
    utmSource: string;
    utmCampaign: string | null;
    views: number;
  }[];
  devices: { device: "mobile" | "tablet" | "desktop"; views: number }[];
  countries: { country: string; views: number }[];
}

export interface VisitorIpRowDTO {
  ip: string;
  visits: number;
  uniquePaths: number;
  firstSeenAt: string;
  lastSeenAt: string;
  device: string | null;
  country: string | null;
  isLoggedInUser: boolean;
}

export interface PageViewDTO {
  id: string;
  path: string;
  referrer: string | null;
  ip: string;
  device: string;
  browser: string | null;
  os: string | null;
  country: string | null;
  userId: string | null;
  createdAt: string;
}

export interface AuditLogDTO {
  id: string;
  shopId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  actor: { id: string; name: string; email: string } | null;
  impersonator: { id: string; name: string } | null;
  before: unknown;
  after: unknown;
  ip: string | null;
  createdAt: string;
}

export interface WebhookEventDTO {
  id: string;
  source: string;
  externalId: string;
  shopId: string | null;
  eventType: string;
  status: string;
  attempts: number;
  error: string | null;
  receivedAt: string;
  processedAt: string | null;
  payload?: unknown;
}

export interface JobQueueStatsDTO {
  queue: string;
  created: number;
  active: number;
  completed: number;
  failed: number;
  retry: number;
}

export interface AdminUsageRowDTO {
  shopId: string;
  shopName: string;
  planKey: string;
  featureKey: string;
  period: string;
  used: number;
  limit: number | null;
  unlimited: boolean;
}

export interface AdminAiUsageRowDTO {
  shopId: string;
  shopName: string;
  runs: number;
  inputTokens: number;
  outputTokens: number;
  costMicroUsd: number;
  blocked: number;
  failed: number;
}

export interface SupportEmailAttachment {
  url: string;
  publicId?: string;
  name: string;
  size: number;
  type: "image" | "video";
}

export type SupportTicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface AdminSupportEmailDTO {
  id: string;
  ticketNumber: string;
  name: string;
  email: string;
  phone: string;
  topic: string;
  message: string;
  attachments?: SupportEmailAttachment[] | null;
  status: SupportTicketStatus;
  adminNote?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  createdAt: string;
  updatedAt: string;
}
