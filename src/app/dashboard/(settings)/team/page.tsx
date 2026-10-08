"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/common/PageHeader";
import { Field } from "@/components/common/Field";
import { ErrorState, EmptyState } from "@/components/common/PageStates";
import { TableSkeleton } from "@/components/common/skeletons";
import { shopsApi } from "@/lib/api/shops.api";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import type { ShopRole } from "@/types/auth";
import { toast } from "sonner";
import { ASSIGNABLE_ROLES_BY } from "@/constants/permissions";
import { Trash2, X } from "lucide-react";
export default function TeamPage() {
  const t = useTranslations("step8");
  const { shopId, can, role: actorRole } = useCurrentShop();
  const roleText = useTranslations("admin.roles");
  const assignableRoles =
    actorRole === "OWNER" || actorRole === "MANAGER"
      ? ASSIGNABLE_ROLES_BY[actorRole]
      : [];
  const members = useQuery({
    queryKey: ["members", shopId],
    queryFn: () => shopsApi.members(shopId!),
    enabled: Boolean(shopId),
  });
  const invites = useQuery({
    queryKey: ["invitations", shopId],
    queryFn: () => shopsApi.invitations(shopId!),
    enabled: Boolean(shopId),
  });
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ShopRole>("AGENT");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [removal, setRemoval] = useState<{ id: string; name: string } | null>(
    null,
  );
  const updateRole = async (memberId: string, nextRole: string) => {
    setBusy(true);
    try {
      await shopsApi.updateMember(shopId!, memberId, nextRole);
      await members.refetch();
      toast.success(t("saved"));
    } catch {
      toast.error(t("genericError"));
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!removal) return;
    setBusy(true);
    try {
      await shopsApi.removeMember(shopId!, removal.id);
      setRemoval(null);
      await members.refetch();
      toast.success(t("saved"));
    } catch {
      toast.error(t("genericError"));
    } finally {
      setBusy(false);
    }
  };
  if (members.isPending || invites.isPending)
    return <TableSkeleton rows={5} cols={4} />;
  if (members.isError || invites.isError)
    return (
      <ErrorState
        onRetry={() => {
          void members.refetch();
          void invites.refetch();
        }}
      />
    );
  const invite = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      await shopsApi.invite(shopId!, { email, role });
      setEmail("");
      setOpen(false);
      toast.success(t("saved"));
      await invites.refetch();
    } catch {
      toast.error(t("genericError"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title={t("teamTitle")}
        description={t("teamDescription")}
        action={
          can("team.manage") ? (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              {t("inviteMember")}
            </button>
          ) : null
        }
      />
      {open ? (
        <form
          onSubmit={invite}
          className="grid max-w-xl gap-4 rounded-2xl border bg-primary-soft p-5"
        >
          <Field
            label={t("inviteEmail")}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label className="grid gap-1.5 text-sm font-medium">
            <span>{t("role")}</span>
            <select
              className="h-11 rounded-lg border bg-card px-3"
              value={role}
              onChange={(event) => setRole(event.target.value as ShopRole)}
            >
              {assignableRoles.map((item) => (
                <option key={item} value={item}>
                  {roleText(item)}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <button
              disabled={busy}
              className="min-h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              {t("invite")}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="min-h-11 rounded-lg border px-4 text-sm"
            >
              {t("close")}
            </button>
          </div>
        </form>
      ) : null}
      <section className="overflow-hidden rounded-2xl border bg-card">
        <h2 className="border-b p-5 font-semibold">{t("members")}</h2>
        {members.data?.length ? (
          <div className="divide-y">
            {members.data.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {member.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {can("team.manage") &&
                  member.role !== "OWNER" &&
                  !(actorRole === "MANAGER" && member.role === "MANAGER") ? (
                    <>
                      <select
                        aria-label={`${t("role")}: ${member.name}`}
                        value={member.role}
                        disabled={busy}
                        onChange={(event) =>
                          void updateRole(member.id, event.target.value)
                        }
                        className="h-11 rounded-lg border bg-background px-2 text-sm"
                      >
                        {assignableRoles.map((item) => (
                          <option key={item} value={item}>
                            {roleText(item)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        aria-label={t("removeMember")}
                        disabled={busy}
                        onClick={() =>
                          setRemoval({ id: member.id, name: member.name })
                        }
                        className="grid size-11 place-items-center rounded-lg text-danger hover:bg-danger-soft"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {roleText(member.role)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4">
            <EmptyState title={t("noNotifications")} />
          </div>
        )}
      </section>
      {invites.data?.length ? (
        <section className="overflow-hidden rounded-2xl border bg-card">
          <h2 className="border-b p-5 font-semibold">{t("pendingInvites")}</h2>
          <div className="divide-y">
            {invites.data.map((inviteItem) => (
              <div
                key={inviteItem.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <span>{inviteItem.email}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {roleText(inviteItem.role)}
                  </span>
                  {can("team.manage") && inviteItem.status === "PENDING" ? (
                    <button
                      type="button"
                      aria-label={t("revokeInvite")}
                      disabled={busy}
                      onClick={() => {
                        setBusy(true);
                        void shopsApi
                          .revokeInvitation(shopId!, inviteItem.id)
                          .then(() => invites.refetch())
                          .catch(() => toast.error(t("genericError")))
                          .finally(() => setBusy(false));
                      }}
                      className="grid size-11 place-items-center rounded-lg hover:bg-muted"
                    >
                      <X size={18} />
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {removal ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t("removeMember")}
        >
          <div className="w-full max-w-md rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">{t("removeMember")}</h2>
            <p className="mt-2 text-sm">
              {t("confirmRemoveMember", { name: removal.name })}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setRemoval(null)}
                className="min-h-11 rounded-lg border px-4"
              >
                {t("close")}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void remove()}
                className="min-h-11 rounded-lg bg-danger px-4 text-primary-foreground"
              >
                {t("removeMember")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
