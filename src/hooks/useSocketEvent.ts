"use client";

import { useEffect } from "react";
import { getSocket } from "@/lib/socket";
import type { SocketEventName, SocketEventPayload } from "@/types/socket";

export function useSocketEvent<T extends SocketEventName>(
  event: T,
  handler: (payload: SocketEventPayload<T>) => void,
) {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const typedSocket = socket as unknown as {
      on: (name: string, listener: (payload: unknown) => void) => void;
      off: (name: string, listener: (payload: unknown) => void) => void;
    };
    const listener = handler as (payload: unknown) => void;
    typedSocket.on(event, listener);
    return () => {
      typedSocket.off(event, listener);
    };
  }, [event, handler]);
}
