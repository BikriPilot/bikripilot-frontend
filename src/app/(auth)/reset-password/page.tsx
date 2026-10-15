"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { PasswordField, isPasswordSecure } from "@/components/common/PasswordField";
import { authApi } from "@/lib/api/auth.api";
import { ApiClientError } from "@/lib/api/client";

function ResetPasswordForm() {
  const t = useTranslations("step8");
  const tErrors = useTranslations("errors");
  const token = useSearchParams().get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      setError(t("invalidToken"));
      return;
    }
    if (!isPasswordSecure(password)) {
      setError(t("passwordRule"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setError("");
    setBusy(true);

    try {
      // Backend validates strictly against { token, password }
      await authApi.resetPassword({ token, password });
      setDone(true);
    } catch (cause) {
      if (cause instanceof ApiClientError) {
        try {
          setError(tErrors(cause.code as never));
        } catch {
          setError(cause.message || t("genericError"));
        }
      } else {
        setError(t("genericError"));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title={t("resetTitle")} description={t("resetDescription")}>
      {done ? (
        <div className="space-y-4">
          <div className="rounded-lg bg-success-soft p-4 text-sm text-foreground">
            {t("resetSuccess")}
          </div>
          <Link
            href="/login"
            className="flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t("signIn")}
          </Link>
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
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError("");
            }}
            autoComplete="new-password"
            showStrengthIndicator={true}
            placeholder="••••••••"
            required
          />

          <PasswordField
            label={t("confirmPassword")}
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              if (error) setError("");
            }}
            autoComplete="new-password"
            showStrengthIndicator={false}
            placeholder="••••••••"
            required
          />

          <button
            type="submit"
            disabled={busy}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin text-primary-foreground" />
                <span>{t("saving")}</span>
              </>
            ) : (
              t("save")
            )}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
