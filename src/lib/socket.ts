import { io, type Socket } from "socket.io-client";
import { runtimeConfig } from "@/config/runtime";

let socket: Socket | null = null;

export const getSocket = () => {
  if (typeof window === "undefined") return null;
  socket ??= io(runtimeConfig.socketUrl, {
    path: "/socket.io",
    autoConnect: false,
    transports: ["websocket", "polling"],
  });
  return socket;
};

export const connectSocket = (token: string) => {
  const instance = getSocket();
  if (!instance) return null;
  instance.auth = { token };
  if (!instance.connected) instance.connect();
  return instance;
};

export const disconnectSocket = () => {
  socket?.disconnect();
};
