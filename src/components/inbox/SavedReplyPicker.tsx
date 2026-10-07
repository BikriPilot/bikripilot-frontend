"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSavedReplies } from "@/hooks/queries/useInbox";
import type { SavedReplyDTO } from "@/types/inbox";

interface SavedReplyPickerProps {
  query?: string;
  onSelect: (text: string) => void;
  onClose: () => void;
  onOpenManage: () => void;
}

export function SavedReplyPicker({
  query = "",
  onSelect,
  onClose,
  onOpenManage,
}: SavedReplyPickerProps) {
  const t = useTranslations("inbox");
  const [prevQuery, setPrevQuery] = useState(query);
  const [search, setSearch] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setSearch(query);
  }

  const { data: savedReplies = [], isLoading } = useSavedReplies(search);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevRepliesLength, setPrevRepliesLength] = useState(savedReplies.length);
  if (savedReplies.length !== prevRepliesLength) {
    setPrevRepliesLength(savedReplies.length);
    setSelectedIndex(0);
  }
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < savedReplies.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : savedReplies.length - 1,
        );
      } else if (e.key === "Enter") {
        if (savedReplies[selectedIndex]) {
          e.preventDefault();
          onSelect(savedReplies[selectedIndex].text);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onSelect, savedReplies, selectedIndex]);

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full left-0 mb-2 w-full max-w-md overflow-hidden rounded-xl border bg-card shadow-xl z-30"
    >
      <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2">
        <div className="flex items-center gap-2 flex-1">
          <Search size={14} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchSavedReplies")}
            className="w-full bg-transparent text-xs focus:outline-none"
            autoFocus
          />
        </div>
        <button
          type="button"
          onClick={onOpenManage}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          title={t("manageSavedReplies")}
        >
          <Settings2 size={13} />
          <span>{t("manage")}</span>
        </button>
      </div>

      <div className="max-h-60 overflow-y-auto divide-y">
        {isLoading ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            {t("loading")}...
          </div>
        ) : savedReplies.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            {t("noSavedReplies")}
          </div>
        ) : (
          savedReplies.map((reply: SavedReplyDTO, index: number) => (
            <button
              key={reply.id}
              type="button"
              onClick={() => onSelect(reply.text)}
              className={`w-full text-left p-3 text-xs transition-colors ${
                index === selectedIndex
                  ? "bg-primary-soft text-primary"
                  : "hover:bg-muted/50 text-foreground"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">{reply.title}</span>
                {reply.shortcut && (
                  <span className="font-mono text-[10px] rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                    {reply.shortcut}
                  </span>
                )}
              </div>
              <p className="line-clamp-2 text-muted-foreground">{reply.text}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
