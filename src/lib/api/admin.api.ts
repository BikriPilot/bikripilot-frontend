import { api } from "./client";
import type { ApiEnvelope } from "@/types/api";
import type {
  AdminAiUsageRowDTO,
  AdminAnnouncementDTO,
  AdminContentDTO,
  AdminFeatureDTO,
  AdminInvoiceDTO,
  AdminOrderDTO,
  AdminOrderListItemDTO,
  AdminOverviewDTO,
  AdminPage,
  AdminPaymentDTO,
  AdminPlanDTO,
  AdminSettingDTO,
  AdminShopDetailDTO,
  AdminShopListItemDTO,
  AdminUsageRowDTO,
  AdminUserDTO,
  AuditLogDTO,
  CouponDTO,
  JobQueueStatsDTO,
  PageViewDTO,
  VisitorIpRowDTO,
  VisitorSummaryDTO,
  WebhookEventDTO,
  AdminOverrideDTO,
  AdminSupportEmailDTO,
} from "@/types/admin";

type Query = Record<string, string | number | boolean | undefined>;
const data = async <T>(request: Promise<{ data: ApiEnvelope<T> }>) =>
  (await request).data.data;
const page = async <T>(
  request: Promise<{ data: ApiEnvelope<T[]> }>,
): Promise<AdminPage<T>> => {
  const response = (await request).data;
  return { items: response.data, meta: response.meta as AdminPage<T>["meta"] };
};
const getPage = <T>(path: string, params?: Query) =>
  page<T>(api.get(path, { params }));
const getData = <T>(path: string, params?: Query) =>
  data<T>(api.get(path, { params }));
const send = <T>(
  method: "post" | "patch" | "put" | "delete",
  path: string,
  body?: unknown,
) => {
  if (method === "delete")
    return data<T>(api.delete(path, body ? { data: body } : undefined));
  return data<T>(api[method](path, body));
};

export const adminApi = {
  overview: () => getData<AdminOverviewDTO>("/admin/overview"),
  shops: (params?: Query) =>
    getPage<AdminShopListItemDTO>("/admin/shops", params),
  shop: (id: string) => getData<AdminShopDetailDTO>(`/admin/shops/${id}`),
  setShopStatus: (id: string, body: unknown) =>
    send<AdminShopDetailDTO>("patch", `/admin/shops/${id}/status`, body),
  setShopSubscription: (id: string, body: unknown) =>
    send<unknown>("post", `/admin/shops/${id}/subscription`, body),
  extendShop: (id: string, body: { days: number }) =>
    send<unknown>("post", `/admin/shops/${id}/extend`, body),
  shopOverrides: (id: string) =>
    getData<AdminOverrideDTO[]>(`/admin/shops/${id}/overrides`),
  setOverride: (id: string, featureKey: string, body: unknown) =>
    send<AdminOverrideDTO>(
      "put",
      `/admin/shops/${id}/overrides/${featureKey}`,
      body,
    ),
  removeOverride: (id: string, featureKey: string) =>
    send<null>("delete", `/admin/shops/${id}/overrides/${featureKey}`),
  impersonate: (id: string, body: { reason: string }) =>
    send<{ accessToken: string; expiresAt: string; shopId: string }>(
      "post",
      `/admin/shops/${id}/impersonate`,
      body,
    ),
  resetUsage: (id: string, body: { featureKey: string }) =>
    send<null>("post", `/admin/shops/${id}/reset-usage`, body),
  deleteShop: (id: string, body: { confirmSlug: string }) =>
    send<null>("delete", `/admin/shops/${id}`, body),
  users: (params?: Query) => getPage<AdminUserDTO>("/admin/users", params),
  user: (id: string) => getData<AdminUserDTO>(`/admin/users/${id}`),
  updateUser: (id: string, body: unknown) =>
    send<AdminUserDTO>("patch", `/admin/users/${id}`, body),
  blockUser: (id: string, body: unknown) =>
    send<AdminUserDTO>("post", `/admin/users/${id}/block`, body),
  unblockUser: (id: string, body: unknown) =>
    send<AdminUserDTO>("post", `/admin/users/${id}/unblock`, body),
  revokeSessions: (id: string) =>
    send<null>("post", `/admin/users/${id}/revoke-sessions`),
  reset2fa: (id: string, body: { reason: string }) =>
    send<null>("post", `/admin/users/${id}/reset-2fa`, body),
  unlockUser: (id: string) =>
    send<AdminUserDTO>("post", `/admin/users/${id}/unlock`),
  plans: (params?: Query) => getData<AdminPlanDTO[]>("/admin/plans", params),
  plan: (id: string) => getData<AdminPlanDTO>(`/admin/plans/${id}`),
  createPlan: (body: unknown) =>
    send<AdminPlanDTO>("post", "/admin/plans", body),
  updatePlan: (id: string, body: unknown) =>
    send<AdminPlanDTO>("patch", `/admin/plans/${id}`, body),
  savePlanFeatures: (id: string, body: unknown) =>
    send<AdminPlanDTO>("put", `/admin/plans/${id}/features`, body),
  migratePlan: (body: unknown) =>
    send<{ moved: number }>("post", "/admin/plans/migrate", body),
  features: () => getData<AdminFeatureDTO[]>("/admin/features"),
  updateFeature: (key: string, body: unknown) =>
    send<AdminFeatureDTO>("patch", `/admin/features/${key}`, body),
  settings: () => getData<AdminSettingDTO[]>("/admin/settings"),
  updateSettings: (body: { values: Record<string, unknown> }) =>
    send<AdminSettingDTO[]>("patch", "/admin/settings", body),
  payments: (params?: Query) =>
    getPage<AdminPaymentDTO>("/admin/payments", params),
  approvePayment: (id: string, body: unknown) =>
    send<AdminPaymentDTO>("post", `/admin/payments/${id}/approve`, body),
  rejectPayment: (id: string, body: unknown) =>
    send<AdminPaymentDTO>("post", `/admin/payments/${id}/reject`, body),
  recheckPayment: (id: string) =>
    send<AdminPaymentDTO>("post", `/admin/payments/${id}/recheck`),
  markRefunded: (id: string, body: unknown) =>
    send<AdminPaymentDTO>("post", `/admin/payments/${id}/mark-refunded`, body),
  invoices: (params?: Query) =>
    getPage<AdminInvoiceDTO>("/admin/invoices", params),
  coupons: () => getData<CouponDTO[]>("/admin/coupons"),
  createCoupon: (body: unknown) =>
    send<CouponDTO>("post", "/admin/coupons", body),
  updateCoupon: (id: string, body: unknown) =>
    send<CouponDTO>("patch", `/admin/coupons/${id}`, body),
  deleteCoupon: (id: string) => send<null>("delete", `/admin/coupons/${id}`),
  announcements: () => getData<AdminAnnouncementDTO[]>("/admin/announcements"),
  createAnnouncement: (body: unknown) =>
    send<AdminAnnouncementDTO>("post", "/admin/announcements", body),
  updateAnnouncement: (id: string, body: unknown) =>
    send<AdminAnnouncementDTO>("patch", `/admin/announcements/${id}`, body),
  deleteAnnouncement: (id: string) =>
    send<null>("delete", `/admin/announcements/${id}`),
  content: (params?: Query) =>
    getData<AdminContentDTO[]>("/admin/content", params),
  createContent: (body: unknown) =>
    send<AdminContentDTO>("post", "/admin/content", body),
  updateContent: (id: string, body: unknown) =>
    send<AdminContentDTO>("patch", `/admin/content/${id}`, body),
  deleteContent: (id: string) => send<null>("delete", `/admin/content/${id}`),
  orders: (params?: Query) =>
    getPage<AdminOrderListItemDTO>("/admin/orders", params),
  order: (id: string) => getData<AdminOrderDTO>(`/admin/orders/${id}`),
  exportOrders: async (params?: Query) =>
    (
      await api.get<Blob>("/admin/orders/export", {
        params,
        responseType: "blob",
      })
    ).data,
  visitorSummary: (params?: Query) =>
    getData<VisitorSummaryDTO>("/admin/visitors/summary", params),
  visitorIps: (params?: Query) =>
    getPage<VisitorIpRowDTO>("/admin/visitors/ips", params),
  visitorRecent: (params?: Query) =>
    getPage<PageViewDTO>("/admin/visitors/recent", params),
  auditLogs: (params?: Query) =>
    getPage<AuditLogDTO>("/admin/audit-logs", params),
  shopAuditLogs: (shopId: string, params?: Query) =>
    getPage<AuditLogDTO>(`/shops/${shopId}/audit-logs`, params),
  webhooks: (params?: Query) =>
    getPage<WebhookEventDTO>("/admin/webhooks", params),
  webhook: (id: string) => getData<WebhookEventDTO>(`/admin/webhooks/${id}`),
  replayWebhook: (id: string) =>
    send<WebhookEventDTO>("post", `/admin/webhooks/${id}/replay`),
  jobs: () => getData<JobQueueStatsDTO[]>("/admin/jobs"),
  retryJobs: (queue: string) =>
    send<{ retried: number }>("post", `/admin/jobs/${queue}/retry-failed`),
  usage: (params?: Query) => getPage<AdminUsageRowDTO>("/admin/usage", params),
  aiUsage: (params?: Query) =>
    getPage<AdminAiUsageRowDTO>("/admin/ai-usage", params),
  supportEmails: (params?: Query) =>
    getData<{
      items: AdminSupportEmailDTO[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
      counts: {
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        closed: number;
        expiredThirtyDays: number;
      };
    }>("/admin/support-emails", params),
  supportEmail: (id: string) =>
    getData<AdminSupportEmailDTO>(`/admin/support-emails/${id}`),
  updateSupportEmail: (
    id: string,
    body: { status?: string; adminNote?: string | null },
  ) => send<AdminSupportEmailDTO>("patch", `/admin/support-emails/${id}`, body),
  deleteSupportEmail: (id: string) =>
    send<{ success: boolean; deletedTicket: string }>(
      "delete",
      `/admin/support-emails/${id}`,
    ),
  cleanupExpiredSupportEmails: () =>
    send<{ deletedCount: number; filesDeleted: number; cutoff: string }>(
      "post",
      "/admin/support-emails/cleanup",
    ),
};
