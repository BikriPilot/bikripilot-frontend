"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api/public.api";
import { runtimeConfig } from "@/config/runtime";

const visitorId = () => {
  const key = "bk_visitor";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const value = crypto.randomUUID();
  window.localStorage.setItem(key, value);
  return value;
};

export function VisitTracker() {
  const pathname = usePathname();
  const config = useQuery({
    queryKey: ["public-config"],
    queryFn: publicApi.getConfig,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!pathname || !config.data?.analyticsEnabled) return;
    if (
      navigator.doNotTrack === "1" ||
      /bot|crawler|spider|crawling/i.test(navigator.userAgent)
    )
      return;

    const search = new URLSearchParams(window.location.search);
    const body = {
      path: pathname,
      referrer: document.referrer || undefined,
      utmSource: search.get("utm_source") ?? undefined,
      utmMedium: search.get("utm_medium") ?? undefined,
      utmCampaign: search.get("utm_campaign") ?? undefined,
      visitorId: visitorId(),
    };
    navigator.sendBeacon(
      `${runtimeConfig.apiUrl}/public/visit`,
      new Blob([JSON.stringify(body)], { type: "application/json" }),
    );
  }, [config.data?.analyticsEnabled, pathname]);

  return null;
}
