import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ io: vi.fn() }));
vi.mock("socket.io-client", () => ({ io: mocks.io }));
import { connectSocket } from "@/lib/socket";

describe("socket authentication", () => {
  it("does not create or connect a socket without an access token", () => {
    expect(connectSocket("")).toBeNull();
    expect(connectSocket("   ")).toBeNull();
    expect(mocks.io).not.toHaveBeenCalled();
  });
});
