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
  Sparkles,
  ShoppingCart,
  RefreshCw,
  AlertTriangle,
  Loader2,
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
import { AiOrderExtractDialog } from "./AiOrderExtractDialog";
import type { MessageDTO } from "@/types/inbox";
import { useCurrentShop } from "@/hooks/useCurrentShop";

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
  const { can } = useCurrentShop();
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
  const [extractDialogOpen, setExtractDialogOpen] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const followLatestRef = useRef(true);

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
    if (
      !loadingMessages &&
      bottomAnchorRef.current &&
      followLatestRef.current
    ) {
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
      timeZone: "Asia/Dhaka",
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

  const handleGenerateSummary = async () => {
    if (isSummarizing || mutations.summarizeConversation.isPending) return;
    setIsSummarizing(true);
    try {
      await mutations.summarizeConversation.mutateAsync();
      toast.success(t("summaryGenerated"));
      setMenuOpen(false);
    } catch {
      toast.error(t("summaryFailed"));
    } finally {
      setIsSummarizing(false);
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
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Thread Header */}
      <header className="flex min-h-14 shrink-0 items-center justify-between gap-2 border-b bg-card px-2 py-2 sm:px-4">
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
            <div className="flex min-w-0 flex-wrap items-center gap-1">
              <h2 className="truncate text-sm font-semibold text-foreground">
                {conversation.customer.name ?? t("guestCustomer")}
              </h2>
              <span className="max-w-28 truncate rounded bg-muted px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground">
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
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="hidden lg:block">
            <AssignSelect
              assignedTo={conversation.assignedTo}
              onAssign={handleAssign}
            />
          </div>

          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={!can("inbox.reply")}
            aria-label={
              conversation.status === "OPEN" ? t("resolve") : t("reopen")
            }
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              conversation.status === "OPEN"
                ? "bg-muted text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700"
                : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
            }`}
            title={conversation.status === "OPEN" ? t("resolve") : t("reopen")}
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
                className="absolute right-0 top-full mt-1 w-52 rounded-xl border bg-card p-1.5 shadow-xl z-30 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => {
                    setExtractDialogOpen(true);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-muted"
                >
                  <ShoppingCart size={15} className="text-primary" />
                  <span>{t("extractOrderWithAi")}</span>
                </button>
                <button
                  type="button"
                  onClick={handleGenerateSummary}
                  disabled={
                    isSummarizing || mutations.summarizeConversation.isPending
                  }
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left hover:bg-muted disabled:opacity-50"
                >
                  {isSummarizing ? (
                    <Loader2 size={15} className="animate-spin text-primary" />
                  ) : (
                    <Sparkles size={15} className="text-primary" />
                  )}
                  <span>{t("summarizeWithAi")}</span>
                </button>
                <div className="my-1 border-t" />
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
              aria-label={t("customerDetails")}
              aria-expanded={isCustomerPanelOpen}
            >
              <PanelRight size={17} />
            </button>
          )}
        </div>
      </header>

      {/* Human Review Warning Banner */}
      {conversation.needsHuman && (
        <div className="flex items-center gap-2 border-b border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-900">
          <AlertTriangle size={15} className="shrink-0 text-amber-600" />
          <span className="font-semibold">{t("humanReviewRecommended")}:</span>
          <span className="truncate">
            {conversation.needsHumanReason || t("humanHandoffNotice")}
          </span>
        </div>
      )}

      {/* AI Conversation Summary Card */}
      {conversation.summary && (
        <div className="border-b bg-muted/40 px-4 py-2.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Sparkles size={14} className="text-primary" />
              <span>{t("conversationSummary")}</span>
              {conversation.summaryUpdatedAt && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  •{" "}
                  {new Date(conversation.summaryUpdatedAt).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </span>
              )}
            </div>
            <button
              type="button"
              disabled={
                isSummarizing || mutations.summarizeConversation.isPending
              }
              onClick={handleGenerateSummary}
              className="flex items-center gap-1 text-[11px] text-primary hover:underline disabled:opacity-50"
              title={t("refreshSummary")}
            >
              {isSummarizing ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <RefreshCw size={11} />
              )}
              <span>{t("refreshSummary")}</span>
            </button>
          </div>
          <p className="mt-1 leading-relaxed text-muted-foreground">
            {conversation.summary}
          </p>
        </div>
      )}

      {/* Messages Feed */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-4"
        onScroll={(event) => {
          const container = event.currentTarget;
          followLatestRef.current =
            container.scrollHeight -
              container.scrollTop -
              container.clientHeight <
            100;
        }}
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
      {can("inbox.reply") && (
        <Composer
          conversationId={conversationId}
          conversation={conversation}
          isWindowClosed={isClosed}
          useHumanAgentTag={useHumanAgentTag}
        />
      )}

      {/* Lightbox Modal */}
      <ImageViewerModal
        url={selectedImageUrl}
        onClose={() => setSelectedImageUrl(null)}
      />

      {/* AI Order Extraction Modal */}
      <AiOrderExtractDialog
        open={extractDialogOpen}
        onClose={() => setExtractDialogOpen(false)}
        conversationId={conversationId}
      />
    </div>
  );
}
