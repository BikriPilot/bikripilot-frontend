"use client";

import { useState } from "react";
import { Search, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useComments } from "@/hooks/queries/useComments";
import { CommentItem } from "./CommentItem";
import { channelsApi } from "@/lib/api/channels.api";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { queryKeys } from "@/lib/queryKeys";
import { CardListSkeleton } from "@/components/common/skeletons/Skeletons";
import type { CommentActionStatus } from "@/types/comment";

export function CommentList() {
  const t = useTranslations("comments");
  const { shopId } = useCurrentShop();

  const [search, setSearch] = useState("");
  const [channelId, setChannelId] = useState<string>("");
  const [status, setStatus] = useState<CommentActionStatus | "">("");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Channels for filter
  const { data: channels = [] } = useQuery({
    queryKey: queryKeys.channels(shopId),
    queryFn: () => channelsApi.list(shopId!),
    enabled: Boolean(shopId),
  });

  const queryParams = {
    page,
    limit,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(channelId ? { channelId } : {}),
    ...(status ? { status } : {}),
  };

  const { data, isLoading, isError } = useComments(queryParams);

  const comments = data?.data ?? [];
  const meta = data?.meta;

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleChannelChange = (val: string) => {
    setChannelId(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val as CommentActionStatus | "");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Channel dropdown */}
          <select
            value={channelId}
            onChange={(e) => handleChannelChange(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="">{t("filterAll")} ({t("filterChannel")})</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status dropdown */}
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-hidden"
          >
            <option value="">{t("filterAll")} ({t("filterStatus")})</option>
            <option value="DONE">{t("status.DONE")}</option>
            <option value="PENDING">{t("status.PENDING")}</option>
            <option value="SKIPPED">{t("status.SKIPPED")}</option>
            <option value="FAILED">{t("status.FAILED")}</option>
            <option value="NONE">{t("status.NONE")}</option>
          </select>
        </div>
      </div>

      {/* Main comments list */}
      {isLoading ? (
        <CardListSkeleton rows={5} />
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Failed to load comments. Please try again.
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <div className="mb-3 rounded-full bg-primary/10 p-4 text-primary">
            <MessageSquare className="size-8" />
          </div>
          <h3 className="text-base font-semibold">{t("emptyComments")}</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {t("emptyCommentsDesc")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
          <span>
            Page {meta.page} of {meta.totalPages} ({meta.total} comments)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={!meta.hasPrev}
              className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-3 py-1.5 font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-3.5" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={!meta.hasNext}
              className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-3 py-1.5 font-medium hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
