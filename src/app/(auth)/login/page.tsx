"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Loader2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Field } from "@/components/common/Field";
import { PasswordField } from "@/components/common/PasswordField";
import { TurnstileWidget } from "@/components/common/TurnstileWidget";
import { ApiClientError } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth.api";
import { getAuthenticatedRedirect } from "@/lib/safeRedirect";
import { useAuthStore } from "@/stores/authStore";
import { GuestGuard } from "@/components/layout/GuestGuard";

function LoginForm() {
  const t = useTranslations("step8");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [form, setForm] = useState({
    email: "",
    password: "",
    turnstileToken: "",
  });
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const messageFor = (cause: unknown) => {
    if (cause instanceof ApiClientError) {
      try {
        return tErrors(cause.code as never);
      } catch {
        return cause.message || t("genericError");
      }
    }
    return t("genericError");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await authApi.login({
        email: form.email.trim(),
        password: form.password,
        ...(form.turnstileToken ? { turnstileToken: form.turnstileToken } : {}),
      });
      if ("twoFactorRequired" in result) setChallenge(result.twoFactorToken);
      else {
        setAuth(result.accessToken, result.user);
        const destination = getAuthenticatedRedirect(
          params.get("next"),
          result.user.platformRole,
          Boolean(result.user.memberships?.length),
        );
        router.replace(destination);
      }
    } catch (cause) {
      setError(messageFor(cause));
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await authApi.verifyTwoFactor({
        twoFactorToken: challenge,
        code,
      });
      setAuth(result.accessToken, result.user);
      const destination = getAuthenticatedRedirect(
        params.get("next"),
        result.user.platformRole,
        Boolean(result.user.memberships?.length),
      );
      router.replace(destination);
    } catch (cause) {
      setError(messageFor(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title={challenge ? t("twoFactorTitle") : t("loginTitle")}
      description={
        challenge ? t("twoFactorDescription") : t("loginDescription")
      }
    >
      {error ? (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-400"
        >
          <AlertCircle className="size-4 shrink-0 text-red-500" />
          <p className="font-medium leading-tight">{error}</p>
        </div>
      ) : null}
      {challenge ? (
        <form className="grid gap-4" onSubmit={verify}>
          <Field
            label={t("code")}
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            inputMode="numeric"
            autoComplete="one-time-code"
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
                <span>{t("loading")}...</span>
              </>
            ) : (
              t("continue")
            )}
          </button>
          <button
            type="button"
            onClick={() => setChallenge("")}
            className="text-sm text-muted-foreground underline"
          >
            {t("backToLogin")}
          </button>
        </form>
      ) : (
        <form className="grid gap-4" onSubmit={submit}>
          <Field
            label={t("email")}
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            autoComplete="email"
            required
          />
          <PasswordField
            label={t("password")}
            value={form.password}
            onChange={(event) => update("password", event.target.value)}
            autoComplete="current-password"
            required
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary underline"
            >
              {t("forgotPassword")}
            </Link>
          </div>
          <TurnstileWidget
            onToken={(token) => update("turnstileToken", token)}
          />
          <button
            type="submit"
            disabled={busy}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin text-primary-foreground" />
                <span>{t("loading")}...</span>
              </>
            ) : (
              t("signIn")
            )}
          </button>
        </form>
      )}
      {!challenge ? (
        <p className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">
          {t("needAccount")}{" "}
          <Link
            href="/register"
            className="font-semibold text-primary underline"
          >
            {t("createAccount")}
          </Link>
        </p>
      ) : null}
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <GuestGuard>
      <LoginForm />
    </GuestGuard>
  );
}
