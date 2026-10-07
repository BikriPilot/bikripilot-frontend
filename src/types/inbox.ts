import type {
  ChannelTypeValue,
  ConversationStatusValue,
  MessageDirectionValue,
  MessageSenderTypeValue,
  MessageStatusValue,
  MessageTypeValue,
} from "@/constants/enums";

export interface UserRef {
  id: string;
  name: string;
  email: string;
}

export interface WindowStateDTO {
  isOpen: boolean;
  closesAt: string | null;
  humanAgentTagAllowed: boolean;
  humanAgentTagUntil: string | null;
}

export interface ConversationListItemDTO {
  id: string;
  status: ConversationStatusValue;
  channel: { id: string; name: string; type: ChannelTypeValue };
  customer: {
    id: string;
    name: string | null;
    phone: string | null;
    profilePicUrl: string | null;
  };
  assignedTo: UserRef | null;
  unreadCount: number;
  lastMessageAt: string;
  lastMessagePreview: string | null;
  needsHuman: boolean;
  aiPaused: boolean;
  tags: string[];
  hasAiDraft: boolean;
}

export interface ConversationDTO extends ConversationListItemDTO {
  lastInboundAt: string | null;
  window: WindowStateDTO;
  needsHumanReason: string | null;
  aiDisabled: boolean;
  aiPausedUntil: string | null;
  aiDraftText: string | null;
  aiDraftRunId: string | null;
  summary: string | null;
  summaryUpdatedAt: string | null;
}

export interface MessageAttachment {
  type: "image" | "video" | "audio" | "file";
  url: string;
  name?: string;
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  direction: MessageDirectionValue;
  senderType: MessageSenderTypeValue;
  sentBy: UserRef | null;
  type: MessageTypeValue;
  text: string | null;
  attachments: MessageAttachment[];
  status: MessageStatusValue;
  error: string | null;
  usedHumanAgentTag: boolean;
  aiRunId: string | null;
  clientRef: string | null;
  sentAt: string;
  deliveredAt: string | null;
  readAt: string | null;
}

export interface InternalNoteDTO {
  id: string;
  text: string;
  author: UserRef;
  createdAt: string;
}

export interface SavedReplyDTO {
  id: string;
  title: string;
  text: string;
  shortcut: string | null;
  createdAt: string;
}

export type ConversationFilter =
  | "all"
  | "unread"
  | "mine"
  | "unassigned"
  | "needs_human"
  | "resolved";

export interface ConversationListQuery {
  filter?: ConversationFilter;
  channelId?: string;
  tag?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

export interface UpdateConversationInput {
  status?: ConversationStatusValue;
  assignedToId?: string | null;
  tags?: string[];
  needsHuman?: boolean;
  aiDisabled?: boolean;
}

export interface SendMessageInput {
  clientRef: string;
  text?: string;
  attachments?: MessageAttachment[];
  useHumanAgentTag?: boolean;
  aiRunId?: string;
  aiEdited?: boolean;
}

export interface CreateSavedReplyInput {
  title: string;
  text: string;
  shortcut?: string | null;
}

export interface UpdateSavedReplyInput {
  title?: string;
  text?: string;
  shortcut?: string | null;
}

export interface CursorMeta {
  nextCursor: string | null;
  hasMore: boolean;
}
