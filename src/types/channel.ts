export type ChannelDTO = {
  id: string; type: string; externalId: string; name: string; pictureUrl: string | null;
  status: "ACTIVE" | "NEEDS_RECONNECT" | "DISCONNECTED"; lastError: string | null;
  webhookSubscribedAt: string | null; connectedAt: string;
};
export type PendingPageDTO = { pageId: string; name: string; pictureUrl: string | null; tasks: string[] };
export type WhatsAppStatusDTO = {
  status: "CONNECTED" | "SCAN_QR" | "DISCONNECTED";
  phone: string | null;
  qr: string | null;
  lastError?: string | null;
};

