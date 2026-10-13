"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordField, isPasswordSecure } from "@/components/common/PasswordField";
import { authApi } from "@/lib/api/auth.api";
export default function ResetPasswordPage() {
  const t = useTranslations("step8");
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isPasswordSecure(password)) {
      setError(t("passwordRule"));
      return;
    }
    setError("");
    await authApi.resetPassword({ token, password });
    setDone(true);
  };
  return (
    <AuthCard title={t("resetTitle")} description={t("resetDescription")}>
      {done ? (
        <div className="rounded-lg bg-success-soft p-4 text-sm">
          {t("resetSuccess")}
        </div>
      ) : (
        <form className="grid gap-4" onSubmit={submit}>
          {error ? (
            <p className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <PasswordField
            label={t("password")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            showStrengthIndicator={true}
            required
          />
          <button className="min-h-11 rounded-lg bg-primary px-4 font-semibold text-primary-foreground">
            {t("save")}
          </button>
        </form>
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
