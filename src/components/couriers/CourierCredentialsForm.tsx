"use client";

import { useTranslations } from "next-intl";
import { Field } from "@/components/common/Field";
import type { CourierProvider } from "@/types/courier";
import { CredentialSecurityNotice } from "@/components/common/CredentialSecurityNotice";

interface CourierCredentialsFormProps {
  provider: CourierProvider;
  credentials: Record<string, string>;
  settings: Record<string, unknown>;
  onCredentialsChange: (creds: Record<string, string>) => void;
  onSettingsChange: (settings: Record<string, unknown>) => void;
  isEditing?: boolean;
}

export function CourierCredentialsForm({
  provider,
  credentials,
  settings,
  onCredentialsChange,
  onSettingsChange,
  isEditing = false,
}: CourierCredentialsFormProps) {
  const t = useTranslations("couriers.form");

  const updateCred = (key: string, value: string) => {
    onCredentialsChange({ ...credentials, [key]: value });
  };

  const updateSetting = (key: string, value: unknown) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  if (provider === "STEADFAST") {
    return (
      <div className="space-y-4">
        <CredentialSecurityNotice provider="courier" />
        {isEditing && (
          <p className="text-xs text-muted-foreground">
            {t("leaveEmptyToKeep")}
          </p>
        )}
        <Field
          label={t("steadfastApiKey")}
          placeholder={isEditing ? "••••••••" : "api_key_xxxxxxxx"}
          value={credentials.apiKey || ""}
          onChange={(e) => updateCred("apiKey", e.target.value)}
          type="password"
          required={!isEditing}
        />
        <Field
          label={t("steadfastSecretKey")}
          placeholder={isEditing ? "••••••••" : "secret_key_xxxxxxxx"}
          value={credentials.secretKey || ""}
          onChange={(e) => updateCred("secretKey", e.target.value)}
          type="password"
          required={!isEditing}
        />
      </div>
    );
  }

  if (provider === "PATHAO") {
    return (
      <div className="space-y-4">
        <CredentialSecurityNotice provider="courier" />
        {isEditing && (
          <p className="text-xs text-muted-foreground">
            {t("leaveEmptyToKeep")}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t("pathaoClientId")}
            placeholder={isEditing ? "••••••••" : "Client ID"}
            value={credentials.clientId || ""}
            onChange={(e) => updateCred("clientId", e.target.value)}
            required={!isEditing}
          />
          <Field
            label={t("pathaoClientSecret")}
            placeholder={isEditing ? "••••••••" : "Client Secret"}
            value={credentials.clientSecret || ""}
            onChange={(e) => updateCred("clientSecret", e.target.value)}
            type="password"
            required={!isEditing}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t("pathaoUsername")}
            placeholder={isEditing ? "••••••••" : "user@example.com"}
            value={credentials.username || ""}
            onChange={(e) => updateCred("username", e.target.value)}
            required={!isEditing}
          />
          <Field
            label={t("pathaoPassword")}
            placeholder={isEditing ? "••••••••" : "••••••••"}
            value={credentials.password || ""}
            onChange={(e) => updateCred("password", e.target.value)}
            type="password"
            required={!isEditing}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t("pathaoStoreId")}
            placeholder="e.g. 12345 (optional)"
            type="number"
            value={(settings.storeId as number) || ""}
            onChange={(e) =>
              updateSetting(
                "storeId",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
          <Field
            label={t("defaultWeightKg")}
            placeholder="0.5"
            type="number"
            step="0.1"
            value={(settings.defaultWeightKg as number) || ""}
            onChange={(e) =>
              updateSetting(
                "defaultWeightKg",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
          />
        </div>
      </div>
    );
  }

  if (provider === "REDX") {
    return (
      <div className="space-y-4">
        <CredentialSecurityNotice provider="courier" />
        {isEditing && (
          <p className="text-xs text-muted-foreground">
            {t("leaveEmptyToKeep")}
          </p>
        )}
        <Field
          label={t("redxAccessToken")}
          placeholder={isEditing ? "••••••••" : "RedX OpenAPI Token"}
          value={credentials.accessToken || ""}
          onChange={(e) => updateCred("accessToken", e.target.value)}
          type="password"
          required={!isEditing}
        />
        <Field
          label={t("redxPickupStoreId")}
          placeholder="Store ID (optional)"
          type="number"
          value={(settings.pickupStoreId as number) || ""}
          onChange={(e) =>
            updateSetting(
              "pickupStoreId",
              e.target.value ? Number(e.target.value) : undefined,
            )
          }
        />
      </div>
    );
  }

  return null;
}
