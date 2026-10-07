"use client";

import { useState } from "react";
import { MessageSquare, Send, X, Bot } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  useReplyComment,
  usePrivateReplyComment,
} from "@/hooks/queries/useComments";
import type { CommentDTO } from "@/types/comment";

interface ReplyDialogProps {
  comment: CommentDTO | null;
  mode: "public" | "private";
  open: boolean;
  onClose: () => void;
}

export function ReplyDialog({
  comment,
  mode,
  open,
  onClose,
}: ReplyDialogProps) {
  const t = useTranslations("comments");
  const [text, setText] = useState("");
  const replyMutation = useReplyComment();
  const privateReplyMutation = usePrivateReplyComment();

  if (!open || !comment) return null;

  const isPrivate = mode === "private";
  const isLoading =
    replyMutation.isPending || privateReplyMutation.isPending;

  const handleInsertPlaceholder = (placeholder: string) => {
    setText((prev) => prev + placeholder);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      if (isPrivate) {
        await privateReplyMutation.mutateAsync({
          commentId: comment.id,
          text: text.trim(),
        });
        toast.success(t("successPrivateReply"));
      } else {
        await replyMutation.mutateAsync({
          commentId: comment.id,
          text: text.trim(),
        });
        toast.success(t("successReply"));
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send reply";
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg ${
                isPrivate
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {isPrivate ? (
                <Bot className="size-5" />
              ) : (
                <MessageSquare className="size-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-semibold">
                {isPrivate ? t("privateReplyTitle") : t("replyTitle")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {comment.authorName ?? "Customer"} &bull; {comment.channel.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Comment quote */}
        <div className="my-4 rounded-xl bg-muted/60 p-3.5 border border-border/50 text-xs text-foreground/90">
          <p className="font-medium text-muted-foreground mb-1">
            {comment.authorName ?? "Comment"}:
          </p>
          <p className="italic line-clamp-3">
            &ldquo;{comment.text || "No text"}&rdquo;
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {isPrivate ? t("privateReplyText") : t("replyPlaceholder")}
              </label>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span>{t("insertPlaceholder")}</span>
                <button
                  type="button"
                  onClick={() => handleInsertPlaceholder("{name}")}
                  className="rounded bg-muted px-1.5 py-0.5 hover:bg-accent hover:text-accent-foreground font-mono text-[10px]"
                >
                  {"{name}"}
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertPlaceholder("{price}")}
                  className="rounded bg-muted px-1.5 py-0.5 hover:bg-accent hover:text-accent-foreground font-mono text-[10px]"
                >
                  {"{price}"}
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertPlaceholder("{productName}")}
                  className="rounded bg-muted px-1.5 py-0.5 hover:bg-accent hover:text-accent-foreground font-mono text-[10px]"
                >
                  {"{productName}"}
                </button>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                isPrivate
                  ? t("privateReplyPlaceholder")
                  : t("replyPlaceholder")
              }
              rows={4}
              maxLength={2000}
              className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 resize-none"
              autoFocus
              required
            />
            <div className="mt-1 text-right text-[11px] text-muted-foreground">
              {text.length}/2000
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border border-input px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !text.trim()}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium text-white shadow-xs transition-opacity disabled:opacity-50 ${
                isPrivate
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-primary hover:bg-primary/90"
              }`}
            >
              <Send className="size-4" />
              {isLoading ? "Sending..." : isPrivate ? t("privateReply") : t("reply")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
