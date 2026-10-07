"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { useCallback } from "react";
import { inboxApi } from "@/lib/api/inbox.api";
import { queryKeys } from "@/lib/queryKeys";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { useAuthStore } from "@/stores/authStore";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/constants/socketEvents";
import type {
  ConversationListItemDTO,
  ConversationDTO,
  MessageDTO,
  ConversationListQuery,
  UpdateConversationInput,
  SendMessageInput,
  CreateSavedReplyInput,
  UpdateSavedReplyInput,
  CursorMeta,
} from "@/types/inbox";

export function useConversations(query?: ConversationListQuery) {
  const { shopId } = useCurrentShop();

  return useInfiniteQuery({
    queryKey: queryKeys.conversations(shopId, query),
    queryFn: ({ pageParam }) =>
      inboxApi.listConversations(shopId!, { ...query, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasMore ? (lastPage.meta.nextCursor ?? undefined) : undefined,
    enabled: Boolean(shopId),
    placeholderData: (prev) => prev,
  });
}

export function useConversation(conversationId: string | null | undefined) {
  const { shopId } = useCurrentShop();

  return useQuery({
    queryKey: queryKeys.conversation(shopId, conversationId ?? ""),
    queryFn: () => inboxApi.getConversation(shopId!, conversationId!),
    enabled: Boolean(shopId && conversationId),
  });
}

export function useMessages(conversationId: string | null | undefined) {
  const { shopId } = useCurrentShop();

  return useInfiniteQuery({
    queryKey: queryKeys.messages(shopId, conversationId ?? ""),
    queryFn: ({ pageParam }) =>
      inboxApi.listMessages(shopId!, conversationId!, {
        before: pageParam,
        limit: 30,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasMore ? (lastPage.meta.nextCursor ?? undefined) : undefined,
    enabled: Boolean(shopId && conversationId),
  });
}

export function useNotes(conversationId: string | null | undefined) {
  const { shopId } = useCurrentShop();

  return useQuery({
    queryKey: queryKeys.notes(shopId, conversationId ?? ""),
    queryFn: () => inboxApi.listNotes(shopId!, conversationId!),
    enabled: Boolean(shopId && conversationId),
  });
}

export function useConversationOrders(
  conversationId: string | null | undefined,
) {
  const { shopId } = useCurrentShop();

  return useQuery({
    queryKey: queryKeys.conversationOrders(shopId, conversationId ?? ""),
    queryFn: () => inboxApi.listOrders(shopId!, conversationId!),
    enabled: Boolean(shopId && conversationId),
  });
}

export function useSavedReplies(search?: string) {
  const { shopId } = useCurrentShop();

  return useQuery({
    queryKey: queryKeys.savedReplies(shopId, search),
    queryFn: () => inboxApi.listSavedReplies(shopId!, search),
    enabled: Boolean(shopId),
  });
}

export function useInboxRealtime(activeConversationId?: string | null) {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  const handleNewMessage = useCallback(
    ({
      conversationId,
      message,
    }: {
      conversationId: string;
      message: MessageDTO;
    }) => {
      if (!shopId) return;

      // 1. Update message list cache for active conversation
      queryClient.setQueryData<
        InfiniteData<{ data: MessageDTO[]; meta?: CursorMeta }>
      >(queryKeys.messages(shopId, conversationId), (old) => {
        if (!old) return old;
        const exists = old.pages.some((page) =>
          page.data.some(
            (m) =>
              m.id === message.id ||
              (message.clientRef && m.clientRef === message.clientRef),
          ),
        );
        if (exists) {
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((m) =>
                m.id === message.id ||
                (message.clientRef && m.clientRef === message.clientRef)
                  ? message
                  : m,
              ),
            })),
          };
        }
        // Prepend to newest page
        const firstPage = old.pages[0];
        if (!firstPage) return old;
        return {
          ...old,
          pages: [
            {
              ...firstPage,
              data: [message, ...firstPage.data],
            },
            ...old.pages.slice(1),
          ],
        };
      });

      // 2. Update conversation preview in all conversations list caches
      queryClient.setQueriesData<
        InfiniteData<{ data: ConversationListItemDTO[]; meta?: CursorMeta }>
      >({ queryKey: ["conversations", shopId] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((conv) => {
              if (conv.id !== conversationId) return conv;
              return {
                ...conv,
                lastMessageAt: message.sentAt,
                lastMessagePreview:
                  message.text ||
                  (message.attachments.length > 0 ? "[Photo]" : null),
                unreadCount:
                  message.direction === "INBOUND" &&
                  conversationId !== activeConversationId
                    ? conv.unreadCount + 1
                    : conv.unreadCount,
              };
            }),
          })),
        };
      });
    },
    [activeConversationId, queryClient, shopId],
  );

  const handleMessageUpdated = useCallback(
    ({
      conversationId,
      messageId,
      status,
      error,
    }: {
      conversationId: string;
      messageId: string;
      status: string;
      error: string | null;
    }) => {
      if (!shopId) return;

      queryClient.setQueryData<
        InfiniteData<{ data: MessageDTO[]; meta?: CursorMeta }>
      >(queryKeys.messages(shopId, conversationId), (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((m) =>
              m.id === messageId
                ? {
                    ...m,
                    status: status as MessageDTO["status"],
                    error,
                  }
                : m,
            ),
          })),
        };
      });
    },
    [queryClient, shopId],
  );

  const handleConversationUpdated = useCallback(
    ({ conversation }: { conversation: ConversationListItemDTO }) => {
      if (!shopId) return;

      queryClient.setQueriesData<
        InfiniteData<{ data: ConversationListItemDTO[]; meta?: CursorMeta }>
      >({ queryKey: ["conversations", shopId] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((c) =>
              c.id === conversation.id ? { ...c, ...conversation } : c,
            ),
          })),
        };
      });

      queryClient.setQueryData<ConversationDTO>(
        queryKeys.conversation(shopId, conversation.id),
        (old) => (old ? { ...old, ...conversation } : undefined),
      );
    },
    [queryClient, shopId],
  );

  useSocketEvent(SOCKET_EVENTS.MESSAGE_NEW, handleNewMessage);
  useSocketEvent(SOCKET_EVENTS.MESSAGE_UPDATED, handleMessageUpdated);
  useSocketEvent(SOCKET_EVENTS.CONVERSATION_UPDATED, handleConversationUpdated);
}

export function useInboxMutations(conversationId?: string | null) {
  const { shopId } = useCurrentShop();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: (body: SendMessageInput) =>
      inboxApi.sendMessage(shopId!, conversationId!, body),
    onMutate: async (newMsg) => {
      if (!shopId || !conversationId) return;

      await queryClient.cancelQueries({
        queryKey: queryKeys.messages(shopId, conversationId),
      });

      const optimisticMsg: MessageDTO = {
        id: `temp_${newMsg.clientRef}`,
        conversationId,
        direction: "OUTBOUND",
        senderType: "AGENT",
        sentBy: user
          ? { id: user.id, name: user.name, email: user.email }
          : null,
        type: newMsg.attachments?.length ? "IMAGE" : "TEXT",
        text: newMsg.text ?? null,
        attachments: newMsg.attachments ?? [],
        status: "SENDING",
        error: null,
        usedHumanAgentTag: Boolean(newMsg.useHumanAgentTag),
        aiRunId: newMsg.aiRunId ?? null,
        clientRef: newMsg.clientRef,
        sentAt: new Date().toISOString(),
        deliveredAt: null,
        readAt: null,
      };

      queryClient.setQueryData<
        InfiniteData<{ data: MessageDTO[]; meta?: CursorMeta }>
      >(queryKeys.messages(shopId, conversationId), (old) => {
        if (!old) {
          return {
            pages: [{ data: [optimisticMsg], meta: { hasMore: false, nextCursor: null } }],
            pageParams: [undefined],
          };
        }
        const firstPage = old.pages[0];
        return {
          ...old,
          pages: [
            {
              ...firstPage,
              data: [optimisticMsg, ...firstPage.data],
            },
            ...old.pages.slice(1),
          ],
        };
      });

      return { optimisticMsg };
    },
    onSuccess: (savedMsg) => {
      if (!shopId || !conversationId) return;

      queryClient.setQueryData<
        InfiniteData<{ data: MessageDTO[]; meta?: CursorMeta }>
      >(queryKeys.messages(shopId, conversationId), (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((m) =>
              m.clientRef === savedMsg.clientRef ? savedMsg : m,
            ),
          })),
        };
      });

      // Update conversations list preview
      queryClient.setQueriesData<
        InfiniteData<{ data: ConversationListItemDTO[]; meta?: CursorMeta }>
      >({ queryKey: ["conversations", shopId] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    lastMessageAt: savedMsg.sentAt,
                    lastMessagePreview: savedMsg.text || "[Attachment]",
                  }
                : c,
            ),
          })),
        };
      });
    },
    onError: (_err, newMsg) => {
      if (!shopId || !conversationId) return;

      queryClient.setQueryData<
        InfiniteData<{ data: MessageDTO[]; meta?: CursorMeta }>
      >(queryKeys.messages(shopId, conversationId), (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((m) =>
              m.clientRef === newMsg.clientRef
                ? { ...m, status: "FAILED" as const }
                : m,
            ),
          })),
        };
      });
    },
  });

  const retryMessageMutation = useMutation({
    mutationFn: (messageId: string) => inboxApi.retryMessage(shopId!, messageId),
    onSuccess: (retriedMsg) => {
      if (!shopId || !conversationId) return;

      queryClient.setQueryData<
        InfiniteData<{ data: MessageDTO[]; meta?: CursorMeta }>
      >(queryKeys.messages(shopId, conversationId), (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((m) =>
              m.id === retriedMsg.id ? retriedMsg : m,
            ),
          })),
        };
      });
    },
  });

  const updateConversationMutation = useMutation({
    mutationFn: (body: UpdateConversationInput) =>
      inboxApi.updateConversation(shopId!, conversationId!, body),
    onSuccess: (updated) => {
      if (!shopId || !conversationId) return;

      queryClient.setQueryData(
        queryKeys.conversation(shopId, conversationId),
        updated,
      );

      queryClient.setQueriesData<
        InfiniteData<{ data: ConversationListItemDTO[]; meta?: CursorMeta }>
      >({ queryKey: ["conversations", shopId] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((c) =>
              c.id === conversationId ? { ...c, ...updated } : c,
            ),
          })),
        };
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: () => inboxApi.markAsRead(shopId!, conversationId!),
    onSuccess: () => {
      if (!shopId || !conversationId) return;

      queryClient.setQueriesData<
        InfiniteData<{ data: ConversationListItemDTO[]; meta?: CursorMeta }>
      >({ queryKey: ["conversations", shopId] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((c) =>
              c.id === conversationId ? { ...c, unreadCount: 0 } : c,
            ),
          })),
        };
      });
    },
  });

  const createNoteMutation = useMutation({
    mutationFn: (text: string) =>
      inboxApi.createNote(shopId!, conversationId!, text),
    onSuccess: () => {
      if (!shopId || !conversationId) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notes(shopId, conversationId),
      });
    },
  });

  const createSavedReplyMutation = useMutation({
    mutationFn: (body: CreateSavedReplyInput) =>
      inboxApi.createSavedReply(shopId!, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["saved-replies", shopId],
      });
    },
  });

  const updateSavedReplyMutation = useMutation({
    mutationFn: ({
      replyId,
      body,
    }: {
      replyId: string;
      body: UpdateSavedReplyInput;
    }) => inboxApi.updateSavedReply(shopId!, replyId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["saved-replies", shopId],
      });
    },
  });

  const deleteSavedReplyMutation = useMutation({
    mutationFn: (replyId: string) =>
      inboxApi.deleteSavedReply(shopId!, replyId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["saved-replies", shopId],
      });
    },
  });

  return {
    sendMessage: sendMessageMutation,
    retryMessage: retryMessageMutation,
    updateConversation: updateConversationMutation,
    markAsRead: markAsReadMutation,
    createNote: createNoteMutation,
    createSavedReply: createSavedReplyMutation,
    updateSavedReply: updateSavedReplyMutation,
    deleteSavedReply: deleteSavedReplyMutation,
  };
}
