"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useTranslations } from "next-intl";
import { PageHeaderSkeleton } from "@/components/common/skeletons";
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isBootstrapping } = useAuth();
  const router = useRouter();
  const t = useTranslations("common");
  useEffect(() => {
    if (!isBootstrapping && user?.memberships.length === 0)
      router.replace("/onboarding");
    else if (!isBootstrapping && user?.twoFactorSetupRequired)
      router.replace("/dashboard/profile?setup2fa=1");
  }, [isBootstrapping, router, user]);
  if (isBootstrapping || !user)
    return (
      <main className="mx-auto max-w-6xl p-6">
        <PageHeaderSkeleton />
        <p className="mt-6 text-sm text-muted-foreground">{t("loading")}</p>
      </main>
    );
  return <>{children}</>;
}
