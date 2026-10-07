"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { commentsApi } from "@/lib/api/comments.api";
import { queryKeys } from "@/lib/queryKeys";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { useSocketEvent } from "@/hooks/useSocketEvent";
import { SOCKET_EVENTS } from "@/constants/socketEvents";
import type {
  CommentListQuery,
  CreateCommentRuleInput,
  UpdateCommentRuleInput,
} from "@/types/comment";

export function useComments(query?: CommentListQuery) {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  const queryResult = useQuery({
    queryKey: queryKeys.comments(shopId, query),
    queryFn: () => commentsApi.listComments(shopId!, query),
    enabled: Boolean(shopId),
    placeholderData: (prev) => prev,
  });

  const handleCommentNew = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["comments", shopId],
    });
  }, [queryClient, shopId]);

  const handleCommentUpdated = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["comments", shopId],
    });
  }, [queryClient, shopId]);

  useSocketEvent(SOCKET_EVENTS.COMMENT_NEW, handleCommentNew);
  useSocketEvent(SOCKET_EVENTS.COMMENT_UPDATED, handleCommentUpdated);

  return queryResult;
}

export function useReplyComment() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      commentsApi.reply(shopId!, commentId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", shopId] });
    },
  });
}

export function usePrivateReplyComment() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, text }: { commentId: string; text: string }) =>
      commentsApi.privateReply(shopId!, commentId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", shopId] });
    },
  });
}

export function useHideComment() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      hidden,
    }: {
      commentId: string;
      hidden: boolean;
    }) => commentsApi.hide(shopId!, commentId, hidden),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", shopId] });
    },
  });
}

export function useCommentRules() {
  const { shopId } = useCurrentShop();

  return useQuery({
    queryKey: queryKeys.commentRules(shopId),
    queryFn: () => commentsApi.listRules(shopId!),
    enabled: Boolean(shopId),
  });
}

export function useCreateCommentRule() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCommentRuleInput) =>
      commentsApi.createRule(shopId!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commentRules(shopId) });
    },
  });
}

export function useUpdateCommentRule() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ruleId,
      body,
    }: {
      ruleId: string;
      body: UpdateCommentRuleInput;
    }) => commentsApi.updateRule(shopId!, ruleId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commentRules(shopId) });
    },
  });
}

export function useDeleteCommentRule() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ruleId: string) => commentsApi.deleteRule(shopId!, ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commentRules(shopId) });
    },
  });
}

export function usePostLinks(postId?: string) {
  const { shopId } = useCurrentShop();

  return useQuery({
    queryKey: queryKeys.postLinks(shopId, postId),
    queryFn: () => commentsApi.listPostLinks(shopId!, postId),
    enabled: Boolean(shopId),
  });
}

export function useSetPostLinks() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      channelConnectionId: string;
      postId: string;
      productIds: string[];
    }) => commentsApi.setPostLinks(shopId!, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["post-links", shopId] });
      queryClient.invalidateQueries({
        queryKey: queryKeys.postLinks(shopId, variables.postId),
      });
      queryClient.invalidateQueries({ queryKey: ["comments", shopId] });
    },
  });
}

export function useDeletePostLink() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ linkId }: { linkId: string; postId?: string }) =>
      commentsApi.deletePostLink(shopId!, linkId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["post-links", shopId] });
      if (variables.postId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.postLinks(shopId, variables.postId),
        });
      }
      queryClient.invalidateQueries({ queryKey: ["comments", shopId] });
    },
  });
}

export function useChannelPosts(
  channelId: string | null | undefined,
  limit = 25,
) {
  const { shopId } = useCurrentShop();

  return useQuery({
    queryKey: queryKeys.channelPosts(shopId, channelId, limit),
    queryFn: () => commentsApi.listChannelPosts(shopId!, channelId!, limit),
    enabled: Boolean(shopId && channelId),
  });
}
