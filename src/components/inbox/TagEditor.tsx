"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface TagEditorProps {
  tags: string[];
  onUpdateTags: (tags: string[]) => void;
  disabled?: boolean;
}

export function TagEditor({
  tags,
  onUpdateTags,
  disabled = false,
}: TagEditorProps) {
  const t = useTranslations("inbox");
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState("");

  const handleAdd = () => {
    const trimmed = newTag.trim();
    if (!trimmed) {
      setIsAdding(false);
      return;
    }
    if (!tags.includes(trimmed)) {
      onUpdateTags([...tags, trimmed]);
    }
    setNewTag("");
    setIsAdding(false);
  };

  const handleRemove = (tagToRemove: string) => {
    onUpdateTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    } else if (e.key === "Escape") {
      setIsAdding(false);
      setNewTag("");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
        >
          <span>{tag}</span>
          {!disabled && (
            <button
              type="button"
              onClick={() => handleRemove(tag)}
              className="text-muted-foreground hover:text-foreground"
              aria-label={`Remove tag ${tag}`}
            >
              <X size={12} />
            </button>
          )}
        </span>
      ))}

      {!disabled &&
        (isAdding ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              autoFocus
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleAdd}
              placeholder={t("tagPlaceholder")}
              className="h-6 w-24 rounded border bg-background px-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex h-6 items-center gap-1 rounded-md border border-dashed px-2 text-xs font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground"
          >
            <Plus size={12} />
            <span>{t("addTag")}</span>
          </button>
        ))}
    </div>
  );
}
