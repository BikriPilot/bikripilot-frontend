"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles, Link2, MessageSquareCode } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { RuleList } from "@/components/comments/RuleList";
import { PostLinkManager } from "@/components/comments/PostLinkManager";
import { SavedRepliesTab } from "@/components/comments/SavedRepliesTab";

type AutomationTab = "rules" | "post-links" | "saved-replies";

export default function AutomationPage() {
  const t = useTranslations("comments");
  const [activeTab, setActiveTab] = useState<AutomationTab>("rules");

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title={t("automationTitle")}
        description={t("automationDescription")}
      />

      {/* Tabs navigation */}
      <div className="flex gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("rules")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "rules"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="size-4" />
          <span>{t("tabRules")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("post-links")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "post-links"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Link2 className="size-4" />
          <span>{t("tabPostLinks")}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("saved-replies")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === "saved-replies"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquareCode className="size-4" />
          <span>{t("tabSavedReplies")}</span>
        </button>
      </div>

      {/* Tab contents */}
      <div>
        {activeTab === "rules" && <RuleList />}
        {activeTab === "post-links" && <PostLinkManager />}
        {activeTab === "saved-replies" && <SavedRepliesTab />}
      </div>
    </div>
  );
}
