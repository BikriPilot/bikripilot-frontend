"use client";

import { Check, CheckCheck, Clock, AlertCircle, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { SafeText } from "@/components/common/SafeText";
import type { MessageDTO } from "@/types/inbox";

interface MessageBubbleProps {
  message: MessageDTO;
  onRetry?: (messageId: string) => void;
  onOpenImage?: (url: string) => void;
}

export function MessageBubble({
  message,
  onRetry,
  onOpenImage,
}: MessageBubbleProps) {
  const t = useTranslations("inbox");
  const isOutbound = message.direction === "OUTBOUND";

  const formattedTime = new Date(message.sentAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      className={`flex flex-col ${
        isOutbound ? "items-end" : "items-start"
      } mb-3`}
    >
      <div className="mb-1 flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
        {!isOutbound ? (
          <span className="font-medium text-foreground">
            {message.sentBy?.name ?? t("customer")}
          </span>
        ) : (
          <>
            {message.senderType === "AI" && (
              <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                AI
              </span>
            )}
            {message.senderType === "AUTOMATION" && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {t("automation")}
              </span>
            )}
            {message.senderType === "AGENT" && message.sentBy && (
              <span>{message.sentBy.name}</span>
            )}
            {message.usedHumanAgentTag && (
              <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                {t("humanAgentTagBadge")}
              </span>
            )}
          </>
        )}
        <span>•</span>
        <span>{formattedTime}</span>
      </div>

      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm sm:max-w-[70%] ${
          isOutbound
            ? "rounded-tr-sm bg-primary text-primary-foreground shadow-sm"
            : "rounded-tl-sm border bg-card text-foreground shadow-sm"
        }`}
      >
        {message.attachments && message.attachments.length > 0 && (
          <div className="mb-2 space-y-2">
            {message.attachments.map((att, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-lg bg-black/10 cursor-pointer"
                onClick={() => onOpenImage?.(att.url)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={att.url}
                  alt={att.name ?? "Attachment"}
                  className="max-h-60 w-auto rounded-lg object-cover hover:opacity-90"
                />
              </div>
            ))}
          </div>
        )}

        {message.text && (
          <div className="break-words leading-relaxed whitespace-pre-wrap">
            <SafeText text={message.text} />
          </div>
        )}
      </div>

      {isOutbound && (
        <div className="mt-1 flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
          {message.status === "SENDING" && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock size={12} className="animate-spin" />
              <span>{t("sending")}</span>
            </span>
          )}

          {message.status === "SENT" && (
            <span className="flex items-center gap-1" title={t("sent")}>
              <Check size={13} />
            </span>
          )}

          {message.status === "DELIVERED" && (
            <span className="flex items-center gap-1" title={t("delivered")}>
              <CheckCheck size={13} />
            </span>
          )}

          {message.status === "READ" && (
            <span
              className="flex items-center gap-1 text-sky-500 font-medium"
              title={t("read")}
            >
              <CheckCheck size={13} />
            </span>
          )}

          {message.status === "FAILED" && (
            <div className="flex items-center gap-2 text-destructive">
              <span className="flex items-center gap-1">
                <AlertCircle size={13} />
                <span>{t("failed")}</span>
              </span>
              {onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(message.id)}
                  className="flex items-center gap-1 rounded bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive hover:bg-destructive/20"
                >
                  <RotateCcw size={11} />
                  <span>{t("retry")}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
