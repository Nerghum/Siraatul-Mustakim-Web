import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import LiveStream from "../models/LiveStream.js";
import Boyan from "../models/Boyan.js";
import * as notificationService from "./notificationService.js";
import { getOrCreateSession, endStreamSession } from "./signalingService.js";

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || "devkey";
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || "secret";
const LIVEKIT_HOST = process.env.LIVEKIT_HOST || "ws://localhost:7880";

const roomService = new RoomServiceClient(LIVEKIT_HOST, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

const generateToken = (roomName, identity, canPublish) => {
  try {
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: String(identity),
      ttl: "6h",
    });
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish,
      canSubscribe: true,
    });
    return at.toJwt();
  } catch (e) {
    return null;
  }
};

const startLive = async (title, description, startedBy, extra = {}) => {
  const roomName = `live-${Date.now()}-${randomUUID().slice(0, 8)}`;

  try {
    await roomService.createRoom({ name: roomName });
  } catch (e) {
    // LiveKit server optional fallback; Socket.io signaling works standalone
  }

  const token = generateToken(roomName, startedBy, true);

  const stream = await LiveStream.create({
    title,
    description,
    category: extra.category || "লাইভ বয়ান",
    author: extra.author || "মুফতি জাফর আহমেদ",
    location: extra.location || "",
    roomName,
    streamKey: roomName,
    startedBy,
    startedAt: new Date(),
    isLive: true,
    status: "live",
    listenerCount: 0,
  });

  getOrCreateSession(String(stream._id), roomName);

  await notificationService.sendLiveStarted(stream);

  const streamUrl = `/api/live/stream/${stream._id}.aac`;

  if (global.io) {
    global.io.emit("live:started", { stream, streamUrl });
    global.io.emit("live:status", {
      isLive: true,
      streamId: String(stream._id),
      roomName,
    });
  }

  return {
    stream,
    token,
    wsUrl: LIVEKIT_HOST,
    streamUrl,
  };
};

const stopLive = async (streamId, uploadedFilePath = null) => {
  const stream = await LiveStream.findById(streamId);
  if (!stream) {
    throw new Error("Stream not found");
  }

  const now = new Date();
  const duration = Math.max(1, Math.floor((now - stream.startedAt) / 1000));

  try {
    await roomService.deleteRoom(stream.roomName);
  } catch (e) {}

  await endStreamSession(String(streamId));

  const audioDir = path.join(process.cwd(), "data", "boyan", "audio");
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  let finalAudioRelPath = null;
  let finalFormat = "aac";
  const aacTarget = `live-${stream._id}.aac`;
  const m4aTarget = `live-${stream._id}.m4a`;
  const aacFullPath = path.join(audioDir, aacTarget);
  const m4aFullPath = path.join(audioDir, m4aTarget);

  if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
    const ext = path.extname(uploadedFilePath).replace(".", "") || "aac";
    const destName = `live-${stream._id}.${ext}`;
    const destPath = path.join(audioDir, destName);
    fs.copyFileSync(uploadedFilePath, destPath);
    finalAudioRelPath = `boyan/audio/${destName}`;
    finalFormat = ext;
  } else if (fs.existsSync(aacFullPath) && fs.statSync(aacFullPath).size > 0) {
    finalAudioRelPath = `boyan/audio/${aacTarget}`;
    finalFormat = "aac";
  } else if (fs.existsSync(m4aFullPath) && fs.statSync(m4aFullPath).size > 0) {
    finalAudioRelPath = `boyan/audio/${m4aTarget}`;
    finalFormat = "m4a";
  }

  let createdBoyan = null;
  if (finalAudioRelPath) {
    createdBoyan = await Boyan.create({
      title: stream.title,
      category: stream.category || "লাইভ বয়ান",
      author: stream.author || "মুফতি জাফর আহমেদ",
      location: stream.location || "",
      mediaType: "audio",
      audioUrl: finalAudioRelPath,
      audioFormat: finalFormat,
      audioDuration: duration,
      views: stream.listenerCount || 0,
    });
    stream.boyanId = createdBoyan._id;
    stream.recordingUrl = finalAudioRelPath;
  }

  stream.isLive = false;
  stream.endedAt = now;
  stream.duration = duration;
  stream.status = "ended";
  await stream.save();

  await notificationService.sendLiveEnded(stream);

  if (global.io) {
    const endPayload = {
      streamId: String(stream._id),
      roomName: stream.roomName,
      boyanId: createdBoyan ? String(createdBoyan._id) : null,
      boyan: createdBoyan,
    };
    global.io.to(`live:${stream.roomName}`).emit("live:ended", endPayload);
    global.io.emit("live:ended", endPayload);
    global.io.emit("live:status", {
      isLive: false,
      streamId: String(stream._id),
      roomName: stream.roomName,
    });
  }

  return { stream, boyan: createdBoyan };
};

const getCurrentLive = async () => {
  const stream = await LiveStream.findOne({ isLive: true }).populate(
    "startedBy",
    "phone email name"
  );
  if (!stream) return null;

  const token = generateToken(stream.roomName, `listener-${Date.now()}`, false);

  return {
    stream,
    token,
    wsUrl: LIVEKIT_HOST,
    streamUrl: `/api/live/stream/${stream._id}.aac`,
  };
};

const getLiveHistory = async () => {
  return LiveStream.find()
    .sort({ startedAt: -1 })
    .populate("startedBy", "phone email name")
    .populate("boyanId");
};

const getLiveById = async (id) => {
  const stream = await LiveStream.findById(id)
    .populate("startedBy", "phone email name")
    .populate("boyanId");
  if (!stream) {
    throw new Error("Stream not found");
  }

  let token = null;
  let wsUrl = null;
  if (stream.isLive) {
    token = generateToken(stream.roomName, `listener-${Date.now()}`, false);
    wsUrl = LIVEKIT_HOST;
  }

  return {
    stream,
    token,
    wsUrl,
    streamUrl: `/api/live/stream/${stream._id}`,
  };
};

const getListenerCount = async (id) => {
  const stream = await LiveStream.findById(id);
  if (!stream) {
    throw new Error("Stream not found");
  }

  let liveCount = stream.listenerCount;
  try {
    const room = await roomService.listRooms([stream.roomName]);
    if (room.length > 0 && room[0].numParticipants !== undefined) {
      liveCount = Math.max(1, room[0].numParticipants - 1);
    }
  } catch (e) {}

  if (stream.isLive) {
    stream.listenerCount = liveCount;
    await stream.save();
  }

  return { count: liveCount };
};

export {
  startLive,
  stopLive,
  getCurrentLive,
  getLiveHistory,
  getLiveById,
  getListenerCount,
};
