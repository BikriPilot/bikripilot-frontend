"use client";

import { useState } from "react";
import { MessageSquareOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useConversations } from "@/hooks/queries/useInbox";
import { CardListSkeleton } from "@/components/common/skeletons";
import { InboxFilters } from "./InboxFilters";
import { ConversationItem } from "./ConversationItem";
import type { ConversationFilter, ConversationListItemDTO } from "@/types/inbox";

interface ConversationListProps {
  activeId?: string | null;
  onSelectConversation: (id: string) => void;
}

export function ConversationList({
  activeId,
  onSelectConversation,
}: ConversationListProps) {
  const t = useTranslations("inbox");
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const [search, setSearch] = useState("");

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useConversations({
    filter,
    search: search.trim() || undefined,
  });

  const allConversations: ConversationListItemDTO[] =
    data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="flex h-full flex-col bg-card border-r">
      {/* Header and Filters */}
      <InboxFilters
        activeFilter={filter}
        onSelectFilter={setFilter}
        search={search}
        onSearchChange={setSearch}
      />

      {/* List Container */}
      <div className="flex-1 overflow-y-auto divide-y">
        {isLoading ? (
          <div className="p-4">
            <CardListSkeleton rows={6} />
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-destructive">
            {t("loadConversationsFailed")}
          </div>
        ) : allConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-2">
            <MessageSquareOff size={32} className="opacity-40" />
            <p className="text-xs">{t("noConversationsFound")}</p>
          </div>
        ) : (
          <>
            {allConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={conv.id === activeId}
                onSelect={() => onSelectConversation(conv.id)}
              />
            ))}

            {hasNextPage && (
              <div className="p-3 text-center">
                <button
                  type="button"
                  disabled={isFetchingNextPage}
                  onClick={() => void fetchNextPage()}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-50"
                >
                  {isFetchingNextPage ? t("loading") : t("loadMore")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
