"use client";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { Field } from "@/components/common/Field";
import { TurnstileWidget } from "@/components/common/TurnstileWidget";
import { authApi } from "@/lib/api/auth.api";
import { GuestGuard } from "@/components/layout/GuestGuard";

function ForgotPasswordForm() {
  const t = useTranslations("step8");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await authApi.forgotPassword({
        email: email.trim(),
        ...(token ? { turnstileToken: token } : {}),
      });
      setSent(true);
    } catch {
      // Backend returns 200 regardless of whether email exists to prevent user enumeration
      // If client or network error occurs, show generic error or still display confirmation
      setSent(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthCard title={t("forgotTitle")} description={t("forgotDescription")}>
      {sent ? (
        <div className="rounded-lg bg-success-soft p-4 text-sm text-foreground">
          {t("forgotSuccess")}
        </div>
      ) : (
        <form className="grid gap-4" onSubmit={submit}>
          {error ? (
            <p className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <Field
            label={t("email")}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="you@company.com"
            required
          />
          <TurnstileWidget onToken={setToken} />
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
              t("sendReset")
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

export default function ForgotPasswordPage() {
  return (
    <GuestGuard>
      <ForgotPasswordForm />
    </GuestGuard>
  );
}
