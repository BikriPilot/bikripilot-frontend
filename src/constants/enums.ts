// Must match Prisma enums in 06-database-schema.md exactly.
export const PLATFORM_ROLES = ['USER', 'SUPPORT', 'SUPER_ADMIN'] as const;
export const USER_STATUSES = ['ACTIVE', 'SUSPENDED'] as const;
export const SHOP_STATUSES = ['ACTIVE', 'SUSPENDED'] as const;
export const SHOP_ROLES = [
  'OWNER',
  'MANAGER',
  'AGENT',
  'FULFILMENT',
  'ACCOUNTANT',
  'VIEWER',
] as const;
export const INVITATION_STATUSES = ['PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED'] as const;
export const SUBSCRIPTION_STATUSES = [
  'TRIALING',
  'ACTIVE',
  'PAST_DUE',
  'CANCELLED',
  'EXPIRED',
] as const;
export const SUBSCRIPTION_SOURCES = ['SIGNUP', 'LAUNCH', 'PAYMENT', 'ADMIN', 'DOWNGRADE'] as const;
export const BILLING_CYCLES = ['MONTHLY', 'YEARLY'] as const;
export const INVOICE_STATUSES = ['PENDING', 'PAID', 'CANCELLED', 'REFUNDED'] as const;
export const INVOICE_KINDS = ['NEW', 'RENEWAL', 'UPGRADE'] as const;
export const PAYMENT_PROVIDERS = ['SSLCOMMERZ', 'BKASH', 'MANUAL'] as const;
export const PAYMENT_STATUSES = [
  'INITIATED',
  'PENDING_VERIFICATION',
  'PAID',
  'FAILED',
  'CANCELLED',
  'REJECTED',
] as const;
export const MANUAL_PAYMENT_METHODS = ['BKASH', 'NAGAD'] as const;
export const COUPON_TYPES = ['PERCENT', 'FIXED'] as const;
export const CHANNEL_TYPES = ['MESSENGER', 'INSTAGRAM', 'WHATSAPP'] as const;
export const CHANNEL_STATUSES = ['ACTIVE', 'NEEDS_RECONNECT', 'DISCONNECTED'] as const;
export const WEBHOOK_SOURCES = ['META', 'STEADFAST', 'PATHAO', 'REDX'] as const;
export const WEBHOOK_STATUSES = ['PENDING', 'PROCESSED', 'FAILED', 'IGNORED'] as const;
export const CONVERSATION_STATUSES = ['OPEN', 'RESOLVED'] as const;
export const MESSAGE_DIRECTIONS = ['INBOUND', 'OUTBOUND'] as const;
export const MESSAGE_SENDER_TYPES = ['CUSTOMER', 'AGENT', 'AI', 'AUTOMATION', 'SYSTEM'] as const;
export const MESSAGE_TYPES = [
  'TEXT',
  'IMAGE',
  'VIDEO',
  'AUDIO',
  'FILE',
  'STICKER',
  'TEMPLATE',
  'OTHER',
] as const;
export const MESSAGE_STATUSES = [
  'RECEIVED',
  'SENDING',
  'SENT',
  'DELIVERED',
  'READ',
  'FAILED',
] as const;
export const COMMENT_ACTION_STATUSES = ['NONE', 'PENDING', 'DONE', 'SKIPPED', 'FAILED'] as const;
export const PRODUCT_STATUSES = ['ACTIVE', 'DRAFT', 'ARCHIVED'] as const;
export const INVENTORY_REASONS = [
  'INITIAL',
  'ADJUSTMENT',
  'PURCHASE',
  'ORDER_CONFIRMED',
  'ORDER_CANCELLED',
  'ORDER_RETURNED',
  'DAMAGED',
] as const;
export const ORDER_STATUSES = [
  'DRAFT',
  'PENDING',
  'CONFIRMED',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'PARTIALLY_DELIVERED',
  'RETURNED',
  'CANCELLED',
] as const;
export const ORDER_SOURCES = [
  'MESSENGER',
  'INSTAGRAM',
  'WHATSAPP',
  'COMMENT',
  'MANUAL',
  'PHONE',
  'WEBSITE',
] as const;
export const DELIVERY_ZONES = ['INSIDE_DHAKA', 'SUB_DHAKA', 'OUTSIDE_DHAKA'] as const;
export const PAYMENT_METHODS = ['COD', 'BKASH', 'NAGAD', 'ROCKET', 'BANK', 'CARD', 'CASH'] as const;
export const ORDER_PAYMENT_STATUSES = ['UNPAID', 'PARTIAL', 'PAID'] as const;
export const STATUS_CHANGE_SOURCES = ['USER', 'COURIER', 'SYSTEM', 'AI'] as const;
export const COURIER_PROVIDERS = ['STEADFAST', 'PATHAO', 'REDX', 'MANUAL'] as const;
export const SHIPMENT_STATUSES = [
  'CREATED',
  'PICKUP_PENDING',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'PARTIAL_DELIVERED',
  'ON_HOLD',
  'RETURNING',
  'RETURNED',
  'CANCELLED',
  'UNKNOWN',
] as const;
export const SHIPMENT_EVENT_SOURCES = ['BOOKING', 'WEBHOOK', 'SYNC', 'MANUAL'] as const;
export const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'UNKNOWN'] as const;
export const RISK_ACTIONS = ['SHIP', 'CALL_FIRST', 'ASK_ADVANCE'] as const;
export const PARTY_KINDS = ['CUSTOMER', 'SUPPLIER', 'OTHER'] as const;
export const LEDGER_DIRECTIONS = ['GAVE', 'GOT'] as const;
export const LEDGER_METHODS = [
  'CASH',
  'BKASH',
  'NAGAD',
  'ROCKET',
  'BANK',
  'CARD',
  'COURIER',
  'GOODS',
  'ADJUSTMENT',
] as const;
export const ENTRY_SOURCES = [
  'MANUAL',
  'ORDER',
  'ORDER_PAYMENT',
  'DELIVERY',
  'PURCHASE',
  'RETURN',
  'PAYOUT',
  'REFUND',
] as const;
export const MONEY_ACCOUNT_KINDS = ['CASH', 'MFS', 'BANK', 'COURIER'] as const;
export const CASH_DIRECTIONS = ['IN', 'OUT'] as const;
export const CASH_CATEGORIES = [
  'SALE',
  'DUE_COLLECTION',
  'ADVANCE',
  'COD_COLLECTION',
  'OWNER_IN',
  'OWNER_OUT',
  'EXPENSE',
  'SUPPLIER_PAYMENT',
  'TRANSFER',
  'REFUND',
  'COURIER_CHARGE',
  'OTHER',
] as const;
export const MANUAL_CASH_CATEGORIES = [
  'SALE',
  'DUE_COLLECTION',
  'OWNER_IN',
  'OWNER_OUT',
  'EXPENSE',
  'SUPPLIER_PAYMENT',
  'REFUND',
  'OTHER',
] as const;
export const REMINDER_CHANNELS = ['SMS', 'WHATSAPP_LINK'] as const;
export const REMINDER_STATUSES = ['QUEUED', 'SENT', 'FAILED', 'OPENED'] as const;
export const PAYOUT_STATUSES = ['DRAFT', 'MATCHED', 'MISMATCH', 'CONFIRMED'] as const;
export const PAYOUT_MATCH_STATUSES = [
  'MATCHED',
  'AMOUNT_MISMATCH',
  'NOT_FOUND',
  'DUPLICATE',
] as const;
export const AI_REPLY_MODES = ['OFF', 'DRAFT', 'AUTO'] as const;
export const AI_TONES = ['FRIENDLY', 'FORMAL'] as const;
export const AI_REPLY_LANGUAGES = ['AUTO', 'BANGLA', 'BANGLISH', 'ENGLISH'] as const;
export const AI_RUN_TYPES = [
  'REPLY_DRAFT',
  'AUTO_REPLY',
  'ORDER_EXTRACTION',
  'SUMMARY',
  'COMMENT_REPLY',
  'PLAYGROUND',
] as const;
export const AI_RUN_STATUSES = ['SUCCESS', 'BLOCKED', 'FAILED', 'SKIPPED'] as const;
export const KNOWLEDGE_TYPES = [
  'FAQ',
  'RETURN_POLICY',
  'DELIVERY',
  'PAYMENT',
  'ABOUT',
  'OTHER',
] as const;
export const NOTIFICATION_TYPES = [
  'NEW_ORDER',
  'NEEDS_HUMAN',
  'NEW_COMMENT',
  'CHANNEL_DISCONNECTED',
  'LIMIT_WARNING',
  'LIMIT_REACHED',
  'LOW_STOCK',
  'PAYMENT_APPROVED',
  'PAYMENT_REJECTED',
  'SUBSCRIPTION_EXPIRING',
  'SUBSCRIPTION_EXPIRED',
  'SHIPMENT_ISSUE',
  'PAYOUT_MISMATCH',
  'MEMBER_JOINED',
  'SYSTEM',
] as const;
export const ANNOUNCEMENT_VARIANTS = ['INFO', 'WARNING', 'SUCCESS'] as const;
export const ANNOUNCEMENT_AUDIENCES = ['ALL', 'PLAN', 'SHOP'] as const;
export const SITE_CONTENT_TYPES = ['FAQ', 'TESTIMONIAL'] as const;

// Not stored as Prisma enums (string values / arrays in DB):
export const LOCALES = ['bn', 'en'] as const;
export const DEFAULT_LOCALE = 'bn'; // Bangla first; the switch changes the whole UI to proper English

export const AI_INTENTS = [
  'GREETING',
  'PRICE_QUERY',
  'AVAILABILITY',
  'PRODUCT_INFO',
  'DELIVERY_INFO',
  'PAYMENT_INFO',
  'ORDER_PLACE',
  'ORDER_STATUS',
  'COMPLAINT',
  'RETURN_REFUND',
  'HUMAN_REQUEST',
  'OTHER',
] as const;

export const RISK_REASONS = [
  'NO_DATA',
  'EXTERNAL_UNAVAILABLE',
  'LOW_SUCCESS_RATE',
  'MEDIUM_SUCCESS_RATE',
  'HIGH_SUCCESS_RATE',
  'FRAUD_REPORTS',
  'PREVIOUS_RETURNS',
  'REPEAT_GOOD_CUSTOMER',
  'NEW_CUSTOMER',
  'INCOMPLETE_ADDRESS',
  'INVALID_PHONE',
  'BLOCKED_CUSTOMER',
] as const;

export const ORDER_MISSING_FIELDS = [
  'CUSTOMER_NAME',
  'PHONE',
  'VALID_PHONE',
  'ADDRESS',
  'DISTRICT',
  'ITEMS',
  'PRICES',
  'STOCK',
  'DELIVERY_CHARGE',
] as const;

export const BUSINESS_CATEGORIES = [
  'fashion',
  'cosmetics',
  'electronics',
  'gadgets',
  'food',
  'grocery',
  'home_decor',
  'kids',
  'books',
  'health',
  'jewellery',
  'handicrafts',
  'pets',
  'other',
] as const;

export const AUDIT_ACTIONS = [
  'auth.password_changed',
  'security.account_locked',
  'security.2fa_enabled',
  'security.2fa_disabled',
  'security.sessions_revoked',
  'shop.updated',
  'shop.settings_updated',
  'member.invited',
  'member.invite_revoked',
  'member.joined',
  'member.role_changed',
  'member.removed',
  'channel.connected',
  'channel.disconnected',
  'product.created',
  'product.updated',
  'product.deleted',
  'inventory.adjusted',
  'inventory.purchased',
  'customer.created',
  'customer.updated',
  'customer.blocked',
  'customer.deleted',
  'order.created',
  'order.updated',
  'order.status_changed',
  'order.payment_added',
  'courier.connected',
  'courier.updated',
  'courier.deleted',
  'shipment.booked',
  'shipment.cancelled',
  'shipment.status_manual',
  'party.created',
  'party.updated',
  'party.archived',
  'ledger.entry_created',
  'ledger.entry_updated',
  'ledger.entry_deleted',
  'cash.entry_created',
  'cash.entry_updated',
  'cash.entry_deleted',
  'cash.transfer_created',
  'payout.created',
  'payout.confirmed',
  'payout.deleted',
  'ai.settings_updated',
  'knowledge.saved',
  'knowledge.deleted',
  'comment_rule.saved',
  'comment_rule.deleted',
  'billing.checkout_started',
  'billing.manual_payment_submitted',
  'billing.subscription_activated',
  'billing.cancel_requested',
  'billing.downgrade_scheduled',
  'billing.downgrade_cancelled',
  'billing.auto_renew_changed',
  'billing.payment_needs_refund',
  'admin.shop_status_changed',
  'admin.shop_deleted',
  'admin.user_blocked',
  'admin.user_unblocked',
  'admin.subscription_changed',
  'admin.override_set',
  'admin.override_removed',
  'admin.plan_created',
  'admin.plan_updated',
  'admin.plan_features_updated',
  'admin.plan_migrated',
  'admin.feature_updated',
  'admin.setting_updated',
  'admin.user_updated',
  'admin.payment_approved',
  'admin.payment_rejected',
  'admin.impersonation_started',
  'admin.coupon_saved',
  'admin.announcement_saved',
  'admin.content_saved',
  'admin.webhook_replayed',
] as const;

export type InvoiceKindValue = (typeof INVOICE_KINDS)[number];
export type PlatformRoleValue = (typeof PLATFORM_ROLES)[number];
export type ShopRoleValue = (typeof SHOP_ROLES)[number];
export type OrderStatusValue = (typeof ORDER_STATUSES)[number];
export type ShipmentStatusValue = (typeof SHIPMENT_STATUSES)[number];
export type DeliveryZoneValue = (typeof DELIVERY_ZONES)[number];
export type PaymentMethodValue = (typeof PAYMENT_METHODS)[number];
export type RiskLevelValue = (typeof RISK_LEVELS)[number];
export type RiskActionValue = (typeof RISK_ACTIONS)[number];
export type LocaleValue = (typeof LOCALES)[number];
export type AiIntent = (typeof AI_INTENTS)[number];
export type RiskReason = (typeof RISK_REASONS)[number];
export type OrderMissingField = (typeof ORDER_MISSING_FIELDS)[number];
export type AuditAction = (typeof AUDIT_ACTIONS)[number];
export type NotificationTypeValue = (typeof NOTIFICATION_TYPES)[number];
export type ChannelTypeValue = (typeof CHANNEL_TYPES)[number];
export type ConversationStatusValue = (typeof CONVERSATION_STATUSES)[number];
export type MessageDirectionValue = (typeof MESSAGE_DIRECTIONS)[number];
export type MessageSenderTypeValue = (typeof MESSAGE_SENDER_TYPES)[number];
export type MessageTypeValue = (typeof MESSAGE_TYPES)[number];
export type MessageStatusValue = (typeof MESSAGE_STATUSES)[number];
