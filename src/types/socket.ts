import type { NotificationDTO } from "@/types/notification";
import type { MessageStatusValue, OrderStatusValue } from "@/constants/enums";
import { SOCKET_EVENTS } from "@/constants/socketEvents";
import type { ConversationListItemDTO, MessageDTO } from "@/types/inbox";

export type SocketEventName = keyof SocketEventPayloads;

export type SocketEventPayloads = {
  [SOCKET_EVENTS.MESSAGE_NEW]: { conversationId: string; message: MessageDTO };
  [SOCKET_EVENTS.MESSAGE_UPDATED]: {
    conversationId: string;
    messageId: string;
    status: MessageStatusValue;
    error: string | null;
  };
  [SOCKET_EVENTS.CONVERSATION_UPDATED]: {
    conversation: ConversationListItemDTO;
  };
  [SOCKET_EVENTS.COMMENT_NEW]: { comment: unknown };
  [SOCKET_EVENTS.COMMENT_UPDATED]: { comment: unknown };
  [SOCKET_EVENTS.ORDER_CREATED]: {
    orderId: string;
    orderNumber: string;
    status: OrderStatusValue;
  };
  [SOCKET_EVENTS.ORDER_UPDATED]: {
    orderId: string;
    orderNumber: string;
    status: OrderStatusValue;
  };
  [SOCKET_EVENTS.SHIPMENT_UPDATED]: {
    shipmentId: string;
    orderId: string;
    status: string;
  };
  [SOCKET_EVENTS.NOTIFICATION_NEW]: { notification: NotificationDTO };
  [SOCKET_EVENTS.ENTITLEMENTS_CHANGED]: Record<string, never>;
};

export type SocketEventPayload<T extends SocketEventName> =
  SocketEventPayloads[T & keyof SocketEventPayloads];
