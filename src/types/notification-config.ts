export interface ShopNotificationConfigDTO {
  id: string;
  shopId: string;

  // SMS Gateway (BulkSMSBD)
  smsEnabled: boolean;
  hasBulksmsKey: boolean;
  bulksmsApiKeyMasked: string | null;
  bulksmsSenderId: string | null;

  // Email Gateway (Custom SMTP)
  emailEnabled: boolean;
  smtpHost: string | null;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string | null;
  hasSmtpPass: boolean;
  smtpPassMasked: string | null;
  emailFrom: string | null;

  // Order Lifecycle Event Toggles: SMS
  notifyOrderCreatedSms: boolean;
  notifyOrderConfirmedSms: boolean;
  notifyOrderShippedSms: boolean;
  notifyOrderDeliveredSms: boolean;
  notifyOrderCancelledSms: boolean;
  notifyOrderReturnedSms: boolean;

  // Order Lifecycle Event Toggles: Email
  notifyOrderCreatedEmail: boolean;
  notifyOrderConfirmedEmail: boolean;
  notifyOrderShippedEmail: boolean;
  notifyOrderDeliveredEmail: boolean;
  notifyOrderCancelledEmail: boolean;
  notifyOrderReturnedEmail: boolean;

  // Ledger / Hisab Khata Toggles
  notifyLedgerTagadaSms: boolean;
  notifyLedgerTagadaEmail: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface UpdateShopNotificationConfigInput {
  smsEnabled?: boolean;
  bulksmsApiKey?: string | null;
  bulksmsSenderId?: string | null;

  emailEnabled?: boolean;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpSecure?: boolean;
  smtpUser?: string | null;
  smtpPass?: string | null;
  emailFrom?: string | null;

  notifyOrderCreatedSms?: boolean;
  notifyOrderConfirmedSms?: boolean;
  notifyOrderShippedSms?: boolean;
  notifyOrderDeliveredSms?: boolean;
  notifyOrderCancelledSms?: boolean;
  notifyOrderReturnedSms?: boolean;

  notifyOrderCreatedEmail?: boolean;
  notifyOrderConfirmedEmail?: boolean;
  notifyOrderShippedEmail?: boolean;
  notifyOrderDeliveredEmail?: boolean;
  notifyOrderCancelledEmail?: boolean;
  notifyOrderReturnedEmail?: boolean;

  notifyLedgerTagadaSms?: boolean;
  notifyLedgerTagadaEmail?: boolean;
}

export interface NotificationLogDTO {
  id: string;
  shopId: string;
  channel: 'SMS' | 'EMAIL';
  recipient: string;
  event: string;
  status: 'SENT' | 'FAILED';
  error?: string | null;
  providerRef?: string | null;
  createdAt: string;
}

export interface NotificationLogsQuery {
  page?: number;
  limit?: number;
  channel?: 'SMS' | 'EMAIL';
}

export interface SendManualInput {
  channel: 'SMS' | 'EMAIL';
  recipient: string;
  message: string;
  subject?: string;
}
