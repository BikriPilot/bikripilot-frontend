import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "../messages/en.json";
import { WindowNotice } from "@/components/inbox/WindowNotice";
import { MessageBubble } from "@/components/inbox/MessageBubble";
import { InboxFilters } from "@/components/inbox/InboxFilters";
import type { WindowStateDTO, MessageDTO } from "@/types/inbox";

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={enMessages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("WindowNotice", () => {
  it("renders active notice when window is open", () => {
    const windowState: WindowStateDTO = {
      isOpen: true,
      closesAt: new Date(Date.now() + 3600000).toISOString(),
      humanAgentTagAllowed: true,
      humanAgentTagUntil: new Date(Date.now() + 86400000).toISOString(),
    };

    renderWithIntl(
      <WindowNotice
        window={windowState}
        useHumanAgentTag={false}
        onToggleHumanAgentTag={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/24-hour messaging window is active/i),
    ).toBeInTheDocument();
  });

  it("renders closed notice and human agent tag checkbox when standard window is expired", () => {
    const windowState: WindowStateDTO = {
      isOpen: false,
      closesAt: new Date(Date.now() - 3600000).toISOString(),
      humanAgentTagAllowed: true,
      humanAgentTagUntil: new Date(Date.now() + 86400000).toISOString(),
    };
    const onToggle = vi.fn();

    renderWithIntl(
      <WindowNotice
        window={windowState}
        useHumanAgentTag={false}
        onToggleHumanAgentTag={onToggle}
      />,
    );

    expect(
      screen.getByText(/24-hour standard messaging window has closed/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Send using Human Agent Tag/i)).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(onToggle).toHaveBeenCalledWith(true);
  });
});

describe("MessageBubble", () => {
  it("renders inbound message content safely", () => {
    const message: MessageDTO = {
      id: "msg_1",
      conversationId: "conv_1",
      direction: "INBOUND",
      senderType: "CUSTOMER",
      sentBy: null,
      type: "TEXT",
      text: "Hello, I want to order a bag <script>alert(1)</script>",
      attachments: [],
      status: "DELIVERED",
      error: null,
      usedHumanAgentTag: false,
      aiRunId: null,
      clientRef: null,
      sentAt: new Date().toISOString(),
      deliveredAt: new Date().toISOString(),
      readAt: null,
    };

    renderWithIntl(
      <MessageBubble
        message={message}
        onRetry={vi.fn()}
        onOpenImage={vi.fn()}
      />,
    );

    expect(
      screen.getByText(
        "Hello, I want to order a bag <script>alert(1)</script>",
      ),
    ).toBeInTheDocument();
    const text = screen.getByText(
      "Hello, I want to order a bag <script>alert(1)</script>",
    );
    expect(text.closest(".whitespace-pre-wrap")).toHaveClass(
      "[overflow-wrap:anywhere]",
    );
    expect(text.closest(".w-fit")).toHaveClass("max-w-[min(80%,28rem)]");
  });

  it("renders outbound message with HUMAN AGENT tag badge", () => {
    const message: MessageDTO = {
      id: "msg_2",
      conversationId: "conv_1",
      direction: "OUTBOUND",
      senderType: "AGENT",
      sentBy: {
        id: "usr_1",
        name: "Rahim Support",
        email: "rahim@bikrio.com",
      },
      type: "TEXT",
      text: "Your order is confirmed!",
      attachments: [],
      status: "SENT",
      error: null,
      usedHumanAgentTag: true,
      aiRunId: null,
      clientRef: null,
      sentAt: new Date().toISOString(),
      deliveredAt: null,
      readAt: null,
    };

    renderWithIntl(
      <MessageBubble
        message={message}
        onRetry={vi.fn()}
        onOpenImage={vi.fn()}
      />,
    );

    expect(screen.getByText("Your order is confirmed!")).toBeInTheDocument();
    expect(screen.getByText("HUMAN AGENT")).toBeInTheDocument();
  });
});

describe("InboxFilters", () => {
  it("renders filter chips and responds to click", () => {
    const onSelectFilter = vi.fn();
    const onSearchChange = vi.fn();

    renderWithIntl(
      <InboxFilters
        activeFilter="all"
        onSelectFilter={onSelectFilter}
        search=""
        onSearchChange={onSearchChange}
      />,
    );

    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Unread")).toBeInTheDocument();
    expect(screen.getByText("Mine")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Unread"));
    expect(onSelectFilter).toHaveBeenCalledWith("unread");
  });
});
