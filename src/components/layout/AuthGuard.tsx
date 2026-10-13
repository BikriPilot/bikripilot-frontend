"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";
import { PageHeaderSkeleton } from "@/components/common/skeletons";
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isBootstrapping } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("common");
  useEffect(() => {
    if (isBootstrapping || !user || pathname === "/dashboard/profile") return;
    if (
      (user.platformRole === "SUPER_ADMIN" || user.platformRole === "SUPPORT") &&
      !user.impersonation
    ) {
      router.replace("/admin");
      return;
    }
    if (user.twoFactorSetupRequired)
      router.replace("/dashboard/profile?setup2fa=1");
    else if (user.memberships.length === 0) router.replace("/onboarding");
  }, [isBootstrapping, pathname, router, user]);
  if (isBootstrapping || !user)
    return (
      <main className="mx-auto max-w-6xl p-6">
        <PageHeaderSkeleton />
        <p className="mt-6 text-sm text-muted-foreground">{t("loading")}</p>
      </main>
    );
  return <>{children}</>;
}
