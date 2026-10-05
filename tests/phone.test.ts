import { describe, expect, it } from "vitest";
import { isValidBdPhone, normalizeBdPhone } from "@/lib/phone";
describe("Bangladesh phone helpers", () => {
  it("converts Bangla digits and country code", () =>
    expect(normalizeBdPhone("+৮৮০১৭১২৩৪৫৬৭৮")).toBe("01712345678"));
  it("validates mobile numbers", () =>
    expect(isValidBdPhone("01712345678")).toBe(true));
});
