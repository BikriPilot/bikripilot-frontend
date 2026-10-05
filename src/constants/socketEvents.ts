export const SOCKET_EVENTS = {
  MESSAGE_NEW: "message:new",
  ORDER_CREATED: "order:created",
  NOTIFICATION_NEW: "notification:new",
} as const;
export type SocketEventName =
  (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
