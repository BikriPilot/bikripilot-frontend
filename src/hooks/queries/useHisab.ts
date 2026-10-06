"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { hisabApi } from "@/lib/api/hisab.api";
import type { PartyKind } from "@/types/hisab";
export function useHisab() {
  const { shopId } = useCurrentShop();
  const client = useQueryClient();
  const summary = useQuery({ queryKey: ["hisab", shopId, "summary"], queryFn: () => hisabApi.summary(shopId!), enabled: Boolean(shopId) });
  const parties = useQuery({ queryKey: ["hisab", shopId, "parties"], queryFn: () => hisabApi.parties(shopId!, { archived: false, page: 1, limit: 100, sort: "balance", order: "desc" }), enabled: Boolean(shopId) });
  const accounts = useQuery({ queryKey: ["hisab", shopId, "accounts"], queryFn: () => hisabApi.accounts(shopId!), enabled: Boolean(shopId) });
  const addParty = useMutation({ mutationFn: (body: { kind: PartyKind; name: string; phone?: string; openingBalancePaisa?: number }) => hisabApi.createParty(shopId!, body), onSuccess: () => { void client.invalidateQueries({ queryKey: ["hisab", shopId] }); } });
  const addEntry = useMutation({ mutationFn: ({ partyId, body }: { partyId: string; body: Record<string, unknown> }) => hisabApi.createEntry(shopId!, partyId, body), onSuccess: () => { void client.invalidateQueries({ queryKey: ["hisab", shopId] }); } });
  return { shopId, summary, parties, accounts, addParty, addEntry };
}
export function usePartyLedger(partyId: string | undefined) {
  const { shopId } = useCurrentShop();
  return useQuery({ queryKey: ["hisab", shopId, "entries", partyId], queryFn: () => hisabApi.entries(shopId!, partyId!), enabled: Boolean(shopId && partyId) });
}
export function usePartyStatement(partyId: string | undefined) {
  const { shopId } = useCurrentShop();
  return useQuery({ queryKey: ["hisab", shopId, "statement", partyId], queryFn: () => hisabApi.statement(shopId!, partyId!), enabled: Boolean(shopId && partyId) });
}
