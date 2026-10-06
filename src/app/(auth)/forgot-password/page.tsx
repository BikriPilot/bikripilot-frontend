"use client";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { AuthCard } from "@/components/auth/AuthCard";
import { Field } from "@/components/common/Field";
import { TurnstileWidget } from "@/components/common/TurnstileWidget";
import { authApi } from "@/lib/api/auth.api";
export default function ForgotPasswordPage() {
  const t = useTranslations("step8");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [sent, setSent] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await authApi.forgotPassword({
      email,
      ...(token ? { turnstileToken: token } : {}),
    });
    setSent(true);
  };
  return (
    <AuthCard title={t("forgotTitle")} description={t("forgotDescription")}>
      {sent ? (
        <div className="rounded-lg bg-success-soft p-4 text-sm">
          {t("resetSuccess")}
        </div>
      ) : (
        <form className="grid gap-4" onSubmit={submit}>
          <Field
            label={t("email")}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <TurnstileWidget onToken={setToken} />
          <button className="min-h-11 rounded-lg bg-primary px-4 font-semibold text-primary-foreground">
            {t("sendReset")}
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
