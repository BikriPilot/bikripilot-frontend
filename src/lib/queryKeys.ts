export const queryKeys = {
  publicConfig: ["public-config"] as const,
  me: ["me"] as const,
  products: (shopId: string) => ["products", shopId] as const,
  inventory: (shopId: string) => ["inventory", shopId] as const,
  hisab: (shopId: string) => ["hisab", shopId] as const,
};
