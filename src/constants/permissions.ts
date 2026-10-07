export const PERMISSIONS = {
  SHOP_READ: "shop.read",
  SHOP_MANAGE: "shop.manage",
  TEAM_READ: "team.read",
  TEAM_MANAGE: "team.manage",
  INBOX_READ: "inbox.read",
  INBOX_REPLY: "inbox.reply",
  COMMENT_READ: "comment.read",
  COMMENT_REPLY: "comment.reply",
  AUTOMATION_MANAGE: "automation.manage",
  ORDER_READ: "order.read",
  PRODUCT_READ: "product.read",
  CUSTOMER_READ: "customer.read",
  HISAB_READ: "hisab.read",
} as const;
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
