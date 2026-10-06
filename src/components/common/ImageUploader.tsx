"use client";
import { useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { uploadsApi } from "@/lib/api/uploads.api";
import { useCurrentShop } from "@/hooks/useCurrentShop";

export function ImageUploader({
  value,
  onChange,
  purpose = "product",
  max = 8,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  purpose?: "product" | "shop_logo";
  max?: number;
}) {
  const t = useTranslations("products");
  const { shopId } = useCurrentShop();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const upload = async (files: FileList | null) => {
    if (!files || !shopId) return;
    setBusy(true);
    setError(false);
    try {
      const next = [...value];
      for (const file of Array.from(files).slice(0, max - next.length)) {
        next.push((await uploadsApi.image(shopId, file, purpose)).url);
      }
      onChange(next);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {value.map((url) => (
          <div key={url} className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
            <img src={url} alt="" className="size-full object-cover" />
            <button type="button" onClick={() => onChange(value.filter((item) => item !== url))} className="absolute right-1 top-1 grid size-8 place-items-center rounded-full bg-foreground/70 text-background" aria-label={t("removeImage")}>
              <X size={15} />
            </button>
          </div>
        ))}
        {value.length < max ? (
          <button type="button" onClick={() => input.current?.click()} disabled={busy} className="grid aspect-square place-items-center rounded-xl border border-dashed text-muted-foreground hover:bg-muted">
            <ImagePlus size={22} />
            <span className="text-xs">{busy ? t("uploading") : t("addImage")}</span>
          </button>
        ) : null}
      </div>
      <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(event) => void upload(event.target.files)} />
      {error ? <p className="text-sm text-danger">{t("uploadError")}</p> : null}
    </div>
  );
}
