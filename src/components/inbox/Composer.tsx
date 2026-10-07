"use client";

import { useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  Send,
  X,
  Loader2,
  FileText,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { useInboxMutations } from "@/hooks/queries/useInbox";
import { uploadsApi } from "@/lib/api/uploads.api";
import { SavedReplyPicker } from "./SavedReplyPicker";
import { SavedReplyDialog } from "./SavedReplyDialog";

interface ComposerProps {
  conversationId: string;
  isWindowClosed?: boolean;
  useHumanAgentTag?: boolean;
}

export function Composer({
  conversationId,
  isWindowClosed = false,
  useHumanAgentTag = false,
}: ComposerProps) {
  const t = useTranslations("inbox");
  const { shopId } = useCurrentShop();
  const mutations = useInboxMutations(conversationId);

  const [text, setText] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [manageRepliesOpen, setManageRepliesOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140,
      )}px`;
    }
  }, [text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (val.length > 2000) return;
    setText(val);

    // Detect shortcut "/" trigger
    if (val.startsWith("/")) {
      setPickerOpen(true);
      setPickerQuery(val.slice(1));
    } else {
      if (pickerOpen) setPickerOpen(false);
    }
  };

  const handleSelectSavedReply = (replyText: string) => {
    setText(replyText);
    setPickerOpen(false);
    textareaRef.current?.focus();
  };

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !shopId) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("imageFilesOnly"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("fileTooLarge"));
      return;
    }

    setIsUploading(true);
    try {
      const result = await uploadsApi.image(shopId, file, "inbox");
      setAttachedImage(result.url);
    } catch {
      toast.error(t("uploadFailed"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    if ((!text.trim() && !attachedImage) || mutations.sendMessage.isPending) {
      return;
    }

    if (isWindowClosed) {
      toast.error(t("windowClosedAlert"));
      return;
    }

    const clientRef = `cr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const currentText = text.trim();
    const currentAttachment = attachedImage;

    setText("");
    setAttachedImage(null);
    setPickerOpen(false);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      await mutations.sendMessage.mutateAsync({
        clientRef,
        text: currentText || undefined,
        attachments: currentAttachment
          ? [{ type: "image", url: currentAttachment }]
          : undefined,
        useHumanAgentTag,
      });
    } catch {
      toast.error(t("sendFailed"));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (pickerOpen) return;
      e.preventDefault();
      void handleSend();
    }
  };

  const disabled = isWindowClosed || mutations.sendMessage.isPending || isUploading;

  return (
    <div className="relative border-t bg-card p-3">
      {pickerOpen && (
        <SavedReplyPicker
          query={pickerQuery}
          onSelect={handleSelectSavedReply}
          onClose={() => setPickerOpen(false)}
          onOpenManage={() => {
            setPickerOpen(false);
            setManageRepliesOpen(true);
          }}
        />
      )}

      {attachedImage && (
        <div className="mb-2 flex items-center gap-2">
          <div className="relative overflow-hidden rounded-lg border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={attachedImage}
              alt="Attached"
              className="size-16 object-cover"
            />
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
              aria-label="Remove image"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2 rounded-xl border bg-background p-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
        <div className="flex items-center gap-1 self-end pb-1 text-muted-foreground">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageFileChange}
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className="grid size-8 place-items-center rounded-lg hover:bg-muted hover:text-foreground disabled:opacity-50"
            title={t("attachImage")}
          >
            {isUploading ? (
              <Loader2 size={16} className="animate-spin text-primary" />
            ) : (
              <ImagePlus size={18} />
            )}
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setPickerOpen((prev) => !prev)}
            className="grid size-8 place-items-center rounded-lg hover:bg-muted hover:text-foreground disabled:opacity-50"
            title={t("savedReplies")}
          >
            <FileText size={18} />
          </button>
        </div>

        <textarea
          ref={textareaRef}
          rows={1}
          disabled={disabled}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder={isWindowClosed ? t("windowClosedNotice") : t("typeMessage")}
          className="max-h-36 flex-1 resize-none bg-transparent py-1.5 text-sm focus:outline-none disabled:opacity-50"
        />

        <div className="flex items-center gap-2 self-end pb-1">
          <span className="text-[11px] font-mono text-muted-foreground">
            {text.length}/2000
          </span>
          <button
            type="button"
            disabled={
              (!text.trim() && !attachedImage) ||
              disabled ||
              mutations.sendMessage.isPending
            }
            onClick={handleSend}
            className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
            aria-label={t("send")}
          >
            {mutations.sendMessage.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
      </div>

      <SavedReplyDialog
        open={manageRepliesOpen}
        onClose={() => setManageRepliesOpen(false)}
      />
    </div>
  );
}
