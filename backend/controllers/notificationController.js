import status from "http-status";
import PushToken from "../models/PushToken.js";
import { getNotifications, sendPushNotifications } from "../services/notificationService.js";

export const registerPushToken = async (req, res) => {
  try {
    const { token, platform, deviceId } = req.body;
    if (!token || typeof token !== "string" || !token.trim()) {
      return res.status(status.BAD_REQUEST).json({ error: "Push token is required" });
    }

    const cleanToken = token.trim();
    const userId = req.user?._id || req.user?.id || null;

    const updated = await PushToken.findOneAndUpdate(
      { token: cleanToken },
      {
        token: cleanToken,
        userId,
        platform: platform || "android",
        deviceId: deviceId || "",
        isActive: true,
        lastSeen: new Date(),
      },
      { upsert: true, new: true }
    );

    res.status(status.OK).json({
      success: true,
      message: "Push token registered successfully",
      data: updated,
    });
  } catch (err) {
    console.error("[notificationController] registerPushToken error:", err);
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};

export const unregisterPushToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(status.BAD_REQUEST).json({ error: "Push token is required" });
    }

    await PushToken.findOneAndUpdate(
      { token: token.trim() },
      { isActive: false, lastSeen: new Date() }
    );

    res.status(status.OK).json({ success: true, message: "Push token deactivated" });
  } catch (err) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};

export const getAllNotifications = async (_req, res) => {
  try {
    const items = await getNotifications();
    res.status(status.OK).json({ success: true, data: items });
  } catch (err) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};

export const sendTestPush = async (req, res) => {
  try {
    const { title, body } = req.body;
    const tokens = await PushToken.find({ isActive: true }).select("token").lean();
    if (tokens.length === 0) {
      return res.status(status.OK).json({ message: "No active tokens registered", count: 0 });
    }

    const messages = tokens.map((t) => ({
      to: t.token,
      title: title || "সিরাতুল মুস্তাকিম টেস্ট নোটিফিকেশন",
      body: body || "পুশ নোটিফিকেশন সফলভাবে কাজ করছে।",
      sound: "default",
      channelId: "live-stream",
      priority: "high",
    }));

    const result = await sendPushNotifications(messages);
    res.status(status.OK).json({
      success: result.success,
      count: result.count,
      total: tokens.length,
      fcmConfigured: result.fcmConfigured,
    });
  } catch (err) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};
