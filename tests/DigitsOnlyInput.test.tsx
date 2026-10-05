import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DigitsOnlyInput } from "@/components/common/DigitsOnlyInput";
describe("DigitsOnlyInput", () => {
  it("converts Bangla digits while typing", () => {
    render(<DigitsOnlyInput aria-label="number" />);
    const input = screen.getByLabelText("number");
    fireEvent.change(input, { target: { value: "০১৭" } });
    expect(input).toHaveValue("017");
  });
});
