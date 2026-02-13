import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (token: string) => {
  if (socket) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket"],
    auth: { token },
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};