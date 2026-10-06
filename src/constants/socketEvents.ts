export const SOCKET_EVENTS = {
  SHOP_JOIN: "shop:join",
  SHOP_LEAVE: "shop:leave",
  MESSAGE_UPDATED: "message:updated",
  CONVERSATION_UPDATED: "conversation:updated",
  COMMENT_NEW: "comment:new",
  COMMENT_UPDATED: "comment:updated",
  MESSAGE_NEW: "message:new",
  ORDER_CREATED: "order:created",
  ORDER_UPDATED: "order:updated",
  SHIPMENT_UPDATED: "shipment:updated",
  NOTIFICATION_NEW: "notification:new",
  ENTITLEMENTS_CHANGED: "entitlements:changed",
} as const;
export type SocketEventName =
  (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
