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

  const recordingPath = path.join(audioDir, `live-${streamId}.m4a`);
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
  };

  activeStreamSessions.set(streamId, session);
  return session;
};

export const endStreamSession = async (streamId) => {
  const session = activeStreamSessions.get(streamId);
  if (!session) return null;

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

  activeStreamSessions.delete(streamId);
  return session;
};

export const handleHttpAudioStream = async (streamId, req, res) => {
  const stream = await LiveStream.findById(streamId);
  if (!stream) {
    return res.status(404).send("Stream not found");
  }

  // If stream already ended and has recording, redirect or serve file
  if (!stream.isLive && stream.recordingUrl) {
    const fullPath = path.join(process.cwd(), "data", stream.recordingUrl);
    if (fs.existsSync(fullPath)) {
      return res.sendFile(fullPath);
    }
  }

  const session = getOrCreateSession(streamId, stream.roomName);

  res.writeHead(200, {
    "Content-Type": "audio/mp4",
    "Transfer-Encoding": "chunked",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  // If we have an initial header chunk, send it to prime the client decoder
  if (session.headerChunk) {
    try {
      res.write(session.headerChunk);
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

      socket.emit("live:broadcaster-ready", {
        streamId,
        roomName,
        listenersCount: session.listeners.size,
      });

      io.to(`live:${roomName}`).emit("live:status", {
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

      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      const session = activeStreamSessions.get(streamId);

      if (session) {
        if (isHeader || !session.headerChunk) {
          session.headerChunk = buffer;
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
      await endStreamSession(streamId);
      io.to(`live:${roomName}`).emit("live:ended", { streamId, roomName });
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
          console.log(`[Signaling] Broadcaster disconnected: ${streamId}`);
        }
      }
    });
  });
};
