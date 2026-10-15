"use client";

import { useRef, useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

export function DemoVideo({ url, label }: { url: string; label: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const t = useTranslations("landing");
  let videoId: string | null = null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:") {
      if (parsed.hostname === "youtu.be") videoId = parsed.pathname.slice(1);
      else if (["youtube.com", "www.youtube.com"].includes(parsed.hostname)) {
        videoId =
          parsed.searchParams.get("v") ??
          parsed.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1] ??
          null;
      }
    }
  } catch {
    return null;
  }
  if (!videoId || !/^[A-Za-z0-9_-]{11}$/.test(videoId)) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          dialog.current?.showModal();
        }}
        className="inline-flex min-h-12 items-center rounded-lg border bg-card dark:bg-slate-900/80 dark:border-white/15 dark:text-slate-100 dark:hover:bg-slate-800 px-5 font-semibold shadow-xs backdrop-blur-md transition-colors hover:bg-muted"
      >
        {label}
      </button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        aria-label={label}
        className="m-auto w-[calc(100%-2rem)] max-w-4xl rounded-lg border bg-card p-3 text-foreground backdrop:bg-black/60"
      >
        <div className="mb-2 flex justify-end">
          <button
            type="button"
            aria-label={t("closeDemo")}
            title={t("closeDemo")}
            onClick={() => {
              setOpen(false);
              dialog.current?.close();
            }}
            className="inline-flex size-11 items-center justify-center rounded-lg border"
          >
            <X size={20} />
          </button>
        </div>
        {open ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
            title={label}
            className="aspect-video min-h-50 w-full"
            allow="encrypted-media; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : null}
      </dialog>
    </>
  );
}
