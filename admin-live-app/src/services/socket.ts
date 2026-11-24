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

let pauseHeartbeatTimer: any = null;

export function endSignalingBroadcast(streamId: string, roomName: string) {
  if (pauseHeartbeatTimer) {
    clearInterval(pauseHeartbeatTimer);
    pauseHeartbeatTimer = null;
  }
  const socket = getSignalingSocket();
  if (socket && socket.connected) {
    socket.emit("live:broadcaster-end", { streamId, roomName });
  }
}

export function emitBroadcasterPause(
  streamId: string,
  roomName: string,
  message?: string
) {
  const socket = getSignalingSocket();
  const msg = message || "সাময়িক বিরতি চলছে। কিছুক্ষণ পর আবার সম্প্রচার শুরু হবে।";

  if (pauseHeartbeatTimer) {
    clearInterval(pauseHeartbeatTimer);
    pauseHeartbeatTimer = null;
  }

  const emitAll = () => {
    socket.emit("live:broadcaster-pause", {
      streamId,
      roomName,
      message: msg,
    });
    // Multi-channel fallback: also emit via WebRTC signaling paths which bypass backend version differences
    socket.emit("live:webrtc-offer", {
      streamId,
      roomName,
      offer: { type: "control:pause", message: msg },
    });
    socket.emit("live:webrtc-ice", {
      streamId,
      roomName,
      candidate: { type: "control:pause", message: msg },
    });
  };

  if (socket) {
    if (socket.connected) {
      emitAll();
    } else {
      socket.connect();
      socket.once("connect", emitAll);
    }
  }

  // Periodic heartbeat every 2 seconds while broadcaster remains paused
  pauseHeartbeatTimer = setInterval(() => {
    const s = getSignalingSocket();
    if (s && s.connected) {
      s.emit("live:webrtc-offer", {
        streamId,
        roomName,
        offer: { type: "control:pause", message: msg },
      });
      s.emit("live:webrtc-ice", {
        streamId,
        roomName,
        candidate: { type: "control:pause", message: msg },
      });
    }
  }, 2000);
}

export function emitBroadcasterResume(streamId: string, roomName: string) {
  if (pauseHeartbeatTimer) {
    clearInterval(pauseHeartbeatTimer);
    pauseHeartbeatTimer = null;
  }

  const socket = getSignalingSocket();
  const emitAll = () => {
    socket.emit("live:broadcaster-resume", {
      streamId,
      roomName,
    });
    // Multi-channel fallback
    socket.emit("live:webrtc-offer", {
      streamId,
      roomName,
      offer: { type: "control:resume" },
    });
    socket.emit("live:webrtc-ice", {
      streamId,
      roomName,
      candidate: { type: "control:resume" },
    });
  };

  if (socket) {
    if (socket.connected) {
      emitAll();
    } else {
      socket.connect();
      socket.once("connect", emitAll);
    }
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
  if (pauseHeartbeatTimer) {
    clearInterval(pauseHeartbeatTimer);
    pauseHeartbeatTimer = null;
  }
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
