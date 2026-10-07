"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/common/PageHeader";
import { CommentList } from "@/components/comments/CommentList";

export default function CommentsPage() {
  const t = useTranslations("comments");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
      />
      <CommentList />
    </div>
  );
}
