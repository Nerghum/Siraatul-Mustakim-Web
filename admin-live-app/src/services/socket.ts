import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../constants/api";

let socketInstance: Socket | null = null;

export function getSignalingSocket(): Socket {
  if (!socketInstance || !socketInstance.connected) {
    socketInstance = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketInstance.on("connect", () => {
      console.log("[SignalingSocket] Connected to VPS signaling server:", socketInstance?.id);
    });

    socketInstance.on("connect_error", (err) => {
      console.warn("[SignalingSocket] Connection error:", err.message);
    });
  }

  return socketInstance;
}

export function registerBroadcaster(streamId: string, roomName: string): Promise<number> {
  const socket = getSignalingSocket();
  return new Promise((resolve) => {
    socket.emit("live:broadcaster-join", { streamId, roomName });
    socket.once("live:broadcaster-ready", (data: { listenersCount?: number }) => {
      resolve(data.listenersCount || 0);
    });
  });
}

export function streamAudioChunk(
  streamId: string,
  roomName: string,
  chunk: string | ArrayBuffer | Uint8Array,
  isHeader = false
) {
  const socket = getSignalingSocket();
  if (socket && socket.connected) {
    socket.emit("live:audio-chunk", {
      streamId,
      roomName,
      chunk,
      isHeader,
    });
  }
}

export function endSignalingBroadcast(streamId: string, roomName: string) {
  const socket = getSignalingSocket();
  if (socket && socket.connected) {
    socket.emit("live:broadcaster-end", { streamId, roomName });
  }
}

export function subscribeListenerCount(callback: (count: number) => void): () => void {
  const socket = getSignalingSocket();
  const handler = (data: { count?: number }) => {
    if (typeof data.count === "number") {
      callback(data.count);
    }
  };
  socket.on("live:listener-count", handler);
  return () => {
    socket.off("live:listener-count", handler);
  };
}

export function closeSignalingSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
