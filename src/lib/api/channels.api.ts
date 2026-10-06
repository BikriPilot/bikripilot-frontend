import { api } from "./client";
import type { ChannelDTO, PendingPageDTO } from "@/types/channel";
const data = <T>(request: Promise<{ data: { data: T } }>) => request.then((response) => response.data.data);
const path = (shopId: string, suffix = "") => `/shops/${shopId}/channels${suffix}`;
export const channelsApi = {
  list: (shopId: string) => data<ChannelDTO[]>(api.get(path(shopId))),
  oauthUrl: (shopId: string) => data<{ url: string }>(api.get(path(shopId, "/meta/oauth-url"))),
  pending: (shopId: string, pendingId: string) => data<{ pages: PendingPageDTO[] }>(api.get(path(shopId, `/meta/pending/${pendingId}`))),
  connect: (shopId: string, pendingId: string, pageId: string) => data<ChannelDTO>(api.post(path(shopId, "/meta/connect"), { pendingId, pageId })),
  resubscribe: (shopId: string, channelId: string) => data<ChannelDTO>(api.post(path(shopId, `/${channelId}/resubscribe`))),
  disconnect: (shopId: string, channelId: string) => data<{ disconnected: boolean }>(api.delete(path(shopId, `/${channelId}`))),
};
