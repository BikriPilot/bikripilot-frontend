"use client";

import { useState } from "react";
import { X, Plus, Trash2, Sparkles, PhoneCall, Bot } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  useCreateCommentRule,
  useUpdateCommentRule,
} from "@/hooks/queries/useComments";
import { channelsApi } from "@/lib/api/channels.api";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { queryKeys } from "@/lib/queryKeys";
import type { CommentRuleDTO } from "@/types/comment";
import type { ChannelDTO } from "@/types/channel";

interface RuleFormDialogProps {
  rule?: CommentRuleDTO | null;
  open: boolean;
  onClose: () => void;
}

const SUGGESTED_KEYWORDS = ["price", "dam", "দাম", "koto", "কত", "details", "inbox"];

function RuleFormModalContent({
  rule,
  channels,
  onClose,
}: {
  rule?: CommentRuleDTO | null;
  channels: ChannelDTO[];
  onClose: () => void;
}) {
  const t = useTranslations("comments");
  const createMutation = useCreateCommentRule();
  const updateMutation = useUpdateCommentRule();

  const isEditing = Boolean(rule);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const [name, setName] = useState(rule?.name ?? "");
  const [channelConnectionId, setChannelConnectionId] = useState(
    rule?.channelConnectionId ?? "",
  );
  const [priority, setPriority] = useState(rule?.priority ?? 10);
  const [isActive, setIsActive] = useState(rule?.isActive ?? true);
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState<string[]>(
    rule?.keywords ?? ["price", "দাম"],
  );
  const [publicReplyTexts, setPublicReplyTexts] = useState<string[]>(
    rule
      ? rule.publicReplyTexts.length > 0
        ? rule.publicReplyTexts
        : [""]
      : ["Hello {name}, price is {price} BDT"],
  );
  const [privateReplyText, setPrivateReplyText] = useState(
    rule
      ? (rule.privateReplyText ?? "")
      : "Hello {name}, please check your inbox for details!",
  );
  const [useAiPrivateReply, setUseAiPrivateReply] = useState(
    rule?.useAiPrivateReply ?? false,
  );
  const [hideIfPhoneNumber, setHideIfPhoneNumber] = useState(
    rule?.hideIfPhoneNumber ?? true,
  );

  const handleAddKeyword = (kw: string) => {
    const trimmed = kw.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords((prev) => [...prev, trimmed]);
    }
    setKeywordInput("");
  };

  const handleRemoveKeyword = (kw: string) => {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  };

  const handleAddPublicVariant = () => {
    setPublicReplyTexts((prev) => [...prev, ""]);
  };

  const handleUpdatePublicVariant = (index: number, val: string) => {
    setPublicReplyTexts((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemovePublicVariant = (index: number) => {
    setPublicReplyTexts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInsertPlaceholder = (
    field: "public" | "private",
    index: number,
    placeholder: string,
  ) => {
    if (field === "public") {
      handleUpdatePublicVariant(index, (publicReplyTexts[index] || "") + placeholder);
    } else {
      setPrivateReplyText((prev) => prev + placeholder);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const filteredPublicReplies = publicReplyTexts
      .map((s) => s.trim())
      .filter(Boolean);

    const hasAction =
      filteredPublicReplies.length > 0 ||
      Boolean(privateReplyText.trim()) ||
      useAiPrivateReply ||
      hideIfPhoneNumber;

    if (!hasAction) {
      toast.error(
        "At least one action is required (public reply, private reply, AI, or hide phone).",
      );
      return;
    }

    const payload = {
      name: name.trim(),
      channelConnectionId: channelConnectionId ? channelConnectionId : null,
      priority: Number(priority) || 0,
      isActive,
      keywords: keywords.map((k) => k.trim()).filter(Boolean),
      publicReplyTexts: filteredPublicReplies,
      privateReplyText: privateReplyText.trim() ? privateReplyText.trim() : null,
      useAiPrivateReply,
      hideIfPhoneNumber,
    };

    try {
      if (isEditing && rule) {
        await updateMutation.mutateAsync({
          ruleId: rule.id,
          body: payload,
        });
        toast.success(t("successRuleSaved"));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t("successRuleSaved"));
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save rule";
      toast.error(msg);
    }
  };

  return (
    <div className="my-8 w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold">
              {isEditing ? t("editRule") : t("createRule")}
            </h2>
            <p className="text-xs text-muted-foreground">
              Automate public and private replies when customers comment.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="size-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-5">
        {/* Rule Name & Active status */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-foreground block mb-1">
              {t("ruleName")} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("ruleNamePlaceholder")}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Status
            </label>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`w-full rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-border bg-muted text-muted-foreground"
              }`}
            >
              {isActive ? t("ruleActive") : t("ruleInactive")}
            </button>
          </div>
        </div>

        {/* Page & Priority */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              {t("channelConnection")}
            </label>
            <select
              value={channelConnectionId}
              onChange={(e) => setChannelConnectionId(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-hidden"
            >
              <option value="">{t("allPages")}</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              {t("priority")} (0 - 1000)
            </label>
            <input
              type="number"
              min={0}
              max={1000}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-hidden"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              {t("priorityHelp")}
            </p>
          </div>
        </div>

        {/* Keywords */}
        <div>
          <label className="text-xs font-medium text-foreground block mb-1">
            {t("keywords")} (Match any)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddKeyword(keywordInput);
                }
              }}
              placeholder={t("keywordsPlaceholder")}
              className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => handleAddKeyword(keywordInput)}
              className="rounded-xl border border-input bg-secondary px-3 py-2 text-sm font-medium hover:bg-secondary/80"
            >
              Add
            </button>
          </div>

          {/* Keyword tags */}
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                >
                  {kw}
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="rounded-full p-0.5 hover:bg-primary/20"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Suggestions */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <span>{t("suggestedKeywords")}</span>
            {SUGGESTED_KEYWORDS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleAddKeyword(s)}
                className="rounded-md bg-muted px-2 py-0.5 text-[11px] hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                +{s}
              </button>
            ))}
          </div>
        </div>

        {/* Public Reply Variants */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-foreground">
              {t("publicReplyVariants")}
            </label>
            <button
              type="button"
              onClick={handleAddPublicVariant}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Plus className="size-3.5" />
              {t("addReplyVariant")}
            </button>
          </div>
          <div className="space-y-2">
            {publicReplyTexts.map((variant, idx) => (
              <div
                key={idx}
                className="space-y-1 rounded-xl border border-border p-2.5 bg-background/50"
              >
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Variant {idx + 1}</span>
                  <div className="flex items-center gap-1">
                    <span>{t("insertPlaceholder")}</span>
                    <button
                      type="button"
                      onClick={() => handleInsertPlaceholder("public", idx, "{name}")}
                      className="rounded bg-muted px-1.5 py-0.5 hover:bg-accent font-mono text-[10px]"
                    >
                      {"{name}"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertPlaceholder("public", idx, "{price}")}
                      className="rounded bg-muted px-1.5 py-0.5 hover:bg-accent font-mono text-[10px]"
                    >
                      {"{price}"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleInsertPlaceholder("public", idx, "{productName}")
                      }
                      className="rounded bg-muted px-1.5 py-0.5 hover:bg-accent font-mono text-[10px]"
                    >
                      {"{productName}"}
                    </button>
                    {publicReplyTexts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePublicVariant(idx)}
                        className="ml-2 text-destructive hover:bg-destructive/10 p-0.5 rounded"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="text"
                  value={variant}
                  onChange={(e) => handleUpdatePublicVariant(idx, e.target.value)}
                  placeholder={t("publicReplyPlaceholder")}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:border-primary focus:outline-hidden"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Private Reply Text */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <label className="text-xs font-medium text-foreground block">
                {t("privateReplyText")}
              </label>
              <span className="text-[11px] text-muted-foreground">
                {t("privateReplyHelp")}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span>{t("insertPlaceholder")}</span>
              <button
                type="button"
                onClick={() => handleInsertPlaceholder("private", 0, "{name}")}
                className="rounded bg-muted px-1.5 py-0.5 hover:bg-accent font-mono text-[10px]"
              >
                {"{name}"}
              </button>
              <button
                type="button"
                onClick={() => handleInsertPlaceholder("private", 0, "{price}")}
                className="rounded bg-muted px-1.5 py-0.5 hover:bg-accent font-mono text-[10px]"
              >
                {"{price}"}
              </button>
              <button
                type="button"
                onClick={() =>
                  handleInsertPlaceholder("private", 0, "{productName}")
                }
                className="rounded bg-muted px-1.5 py-0.5 hover:bg-accent font-mono text-[10px]"
              >
                {"{productName}"}
              </button>
            </div>
          </div>
          <textarea
            value={privateReplyText}
            onChange={(e) => setPrivateReplyText(e.target.value)}
            placeholder="Hi {name}, we have sent you the pricing details in inbox!"
            rows={3}
            className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:border-primary focus:outline-hidden resize-none"
          />
        </div>

        {/* Toggles: Hide if phone & AI private reply */}
        <div className="space-y-3 rounded-xl border border-border p-3.5 bg-muted/20">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hideIfPhoneNumber}
              onChange={(e) => setHideIfPhoneNumber(e.target.checked)}
              className="size-4 rounded text-primary focus:ring-primary/20"
            />
            <div className="flex items-center gap-2">
              <PhoneCall className="size-4 text-amber-500" />
              <span className="text-xs font-medium text-foreground">
                {t("hideIfPhoneNumber")}
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={useAiPrivateReply}
              onChange={(e) => setUseAiPrivateReply(e.target.checked)}
              className="size-4 rounded text-primary focus:ring-primary/20"
            />
            <div className="flex items-center gap-2">
              <Bot className="size-4 text-purple-500" />
              <span className="text-xs font-medium text-foreground">
                {t("useAiPrivateReply")}
              </span>
            </div>
          </label>
        </div>

        {/* Dialog footer */}
        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-input px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? "Saving..." : isEditing ? "Save Changes" : t("createRule")}
          </button>
        </div>
      </form>
    </div>
  );
}

export function RuleFormDialog({
  rule,
  open,
  onClose,
}: RuleFormDialogProps) {
  const { shopId } = useCurrentShop();

  const { data: channels = [] } = useQuery({
    queryKey: queryKeys.channels(shopId),
    queryFn: () => channelsApi.list(shopId!),
    enabled: Boolean(shopId),
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <RuleFormModalContent
        key={rule?.id ?? "new"}
        rule={rule}
        channels={channels}
        onClose={onClose}
      />
    </div>
  );
}
