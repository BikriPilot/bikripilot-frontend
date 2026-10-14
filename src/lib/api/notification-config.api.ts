import { api } from "./client";
import type {
  ShopNotificationConfigDTO,
  UpdateShopNotificationConfigInput,
  NotificationLogDTO,
  NotificationLogsQuery,
} from "@/types/notification-config";
import type { PageMeta } from "@/types/product";

const path = (shopId: string, suffix = "") => `/shops/${shopId}/notification-config${suffix}`;

export const notificationConfigApi = {
  getConfig: (shopId: string) =>
    api.get<{ data: ShopNotificationConfigDTO }>(path(shopId)).then((r) => r.data.data),

  updateConfig: (shopId: string, body: UpdateShopNotificationConfigInput) =>
    api.put<{ data: ShopNotificationConfigDTO }>(path(shopId), body).then((r) => r.data.data),

  testSms: (shopId: string, phone: string) =>
    api
      .post<{ success: boolean; message: string }>(path(shopId, "/test-sms"), { phone })
      .then((r) => r.data),

  testEmail: (shopId: string, email: string) =>
    api
      .post<{ success: boolean; message: string }>(path(shopId, "/test-email"), { email })
      .then((r) => r.data),

  sendManual: (
    shopId: string,
    body: { channel: "SMS" | "EMAIL"; recipient: string; message: string; subject?: string },
  ) =>
    api
      .post<{ success: boolean; message: string }>(path(shopId, "/send-manual"), body)
      .then((r) => r.data),

  getLogs: (shopId: string, params?: NotificationLogsQuery) =>
    api
      .get<{ data: NotificationLogDTO[]; meta: PageMeta }>(path(shopId, "/logs"), { params })
      .then((r) => r.data),
};
