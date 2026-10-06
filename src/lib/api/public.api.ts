import { api } from "./client";
import type { SiteContent, SiteContentType } from "@/types/content";
import type { PublicPlan } from "@/types/plan";
import type { PublicConfig } from "@/types/publicConfig";

async function publicFetch<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1"}${path}`,
      { next: { revalidate: 300 } },
    );
    if (!response.ok) return null;
    const body = (await response.json()) as { data: T };
    return body.data;
  } catch {
    return null;
  }
}

export const publicServerApi = {
  getConfig: () => publicFetch<PublicConfig>("/public/config"),
  getPlans: async () =>
    (await publicFetch<PublicPlan[]>("/public/plans")) ?? [],
  getContent: async (type: SiteContentType) =>
    (await publicFetch<SiteContent[]>(`/public/content?type=${type}`)) ?? [],
  getDataDeletionStatus: (code: string) =>
    publicFetch<{
      code: string;
      status: string;
      createdAt: string;
      completedAt: string | null;
    }>(`/public/data-deletion/${encodeURIComponent(code)}`),
};

export const publicApi = {
  getConfig: async () =>
    (await api.get<{ data: PublicConfig }>("/public/config")).data.data,
  getPlans: async () =>
    (await api.get<{ data: PublicPlan[] }>("/public/plans")).data.data,
  getContent: async (type?: SiteContentType) =>
    (
      await api.get<{ data: SiteContent[] }>("/public/content", {
        params: type ? { type } : undefined,
      })
    ).data.data,
  getDataDeletionStatus: async (code: string) =>
    (
      await api.get<{
        data: {
          code: string;
          status: string;
          createdAt: string;
          completedAt: string | null;
        };
      }>(`/public/data-deletion/${encodeURIComponent(code)}`)
    ).data.data,
};
