"use client";

import { User, Bot, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ConversationListItemDTO } from "@/types/inbox";

interface ConversationItemProps {
  conversation: ConversationListItemDTO;
  isActive: boolean;
  onSelect: () => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
}: ConversationItemProps) {
  const t = useTranslations("inbox");
  const { customer, channel } = conversation;

  // Format timestamp relative or time
  const date = new Date(conversation.lastMessageAt);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const timeFormatted = isToday
    ? date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-3.5 flex items-start gap-3 border-b transition-colors ${
        isActive
          ? "bg-primary-soft/60 hover:bg-primary-soft/80"
          : "hover:bg-muted/40 bg-card"
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {customer.profilePicUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={customer.profilePicUrl}
            alt={customer.name ?? "Customer"}
            className="size-11 rounded-full object-cover border"
          />
        ) : (
          <div className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
            {customer.name?.charAt(0).toUpperCase() ?? <User size={18} />}
          </div>
        )}

        {conversation.unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-xs">
            {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
          </span>
        )}
      </div>

      {/* Info & Preview */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-1">
          <span
            className={`truncate text-sm font-semibold ${
              conversation.unreadCount > 0 ? "text-foreground" : "text-foreground/90"
            }`}
          >
            {customer.name ?? t("guestCustomer")}
          </span>
          <span className="text-[11px] text-muted-foreground shrink-0 font-medium">
            {timeFormatted}
          </span>
        </div>

        <p
          className={`line-clamp-1 text-xs ${
            conversation.unreadCount > 0
              ? "font-medium text-foreground"
              : "text-muted-foreground"
          }`}
        >
          {conversation.lastMessagePreview ?? t("noMessages")}
        </p>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground">
            {channel.name}
          </span>

          {conversation.needsHuman && (
            <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <AlertTriangle size={10} />
              <span>{t("needsHuman")}</span>
            </span>
          )}

          {conversation.aiPaused && (
            <span className="inline-flex items-center gap-1 rounded bg-purple-100 px-1.5 py-0.2 text-[10px] font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <Bot size={10} />
              <span>{t("aiPaused")}</span>
            </span>
          )}

          {conversation.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded bg-muted/80 px-1.5 py-0.2 text-[10px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}

          {conversation.assignedTo && (
            <span className="ml-auto text-[10px] text-muted-foreground font-medium truncate max-w-[80px]">
              {conversation.assignedTo.name}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
