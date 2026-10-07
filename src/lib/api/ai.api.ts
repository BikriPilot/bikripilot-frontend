import { api } from './client';
import type {
  AiDraftDTO,
  AiReadinessDTO,
  AiSettingsDTO,
  AiUsageDTO,
  CreateKnowledgeInput,
  KnowledgeEntryDTO,
  KnowledgeType,
  PlaygroundInput,
  UpdateAiSettingsInput,
  UpdateKnowledgeInput,
} from '@/types/ai';

const shopPath = (shopId: string, suffix = '') => `/shops/${shopId}${suffix}`;

export const aiApi = {
  getSettings: (shopId: string) =>
    api
      .get<{ data: AiSettingsDTO }>(shopPath(shopId, '/ai/settings'))
      .then((r) => r.data.data),

  updateSettings: (shopId: string, input: UpdateAiSettingsInput) =>
    api
      .patch<{ data: AiSettingsDTO }>(shopPath(shopId, '/ai/settings'), input)
      .then((r) => r.data.data),

  getReadiness: (shopId: string) =>
    api
      .get<{ data: AiReadinessDTO }>(shopPath(shopId, '/ai/readiness'))
      .then((r) => r.data.data),

  playground: (shopId: string, input: PlaygroundInput) =>
    api
      .post<{ data: AiDraftDTO }>(shopPath(shopId, '/ai/playground'), input)
      .then((r) => r.data.data),

  getUsage: (shopId: string) =>
    api
      .get<{ data: AiUsageDTO }>(shopPath(shopId, '/ai/usage'))
      .then((r) => r.data.data),

  listKnowledge: (shopId: string, type?: KnowledgeType) =>
    api
      .get<{ data: KnowledgeEntryDTO[] }>(shopPath(shopId, '/knowledge'), {
        params: type ? { type } : undefined,
      })
      .then((r) => r.data.data),

  createKnowledge: (shopId: string, input: CreateKnowledgeInput) =>
    api
      .post<{ data: KnowledgeEntryDTO }>(shopPath(shopId, '/knowledge'), input)
      .then((r) => r.data.data),

  updateKnowledge: (
    shopId: string,
    entryId: string,
    input: UpdateKnowledgeInput,
  ) =>
    api
      .patch<{ data: KnowledgeEntryDTO }>(
        shopPath(shopId, `/knowledge/${entryId}`),
        input,
      )
      .then((r) => r.data.data),

  deleteKnowledge: (shopId: string, entryId: string) =>
    api
      .delete(shopPath(shopId, `/knowledge/${entryId}`))
      .then(() => null),
};
