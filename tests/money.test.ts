import { describe, expect, it } from "vitest";
import { formatMoney, takaToPaisa } from "@/lib/money";
describe("money formatting", () => {
  it("uses English lakh grouping", () => {
    expect(formatMoney(10000000)).toBe("৳1,00,000");
    expect(formatMoney(125000)).toBe("৳1,250");
  });
  it("converts taka to paisa", () =>
    expect(takaToPaisa("1,250.50")).toBe(125050));
});
