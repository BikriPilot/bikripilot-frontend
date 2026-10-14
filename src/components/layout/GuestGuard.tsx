"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getAuthenticatedRedirect } from "@/lib/safeRedirect";
import { FormSkeleton } from "@/components/common/skeletons";

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, isBootstrapping } = useAuth(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isBootstrapping && user) {
      const target = getAuthenticatedRedirect(
        searchParams.get("next"),
        user.platformRole,
        Boolean(user.memberships?.length),
      );
      router.replace(target);
    }
  }, [isBootstrapping, user, router, searchParams]);

  if (isBootstrapping || user) {
    return (
      <section className="relative rounded-2xl border border-border/80 bg-card/92 p-5 shadow-2xl backdrop-blur-xl sm:p-8 dark:border-white/10 dark:bg-card/85">
        <div className="space-y-4 py-2">
          <div className="skeleton-shimmer h-7 w-48 rounded-md" />
          <div className="skeleton-shimmer h-4 w-72 rounded-md" />
          <div className="pt-4">
            <FormSkeleton fields={3} />
          </div>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
