'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '@/lib/api/ai.api';
import { useCurrentShop } from '@/hooks/useCurrentShop';
import { queryKeys } from '@/lib/queryKeys';
import type {
  CreateKnowledgeInput,
  KnowledgeType,
  PlaygroundInput,
  UpdateAiSettingsInput,
  UpdateKnowledgeInput,
} from '@/types/ai';

export function useAiSettings() {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: queryKeys.aiSettings(shopId),
    queryFn: () => aiApi.getSettings(shopId!),
    enabled: Boolean(shopId),
  });
}

export function useUpdateAiSettings() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateAiSettingsInput) =>
      aiApi.updateSettings(shopId!, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.aiSettings(shopId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.aiReadiness(shopId),
      });
    },
  });
}

export function useAiReadiness() {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: queryKeys.aiReadiness(shopId),
    queryFn: () => aiApi.getReadiness(shopId!),
    enabled: Boolean(shopId),
  });
}

export function useAiUsage() {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: queryKeys.aiUsage(shopId),
    queryFn: () => aiApi.getUsage(shopId!),
    enabled: Boolean(shopId),
  });
}

export function usePlayground() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PlaygroundInput) =>
      aiApi.playground(shopId!, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.aiUsage(shopId),
      });
    },
  });
}

export function useKnowledge(type?: KnowledgeType) {
  const { shopId } = useCurrentShop();
  return useQuery({
    queryKey: queryKeys.knowledge(shopId, type ?? null),
    queryFn: () => aiApi.listKnowledge(shopId!, type),
    enabled: Boolean(shopId),
  });
}

export function useCreateKnowledge() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateKnowledgeInput) =>
      aiApi.createKnowledge(shopId!, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['knowledge', shopId],
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.aiReadiness(shopId),
      });
    },
  });
}

export function useUpdateKnowledge() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      entryId,
      input,
    }: {
      entryId: string;
      input: UpdateKnowledgeInput;
    }) => aiApi.updateKnowledge(shopId!, entryId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['knowledge', shopId],
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.aiReadiness(shopId),
      });
    },
  });
}

export function useDeleteKnowledge() {
  const { shopId } = useCurrentShop();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: string) => aiApi.deleteKnowledge(shopId!, entryId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['knowledge', shopId],
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.aiReadiness(shopId),
      });
    },
  });
}
