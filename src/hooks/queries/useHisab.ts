"use client";
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCurrentShop } from "@/hooks/useCurrentShop";
import { hisabApi } from "@/lib/api/hisab.api";
import type { PartyKind } from "@/types/hisab";
import { queryKeys } from "@/lib/queryKeys";
export function useHisab(
  filters: Record<string, string | number | boolean | undefined> = {},
) {
  const { shopId, can } = useCurrentShop();
  const enabled = Boolean(shopId && can("hisab.read"));
  const client = useQueryClient();
  const summary = useQuery({
    queryKey: ["hisab", shopId, "summary"],
    queryFn: () => hisabApi.summary(shopId!),
    enabled,
  });
  const parties = useQuery({
    queryKey: [...queryKeys.hisab(shopId!), "parties", filters],
    queryFn: () =>
      hisabApi.parties(shopId!, {
        archived: false,
        page: 1,
        limit: 20,
        sort: "lastEntry",
        order: "desc",
        ...filters,
      }),
    enabled,
    placeholderData: keepPreviousData,
  });
  const accounts = useQuery({
    queryKey: ["hisab", shopId, "accounts"],
    queryFn: () => hisabApi.accounts(shopId!),
    enabled,
  });
  const addParty = useMutation({
    mutationFn: (body: {
      kind: PartyKind;
      name: string;
      phone?: string;
      address?: string;
      openingBalancePaisa?: number;
      openingDate?: string;
    }) => hisabApi.createParty(shopId!, body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: queryKeys.hisab(shopId!) });
    },
  });
  const addEntry = useMutation({
    mutationFn: ({
      partyId,
      body,
    }: {
      partyId: string;
      body: Record<string, unknown>;
    }) => hisabApi.createEntry(shopId!, partyId, body),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["hisab", shopId] });
    },
  });
  return { shopId, summary, parties, accounts, addParty, addEntry };
}
export function usePartyLedger(partyId: string | undefined) {
  const { shopId } = useCurrentShop();
  return useInfiniteQuery({
    queryKey: [...queryKeys.hisab(shopId!), "entries", partyId],
    queryFn: ({ pageParam }) =>
      hisabApi.entries(shopId!, partyId!, { page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
    enabled: Boolean(shopId && partyId),
  });
}
export function usePartyStatement(
  partyId: string | undefined,
  range: { from?: string; to?: string } = {},
) {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: [...queryKeys.hisab(shopId!), "statement", partyId, range],
    queryFn: () => hisabApi.statement(shopId!, partyId!, range),
    enabled: Boolean(shopId && partyId),
  });
}
