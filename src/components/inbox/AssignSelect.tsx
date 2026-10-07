"use client";

import { useQuery } from "@tanstack/react-query";
import { UserCheck, UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { shopsApi } from "@/lib/api/shops.api";
import type { UserRef } from "@/types/inbox";

interface AssignSelectProps {
  assignedTo: UserRef | null;
  onAssign: (userId: string | null) => void;
  disabled?: boolean;
}

export function AssignSelect({
  assignedTo,
  onAssign,
  disabled = false,
}: AssignSelectProps) {
  const t = useTranslations("inbox");
  const { shopId, can } = useCurrentShop();
  const canAssign = can("inbox.assign");

  const { data: members = [] } = useQuery({
    queryKey: ["members", shopId],
    queryFn: () => shopsApi.members(shopId!),
    enabled: Boolean(shopId && canAssign),
  });

  if (!canAssign) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
        {assignedTo ? (
          <>
            <UserCheck size={13} className="text-primary" />
            <span className="font-medium text-foreground">{assignedTo.name}</span>
          </>
        ) : (
          <>
            <UserX size={13} />
            <span>{t("unassigned")}</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        value={assignedTo?.id ?? ""}
        disabled={disabled}
        onChange={(e) => onAssign(e.target.value ? e.target.value : null)}
        className="h-8 rounded-lg border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
      >
        <option value="">{t("unassigned")}</option>
        {members.map((m) => (
          <option key={m.userId} value={m.userId}>
            {m.name} ({m.role})
          </option>
        ))}
      </select>
    </div>
  );
}
