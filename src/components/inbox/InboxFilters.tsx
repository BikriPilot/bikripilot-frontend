"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ConversationFilter } from "@/types/inbox";

interface InboxFiltersProps {
  activeFilter: ConversationFilter;
  onSelectFilter: (filter: ConversationFilter) => void;
  search: string;
  onSearchChange: (val: string) => void;
}

const FILTERS: ConversationFilter[] = [
  "all",
  "unread",
  "mine",
  "unassigned",
  "needs_human",
  "resolved",
];

export function InboxFilters({
  activeFilter,
  onSelectFilter,
  search,
  onSearchChange,
}: InboxFiltersProps) {
  const t = useTranslations("inbox");

  return (
    <div className="border-b bg-card p-3 space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Filter Chips / Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {FILTERS.map((f) => {
          const isActive = activeFilter === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => onSelectFilter(f)}
              aria-pressed={isActive}
              className={`shrink-0 rounded-full px-3 py-1 font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {t(`filter_${f}`)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
