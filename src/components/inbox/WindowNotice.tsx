"use client";

import { AlertCircle, AlertTriangle, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import type { WindowStateDTO } from "@/types/inbox";

interface WindowNoticeProps {
  window: WindowStateDTO;
  useHumanAgentTag: boolean;
  onToggleHumanAgentTag: (val: boolean) => void;
}

export function WindowNotice({
  window,
  useHumanAgentTag,
  onToggleHumanAgentTag,
}: WindowNoticeProps) {
  const t = useTranslations("inbox");

  if (window.isOpen) {
    return (
      <div className="flex items-center gap-2 border-b bg-emerald-50/60 px-4 py-2 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
        <Clock size={14} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>{t("windowOpenNotice")}</span>
      </div>
    );
  }

  if (window.humanAgentTagAllowed) {
    return (
      <div className="space-y-2 border-b bg-amber-50/80 px-4 py-2.5 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        <div className="flex items-start gap-2">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <p className="font-medium">{t("windowClosedNotice")}</p>
            <p className="text-amber-800 dark:text-amber-300">{t("humanAgentTagNotice")}</p>
          </div>
        </div>
        <label className="ml-6 flex cursor-pointer items-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={useHumanAgentTag}
            onChange={(e) => onToggleHumanAgentTag(e.target.checked)}
            className="size-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
          />
          <span>{t("useHumanAgentTag")}</span>
        </label>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 border-b bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
      <AlertCircle size={15} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-medium">{t("windowClosedNotice")}</p>
        <p className="text-muted-foreground">{t("windowClosedAlert")}</p>
      </div>
    </div>
  );
}
