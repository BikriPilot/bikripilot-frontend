import { api } from "./client";
import type { PublicConfig } from "@/types/publicConfig";
export const publicApi = {
  getConfig: async () =>
    (await api.get<{ data: PublicConfig }>("/public/config")).data.data,
};
