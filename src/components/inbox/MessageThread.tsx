"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  MoreVertical,
  PanelRight,
  RotateCcw,
  User,
  Bot,
  BotOff,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  useConversation,
  useMessages,
  useInboxMutations,
} from "@/hooks/queries/useInbox";
import { ChatThreadSkeleton } from "@/components/common/skeletons";
import { MessageBubble } from "./MessageBubble";
import { WindowNotice } from "./WindowNotice";
import { Composer } from "./Composer";
import { AssignSelect } from "./AssignSelect";
import { TagEditor } from "./TagEditor";
import { ImageViewerModal } from "./ImageViewerModal";
import type { MessageDTO } from "@/types/inbox";

interface MessageThreadProps {
  conversationId: string;
  onBack?: () => void;
  onToggleCustomerPanel?: () => void;
  isCustomerPanelOpen?: boolean;
}

export function MessageThread({
  conversationId,
  onBack,
  onToggleCustomerPanel,
  isCustomerPanelOpen,
}: MessageThreadProps) {
  const t = useTranslations("inbox");
  const { data: conversation, isLoading: loadingConv } =
    useConversation(conversationId);
  const {
    data: messagesData,
    isLoading: loadingMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(conversationId);

  const mutations = useInboxMutations(conversationId);

  const [useHumanAgentTag, setUseHumanAgentTag] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);

  // Mark as read on mount or when unreadCount > 0
  const unreadCount = conversation?.unreadCount ?? 0;
  const markAsReadMutate = mutations.markAsRead.mutate;
  useEffect(() => {
    if (unreadCount > 0) {
      markAsReadMutate();
    }
  }, [unreadCount, markAsReadMutate]);

  // Scroll to bottom on initial load & new messages
  const latestPageLength = messagesData?.pages?.[0]?.data?.length ?? 0;
  useEffect(() => {
    if (!loadingMessages && bottomAnchorRef.current) {
      bottomAnchorRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [loadingMessages, latestPageLength]);

  // Flatten messages: backend returns newest first, so we reverse for display top-to-bottom
  const rawMessages: MessageDTO[] =
    messagesData?.pages.flatMap((page) => page.data) ?? [];
  const chronologicalMessages = [...rawMessages].reverse();

  // Group messages by date
  const groupedMessages: { date: string; messages: MessageDTO[] }[] = [];
  chronologicalMessages.forEach((msg) => {
    const dateStr = new Date(msg.sentAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateStr, messages: [msg] });
    }
  });

  const handleToggleStatus = async () => {
    if (!conversation) return;
    const nextStatus = conversation.status === "OPEN" ? "RESOLVED" : "OPEN";
    try {
      await mutations.updateConversation.mutateAsync({ status: nextStatus });
      toast.success(
        nextStatus === "RESOLVED" ? t("resolvedToast") : t("reopenedToast"),
      );
    } catch {
      toast.error(t("statusChangeFailed"));
    }
  };

  const handleToggleAiDisabled = async () => {
    if (!conversation) return;
    try {
      await mutations.updateConversation.mutateAsync({
        aiDisabled: !conversation.aiDisabled,
      });
      toast.success(
        conversation.aiDisabled ? t("aiEnabledToast") : t("aiDisabledToast"),
      );
      setMenuOpen(false);
    } catch {
      toast.error(t("updateFailed"));
    }
  };

  const handleAssign = (userId: string | null) => {
    void mutations.updateConversation.mutateAsync({ assignedToId: userId });
  };

  const handleUpdateTags = (tags: string[]) => {
    void mutations.updateConversation.mutateAsync({ tags });
  };

  const handleRetryMessage = (messageId: string) => {
    void mutations.retryMessage.mutate(messageId);
  };

  if (loadingConv && !conversation) {
    return (
      <div className="flex h-full flex-col bg-background p-6">
        <ChatThreadSkeleton />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
        {t("conversationNotFound")}
      </div>
    );
  }

  const windowState = conversation.window;
  const isClosed =
    !windowState.isOpen &&
    (!windowState.humanAgentTagAllowed || !useHumanAgentTag);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Thread Header */}
      <header className="flex min-h-14 items-center justify-between border-b bg-card px-4 py-2">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted md:hidden"
              aria-label={t("back")}
            >
              <ArrowLeft size={19} />
            </button>
          )}

          <div className="relative shrink-0">
            {conversation.customer.profilePicUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={conversation.customer.profilePicUrl}
                alt={conversation.customer.name ?? "Customer"}
                className="size-10 rounded-full object-cover border"
              />
            ) : (
              <div className="grid size-10 place-items-center rounded-full bg-primary-soft text-primary font-semibold text-sm">
                {conversation.customer.name?.charAt(0).toUpperCase() ?? (
                  <User size={18} />
                )}
              </div>
            )}
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-sm font-semibold text-foreground">
                {conversation.customer.name ?? t("guestCustomer")}
              </h2>
              <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground">
                {conversation.channel.name}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <TagEditor
                tags={conversation.tags}
                onUpdateTags={handleUpdateTags}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions Right */}
        <div className="flex items-center gap-1.5">
          <div className="hidden lg:block">
            <AssignSelect
              assignedTo={conversation.assignedTo}
              onAssign={handleAssign}
            />
          </div>

          <button
            type="button"
            onClick={handleToggleStatus}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              conversation.status === "OPEN"
                ? "bg-muted text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700"
                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
            }`}
            title={
              conversation.status === "OPEN" ? t("resolve") : t("reopen")
            }
          >
            {conversation.status === "OPEN" ? (
              <>
                <CheckCircle2 size={14} />
                <span className="hidden sm:inline">{t("resolve")}</span>
              </>
            ) : (
              <>
                <RotateCcw size={14} />
                <span className="hidden sm:inline">{t("reopen")}</span>
              </>
            )}
          </button>

          {/* Options Dropdown Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
              aria-label={t("moreOptions")}
            >
              <MoreVertical size={17} />
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-48 rounded-xl border bg-card p-1.5 shadow-xl z-30 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={handleToggleAiDisabled}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-muted"
                >
                  {conversation.aiDisabled ? (
                    <>
                      <Bot size={15} className="text-emerald-600" />
                      <span>{t("enableAiForChat")}</span>
                    </>
                  ) : (
                    <>
                      <BotOff size={15} className="text-amber-600" />
                      <span>{t("disableAiForChat")}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {onToggleCustomerPanel && (
            <button
              type="button"
              onClick={onToggleCustomerPanel}
              className={`grid size-9 place-items-center rounded-lg border transition-colors ${
                isCustomerPanelOpen
                  ? "bg-primary-soft text-primary border-primary/30"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              title={t("customerDetails")}
            >
              <PanelRight size={17} />
            </button>
          )}
        </div>
      </header>

      {/* Messages Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onClick={() => menuOpen && setMenuOpen(false)}
      >
        {hasNextPage && (
          <div className="text-center py-2">
            <button
              type="button"
              disabled={isFetchingNextPage}
              onClick={() => void fetchNextPage()}
              className="rounded-lg border bg-card px-3 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-50"
            >
              {isFetchingNextPage ? t("loading") : t("loadOlderMessages")}
            </button>
          </div>
        )}

        {loadingMessages ? (
          <ChatThreadSkeleton />
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date} className="space-y-3">
              <div className="flex items-center justify-center">
                <span className="rounded-full bg-muted/80 px-3 py-0.5 text-[11px] font-medium text-muted-foreground shadow-2xs">
                  {group.date}
                </span>
              </div>

              {group.messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onRetry={handleRetryMessage}
                  onOpenImage={(url) => setSelectedImageUrl(url)}
                />
              ))}
            </div>
          ))
        )}

        <div ref={bottomAnchorRef} />
      </div>

      {/* 24-hour Messaging Window Notice */}
      <WindowNotice
        window={windowState}
        useHumanAgentTag={useHumanAgentTag}
        onToggleHumanAgentTag={setUseHumanAgentTag}
      />

      {/* Composer */}
      <Composer
        conversationId={conversationId}
        isWindowClosed={isClosed}
        useHumanAgentTag={useHumanAgentTag}
      />

      {/* Lightbox Modal */}
      <ImageViewerModal
        url={selectedImageUrl}
        onClose={() => setSelectedImageUrl(null)}
      />
    </div>
  );
}
