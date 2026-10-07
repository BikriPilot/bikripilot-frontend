"use client";

import { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  ExternalLink,
  Eye,
  EyeOff,
  MessageSquare,
  MessageSquareShare,
  Package,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { SafeText } from "@/components/common/SafeText";
import { ReplyDialog } from "./ReplyDialog";
import { useHideComment } from "@/hooks/queries/useComments";
import type { CommentDTO } from "@/types/comment";

dayjs.extend(relativeTime);

interface CommentItemProps {
  comment: CommentDTO;
}

export function CommentItem({ comment }: CommentItemProps) {
  const t = useTranslations("comments");
  const [dialogMode, setDialogMode] = useState<"public" | "private" | null>(
    null,
  );
  const hideMutation = useHideComment();

  const handleToggleHide = async () => {
    try {
      await hideMutation.mutateAsync({
        commentId: comment.id,
        hidden: !comment.isHidden,
      });
      toast.success(t("successHide"));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to toggle visibility";
      toast.error(msg);
    }
  };

  const getStatusBadge = () => {
    switch (comment.actionStatus) {
      case "DONE":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-3" />
            {t("status.DONE")}
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
            <Clock className="size-3" />
            {t("status.PENDING")}
          </span>
        );
      case "SKIPPED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-500/10 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {t("status.SKIPPED")}
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:text-red-400">
            <AlertCircle className="size-3" />
            {t("status.FAILED")}
          </span>
        );
      case "NONE":
      default:
        return null;
    }
  };

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-150 ${
        comment.isHidden
          ? "border-muted bg-muted/30 opacity-75"
          : "border-border bg-card shadow-xs hover:border-border/80"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Left header: Author, time, channel, badges */}
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-foreground text-sm">
              {comment.authorName || "Facebook User"}
            </span>
            <span className="text-xs text-muted-foreground">
              {dayjs(comment.commentedAt).fromNow()}
            </span>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              {comment.channel.name}
            </span>
            {comment.postUrl && (
              <a
                href={comment.postUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
              >
                <span>{t("viewOnFacebook")}</span>
                <ExternalLink className="size-3" />
              </a>
            )}
            {comment.isHidden && (
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-600/10 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                <EyeOff className="size-3" />
                {t("hiddenBadge")}
              </span>
            )}
            {getStatusBadge()}
            {comment.rule && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[11px] font-medium text-purple-600 dark:text-purple-400">
                <Sparkles className="size-3" />
                {t("ruleBadge", { rule: comment.rule.name })}
              </span>
            )}
          </div>

          {/* Comment text */}
          <div className="text-sm text-foreground/90 whitespace-pre-wrap pt-0.5">
            <SafeText text={comment.text ?? ""} />
          </div>

          {/* Linked products */}
          {comment.linkedProducts.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="text-muted-foreground text-[11px]">
                {t("linkedProducts")}
              </span>
              {comment.linkedProducts.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1 rounded-md bg-secondary/80 px-2 py-0.5 text-[11px] font-medium text-secondary-foreground"
                >
                  <Package className="size-3 text-muted-foreground" />
                  {p.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
          <button
            type="button"
            onClick={() => setDialogMode("public")}
            className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <MessageSquare className="size-3.5 text-primary" />
            <span>{t("reply")}</span>
          </button>

          <button
            type="button"
            onClick={() => setDialogMode("private")}
            disabled={!comment.canPrivateReply || Boolean(comment.privateReplySentAt)}
            title={
              comment.privateReplySentAt
                ? t("privateReplySent")
                : !comment.canPrivateReply
                  ? t("privateReplyExpired")
                  : undefined
            }
            className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <MessageSquareShare className="size-3.5 text-purple-600 dark:text-purple-400" />
            <span>
              {comment.privateReplySentAt ? t("privateReplySent") : t("privateReply")}
            </span>
          </button>

          <button
            type="button"
            onClick={handleToggleHide}
            disabled={hideMutation.isPending}
            title={comment.isHidden ? t("unhide") : t("hide")}
            className="inline-flex items-center justify-center size-8 rounded-lg border border-input bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {comment.isHidden ? (
              <Eye className="size-3.5" />
            ) : (
              <EyeOff className="size-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Replies view (Public and/or Private) */}
      {(comment.publicReplyText || comment.privateReplyText) && (
        <div className="mt-3.5 space-y-2 border-t border-border/60 pt-3">
          {comment.publicReplyText && (
            <div className="rounded-xl bg-primary/5 p-3 text-xs border border-primary/10">
              <div className="flex items-center gap-1.5 font-medium text-primary mb-1">
                <MessageSquare className="size-3.5" />
                <span>Public Reply ({comment.channel.name})</span>
              </div>
              <p className="text-foreground/90 whitespace-pre-wrap">
                {comment.publicReplyText}
              </p>
            </div>
          )}

          {comment.privateReplyText && (
            <div className="rounded-xl bg-purple-500/5 p-3 text-xs border border-purple-500/10">
              <div className="flex items-center gap-1.5 font-medium text-purple-600 dark:text-purple-400 mb-1">
                <MessageSquareShare className="size-3.5" />
                <span>Private Messenger Reply</span>
                {comment.privateReplySentAt && (
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {dayjs(comment.privateReplySentAt).fromNow()}
                  </span>
                )}
              </div>
              <p className="text-foreground/90 whitespace-pre-wrap">
                {comment.privateReplyText}
              </p>
            </div>
          )}
        </div>
      )}

      {dialogMode && (
        <ReplyDialog
          comment={comment}
          mode={dialogMode}
          open={Boolean(dialogMode)}
          onClose={() => setDialogMode(null)}
        />
      )}
    </div>
  );
}
