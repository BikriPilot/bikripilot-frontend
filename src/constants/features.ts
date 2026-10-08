// Feature keys used by plans, limits and usage. Plans only reference these keys.
export type FeatureTypeValue = 'BOOLEAN' | 'LIMIT';
export type ResetPeriodValue = 'NONE' | 'MONTHLY';

export const FEATURES = {
  AI_ASSISTANT: { key: 'ai_assistant', type: 'BOOLEAN', resetPeriod: 'NONE', group: 'ai' },
  AI_AUTO_REPLY: { key: 'ai_auto_reply', type: 'BOOLEAN', resetPeriod: 'NONE', group: 'ai' },
  AI_ORDER_EXTRACTION: { key: 'ai_order_extraction', type: 'BOOLEAN', resetPeriod: 'NONE', group: 'ai' },
  AI_REPLIES_PER_MONTH: { key: 'ai_replies_per_month', type: 'LIMIT', resetPeriod: 'MONTHLY', group: 'ai' },
  COMMENT_AUTOMATION: { key: 'comment_automation', type: 'BOOLEAN', resetPeriod: 'NONE', group: 'inbox' },
  MAX_CHANNELS: { key: 'max_channels', type: 'LIMIT', resetPeriod: 'NONE', group: 'inbox' },
  ORDERS_PER_MONTH: { key: 'orders_per_month', type: 'LIMIT', resetPeriod: 'MONTHLY', group: 'orders' },
  MAX_PRODUCTS: { key: 'max_products', type: 'LIMIT', resetPeriod: 'NONE', group: 'orders' },
  CSV_EXPORT: { key: 'csv_export', type: 'BOOLEAN', resetPeriod: 'NONE', group: 'orders' },
  COURIER_INTEGRATION: { key: 'courier_integration', type: 'BOOLEAN', resetPeriod: 'NONE', group: 'courier' },
  RISK_CHECKS_PER_MONTH: { key: 'risk_checks_per_month', type: 'LIMIT', resetPeriod: 'MONTHLY', group: 'courier' },
  HISAB_KHATA: { key: 'hisab_khata', type: 'BOOLEAN', resetPeriod: 'NONE', group: 'money' },
  SMS_PER_MONTH: { key: 'sms_per_month', type: 'LIMIT', resetPeriod: 'MONTHLY', group: 'money' },
  COD_RECONCILIATION: { key: 'cod_reconciliation', type: 'BOOLEAN', resetPeriod: 'NONE', group: 'money' },
  MAX_TEAM_MEMBERS: { key: 'max_team_members', type: 'LIMIT', resetPeriod: 'NONE', group: 'team' },
  ADVANCED_ANALYTICS: { key: 'advanced_analytics', type: 'BOOLEAN', resetPeriod: 'NONE', group: 'analytics' },
  REMOVE_BRANDING: { key: 'remove_branding', type: 'BOOLEAN', resetPeriod: 'NONE', group: 'branding' },
} as const;

export type FeatureKey = (typeof FEATURES)[keyof typeof FEATURES]['key'];

export const FEATURE_LIST = Object.values(FEATURES);

export const FEATURE_GROUPS = ['inbox', 'ai', 'orders', 'courier', 'money', 'team', 'analytics', 'branding'] as const;
export type FeatureGroup = (typeof FEATURE_GROUPS)[number];
