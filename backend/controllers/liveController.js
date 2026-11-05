import status from "http-status";
import mongoose from "mongoose";
import LiveStream from "../models/LiveStream.js";
import * as liveService from "../services/liveService.js";
import { handleHttpAudioStream } from "../services/signalingService.js";

const ADMIN_PHONES = (process.env.ADMIN_PHONES || "")
  .split(",")
  .map((p) => p.trim())
  .filter(Boolean);

const requireAdmin = (req) => {
  if (!req.user) {
    throw new Error("Unauthorized");
  }
  const allowedRoles = ["admin", "moderator", "mufti", "staff"];
  if (req.user.role && allowedRoles.includes(req.user.role)) {
    return;
  }
  if (ADMIN_PHONES.length > 0 && ADMIN_PHONES.includes(req.user.phone)) {
    return;
  }
  if (ADMIN_PHONES.length === 0 && !req.user.role) {
    return;
  }
  throw new Error("Forbidden: Admin access required");
};

const startLive = async (req, res) => {
  try {
    requireAdmin(req);

    const { title, description, category, author, location } = req.body;
    if (!title || !title.trim()) {
      return res.status(status.BAD_REQUEST).json({ error: "Title is required" });
    }

    const result = await liveService.startLive(
      title.trim(),
      (description || "").trim(),
      req.user.id || req.user._id,
      {
        category: (category || "").trim(),
        author: (author || "").trim(),
        location: (location || "").trim(),
      }
    );

    res.status(status.CREATED).json({ success: true, data: result });
  } catch (error) {
    const msg = error.message;
    if (msg.includes("Unauthorized")) {
      return res.status(status.UNAUTHORIZED).json({ error: msg });
    }
    if (msg.includes("Forbidden")) {
      return res.status(status.FORBIDDEN).json({ error: msg });
    }
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const stopLive = async (req, res) => {
  try {
    requireAdmin(req);

    let streamId =
      req.body?.streamId ||
      req.params?.id ||
      req.query?.streamId ||
      req.headers["x-stream-id"];

    if (!streamId || !mongoose.Types.ObjectId.isValid(streamId)) {
      const active = await LiveStream.findOne({ isLive: true }).sort({ startedAt: -1 });
      if (active) {
        streamId = active._id;
      }
    }

    if (!streamId || !mongoose.Types.ObjectId.isValid(streamId)) {
      return res.status(status.BAD_REQUEST).json({ error: "Valid streamId is required" });
    }

    const uploadedFilePath = req.file ? req.file.path : null;
    const result = await liveService.stopLive(streamId, uploadedFilePath);
    res.status(status.OK).json({ success: true, data: result });
  } catch (error) {
    const msg = error.message;
    if (msg.includes("Unauthorized")) {
      return res.status(status.UNAUTHORIZED).json({ error: msg });
    }
    if (msg.includes("Forbidden")) {
      return res.status(status.FORBIDDEN).json({ error: msg });
    }
    if (msg === "Stream not found") {
      return res.status(status.NOT_FOUND).json({ error: msg });
    }
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getCurrentLive = async (_req, res) => {
  try {
    const result = await liveService.getCurrentLive();
    res.status(status.OK).json({ success: true, data: result });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getLiveHistory = async (_req, res) => {
  try {
    const streams = await liveService.getLiveHistory();
    res.status(status.OK).json({ success: true, data: streams });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getLiveById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(status.BAD_REQUEST).json({ error: "Invalid id" });
    }

    const result = await liveService.getLiveById(id);
    res.status(status.OK).json({ success: true, data: result });
  } catch (error) {
    if (error.message === "Stream not found") {
      return res.status(status.NOT_FOUND).json({ error: error.message });
    }
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getListenerCount = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(status.BAD_REQUEST).json({ error: "Invalid id" });
    }

    const result = await liveService.getListenerCount(id);
    res.status(status.OK).json({ success: true, data: result });
  } catch (error) {
    if (error.message === "Stream not found") {
      return res.status(status.NOT_FOUND).json({ error: error.message });
    }
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const streamLiveAudio = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(status.BAD_REQUEST).send("Invalid stream ID");
    }
    await handleHttpAudioStream(id, req, res);
  } catch (error) {
    console.error("[LiveController] streamLiveAudio error:", error);
    if (!res.headersSent) {
      res.status(status.INTERNAL_SERVER_ERROR).send("Stream error");
    }
  }
};

export {
  startLive,
  stopLive,
  getCurrentLive,
  getLiveHistory,
  getLiveById,
  getListenerCount,
  streamLiveAudio,
};
