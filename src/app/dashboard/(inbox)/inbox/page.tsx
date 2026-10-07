"use client";

import { MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";

export default function InboxPage() {
  const t = useTranslations("inbox");

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-background/50">
      <div className="grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary mb-4 shadow-2xs">
        <MessageSquare size={32} />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">
        {t("selectConversationTitle")}
      </h3>
      <p className="max-w-sm text-xs text-muted-foreground leading-relaxed">
        {t("selectConversationDescription")}
      </p>
    </div>
  );
}
