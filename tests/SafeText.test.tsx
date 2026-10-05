import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SafeText } from "@/components/common/SafeText";
describe("SafeText", () => {
  it("renders markup as text", () => {
    render(<SafeText text={"<img src=x onerror=alert(1)>"} />);
    expect(
      screen.getByText("<img src=x onerror=alert(1)>"),
    ).toBeInTheDocument();
  });
});
