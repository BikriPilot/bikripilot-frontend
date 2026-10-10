import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useInboxRealtime } from "@/hooks/queries/useInbox";
import { SOCKET_EVENTS } from "@/constants/socketEvents";

const mocks = vi.hoisted(() => ({
  handlers: new Map<string, (payload: unknown) => void>(),
  invalidateQueries: vi.fn(),
  setQueriesData: vi.fn(),
  setQueryData: vi.fn(),
}));
vi.mock("@tanstack/react-query", async (original) => ({
  ...(await original<typeof import("@tanstack/react-query")>()),
  useQueryClient: () => mocks,
}));
vi.mock("@/hooks/useCurrentShop", () => ({
  useCurrentShop: () => ({ shopId: "shop-one" }),
}));
vi.mock("@/hooks/useSocketEvent", () => ({
  useSocketEvent: (event: string, handler: (payload: unknown) => void) =>
    mocks.handlers.set(event, handler),
}));

function Listener() {
  useInboxRealtime("open-conversation");
  return null;
}

describe("inbox realtime recovery", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    mocks.handlers.clear();
  });
  it("refreshes filtered lists when a new or changed conversation arrives", () => {
    render(<Listener />);
    mocks.handlers.get(SOCKET_EVENTS.CONVERSATION_UPDATED)?.({
      conversation: { id: "new-conversation" },
    });
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: ["conversations", "shop-one"],
    });
  });
  it("does not replace a newer conversation preview with a delayed message", () => {
    render(<Listener />);
    mocks.handlers.get(SOCKET_EVENTS.MESSAGE_NEW)?.({
      conversationId: "open-conversation",
      message: {
        id: "message",
        sentAt: "2026-10-09T10:00:00Z",
        text: "Older",
        direction: "INBOUND",
        attachments: [],
      },
    });
    const update = mocks.setQueriesData.mock.calls[0]?.[1];
    const old = {
      pages: [
        {
          data: [
            {
              id: "open-conversation",
              lastMessageAt: "2026-10-09T11:00:00Z",
              lastMessagePreview: "Newer",
              unreadCount: 0,
            },
          ],
        },
      ],
    };
    expect(update(old).pages[0].data[0]).toEqual(old.pages[0].data[0]);
  });
});
