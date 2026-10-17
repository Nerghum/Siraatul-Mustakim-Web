import { randomUUID } from "crypto";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import LiveStream from "../models/LiveStream.js";
import * as notificationService from "./notificationService.js";

const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || "devkey";
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || "secret";
const LIVEKIT_HOST = process.env.LIVEKIT_HOST || "ws://localhost:7880";

const roomService = new RoomServiceClient(LIVEKIT_HOST, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

const generateToken = (roomName, identity, canPublish) => {
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
};

const startLive = async (title, description, startedBy) => {
  const roomName = `live-${Date.now()}-${randomUUID().slice(0, 8)}`;

  await roomService.createRoom({ name: roomName });

  const token = generateToken(roomName, startedBy, true);

  const stream = await LiveStream.create({
    title,
    description,
    roomName,
    streamKey: roomName,
    startedBy,
    startedAt: new Date(),
    isLive: true,
    status: "live",
    listenerCount: 0,
  });

  await notificationService.sendLiveStarted(stream);

  return { stream, token, wsUrl: LIVEKIT_HOST };
};

const stopLive = async (streamId) => {
  const stream = await LiveStream.findById(streamId);
  if (!stream) {
    throw new Error("Stream not found");
  }

  const now = new Date();
  const duration = Math.floor((now - stream.startedAt) / 1000);

  try {
    await roomService.deleteRoom(stream.roomName);
  } catch (e) {
    // Room may already be deleted
  }

  stream.isLive = false;
  stream.endedAt = now;
  stream.duration = duration;
  stream.status = "ended";
  await stream.save();

  await notificationService.sendLiveEnded(stream);

  return stream;
};

const getCurrentLive = async () => {
  const stream = await LiveStream.findOne({ isLive: true }).populate(
    "startedBy",
    "phone"
  );
  if (!stream) return null;

  const token = generateToken(stream.roomName, `listener-${Date.now()}`, false);

  return { stream, token, wsUrl: LIVEKIT_HOST };
};

const getLiveHistory = async () => {
  return LiveStream.find()
    .sort({ startedAt: -1 })
    .populate("startedBy", "phone");
};

const getLiveById = async (id) => {
  const stream = await LiveStream.findById(id).populate("startedBy", "phone");
  if (!stream) {
    throw new Error("Stream not found");
  }

  let token = null;
  let wsUrl = null;
  if (stream.isLive) {
    token = generateToken(stream.roomName, `listener-${Date.now()}`, false);
    wsUrl = LIVEKIT_HOST;
  }

  return { stream, token, wsUrl };
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
  } catch (e) {
    // Use stored count as fallback
  }

  if (stream.isLive) {
    stream.listenerCount = liveCount;
    await stream.save();
  }

  return { count: liveCount };
};

export { startLive, stopLive, getCurrentLive, getLiveHistory, getLiveById, getListenerCount };
