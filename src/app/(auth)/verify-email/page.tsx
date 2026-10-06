"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AuthCard } from "@/components/auth/AuthCard";
import { authApi } from "@/lib/api/auth.api";
export default function VerifyEmailPage() {
  const t = useTranslations("step8");
  const token = useSearchParams().get("token") ?? "";
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (token)
      void authApi
        .verifyEmail(token)
        .then(() => setDone(true))
        .catch(() => setDone(false));
  }, [token]);
  return (
    <AuthCard title={t("verifyTitle")}>
      {done ? (
        <div className="rounded-lg bg-success-soft p-4 text-sm">
          {t("verifySuccess")}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      )}
      <Link
        href="/login"
        className="mt-6 block text-center text-sm font-semibold text-primary hover:underline"
      >
        {t("backToLogin")}
      </Link>
    </AuthCard>
  );
}
