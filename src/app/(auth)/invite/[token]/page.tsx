"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { AuthCard } from "@/components/auth/AuthCard";
import { ErrorState } from "@/components/common/PageStates";
import { FormSkeleton } from "@/components/common/skeletons";
import { ApiClientError } from "@/lib/api/client";
import { shopsApi } from "@/lib/api/shops.api";
import { useAuthStore } from "@/stores/authStore";

export default function InvitePage() {
  const t = useTranslations("step8");
  const router = useRouter();
  const { token } = useParams<{ token: string }>();
  const user = useAuthStore((state) => state.user);
  const query = useQuery({
    queryKey: ["invite", token],
    queryFn: () => shopsApi.invitePreview(token),
    enabled: Boolean(token),
  });

  if (query.isPending) return <FormSkeleton fields={3} />;
  if (query.isError || !query.data)
    return <ErrorState onRetry={() => void query.refetch()} />;
  const invite = query.data;
  const canAccept = user?.email.toLowerCase() === invite.email.toLowerCase();
  const accept = async () => {
    try {
      await shopsApi.acceptInvite(token);
      router.replace("/dashboard");
    } catch (cause) {
      if (cause instanceof ApiClientError) query.refetch();
    }
  };
  return (
    <AuthCard title={t("inviteTitle")} description={t("inviteDescription")}>
      <div className="rounded-xl border bg-muted/30 p-4 text-sm">
        <p className="font-semibold">{invite.shopName}</p>
        <p className="mt-1 text-muted-foreground">
          {t("inviteRole", { role: invite.role })}
        </p>
        <p className="mt-1 text-muted-foreground">{invite.email}</p>
      </div>
      {canAccept ? (
        <button
          type="button"
          onClick={() => void accept()}
          className="mt-5 min-h-11 w-full rounded-lg bg-primary px-4 font-semibold text-primary-foreground"
        >
          {t("acceptInvite")}
        </button>
      ) : (
        <div className="mt-5 grid gap-3">
          <p className="text-sm text-muted-foreground">
            {user ? t("inviteWrongAccount") : t("inviteSignInFirst")}
          </p>
          <Link
            href={`/login?next=${encodeURIComponent(`/invite/${token}`)}`}
            className="grid min-h-11 place-items-center rounded-lg bg-primary px-4 font-semibold text-primary-foreground"
          >
            {t("signIn")}
          </Link>
          {!user ? (
            <Link
              href={`/register?invite=${encodeURIComponent(token)}`}
              className="grid min-h-11 place-items-center rounded-lg border px-4 font-semibold"
            >
              {t("signUp")}
            </Link>
          ) : null}
        </div>
      )}
    </AuthCard>
  );
}
