import { api } from "./client";
import type {
  CommentDTO,
  CommentRuleDTO,
  PostLinkDTO,
  PagePostDTO,
  CommentListQuery,
  CreateCommentRuleInput,
  UpdateCommentRuleInput,
} from "@/types/comment";

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const shopPath = (shopId: string, suffix = "") => `/shops/${shopId}${suffix}`;

export const commentsApi = {
  listComments: (shopId: string, query?: CommentListQuery) =>
    api
      .get<{ data: CommentDTO[]; meta: PageMeta }>(
        shopPath(shopId, "/comments"),
        { params: query },
      )
      .then((r) => r.data),

  reply: (shopId: string, commentId: string, text: string) =>
    api
      .post<{ data: CommentDTO }>(
        shopPath(shopId, `/comments/${commentId}/reply`),
        { text },
      )
      .then((r) => r.data.data),

  privateReply: (shopId: string, commentId: string, text: string) =>
    api
      .post<{ data: CommentDTO }>(
        shopPath(shopId, `/comments/${commentId}/private-reply`),
        { text },
      )
      .then((r) => r.data.data),

  hide: (shopId: string, commentId: string, hidden: boolean) =>
    api
      .post<{ data: CommentDTO }>(
        shopPath(shopId, `/comments/${commentId}/hide`),
        { hidden },
      )
      .then((r) => r.data.data),

  listRules: (shopId: string) =>
    api
      .get<{ data: CommentRuleDTO[] }>(shopPath(shopId, "/comment-rules"))
      .then((r) => r.data.data),

  createRule: (shopId: string, body: CreateCommentRuleInput) =>
    api
      .post<{ data: CommentRuleDTO }>(shopPath(shopId, "/comment-rules"), body)
      .then((r) => r.data.data),

  updateRule: (
    shopId: string,
    ruleId: string,
    body: UpdateCommentRuleInput,
  ) =>
    api
      .patch<{ data: CommentRuleDTO }>(
        shopPath(shopId, `/comment-rules/${ruleId}`),
        body,
      )
      .then((r) => r.data.data),

  deleteRule: (shopId: string, ruleId: string) =>
    api
      .delete(shopPath(shopId, `/comment-rules/${ruleId}`))
      .then((r) => r.data),

  listPostLinks: (shopId: string, postId?: string) =>
    api
      .get<{ data: PostLinkDTO[] }>(shopPath(shopId, "/post-links"), {
        params: postId ? { postId } : undefined,
      })
      .then((r) => r.data.data),

  setPostLinks: (
    shopId: string,
    body: {
      channelConnectionId: string;
      postId: string;
      productIds: string[];
    },
  ) =>
    api
      .post<{ data: PostLinkDTO[] }>(shopPath(shopId, "/post-links"), body)
      .then((r) => r.data.data),

  deletePostLink: (shopId: string, linkId: string) =>
    api
      .delete(shopPath(shopId, `/post-links/${linkId}`))
      .then((r) => r.data),

  listChannelPosts: (shopId: string, channelId: string, limit = 25) =>
    api
      .get<{ data: PagePostDTO[] }>(
        shopPath(shopId, `/channels/${channelId}/posts`),
        { params: { limit } },
      )
      .then((r) => r.data.data),
};
