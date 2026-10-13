"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import {
  ShieldCheck,
  KeyRound,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Field } from "@/components/common/Field";
import {
  PasswordField,
  isPasswordSecure,
} from "@/components/common/PasswordField";
import { ErrorState } from "@/components/common/PageStates";
import { FormSkeleton } from "@/components/common/skeletons";
import { authApi } from "@/lib/api/auth.api";
import { useAuthStore } from "@/stores/authStore";
import { BD_DISTRICTS } from "@/constants/districts";
import { toast } from "sonner";

export default function ProfilePage() {
  const t = useTranslations("step8");
  const tDistricts = useTranslations("districts");
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clear);

  const sessions = useQuery({
    queryKey: ["sessions"],
    queryFn: authApi.sessions,
  });

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [district, setDistrict] = useState(user?.district ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [postalCode, setPostalCode] = useState(user?.postalCode ?? "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  const resendProfileVerification = async () => {
    setResendingEmail(true);
    try {
      await authApi.resendVerification();
      toast.success("Verification email sent! Please check your inbox and spam folder.");
    } catch {
      toast.error(t("genericError"));
    } finally {
      setResendingEmail(false);
    }
  };

  const [setup, setSetup] = useState<{
    otpauthUrl: string;
    secretBase32: string;
  } | null>(null);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [disableOpen, setDisableOpen] = useState(false);
  const [disableCode, setDisableCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [disableBusy, setDisableBusy] = useState(false);

  if (!user) return <FormSkeleton fields={5} />;

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !phone.trim() || !district) {
      toast.error(
        "Please fill in all required fields: Name, Phone, and District.",
      );
      return;
    }
    setProfileSaving(true);
    try {
      const result = await authApi.updateMe({
        name: name.trim(),
        phone: phone.trim() || null,
        district: district || undefined,
        address: address.trim() || null,
        postalCode: postalCode.trim() || null,
      });
      setUser(result);
      toast.success(t("saved"));
    } catch {
      toast.error(t("genericError"));
    } finally {
      setProfileSaving(false);
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

  const disable2fa = async (event: React.FormEvent) => {
    event.preventDefault();
    setDisableBusy(true);
    try {
      const result = await authApi.disableTwoFactor({
        password: disablePassword,
        code: disableCode,
      });
      setUser(result);
      setDisableOpen(false);
      setDisableCode("");
      setDisablePassword("");
      toast.success(t("saved"));
    } catch {
      toast.error(t("genericError"));
    } finally {
      setDisableBusy(false);
    }
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (!isPasswordSecure(newPassword)) {
      setPasswordError(
        "New password must be at least 8 characters and include a letter, a number, and a special character.",
      );
      return;
    }
    setPasswordError("");
    setPasswordSaving(true);
    try {
      await authApi.changePassword({ currentPassword: password, newPassword });
      setPassword("");
      setNewPassword("");
      toast.success(t("saved"));
    } catch {
      toast.error(t("genericError"));
    } finally {
      setPasswordSaving(false);
    }
  };

  const isProfileComplete = Boolean(
    user.name?.trim() && user.phone?.trim() && user.email && user.district,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("securityTitle")}
        description={t("securityDescription")}
      />

      {/* Top Grid: Left (Profile Card) | Right (2FA + Change Password Stacked) */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        {/* Left Column: Personal Information Form (Expanded with address & postal code) */}
        <form
          onSubmit={saveProfile}
          className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6 space-y-5"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <User size={18} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {t("securityTitle")}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Essential seller credentials required for sales channels.
                  </p>
                </div>
              </div>
              {isProfileComplete ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckCircle2 size={12} />
                  <span>Complete</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  <AlertTriangle size={12} />
                  <span>Action Required</span>
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* Row 1: Name & Phone */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label={`${t("name")} *`}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  placeholder="Your full name"
                  required
                />
                <Field
                  label={`${t("phone")} *`}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="01XXXXXXXXX"
                  required
                />
              </div>

              {/* Row 2: Email (with verified status/resend) & District */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">{`${t("email")} *`}</span>
                    {user.emailVerified ? (
                      <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={12} />
                        Verified
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={resendProfileVerification}
                        disabled={resendingEmail}
                        className="shrink-0 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline disabled:opacity-50"
                      >
                        {resendingEmail ? "Sending..." : "Verify email →"}
                      </button>
                    )}
                  </div>
                  <input
                    value={user.email}
                    readOnly
                    autoComplete="email"
                    className="h-11 w-full min-w-0 rounded-lg border bg-muted/50 px-3 text-sm outline-none cursor-not-allowed opacity-90"
                    required
                  />
                </div>
                <label className="grid min-w-0 gap-1.5 text-sm font-medium">
                  <span className="text-foreground">{`${t("district")} *`}</span>
                  <select
                    className="h-11 w-full min-w-0 max-w-full truncate rounded-lg border bg-card px-3 text-sm outline-none focus:border-primary"
                    value={district}
                    onChange={(event) => setDistrict(event.target.value)}
                    required
                  >
                    <option value="">Select district (জেলা নির্বাচন করুন)</option>
                    {BD_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {tDistricts(dist as never)} ({dist})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Row 3: Address & Postal Code (Balanced 50/50 columns, no overflow) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label={`${t("address")} (Optional)`}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Street, area, house details"
                />
                <Field
                  label={`${t("postalCode")} (Optional)`}
                  value={postalCode}
                  onChange={(event) => setPostalCode(event.target.value)}
                  placeholder="1200"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end">
            <button
              type="submit"
              disabled={profileSaving}
              className="min-h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {profileSaving ? t("loading") : t("saveChanges")}
            </button>
          </div>
        </form>

        {/* Right Column: Two-Factor Authentication & Change Password Stacked */}
        <div className="flex flex-col gap-5">
          {/* Two-Factor Authentication Card */}
          <section
            className={`rounded-2xl border bg-card p-5 shadow-xs sm:p-5 space-y-3.5 ${
              searchParams.get("setup2fa") === "1"
                ? "border-primary ring-2 ring-primary/20"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {t("twoFactor")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    TOTP Google Authenticator or Microsoft Authenticator
                  </p>
                </div>
              </div>
              {user.twoFactorEnabled ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-600" />
                  <span>{t("twoFactorOn")}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  <AlertTriangle size={12} />
                  <span>{t("twoFactorOff")}</span>
                </span>
              )}
            </div>

            {!user.twoFactorEnabled && !setup ? (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Protect your business account with two-factor authentication. Each login will require a 6-digit code from your phone.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    void authApi
                      .setupTwoFactor()
                      .then(setSetup)
                      .catch(() => toast.error(t("genericError")))
                  }
                  className="mt-4 min-h-10 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
                >
                  {t("setupTwoFactor")}
                </button>
              </div>
            ) : null}

            {/* 2FA QR Code Setup */}
            {setup ? (
              <div className="mt-3 rounded-xl border bg-muted/20 p-4 space-y-4">
                <div className="grid gap-4 sm:grid-cols-[160px_1fr] items-center">
                  <div className="bg-white p-2 rounded-xl border flex items-center justify-center">
                    <QRCodeSVG value={setup.otpauthUrl} size={144} />
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Scan this QR code with Google Authenticator or enter secret key:
                    </p>
                    <code className="block break-all rounded bg-background p-2 font-mono text-[11px] font-semibold border">
                      {setup.secretBase32}
                    </code>
                    <Field
                      label={t("code")}
                      value={code}
                      onChange={(event) =>
                        setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      inputMode="numeric"
                      placeholder="123456"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setSetup(null)}
                    className="min-h-9 rounded-lg border px-3 text-xs font-semibold hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={code.length !== 6}
                    onClick={() => void enable()}
                    className="min-h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    {t("verifyEmail")}
                  </button>
                </div>
              </div>
            ) : null}

            {/* Disable 2FA Section */}
            {user.twoFactorEnabled && !disableOpen && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setDisableOpen(true)}
                  className="text-xs font-semibold text-danger hover:underline"
                >
                  Disable two-factor authentication
                </button>
              </div>
            )}

            {disableOpen && (
              <form onSubmit={disable2fa} className="rounded-xl border bg-danger-soft/20 p-4 space-y-3">
                <p className="text-xs font-medium text-foreground">
                  Confirm your password and 6-digit authenticator code to disable 2FA:
                </p>
                <PasswordField
                  label={t("password")}
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <Field
                  label={t("code")}
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric"
                  placeholder="123456"
                  required
                />
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setDisableOpen(false)}
                    className="min-h-9 rounded-lg border px-3 text-xs font-semibold hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={disableBusy || disableCode.length !== 6}
                    className="min-h-9 rounded-lg bg-danger px-4 text-xs font-semibold text-white hover:bg-danger/90 disabled:opacity-50"
                  >
                    {disableBusy ? t("loading") : "Disable 2FA"}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Change Password Card */}
          <form
            onSubmit={changePassword}
            className="rounded-2xl border bg-card p-5 shadow-xs sm:p-5 space-y-3.5"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <KeyRound size={16} />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {t("changePassword")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Update your login credentials securely.
                  </p>
                </div>
              </div>

              {passwordError ? (
                <p
                  role="alert"
                  className="rounded-lg bg-danger-soft p-3 text-xs text-danger"
                >
                  {passwordError}
                </p>
              ) : null}

              <PasswordField
                label={t("currentPassword")}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />

              <PasswordField
                label={t("newPassword")}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                showStrengthIndicator={true}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={passwordSaving}
                className="min-h-11 rounded-xl border bg-card px-5 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted disabled:opacity-50"
              >
                {passwordSaving ? t("loading") : t("saveChanges")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Full-Width Section: Active Sessions Card */}
      <section className="rounded-2xl border bg-card p-5 shadow-xs sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Laptop size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {t("activeSessions")}
              </h2>
              <p className="text-xs text-muted-foreground">
                Devices currently signed into this account
              </p>
            </div>
          </div>
        </div>

        {sessions.isPending ? (
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
        ) : sessions.isError ? (
          <ErrorState onRetry={() => void sessions.refetch()} />
        ) : (
          <div className="space-y-3">
            <div className="divide-y rounded-xl border bg-muted/20">
              {sessions.data.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between gap-3 p-3.5 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground truncate max-w-xs">
                      {session.userAgent ?? "Web Browser"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      IP: {session.ipMasked} • {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {session.current ? (
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {t("currentSession")}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() =>
                  void authApi
                    .logoutAll()
                    .then(() => clearAuth())
                    .then(() => toast.success(t("loggedOutAll")))
                    .catch(() => toast.error(t("genericError")))
                }
                className="min-h-10 w-full rounded-xl border border-danger/30 text-xs font-semibold text-danger hover:bg-danger/10 transition-colors"
              >
                {t("logoutAll")}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
