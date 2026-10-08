"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import { PageHeader } from "@/components/common/PageHeader";
import { Field } from "@/components/common/Field";
import { ErrorState } from "@/components/common/PageStates";
import { FormSkeleton } from "@/components/common/skeletons";
import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
export default function ProfilePage() {
  const t = useTranslations("step8");
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clear);
  const sessions = useQuery({
    queryKey: ["sessions"],
    queryFn: authApi.sessions,
  });
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [setup, setSetup] = useState<{
    otpauthUrl: string;
    secretBase32: string;
  } | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  if (!user) return <FormSkeleton fields={5} />;
  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const result = await authApi.updateMe({ name, phone: phone || null });
      setUser(result);
      toast.success(t("saved"));
    } catch {
      toast.error(t("genericError"));
    }
  };
  const enable = async () => {
    try {
      const result = await authApi.enableTwoFactor(code);
      setUser(result);
      setSetup(null);
      setCode("");
      toast.success(t("saved"));
    } catch {
      toast.error(t("genericError"));
    }
  };
  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await authApi.changePassword({ currentPassword: password, newPassword });
      setPassword("");
      setNewPassword("");
      toast.success(t("saved"));
    } catch {
      toast.error(t("genericError"));
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("securityTitle")}
        description={t("securityDescription")}
      />
      <form
        onSubmit={saveProfile}
        className="grid max-w-2xl gap-4 rounded-2xl border bg-card p-5 sm:p-7"
      >
        <Field
          label={t("name")}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Field
          label={t("phone")}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          inputMode="tel"
        />
        <Field label={t("email")} value={user.email} readOnly />
        <button className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
          {t("saveChanges")}
        </button>
      </form>
      <section
        className={`max-w-2xl rounded-2xl border bg-card p-5 sm:p-7 ${searchParams.get("setup2fa") === "1" ? "border-primary ring-2 ring-primary/20" : ""}`}
      >
        <h2 className="text-lg font-semibold">{t("twoFactor")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {user.twoFactorEnabled ? t("twoFactorOn") : t("twoFactorOff")}
        </p>
        {!user.twoFactorEnabled && !setup ? (
          <button
            type="button"
            onClick={() =>
              void authApi
                .setupTwoFactor()
                .then(setSetup)
                .catch(() => toast.error(t("genericError")))
            }
            className="mt-5 min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            {t("setupTwoFactor")}
          </button>
        ) : null}
        {setup ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-[160px_1fr]">
            <QRCodeSVG
              value={setup.otpauthUrl}
              size={160}
              className="rounded-lg border p-2"
            />
            <div className="grid gap-3">
              <p className="break-all text-xs text-muted-foreground">
                {setup.secretBase32}
              </p>
              <Field
                label={t("code")}
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
              />
              <button
                type="button"
                onClick={() => void enable()}
                className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
              >
                {t("enableTwoFactor")}
              </button>
            </div>
          </div>
        ) : null}
        {user.twoFactorEnabled ? (
          <div className="mt-5 grid gap-3 border-t pt-5">
            <Field
              label={t("currentPassword")}
              type="password"
              value={disablePassword}
              onChange={(event) => setDisablePassword(event.target.value)}
            />
            <Field
              label={t("code")}
              value={disableCode}
              onChange={(event) =>
                setDisableCode(
                  event.target.value.replace(/\D/g, "").slice(0, 6),
                )
              }
              inputMode="numeric"
            />
            <button
              type="button"
              onClick={() =>
                void authApi
                  .disableTwoFactor({
                    password: disablePassword,
                    code: disableCode,
                  })
                  .then(setUser)
                  .then(() => toast.success(t("saved")))
                  .catch(() => toast.error(t("genericError")))
              }
              className="min-h-11 rounded-lg border border-danger px-4 text-sm font-semibold text-danger"
            >
              {t("disableTwoFactor")}
            </button>
          </div>
        ) : null}
      </section>
      <form
        onSubmit={changePassword}
        className="grid max-w-2xl gap-4 rounded-2xl border bg-card p-5 sm:p-7"
      >
        <h2 className="text-lg font-semibold">{t("changePassword")}</h2>
        <Field
          label={t("currentPassword")}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <Field
          label={t("newPassword")}
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
        />
        <button className="min-h-11 rounded-lg border px-4 text-sm font-semibold">
          {t("saveChanges")}
        </button>
      </form>
      <section className="max-w-2xl rounded-2xl border bg-card p-5 sm:p-7">
        <h2 className="text-lg font-semibold">{t("sessions")}</h2>
        {sessions.isError ? (
          <ErrorState onRetry={() => void sessions.refetch()} />
        ) : (
          <div className="mt-4 divide-y">
            {sessions.data?.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <p>{session.userAgent ?? "Browser"}</p>
                  <p className="text-muted-foreground">
                    {session.ipMasked ?? ""}
                  </p>
                </div>
                {session.current ? (
                  <span className="text-primary">{t("currentSession")}</span>
                ) : null}
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() =>
            void authApi
              .logoutAll()
              .then(() => {
                clearAuth();
                router.replace("/login");
              })
              .catch(() => toast.error(t("genericError")))
          }
          className="mt-4 min-h-11 rounded-lg border border-danger px-4 text-sm font-semibold text-danger"
        >
          {t("logoutAll")}
        </button>
      </section>
    </div>
  );
}
