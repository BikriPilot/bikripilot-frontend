import { api } from "@/lib/api/client";
import type { PublicTrackingDTO } from "@/types/order";
export const trackingApi = {
  get: (shopSlug: string, orderNumber: string, phoneLast4: string) =>
    api.get<{ data: PublicTrackingDTO }>(`/public/track/${encodeURIComponent(shopSlug)}/${encodeURIComponent(orderNumber)}`, { params: { phoneLast4 } }).then((r) => r.data.data),
};
