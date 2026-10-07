import { api } from "./client";
import type {
  ConversationListItemDTO,
  ConversationDTO,
  MessageDTO,
  InternalNoteDTO,
  SavedReplyDTO,
  ConversationListQuery,
  UpdateConversationInput,
  SendMessageInput,
  CreateSavedReplyInput,
  UpdateSavedReplyInput,
  CursorMeta,
} from "@/types/inbox";
import type { OrderListItemDTO } from "@/types/order";
import type { AiDraftDTO, AiOrderExtractionDTO, AiSummaryDTO } from "@/types/ai";

const path = (shopId: string, suffix = "") => `/shops/${shopId}${suffix}`;

export const inboxApi = {
  listConversations: (shopId: string, query?: ConversationListQuery) =>
    api
      .get<{ data: ConversationListItemDTO[]; meta?: CursorMeta }>(
        path(shopId, "/conversations"),
        { params: query },
      )
      .then((r) => r.data),

  getConversation: (shopId: string, conversationId: string) =>
    api
      .get<{ data: ConversationDTO }>(
        path(shopId, `/conversations/${conversationId}`),
      )
      .then((r) => r.data.data),

  updateConversation: (
    shopId: string,
    conversationId: string,
    body: UpdateConversationInput,
  ) =>
    api
      .patch<{ data: ConversationDTO }>(
        path(shopId, `/conversations/${conversationId}`),
        body,
      )
      .then((r) => r.data.data),

  markAsRead: (shopId: string, conversationId: string) =>
    api
      .post(path(shopId, `/conversations/${conversationId}/read`))
      .then((r) => r.data),

  listMessages: (
    shopId: string,
    conversationId: string,
    params?: { before?: string; limit?: number },
  ) =>
    api
      .get<{ data: MessageDTO[]; meta?: CursorMeta }>(
        path(shopId, `/conversations/${conversationId}/messages`),
        { params },
      )
      .then((r) => r.data),

  sendMessage: (
    shopId: string,
    conversationId: string,
    body: SendMessageInput,
  ) =>
    api
      .post<{ data: MessageDTO }>(
        path(shopId, `/conversations/${conversationId}/messages`),
        body,
      )
      .then((r) => r.data.data),

  retryMessage: (shopId: string, messageId: string) =>
    api
      .post<{ data: MessageDTO }>(path(shopId, `/messages/${messageId}/retry`))
      .then((r) => r.data.data),

  listNotes: (shopId: string, conversationId: string) =>
    api
      .get<{ data: InternalNoteDTO[] }>(
        path(shopId, `/conversations/${conversationId}/notes`),
      )
      .then((r) => r.data.data),

  createNote: (shopId: string, conversationId: string, text: string) =>
    api
      .post<{ data: InternalNoteDTO }>(
        path(shopId, `/conversations/${conversationId}/notes`),
        { text },
      )
      .then((r) => r.data.data),

  listOrders: (shopId: string, conversationId: string) =>
    api
      .get<{ data: OrderListItemDTO[] }>(
        path(shopId, `/conversations/${conversationId}/orders`),
      )
      .then((r) => r.data.data),

  listSavedReplies: (shopId: string, search?: string) =>
    api
      .get<{ data: SavedReplyDTO[] }>(path(shopId, "/saved-replies"), {
        params: search ? { search } : undefined,
      })
      .then((r) => r.data.data),

  createSavedReply: (shopId: string, body: CreateSavedReplyInput) =>
    api
      .post<{ data: SavedReplyDTO }>(path(shopId, "/saved-replies"), body)
      .then((r) => r.data.data),

  updateSavedReply: (
    shopId: string,
    replyId: string,
    body: UpdateSavedReplyInput,
  ) =>
    api
      .patch<{ data: SavedReplyDTO }>(
        path(shopId, `/saved-replies/${replyId}`),
        body,
      )
      .then((r) => r.data.data),

  deleteSavedReply: (shopId: string, replyId: string) =>
    api
      .delete(path(shopId, `/saved-replies/${replyId}`))
      .then((r) => r.data),

  generateAiDraft: (
    shopId: string,
    conversationId: string,
    instructions?: string,
  ) =>
    api
      .post<{ data: AiDraftDTO }>(
        path(shopId, `/conversations/${conversationId}/ai/draft`),
        instructions ? { instructions } : {},
      )
      .then((r) => r.data.data),

  extractOrderWithAi: (
    shopId: string,
    conversationId: string,
    autoCreateDraftOrder?: boolean,
  ) =>
    api
      .post<{ data: AiOrderExtractionDTO }>(
        path(shopId, `/conversations/${conversationId}/ai/extract-order`),
        typeof autoCreateDraftOrder === "boolean"
          ? { autoCreateDraftOrder }
          : {},
      )
      .then((r) => r.data.data),

  summarizeConversation: (shopId: string, conversationId: string) =>
    api
      .post<{ data: AiSummaryDTO }>(
        path(shopId, `/conversations/${conversationId}/ai/summary`),
        {},
      )
      .then((r) => r.data.data),

  discardAiDraft: (shopId: string, conversationId: string) =>
    api
      .post(path(shopId, `/conversations/${conversationId}/ai/discard-draft`), {})
      .then((r) => r.data),
};
