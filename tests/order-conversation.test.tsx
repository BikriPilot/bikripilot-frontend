import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OrderConversationLink } from "@/components/orders/OrderConversationLink";

const access = vi.hoisted(() => ({ allowed: true }));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock("@/hooks/useCurrentShop", () => ({
  useCurrentShop: () => ({ can: () => access.allowed }),
}));

describe("order conversation navigation", () => {
  afterEach(() => {
    cleanup();
    access.allowed = true;
  });
  it("opens the linked conversation without an order mutation", () => {
    render(<OrderConversationLink conversationId="conversation-one" />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/dashboard/inbox/conversation-one",
    );
    expect(screen.getByRole("link")).toHaveAttribute(
      "title",
      "review.conversation",
    );
  });
  it("opens Inbox when the order has no linked conversation", () => {
    render(<OrderConversationLink />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/dashboard/inbox",
    );
  });
  it("does not expose navigation without inbox read permission", () => {
    access.allowed = false;
    render(<OrderConversationLink conversationId="conversation-one" />);
    expect(screen.queryByRole("link")).toBeNull();
  });
});
