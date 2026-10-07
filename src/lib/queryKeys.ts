export const queryKeys = {
  publicConfig: ["public-config"] as const,
  me: ["me"] as const,
  products: (shopId: string) => ["products", shopId] as const,
  inventory: (shopId: string) => ["inventory", shopId] as const,
  hisab: (shopId: string) => ["hisab", shopId] as const,
  orders: (shopId: string) => ["orders", shopId] as const,
  notifications: ["notifications"] as const,
  conversations: (shopId?: string | null, query?: unknown) =>
    ["conversations", shopId, query] as const,
  conversation: (shopId?: string | null, conversationId?: string | null) =>
    ["conversation", shopId, conversationId] as const,
  messages: (shopId?: string | null, conversationId?: string | null) =>
    ["messages", shopId, conversationId] as const,
  notes: (shopId?: string | null, conversationId?: string | null) =>
    ["notes", shopId, conversationId] as const,
  conversationOrders: (
    shopId?: string | null,
    conversationId?: string | null,
  ) => ["conversation-orders", shopId, conversationId] as const,
  savedReplies: (shopId?: string | null, search?: string) =>
    ["saved-replies", shopId, search] as const,
  comments: (shopId?: string | null, query?: unknown) =>
    ["comments", shopId, query] as const,
  commentRules: (shopId?: string | null) => ["comment-rules", shopId] as const,
  postLinks: (shopId?: string | null, postId?: string) =>
    ["post-links", shopId, postId] as const,
  channelPosts: (
    shopId?: string | null,
    channelId?: string | null,
    limit?: number,
  ) => ["channel-posts", shopId, channelId, limit] as const,
  channels: (shopId?: string | null) => ["channels", shopId] as const,
  aiSettings: (shopId?: string | null) => ["ai-settings", shopId] as const,
  aiReadiness: (shopId?: string | null) => ["ai-readiness", shopId] as const,
  aiUsage: (shopId?: string | null) => ["ai-usage", shopId] as const,
  knowledge: (shopId?: string | null, type?: string | null) =>
    ["knowledge", shopId, type] as const,
  couriers: (shopId?: string | null) => ["couriers", shopId] as const,
  courierLocations: (
    shopId?: string | null,
    courierId?: string | null,
    type?: string,
    parentId?: string | number,
    district?: string,
  ) =>
    ["courier-locations", shopId, courierId, type, parentId, district] as const,
  shipments: (shopId?: string | null, query?: unknown) =>
    ["shipments", shopId, query] as const,
  shipment: (shopId?: string | null, shipmentId?: string | null) =>
    ["shipment", shopId, shipmentId] as const,
  riskCheck: (shopId?: string | null, phone?: string | null) =>
    ["risk-check", shopId, phone] as const,
  riskHistory: (shopId?: string | null, query?: unknown) =>
    ["risk-history", shopId, query] as const,
  reconciliationSummary: (shopId?: string | null) =>
    ["reconciliation-summary", shopId] as const,
  unpaidShipments: (shopId?: string | null, query?: unknown) =>
    ["unpaid-shipments", shopId, query] as const,
  payouts: (shopId?: string | null, query?: unknown) =>
    ["payouts", shopId, query] as const,
  payout: (shopId?: string | null, payoutId?: string | null) =>
    ["payout", shopId, payoutId] as const,
};
