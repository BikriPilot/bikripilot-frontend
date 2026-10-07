"use client";

import { useState } from "react";
import {
  Sparkles,
  Send,
  Check,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useInboxMutations } from "@/hooks/queries/useInbox";
import type { AiDraftDTO } from "@/types/ai";

interface AiDraftBarProps {
  conversationId: string;
  draftText?: string | null;
  draftRunId?: string | null;
  draftData?: AiDraftDTO | null;
  onUseDraft: (text: string, runId?: string | null) => void;
  onDiscard?: () => void;
  disabled?: boolean;
}

export function AiDraftBar({
  conversationId,
  draftText,
  draftRunId,
  draftData,
  onUseDraft,
  onDiscard,
  disabled = false,
}: AiDraftBarProps) {
  const t = useTranslations("inbox");
  const mutations = useInboxMutations(conversationId);
  const [isSending, setIsSending] = useState(false);

  const text = draftText || draftData?.text;
  const runId = draftRunId || draftData?.aiRunId;
  const confidence = draftData?.confidence;
  const intent = draftData?.intent;
  const isBlocked = draftData?.status === "BLOCKED";
  const blockedReason = draftData?.blockedReason;
  const needsHuman = draftData?.needsHuman;
  const handoffReason = draftData?.handoffReason;
  const quickReplies = draftData?.suggestedQuickReplies || [];

  if (!text && !isBlocked) return null;

  const handleSendDirect = async () => {
    if (!text || disabled || isSending) return;
    setIsSending(true);
    const clientRef = `ai_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    try {
      await mutations.sendMessage.mutateAsync({
        clientRef,
        text,
        aiRunId: runId || undefined,
        aiEdited: false,
      });
      toast.success(t("aiDraftSent"));
    } catch {
      toast.error(t("sendFailed"));
    } finally {
      setIsSending(false);
    }
  };

  const handleDiscard = async () => {
    try {
      await mutations.discardAiDraft.mutateAsync();
      toast.success(t("aiDraftDiscarded"));
      onDiscard?.();
    } catch {
      toast.error(t("discardFailed"));
    }
  };

  return (
    <div className="mb-2 overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs shadow-xs transition-all">
      {/* Top status bar */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-primary">
          <Sparkles size={14} className="animate-pulse" />
          <span>{t("aiDraftSuggestion")}</span>
          {intent && (
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] uppercase font-mono text-primary">
              {intent}
            </span>
          )}
          {typeof confidence === "number" && (
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-mono font-medium ${
                confidence >= 0.8
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {Math.round(confidence * 100)}% {t("confidence")}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleDiscard}
          disabled={mutations.discardAiDraft.isPending || isSending}
          className="flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
          title={t("discardDraft")}
        >
          <Trash2 size={13} />
          <span>{t("discard")}</span>
        </button>
      </div>

      {/* Blocked or Needs Human alerts */}
      {isBlocked && (
        <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-destructive/10 p-2 text-destructive">
          <ShieldAlert size={14} className="shrink-0" />
          <span className="font-medium">
            {t("aiReplyBlocked")}: {blockedReason || t("guardrailTriggered")}
          </span>
        </div>
      )}

      {!isBlocked && needsHuman && (
        <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-amber-500/10 p-2 text-amber-700">
          <AlertTriangle size={14} className="shrink-0" />
          <span className="font-medium">
            {t("humanHandoffNotice")}: {handoffReason || t("humanReviewRecommended")}
          </span>
        </div>
      )}

      {/* Draft text */}
      {text && !isBlocked && (
        <div className="mb-2.5 rounded-lg border border-background bg-background/80 p-2.5 text-foreground leading-relaxed whitespace-pre-wrap select-text">
          {text}
        </div>
      )}

      {/* Quick reply chips */}
      {quickReplies.length > 0 && !isBlocked && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {quickReplies.map((reply, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onUseDraft(reply, runId)}
              className="rounded-full border bg-background px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      {!isBlocked && text && (
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-primary/10">
          <button
            type="button"
            onClick={() => onUseDraft(text, runId)}
            disabled={disabled || isSending}
            className="flex items-center gap-1 rounded-lg border border-primary/30 bg-background px-3 py-1.5 font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Check size={13} className="text-primary" />
            <span>{t("useDraft")}</span>
          </button>
          <button
            type="button"
            onClick={handleSendDirect}
            disabled={disabled || isSending || mutations.sendMessage.isPending}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-xs"
          >
            {isSending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Send size={13} />
            )}
            <span>{t("sendDraftNow")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
