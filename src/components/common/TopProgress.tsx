"use client";

import { useIsFetching, useIsMutating } from "@tanstack/react-query";
export function TopProgress() {
  const active = useIsFetching() + useIsMutating() > 0;
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-primary transition-transform duration-300 ${active ? "scale-x-100" : "scale-x-0"}`}
    />
  );
}
