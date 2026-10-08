"use client";

import { useTranslations } from "next-intl";
import { AdminTable, type AdminColumn } from "@/components/admin/AdminWidgets";
import type { AuditLogDTO } from "@/types/admin";

export function AuditLogTable({ rows }: { rows: AuditLogDTO[] }) {
  const t = useTranslations("admin");
  const columns: AdminColumn<AuditLogDTO>[] = [
    {
      key: "createdAt",
      label: t("columns.created"),
      value: (item) =>
        new Date(item.createdAt).toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
    },
    {
      key: "actor",
      label: t("columns.actor"),
      value: (item) =>
        item.actor
          ? `${item.actor.name} · ${item.actor.email}${item.impersonator ? ` · ${item.impersonator.name}` : ""}`
          : "—",
    },
    {
      key: "action",
      label: t("columns.action"),
      value: (item) => (
        <span className="break-all font-mono text-xs">{item.action}</span>
      ),
    },
    {
      key: "entity",
      label: t("columns.entity"),
      value: (item) =>
        `${item.entityType}${item.entityId ? ` · ${item.entityId}` : ""}`,
    },
    {
      key: "shopId",
      label: t("columns.shopId"),
      value: (item) => item.shopId ?? "—",
    },
    {
      key: "ip",
      label: t("columns.ip"),
      value: (item) => item.ip ?? "—",
    },
    {
      key: "changes",
      label: t("columns.changes"),
      value: (item) => (
        <details className="max-w-xs">
          <summary className="cursor-pointer text-xs text-primary">
            {t("actions.diff")}
          </summary>
          <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-all bg-muted p-2 text-[10px]">
            {JSON.stringify(
              {
                before: item.before,
                after: item.after,
                impersonator: item.impersonator,
              },
              null,
              2,
            )}
          </pre>
        </details>
      ),
    },
  ];

  return (
    <AdminTable
      rows={rows}
      columns={columns}
      empty={t("empty.noAuditLogs")}
      rowKey={(item) => item.id}
    />
  );
}
