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
};
