"use client";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { uploadsApi } from "@/lib/api/uploads.api";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { LIMITS } from "@/constants/limits";

export function ImageUploader({
  value,
  onChange,
  purpose = "product",
  max = 8,
  onBusyChange,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  purpose?: "product" | "shop_logo";
  max?: number;
  onBusyChange?: (busy: boolean) => void;
}) {
  const t = useTranslations("products");
  const { shopId, can } = useCurrentShop();
  const allowed = can(purpose === "product" ? "product.write" : "shop.manage");
  const input = useRef<HTMLInputElement>(null);
  const uploading = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const upload = async (files: FileList | File[] | null) => {
    if (!files || !shopId || !allowed || uploading.current) return;
    const selected = Array.from(files).slice(
      0,
      Math.max(0, max - value.length),
    );
    if (
      selected.some(
        (file) =>
          file.size > LIMITS.UPLOAD_IMAGE_MAX_BYTES ||
          !LIMITS.UPLOAD_IMAGE_TYPES.includes(file.type as never),
      )
    ) {
      setError(true);
      return;
    }
    uploading.current = true;
    setBusy(true);
    onBusyChange?.(true);
    setError(false);
    try {
      const next = [...value];
      for (const file of selected) {
        next.push((await uploadsApi.image(shopId, file, purpose)).url);
        onChange([...next]);
      }
    } catch {
      setError(true);
    } finally {
      uploading.current = false;
      setBusy(false);
      onBusyChange?.(false);
      if (input.current) input.current.value = "";
    }
  };
  const move = (index: number, direction: number) => {
    const next = [...value];
    [next[index], next[index + direction]] = [
      next[index + direction],
      next[index],
    ];
    onChange(next);
  };
  return (
    <div
      className="space-y-3"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        void upload(event.dataTransfer.files);
      }}
    >
      <div className={max === 1 ? "w-full" : "grid grid-cols-2 gap-3 sm:grid-cols-4"}>
        {value.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className={`relative aspect-square overflow-hidden rounded-xl border bg-muted ${
              max === 1 ? "w-full max-w-[220px]" : ""
            }`}
          >
            <img src={url} alt="" className="size-full object-cover" />
            <button
              type="button"
              disabled={busy || !allowed}
              onClick={() =>
                onChange(value.filter((_, imageIndex) => imageIndex !== index))
              }
              className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-foreground/75 text-background shadow-xs hover:bg-foreground transition-colors"
              aria-label={t("removeImage")}
              title={t("removeImage")}
            >
              <X size={15} />
            </button>
            {allowed && value.length > 1 ? (
              <div className="absolute bottom-1 left-1 flex gap-1">
                <button
                  type="button"
                  disabled={busy || index === 0}
                  aria-label={t("moveImageLeft")}
                  title={t("moveImageLeft")}
                  onClick={() => move(index, -1)}
                  className="grid size-8 place-items-center rounded bg-foreground/70 text-background"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  disabled={busy || index === value.length - 1}
                  aria-label={t("moveImageRight")}
                  title={t("moveImageRight")}
                  onClick={() => move(index, 1)}
                  className="grid size-8 place-items-center rounded bg-foreground/70 text-background"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : null}
          </div>
        ))}
        {allowed && value.length < max ? (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy}
            className={`grid aspect-square place-items-center rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/50 transition-colors ${
              max === 1 ? "w-full max-w-[220px] p-4 gap-2" : ""
            }`}
          >
            <ImagePlus size={max === 1 ? 32 : 22} className={max === 1 ? "text-primary/70" : ""} />
            <span className={max === 1 ? "text-xs font-medium text-foreground" : "text-xs"}>
              {busy ? t("uploading") : t("addImage")}
            </span>
            {max === 1 ? (
              <span className="text-[11px] text-muted-foreground text-center">
                JPG, PNG, WebP (Max 5MB)
              </span>
            ) : null}
          </button>
        ) : null}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(event) => void upload(event.target.files)}
      />
      {error ? <p className="text-sm text-danger">{t("uploadError")}</p> : null}
    </div>
  );
}
