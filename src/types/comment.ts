export type CommentActionStatus =
  | "NONE"
  | "PENDING"
  | "DONE"
  | "SKIPPED"
  | "FAILED";

export interface CommentDTO {
  id: string;
  channel: { id: string; name: string };
  postId: string;
  postUrl: string;
  authorName: string | null;
  text: string | null;
  commentedAt: string;
  actionStatus: CommentActionStatus;
  rule: { id: string; name: string } | null;
  publicReplyText: string | null;
  privateReplyText: string | null;
  privateReplySentAt: string | null;
  canPrivateReply: boolean;
  isHidden: boolean;
  error: string | null;
  linkedProducts: Array<{ id: string; name: string }>;
}

export interface CommentRuleDTO {
  id: string;
  channelConnectionId: string | null;
  name: string;
  isActive: boolean;
  priority: number;
  postIds: string[];
  keywords: string[];
  publicReplyTexts: string[];
  privateReplyText: string | null;
  useAiPrivateReply: boolean;
  hideIfPhoneNumber: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostLinkDTO {
  id: string;
  channelConnectionId: string;
  postId: string;
  product: {
    id: string;
    name: string;
    pricePaisa: number;
    images: string[];
  };
}

export interface PagePostDTO {
  id: string;
  message: string | null;
  createdTime: string;
  permalinkUrl: string | null;
  fullPicture: string | null;
}

export interface CreateCommentRuleInput {
  name: string;
  channelConnectionId?: string | null;
  isActive?: boolean;
  priority?: number;
  postIds?: string[];
  keywords?: string[];
  publicReplyTexts?: string[];
  privateReplyText?: string | null;
  useAiPrivateReply?: boolean;
  hideIfPhoneNumber?: boolean;
}

export type UpdateCommentRuleInput = Partial<CreateCommentRuleInput>;

export interface CommentListQuery {
  page?: number;
  limit?: number;
  channelId?: string;
  postId?: string;
  status?: CommentActionStatus;
  search?: string;
}
