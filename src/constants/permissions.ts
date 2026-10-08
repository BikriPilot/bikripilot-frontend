import type { ShopRoleValue } from './enums';

export const PERMISSIONS = {
  SHOP_READ: 'shop.read',
  SHOP_MANAGE: 'shop.manage',
  TEAM_READ: 'team.read',
  TEAM_MANAGE: 'team.manage',
  BILLING_READ: 'billing.read',
  BILLING_MANAGE: 'billing.manage',
  CHANNEL_MANAGE: 'channel.manage',
  INBOX_READ: 'inbox.read',
  INBOX_REPLY: 'inbox.reply',
  INBOX_ASSIGN: 'inbox.assign',
  COMMENT_READ: 'comment.read',
  COMMENT_REPLY: 'comment.reply',
  AUTOMATION_MANAGE: 'automation.manage',
  AI_USE: 'ai.use',
  AI_MANAGE: 'ai.manage',
  PRODUCT_READ: 'product.read',
  PRODUCT_WRITE: 'product.write',
  INVENTORY_WRITE: 'inventory.write',
  CUSTOMER_READ: 'customer.read',
  CUSTOMER_WRITE: 'customer.write',
  ORDER_READ: 'order.read',
  ORDER_WRITE: 'order.write',
  ORDER_STATUS: 'order.status',
  ORDER_EXPORT: 'order.export',
  COURIER_MANAGE: 'courier.manage',
  SHIPMENT_WRITE: 'shipment.write',
  RISK_CHECK: 'risk.check',
  HISAB_READ: 'hisab.read',
  HISAB_WRITE: 'hisab.write',
  RECONCILIATION_MANAGE: 'reconciliation.manage',
  ANALYTICS_READ: 'analytics.read',
  AUDIT_READ: 'audit.read',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS) as Permission[];

const P = PERMISSIONS;

export const ROLE_PERMISSIONS: Record<ShopRoleValue, Permission[]> = {
  OWNER: ALL_PERMISSIONS,
  MANAGER: ALL_PERMISSIONS.filter((p) => p !== P.BILLING_MANAGE),
  AGENT: [
    P.SHOP_READ, P.TEAM_READ, P.INBOX_READ, P.INBOX_REPLY, P.COMMENT_READ, P.COMMENT_REPLY,
    P.AI_USE, P.PRODUCT_READ, P.CUSTOMER_READ, P.CUSTOMER_WRITE, P.ORDER_READ, P.ORDER_WRITE,
    P.RISK_CHECK,
  ],
  FULFILMENT: [
    P.SHOP_READ, P.TEAM_READ, P.PRODUCT_READ, P.INVENTORY_WRITE, P.CUSTOMER_READ, P.ORDER_READ,
    P.ORDER_STATUS, P.ORDER_EXPORT, P.SHIPMENT_WRITE, P.RISK_CHECK,
  ],
  ACCOUNTANT: [
    P.SHOP_READ, P.TEAM_READ, P.BILLING_READ, P.PRODUCT_READ, P.CUSTOMER_READ, P.ORDER_READ,
    P.ORDER_EXPORT, P.HISAB_READ, P.HISAB_WRITE, P.RECONCILIATION_MANAGE, P.ANALYTICS_READ, P.AUDIT_READ,
  ],
  VIEWER: [
    P.SHOP_READ, P.TEAM_READ, P.BILLING_READ, P.INBOX_READ, P.COMMENT_READ, P.PRODUCT_READ,
    P.CUSTOMER_READ, P.ORDER_READ, P.HISAB_READ, P.ANALYTICS_READ,
  ],
};

// Roles a member with TEAM_MANAGE may assign. Only OWNER may assign MANAGER.
export const ASSIGNABLE_ROLES_BY: Record<'OWNER' | 'MANAGER', ShopRoleValue[]> = {
  OWNER: ['MANAGER', 'AGENT', 'FULFILMENT', 'ACCOUNTANT', 'VIEWER'],
  MANAGER: ['AGENT', 'FULFILMENT', 'ACCOUNTANT', 'VIEWER'],
};

export const hasPermission = (permissions: readonly string[], permission: Permission) =>
  permissions.includes(permission);
