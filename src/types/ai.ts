import type {
  AI_INTENTS,
  AI_REPLY_LANGUAGES,
  AI_REPLY_MODES,
  AI_RUN_STATUSES,
  AI_RUN_TYPES,
  AI_TONES,
  DELIVERY_ZONES,
  KNOWLEDGE_TYPES,
} from '@/constants/enums';

export type AiReplyMode = (typeof AI_REPLY_MODES)[number];
export type AiTone = (typeof AI_TONES)[number];
export type AiReplyLanguage = (typeof AI_REPLY_LANGUAGES)[number];
export type AiRunType = (typeof AI_RUN_TYPES)[number];
export type AiRunStatus = (typeof AI_RUN_STATUSES)[number];
export type KnowledgeType = (typeof KNOWLEDGE_TYPES)[number];
export type AiIntent = (typeof AI_INTENTS)[number];
export type DeliveryZone = (typeof DELIVERY_ZONES)[number];

export interface AiSettingsDTO {
  replyMode: AiReplyMode;
  businessInfo: string | null;
  tone: AiTone;
  replyLanguage: AiReplyLanguage;
  revealPrice: boolean;
  greetingText: string | null;
  customInstructions: string | null;
  handoffKeywords: string[];
  humanPauseMinutes: number;
  minConfidence: number;
  autoCreateDraftOrder: boolean;
  commentAiEnabled: boolean;
  maxAutoRepliesPerConversationPerDay: number;
}

export interface UpdateAiSettingsInput {
  replyMode?: AiReplyMode;
  businessInfo?: string | null;
  tone?: AiTone;
  replyLanguage?: AiReplyLanguage;
  revealPrice?: boolean;
  greetingText?: string | null;
  customInstructions?: string | null;
  handoffKeywords?: string[];
  humanPauseMinutes?: number;
  minConfidence?: number;
  autoCreateDraftOrder?: boolean;
  commentAiEnabled?: boolean;
  maxAutoRepliesPerConversationPerDay?: number;
}

export type AiReadinessItemKey =
  | 'channel_connected'
  | 'business_info'
  | 'products_with_price'
  | 'delivery_charges'
  | 'policy'
  | 'faq';

export interface AiReadinessDTO {
  ready: boolean;
  items: {
    key: AiReadinessItemKey;
    done: boolean;
    count?: number;
  }[];
}

export interface KnowledgeEntryDTO {
  id: string;
  type: KnowledgeType;
  title: string;
  content: string;
  keywords: string[];
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
}

export interface CreateKnowledgeInput {
  type: KnowledgeType;
  title: string;
  content: string;
  keywords?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdateKnowledgeInput {
  type?: KnowledgeType;
  title?: string;
  content?: string;
  keywords?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

export interface AiDraftDTO {
  aiRunId: string;
  status: AiRunStatus;
  text: string | null;
  intent: AiIntent | null;
  confidence: number | null;
  needsHuman: boolean;
  handoffReason: string | null;
  blockedReason: string | null;
  productIds: string[];
  suggestedQuickReplies?: string[];
}

export interface AiSummaryDTO {
  summary: string;
  summaryUpdatedAt: string;
}

export interface OrderMissingField {
  field: string;
  labelEn: string;
  labelBn: string;
}

export interface AiOrderExtractionDTO {
  aiRunId: string;
  confidence: number;
  customerName: string | null;
  phone: string | null;
  altPhone: string | null;
  address: string | null;
  district: string | null;
  area: string | null;
  deliveryZone: DeliveryZone | null;
  note: string | null;
  items: {
    productId: string;
    variantId: string | null;
    productName: string;
    variantName: string | null;
    quantity: number;
    unitPricePaisa: number;
  }[];
  unmatchedItems: { text: string; quantity: number }[];
  missingFields: OrderMissingField[];
  extractedFields: string[];
}

export interface AiUsageDTO {
  period: string;
  used: number;
  limit: number | null;
  unlimited: boolean;
  runsByType: Record<AiRunType, number>;
  blockedCount: number;
  draftAcceptanceRate: number | null;
}

export interface PlaygroundInput {
  message: string;
  history?: { role: 'customer' | 'shop'; text: string }[];
}
