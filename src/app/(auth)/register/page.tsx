"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Loader2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Field } from "@/components/common/Field";
import { PasswordField, isPasswordSecure } from "@/components/common/PasswordField";
import { TurnstileWidget } from "@/components/common/TurnstileWidget";
import { authApi } from "@/lib/api/auth.api";
import { ApiClientError } from "@/lib/api/client";
import { useAuthStore } from "@/stores/authStore";
import { BD_DISTRICTS } from "@/constants/districts";
import { BUSINESS_CATEGORIES } from "@/constants/enums";
import { GuestGuard } from "@/components/layout/GuestGuard";

function RegisterForm() {
  const t = useTranslations("step8");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    phone: "",
    websiteUrl: "",
    facebookPageUrl: "",
    businessCategory: "",
    district: "",
    turnstileToken: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    if (!isPasswordSecure(form.password)) {
      setError(t("passwordRule"));
      setBusy(false);
      return;
    }
    try {
      const result = await authApi.register(
        Object.fromEntries(Object.entries(form).filter(([, value]) => value)),
      );
      setAuth(result.accessToken, result.user);
      router.replace("/onboarding");
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
    <AuthCard title={t("registerTitle")} description={t("registerDescription")}>
      {error ? (
        <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 p-3.5 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-400">
          <AlertCircle className="size-4 shrink-0 text-red-500" />
          <p className="font-medium leading-tight">{error}</p>
        </div>
      ) : null}
      <form className="grid gap-4" onSubmit={submit}>
        <Field
          label={t("name")}
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          autoComplete="name"
          required
        />
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
          autoComplete="new-password"
          showStrengthIndicator={true}
          required
        />
        <details className="rounded-lg border p-3">
          <summary className="cursor-pointer text-sm font-semibold">
            {t("optionalBusiness")}
          </summary>
          <div className="mt-4 grid gap-4">
            <Field
              label={t("businessName")}
              value={form.businessName}
              onChange={(event) => update("businessName", event.target.value)}
            />
            <Field
              label={t("phone")}
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
              inputMode="tel"
            />
            <Field
              label={t("website")}
              value={form.websiteUrl}
              onChange={(event) => update("websiteUrl", event.target.value)}
            />
            <Field
              label={t("facebookPage")}
              value={form.facebookPageUrl}
              onChange={(event) =>
                update("facebookPageUrl", event.target.value)
              }
            />
            <label className="grid gap-1.5 text-sm font-medium">
              <span>{t("businessCategory")}</span>
              <select
                className="h-11 rounded-lg border bg-card px-3 text-base"
                value={form.businessCategory}
                onChange={(event) =>
                  update("businessCategory", event.target.value)
                }
              >
                <option value="" />
                {BUSINESS_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {t(`categories.${category}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              <span>{t("district")}</span>
              <select
                className="h-11 rounded-lg border bg-card px-3 text-base"
                value={form.district}
                onChange={(event) => update("district", event.target.value)}
              >
                <option value="" />
                {BD_DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </details>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            required
            className="mt-1 size-4 accent-primary"
          />
          {t("terms")}
        </label>
        <TurnstileWidget onToken={(token) => update("turnstileToken", token)} />
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
            t("signUp")
          )}
        </button>
      </form>
      <p className="mt-6 border-t pt-5 text-center text-sm text-muted-foreground">
        {t("alreadyHaveAccount")}{" "}
        <Link
          href="/login"
          className="font-semibold text-primary hover:underline"
        >
          {t("signIn")}
        </Link>
      </p>
    </AuthCard>
  );
}

export default function RegisterPage() {
  return (
    <GuestGuard>
      <RegisterForm />
    </GuestGuard>
  );
}

