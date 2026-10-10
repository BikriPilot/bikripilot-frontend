"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCurrentShop } from "@/hooks/useCurrentShop";

export function OrderConversationLink({
  conversationId,
}: {
  conversationId?: string | null;
}) {
  const t = useTranslations("orders");
  const { can } = useCurrentShop();
  if (!can("inbox.read")) return null;
  return (
    <Link
      href={
        conversationId
          ? `/dashboard/inbox/${encodeURIComponent(conversationId)}`
          : "/dashboard/inbox"
      }
      aria-label={t("review.conversation")}
      title={t("review.conversation")}
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border hover:bg-muted"
    >
      <MessageCircle size={18} aria-hidden="true" />
    </Link>
  );
}
