export type FeatureTypeValue = "BOOLEAN" | "LIMIT";
export const FEATURES = {
  AI_ASSISTANT: {
    key: "ai_assistant",
    type: "BOOLEAN",
    resetPeriod: "NONE",
    group: "ai",
  },
  MAX_PRODUCTS: {
    key: "max_products",
    type: "LIMIT",
    resetPeriod: "NONE",
    group: "orders",
  },
  HISAB_KHATA: {
    key: "hisab_khata",
    type: "BOOLEAN",
    resetPeriod: "NONE",
    group: "money",
  },
} as const;
export type FeatureKey = (typeof FEATURES)[keyof typeof FEATURES]["key"];
export const FEATURE_LIST = Object.values(FEATURES);
