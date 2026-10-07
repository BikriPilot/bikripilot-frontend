"use client";

import { useState } from "react";
import {
  Plus,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle2,
  MessageSquare,
  Bot,
  PhoneCall,
  Power,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  useCommentRules,
  useUpdateCommentRule,
  useDeleteCommentRule,
} from "@/hooks/queries/useComments";
import { RuleFormDialog } from "./RuleFormDialog";
import { CardListSkeleton } from "@/components/common/skeletons/Skeletons";
import type { CommentRuleDTO } from "@/types/comment";

export function RuleList() {
  const t = useTranslations("comments");
  const { data: rules = [], isLoading, isError } = useCommentRules();
  const updateMutation = useUpdateCommentRule();
  const deleteMutation = useDeleteCommentRule();

  const [selectedRule, setSelectedRule] = useState<CommentRuleDTO | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleToggleActive = async (rule: CommentRuleDTO) => {
    try {
      await updateMutation.mutateAsync({
        ruleId: rule.id,
        body: { isActive: !rule.isActive },
      });
      toast.success(t("successRuleSaved"));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to toggle rule state";
      toast.error(msg);
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!window.confirm(t("deleteRuleConfirm"))) return;
    try {
      await deleteMutation.mutateAsync(ruleId);
      toast.success(t("successRuleDeleted"));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete rule";
      toast.error(msg);
    }
  };

  const handleCreate = () => {
    setSelectedRule(null);
    setDialogOpen(true);
  };

  const handleEdit = (rule: CommentRuleDTO) => {
    setSelectedRule(rule);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Header action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {t("tabRules")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("automationDescription")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
        >
          <Plus className="size-4" />
          <span>{t("createRule")}</span>
        </button>
      </div>

      {isLoading ? (
        <CardListSkeleton rows={3} />
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Failed to load comment rules.
        </div>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <div className="mb-3 rounded-full bg-primary/10 p-4 text-primary">
            <Sparkles className="size-8" />
          </div>
          <h3 className="text-base font-semibold">{t("emptyRules")}</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {t("emptyRulesDesc")}
          </p>
          <button
            type="button"
            onClick={handleCreate}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            <Plus className="size-4" />
            <span>{t("createRule")}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`rounded-2xl border p-4 transition-all ${
                rule.isActive
                  ? "border-border bg-card shadow-xs"
                  : "border-muted bg-muted/30 opacity-70"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                {/* Rule info */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {rule.name}
                    </span>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
                      Priority: {rule.priority}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        rule.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-zinc-500/10 text-zinc-500"
                      }`}
                    >
                      <Power className="size-3" />
                      {rule.isActive ? t("ruleActive") : t("ruleInactive")}
                    </span>
                  </div>

                  {/* Keywords */}
                  {rule.keywords.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground">
                        {t("keywords")}:
                      </span>
                      {rule.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions summary */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                    {rule.publicReplyTexts.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="size-3.5 text-primary" />
                        {rule.publicReplyTexts.length} public template(s)
                      </span>
                    )}
                    {rule.privateReplyText && (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="size-3.5 text-purple-500" />
                        Private reply active
                      </span>
                    )}
                    {rule.useAiPrivateReply && (
                      <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400">
                        <Bot className="size-3.5" />
                        AI private reply
                      </span>
                    )}
                    {rule.hideIfPhoneNumber && (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <PhoneCall className="size-3.5" />
                        Hide if phone
                      </span>
                    )}
                  </div>
                </div>

                {/* Control buttons */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(rule)}
                    disabled={updateMutation.isPending}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      rule.isActive
                        ? "border-input bg-background hover:bg-muted text-foreground"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                    }`}
                  >
                    {rule.isActive ? "Pause" : "Enable"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(rule)}
                    className="rounded-lg border border-input bg-background p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    title={t("editRule")}
                  >
                    <Edit2 className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(rule.id)}
                    disabled={deleteMutation.isPending}
                    className="rounded-lg border border-destructive/20 bg-background p-1.5 text-destructive hover:bg-destructive/10 transition-colors"
                    title={t("deleteRule")}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RuleFormDialog
        rule={selectedRule}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
