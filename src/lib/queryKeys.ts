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
  commentRules: (shopId?: string | null) =>
    ["comment-rules", shopId] as const,
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
};
