"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { hisabApi } from "@/lib/api/hisab.api";
import { shopsApi } from "@/lib/api/shops.api";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { useEntitlements } from "@/hooks/useEntitlements";
import type { PartyDTO } from "@/types/hisab";
import { HisabDialog } from "./PartyForm";
import { formatDateTime } from "@/lib/date";
export function TagadaDialog({
  party,
  onClose,
}: {
  party: PartyDTO;
  onClose: () => void;
}) {
  const t = useTranslations("hisab");
  const { shopId, shop } = useCurrentShop();
  const client = useQueryClient();
  const entitlement = useEntitlements();
  const quota = entitlement.useLimit("sms_per_month");
  const [channel, setChannel] = useState<"SMS" | "WHATSAPP_LINK">(
    "WHATSAPP_LINK",
  );
  const [message, setMessage] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [url, setUrl] = useState<string>();
  const currentParty = useQuery({
    queryKey: ["hisab", shopId, "reminder-party", party.id],
    queryFn: () => hisabApi.party(shopId!, party.id),
    enabled: Boolean(shopId),
    staleTime: 0,
  });
  const history = useQuery({
    queryKey: ["hisab", shopId, "reminders", party.id],
    queryFn: () => hisabApi.reminderHistory(shopId!, party.id),
    enabled: Boolean(shopId),
  });
  const settings = useQuery({
    queryKey: ["settings", shopId],
    queryFn: () => shopsApi.settings(shopId!),
    enabled: Boolean(shopId),
  });
  const template =
    settings.data?.tagadaTemplate ??
    "প্রিয় {name}, {shopName}-এ আপনার বাকি ৳{amount}। অনুগ্রহ করে পরিশোধ করুন। ধন্যবাদ।";
  const preview = template
    .replace(/\{name\}/g, currentParty.data?.name ?? party.name)
    .replace(
      /\{amount\}/g,
      String((currentParty.data?.balancePaisa ?? party.balancePaisa) / 100),
    )
    .replace(/\{shopName\}/g, shop?.shopName ?? "")
    .replace(/\{shopPhone\}|\{footer\}/g, "");
  return (
    <HisabDialog title={t("reminder")} onClose={onClose} busy={busy}>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError(false);
          const popup =
            channel === "WHATSAPP_LINK"
              ? window.open("about:blank", "_blank")
              : null;
          if (popup) popup.opener = null;
          try {
            const result = await hisabApi.reminders(shopId!, party.id, {
              channel,
              ...(message !== undefined ? { message } : {}),
            });
            if (result.status === "FAILED") throw new Error("SMS failed");
            if (result.whatsappUrl) {
              setUrl(result.whatsappUrl);
              if (popup) popup.location.href = result.whatsappUrl;
            }
            await history.refetch();
            await client.invalidateQueries({
              queryKey: ["entitlements", shopId],
            });
          } catch {
            popup?.close();
            setError(true);
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="block">
          {t("message")}
          <textarea
            value={message ?? preview}
            maxLength={1000}
            onChange={(event) => setMessage(event.target.value)}
            className="mt-1 min-h-32 w-full rounded border bg-card p-3 text-base"
          />
        </label>
        <div className="flex flex-wrap gap-3">
          {(["WHATSAPP_LINK", "SMS"] as const).map((value) => (
            <label key={value} className="flex min-h-11 items-center gap-2">
              <input
                type="radio"
                name="channel"
                checked={channel === value}
                disabled={
                  value === "SMS" &&
                  (!entitlement.useFeature("sms_per_month") ||
                    quota.remaining === 0)
                }
                onChange={() => setChannel(value)}
              />
              {value === "SMS" ? t("sms") : t("whatsapp")}
            </label>
          ))}
        </div>
        <p className="text-sm">
          {t("remainingSms")}:{" "}
          {quota.unlimited ? t("unlimited") : (quota.remaining ?? 0)}
        </p>
        {error && (
          <p role="alert" className="text-danger">
            {t("saveError")}
          </p>
        )}
        <button
          disabled={
            busy ||
            currentParty.isFetching ||
            currentParty.isError ||
            !(message ?? preview).trim()
          }
          className="min-h-11 w-full rounded bg-primary text-primary-foreground"
        >
          {busy ? t("saving") : t("send")}
        </button>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block py-3 text-primary"
          >
            {t("whatsapp")}
          </a>
        )}
        <h3 className="border-t pt-4 font-semibold">{t("history")}</h3>
        {history.isError && (
          <button type="button" onClick={() => void history.refetch()}>
            {t("retry")}
          </button>
        )}
        {history.data?.data.map((reminder) => (
          <div key={reminder.id} className="border-b py-2 text-sm">
            <p>{reminder.message}</p>
            <p className="text-muted-foreground">
              {t(`reminderStatus.${reminder.status}`)} ·{" "}
              {formatDateTime(reminder.createdAt)}
            </p>
          </div>
        ))}
      </form>
    </HisabDialog>
  );
}
