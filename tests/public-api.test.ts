import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/api/client", () => ({ api: {} }));
import { publicServerApi } from "@/lib/api/public.api";

describe("public server fetch policy", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("does not cache deletion status while caching the public catalog", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ data: [] }) });
    vi.stubGlobal("fetch", fetch);
    await publicServerApi.getDataDeletionStatus("test/code");
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("/public/data-deletion/test%2Fcode"),
      { cache: "no-store" },
    );
    await publicServerApi.getPlans();
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/public/plans"),
      { next: { revalidate: 300 } },
    );
  });
});
