"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import {
  CheckCircle2,
  Maximize2,
  Play,
  RotateCcw,
  ShieldCheck,
  Star,
  Volume2,
  X,
  Sparkles,
} from "lucide-react";

export function HeroVideoCard({ url }: { url?: string | null }) {
  const isBn = useLocale() === "bn";
  const [isPlaying, setIsPlaying] = useState(false);

  // Extract YouTube ID or fallback to high-quality demo video
  let videoId = "dQw4w9WgXcQ"; // Default fallback demo
  if (url) {
    try {
      const parsed = new URL(url);
      if (parsed.protocol === "https:") {
        if (parsed.hostname === "youtu.be") {
          videoId = parsed.pathname.slice(1);
        } else if (["youtube.com", "www.youtube.com"].includes(parsed.hostname)) {
          videoId =
            parsed.searchParams.get("v") ??
            parsed.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1] ??
            videoId;
        }
      }
    } catch {
      // Keep default videoId
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-xl">
      {/* Background ambient glow effect */}
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-primary/15 blur-3xl" />

      {/* Main Video Frame */}
      <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-slate-950 shadow-2xl transition-all hover:border-primary/50 hover:shadow-primary/10">
        {isPlaying ? (
          <div className="relative aspect-video w-full bg-black">
            {/* Top Close Control */}
            <div className="absolute top-2.5 right-2.5 z-20">
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                className="inline-flex size-8 items-center justify-center rounded-full bg-black/75 text-white/90 backdrop-blur-md transition-colors hover:bg-black hover:text-white"
                title="Close video preview"
              >
                <X className="size-4" />
              </button>
            </div>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title="BikriPilot Product Tour"
              className="size-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="relative aspect-video w-full select-none">
            {/* Video Thumbnail / Poster Image */}
            <Image
              src="/images/hero-video-poster.jpg"
              alt="BikriPilot Video Tour"
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-102"
            />

            {/* Gradient Overlays for high contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/50" />

            {/* Top Badge: "Meet BikriPilot AI" (styled like Image 1) */}
            <div className="absolute top-3.5 right-3.5 z-10">
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/60 px-3 py-1.5 backdrop-blur-md">
                <span className="text-[11px] font-semibold text-white/90">
                  {isBn ? "নতুন" : "Meet New"}
                </span>
                <span className="rounded-md bg-primary px-1.5 py-0.5 text-[11px] font-black text-white">
                  BikriPilot
                </span>
              </div>
            </div>

            {/* Floating Feature Pills (matching Image 1) */}
            <div className="absolute bottom-13 right-3.5 z-10 hidden flex-wrap justify-end gap-1.5 sm:flex max-w-[280px]">
              {(isBn
                ? ["AI ইনবক্স", "অটো অর্ডার", "কুরিয়ার সিঙ্ক", "ফ্রড গার্ড"]
                : ["AI Inbox", "Auto Orders", "Courier Sync", "Fraud Shield"]
              ).map((pill) => (
                <span
                  key={pill}
                  className="rounded-lg border border-white/15 bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-md shadow-xs"
                >
                  {pill}
                </span>
              ))}
            </div>

            {/* Center Play Button with ripple effect */}
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              aria-label="Play product video"
              className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-primary/95 text-primary-foreground shadow-2xl transition-all duration-300 hover:scale-110 hover:bg-primary active:scale-95 group-hover:shadow-primary/50"
            >
              <div className="absolute -inset-2 animate-ping rounded-full bg-primary/30 opacity-75" />
              <Play className="size-7 fill-current translate-x-0.5" />
            </button>

            {/* Bottom Video Controls Bar (matching Image 1 layout) */}
            <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-white/10 bg-black/70 px-4 py-2.5 backdrop-blur-md">
              <div className="flex items-center gap-3 text-white/80">
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="transition-colors hover:text-white"
                  title="Play video"
                >
                  <Play className="size-4 fill-current" />
                </button>
                <span className="font-mono text-[11px] font-medium text-white/90">
                  0:00 / 2:15
                </span>
              </div>

              {/* Center Scrub Line Simulation */}
              <div className="mx-4 hidden h-1 flex-1 rounded-full bg-white/20 sm:block overflow-hidden">
                <div className="h-full w-1/3 bg-primary rounded-full" />
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-3 text-white/80">
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white/90">
                  1x
                </span>
                <Volume2 className="size-3.5 cursor-pointer hover:text-white" />
                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="transition-colors hover:text-white"
                  title="Watch full size"
                >
                  <Maximize2 className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trust & Star Rating Card (matching Image 1 directly below the video) */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/90 px-4 py-3 shadow-xs backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {/* G2 / Star Rating */}
          <div className="flex -space-x-0.5 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="size-4 fill-amber-400" />
            ))}
          </div>
          <span className="text-xs font-bold text-foreground">
            {isBn ? "৪.৯/৫ স্টার রেটিং" : "4.9/5 Rating"}
          </span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {isBn ? "· ২,৫০০+ দেশীয় সেলার" : "· 2,500+ BD Sellers"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-600" />
          <span>{isBn ? "মেটা ভেরিফায়েড টেক পার্টনার" : "Meta Verified Tech Partner"}</span>
        </div>
      </div>
    </div>
  );
}
