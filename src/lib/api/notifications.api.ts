import { api } from "./client";
import type { NotificationDTO } from "@/types/notification";
const data = <T>(request: Promise<{ data: { data: T } }>) =>
  request.then((response) => response.data.data);
const path = (id: string, suffix = "") => `/shops/${id}/notifications${suffix}`;
export const notificationsApi = {
  list: (shopId: string) =>
    data<NotificationDTO[]>(api.get(path(shopId, "?page=1&limit=30"))),
  unreadCount: (shopId: string) =>
    data<{ count: number }>(api.get(path(shopId, "/unread-count"))),
  markRead: (shopId: string, body: { ids?: string[]; all?: boolean }) =>
    data<{ updated: number }>(api.post(path(shopId, "/read"), body)),
};
