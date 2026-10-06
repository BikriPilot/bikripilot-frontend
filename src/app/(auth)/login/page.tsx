"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { AuthCard } from "@/components/auth/AuthCard";
import { Field } from "@/components/common/Field";
import { TurnstileWidget } from "@/components/common/TurnstileWidget";
import { ApiClientError } from "@/lib/api/client";
import { authApi } from "@/lib/api/auth.api";
import { safeRedirect } from "@/lib/safeRedirect";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
  const t = useTranslations("step8");
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
  const messageFor = (cause: unknown) =>
    cause instanceof ApiClientError
      ? t(`errors.${cause.code}` as never)
      : t("genericError");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await authApi.login({ ...form, email: form.email.trim() });
      if ("twoFactorRequired" in result) setChallenge(result.twoFactorToken);
      else {
        setAuth(result.accessToken, result.user);
        router.replace(safeRedirect(params.get("next")));
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
      router.replace(safeRedirect(params.get("next")));
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
        <p
          role="alert"
          className="mb-4 rounded-lg bg-danger-soft p-3 text-sm text-danger"
        >
          {error}
        </p>
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
            disabled={busy}
            className="min-h-11 rounded-lg bg-primary px-4 font-semibold text-primary-foreground"
          >
            {busy ? t("loading") : t("continue")}
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
          <Field
            label={t("password")}
            type="password"
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
            disabled={busy}
            className="min-h-11 rounded-lg bg-primary px-4 font-semibold text-primary-foreground"
          >
            {busy ? t("loading") : t("signIn")}
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
