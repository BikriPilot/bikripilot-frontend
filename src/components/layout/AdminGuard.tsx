"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import { PageHeaderSkeleton } from "@/components/common/skeletons";
import { useAuth } from "@/hooks/useAuth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isBootstrapping } = useAuth();
  const router = useRouter();
  const t = useTranslations("admin");
  const isAdmin =
    user?.platformRole === "SUPPORT" || user?.platformRole === "SUPER_ADMIN";

  useEffect(() => {
    if (!isBootstrapping && user && !isAdmin) router.replace("/dashboard");
  }, [isAdmin, isBootstrapping, router, user]);

  if (isBootstrapping || !user) {
    return (
      <main className="mx-auto max-w-6xl space-y-5 p-6">
        <PageHeaderSkeleton />
        <div className="h-48 animate-pulse rounded-md border bg-muted" />
      </main>
    );
  }

  if (!isAdmin) return null;

  if (user.twoFactorSetupRequired) {
    return (
      <main className="mx-auto grid min-h-[70vh] max-w-lg place-items-center p-5">
        <section className="w-full border-l-4 border-warning bg-card p-6 shadow-sm">
          <ShieldCheck className="mb-4 text-warning" size={28} />
          <h1 className="text-xl font-semibold">
            {t("twoFactorRequired.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("twoFactorRequired.description")}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              className="inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
              href="/dashboard/profile?setup2fa=1"
            >
              {t("twoFactorRequired.action")}
            </Link>
            {user.memberships.length > 0 && (
              <Link
                className="inline-flex min-h-11 items-center rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-muted"
                href="/dashboard"
              >
                {t("backToShop", { fallback: "Go to seller dashboard" })}
              </Link>
            )}
          </div>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
