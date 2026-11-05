import fs from "fs";
import path from "path";
import Boyan from "../models/Boyan.js";
import LiveStream from "../models/LiveStream.js";

// Active in-memory stream sessions: streamId -> session
export const activeStreamSessions = new Map();

export const getOrCreateSession = (streamId, roomName) => {
  if (activeStreamSessions.has(streamId)) {
    return activeStreamSessions.get(streamId);
  }

  const audioDir = path.join(process.cwd(), "data", "boyan", "audio");
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  const recordingPath = path.join(audioDir, `live-${streamId}.aac`);
  const writeStream = fs.createWriteStream(recordingPath, { flags: "a" });

  const session = {
    streamId,
    roomName,
    broadcasterSocketId: null,
    listeners: new Set(),
    httpClients: new Set(), // Set of active Express `res` objects streaming live
    recordingPath,
    writeStream,
    startedAt: Date.now(),
    headerChunk: null, // Initial audio header chunk to send to new listeners
    recentChunks: [], // Ring buffer of recent ADTS chunks (~64KB) for instant playback
    recentBytes: 0,
    disconnectTimer: null,
  };

  activeStreamSessions.set(streamId, session);
  return session;
};

export const endStreamSession = async (streamId) => {
  const session = activeStreamSessions.get(streamId);
  if (!session) return null;

  if (session.disconnectTimer) {
    clearTimeout(session.disconnectTimer);
    session.disconnectTimer = null;
  }

  try {
    if (session.writeStream) {
      session.writeStream.end();
    }
  } catch (err) {
    console.error(`[Signaling] Error closing writeStream for ${streamId}:`, err);
  }

  // Close all HTTP streaming responses
  for (const clientRes of session.httpClients) {
    try {
      clientRes.end();
    } catch (e) {}
  }
  session.httpClients.clear();
  session.recentChunks = [];
  session.recentBytes = 0;

  activeStreamSessions.delete(streamId);
  return session;
};

export const handleHttpAudioStream = async (rawStreamId, req, res) => {
  const streamId = String(rawStreamId).replace(/\.(aac|m4a|mp3|ogg|wav)$/i, "");
  const stream = await LiveStream.findById(streamId);
  if (!stream) {
    return res.status(404).send("Stream not found");
  }

  // If stream already ended and has recording, redirect or serve file
  if (!stream.isLive) {
    if (stream.recordingUrl) {
      const fullPath = path.join(process.cwd(), "data", stream.recordingUrl);
      if (fs.existsSync(fullPath)) {
        return res.sendFile(fullPath);
      }
    }
    return res.status(404).send("Stream has ended");
  }

  const session = getOrCreateSession(streamId, stream.roomName);

  res.writeHead(200, {
    "Content-Type": "audio/aac",
    "Transfer-Encoding": "chunked",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Accept-Ranges": "none",
    "X-Content-Type-Options": "nosniff",
    "icy-name": "Siraatul Mustakim Live",
    "icy-br": "64",
    "icy-sr": "44100",
  });

  // Prime client with recent buffered audio aligned to the first ADTS syncword
  let bufferToSend = null;
  if (session.recentChunks && session.recentChunks.length > 0) {
    bufferToSend = Buffer.concat(session.recentChunks);
  } else if (session.recordingPath && fs.existsSync(session.recordingPath)) {
    try {
      const stat = fs.statSync(session.recordingPath);
      if (stat.size > 0) {
        const tailSize = Math.min(stat.size, 64 * 1024);
        const buf = Buffer.alloc(tailSize);
        const fd = fs.openSync(session.recordingPath, "r");
        fs.readSync(fd, buf, 0, tailSize, stat.size - tailSize);
        fs.closeSync(fd);
        bufferToSend = buf;
      }
    } catch (e) {}
  }

  if (bufferToSend && bufferToSend.length > 0) {
    let startOffset = 0;
    // Align to the nearest ADTS syncword (0xFF followed by 0xF0..0xFF)
    for (let i = 0; i < bufferToSend.length - 1; i++) {
      if (bufferToSend[i] === 0xFF && (bufferToSend[i + 1] & 0xF0) === 0xF0) {
        startOffset = i;
        break;
      }
    }
    try {
      res.write(bufferToSend.subarray(startOffset));
    } catch (e) {}
  }

  session.httpClients.add(res);

  req.on("close", () => {
    session.httpClients.delete(res);
  });
};

export const initSignaling = (io) => {
  io.on("connection", (socket) => {
    console.log(`[Signaling] Socket connected: ${socket.id}`);

    // --- Broadcaster registers ---
    socket.on("live:broadcaster-join", async ({ streamId, roomName }) => {
      console.log(`[Signaling] Broadcaster joined: stream=${streamId}, room=${roomName}`);
      socket.join(`live:${roomName}`);
      socket.join(`broadcaster:${streamId}`);

      const session = getOrCreateSession(streamId, roomName);
      session.broadcasterSocketId = socket.id;

      if (session.disconnectTimer) {
        clearTimeout(session.disconnectTimer);
        session.disconnectTimer = null;
        console.log(`[Signaling] Cleared broadcaster disconnect timer for ${streamId}`);
      }

      socket.emit("live:broadcaster-ready", {
        streamId,
        roomName,
        listenersCount: session.listeners.size,
      });

      // Emit status to room AND globally so all clients know it is live
      io.emit("live:status", {
        isLive: true,
        streamId,
        roomName,
      });
    });

    // --- Listener registers ---
    socket.on("live:listener-join", async ({ streamId, roomName }) => {
      console.log(`[Signaling] Listener joined: ${socket.id} to room ${roomName}`);
      socket.join(`live:${roomName}`);

      let currentCount = 1;
      if (streamId) {
        const session = getOrCreateSession(streamId, roomName);
        session.listeners.add(socket.id);
        currentCount = session.listeners.size;

        // Persist listener count
        try {
          await LiveStream.findByIdAndUpdate(streamId, {
            listenerCount: currentCount,
          });
        } catch (e) {}
      }

      io.to(`live:${roomName}`).emit("live:listener-count", {
        streamId,
        count: currentCount,
      });
    });

    // --- Broadcaster streams audio chunk ---
    socket.on("live:audio-chunk", ({ streamId, roomName, chunk, isHeader }) => {
      if (!chunk) return;

      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, typeof chunk === "string" ? "base64" : undefined);
      const session = activeStreamSessions.get(streamId);

      if (session) {
        if (isHeader || !session.headerChunk) {
          session.headerChunk = buffer;
        }

        // Cache recent audio chunks (~64KB) for instant playback startup of new clients
        session.recentChunks.push(buffer);
        session.recentBytes += buffer.length;
        while (session.recentBytes > 64 * 1024 && session.recentChunks.length > 1) {
          const removed = session.recentChunks.shift();
          session.recentBytes -= removed.length;
        }

        // 1. Write chunk to server recording file
        try {
          if (session.writeStream && !session.writeStream.destroyed) {
            session.writeStream.write(buffer);
          }
        } catch (err) {
          console.error(`[Signaling] Error writing chunk for ${streamId}:`, err);
        }

        // 2. Broadcast chunk to HTTP chunked streaming clients
        for (const clientRes of session.httpClients) {
          try {
            clientRes.write(buffer);
          } catch (err) {
            session.httpClients.delete(clientRes);
          }
        }
      }

      // 3. Broadcast chunk over socket to listeners
      socket.to(`live:${roomName}`).emit("live:audio-packet", {
        chunk: buffer,
        timestamp: Date.now(),
      });
    });

    // --- WebRTC Signaling (Offer, Answer, ICE Candidate) ---
    socket.on("live:webrtc-offer", ({ targetId, offer, streamId, roomName }) => {
      if (targetId) {
        io.to(targetId).emit("live:webrtc-offer", {
          senderId: socket.id,
          offer,
          streamId,
          roomName,
        });
      } else if (roomName) {
        socket.to(`live:${roomName}`).emit("live:webrtc-offer", {
          senderId: socket.id,
          offer,
          streamId,
          roomName,
        });
      }
    });

    socket.on("live:webrtc-answer", ({ targetId, answer, streamId, roomName }) => {
      if (targetId) {
        io.to(targetId).emit("live:webrtc-answer", {
          senderId: socket.id,
          answer,
          streamId,
          roomName,
        });
      } else if (roomName) {
        socket.to(`live:${roomName}`).emit("live:webrtc-answer", {
          senderId: socket.id,
          answer,
          streamId,
          roomName,
        });
      }
    });

    socket.on("live:webrtc-ice", ({ targetId, candidate, streamId, roomName }) => {
      if (targetId) {
        io.to(targetId).emit("live:webrtc-ice", {
          senderId: socket.id,
          candidate,
          streamId,
          roomName,
        });
      } else if (roomName) {
        socket.to(`live:${roomName}`).emit("live:webrtc-ice", {
          senderId: socket.id,
          candidate,
          streamId,
          roomName,
        });
      }
    });

    // --- Broadcaster ends live ---
    socket.on("live:broadcaster-end", async ({ streamId, roomName }) => {
      console.log(`[Signaling] Broadcaster ended live: ${streamId}`);
      try {
        const { stopLive } = await import("./liveService.js");
        await stopLive(streamId);
      } catch (err) {
        console.warn(`[Signaling] stopLive in live:broadcaster-end error:`, err);
        await endStreamSession(streamId);
        io.emit("live:ended", { streamId, roomName });
        io.emit("live:status", { isLive: false, streamId, roomName });
      }
    });

    // --- Socket disconnect ---
    socket.on("disconnect", () => {
      for (const [streamId, session] of activeStreamSessions.entries()) {
        if (session.listeners.has(socket.id)) {
          session.listeners.delete(socket.id);
          const currentCount = session.listeners.size;
          io.to(`live:${session.roomName}`).emit("live:listener-count", {
            streamId,
            count: currentCount,
          });
          LiveStream.findByIdAndUpdate(streamId, {
            listenerCount: currentCount,
          }).catch(() => {});
        }

        if (session.broadcasterSocketId === socket.id) {
          console.log(`[Signaling] Broadcaster disconnected for stream ${streamId}. Starting 15s grace timer.`);
          if (session.disconnectTimer) clearTimeout(session.disconnectTimer);
          session.disconnectTimer = setTimeout(async () => {
            console.log(`[Signaling] Broadcaster grace period expired for ${streamId}. Auto-ending stream.`);
            try {
              const { stopLive } = await import("./liveService.js");
              await stopLive(streamId);
            } catch (err) {
              await endStreamSession(streamId);
              io.emit("live:ended", { streamId, roomName: session.roomName });
              io.emit("live:status", { isLive: false, streamId, roomName: session.roomName });
            }
          }, 15000);
        }
      }
    });
  });
};
