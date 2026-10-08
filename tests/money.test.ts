import { describe, expect, it } from "vitest";
import { formatMoney, takaToPaisa } from "@/lib/money";
describe("money formatting", () => {
  it("uses English lakh grouping", () => {
    expect(formatMoney(10000000)).toBe("৳1,00,000");
    expect(formatMoney(125000)).toBe("৳1,250");
    expect(formatMoney(99050)).toBe("৳990.50");
    expect(formatMoney(99001)).toBe("৳990.01");
  });
  it("converts taka to paisa", () =>
    expect(takaToPaisa("1,250.50")).toBe(125050));
  it("converts Bangla digits before parsing money", () => {
    expect(takaToPaisa("১,২৫০.৫০")).toBe(125050);
  });
});
