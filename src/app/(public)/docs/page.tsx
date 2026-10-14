import { Suspense } from "react";
import type { Metadata } from "next";
import { DocsClient } from "./DocsClient";

export const metadata: Metadata = {
  title: "Documentation & Seller Guide — BikriPilot",
  description:
    "Official BikriPilot documentation. Learn how to connect social channels, configure AI replies, book couriers, reconcile finances, and invite team members with granular roles.",
  keywords: [
    "BikriPilot documentation",
    "social commerce guide",
    "team member roles and permissions",
    "Facebook page automation",
    "courier integration",
    "Hisab Khata",
  ],
};

function DocsFallback() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-20 text-center">
      <div className="inline-block size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="mt-3 text-xs text-muted-foreground">Loading documentation...</p>
    </div>
  );
}

export default function DocsPage() {
  return (
    <Suspense fallback={<DocsFallback />}>
      <DocsClient />
    </Suspense>
  );
}
