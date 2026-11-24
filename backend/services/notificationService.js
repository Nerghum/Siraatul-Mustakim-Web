import fs from "fs";
import path from "path";
import axios from "axios";
import admin from "firebase-admin";
import Notification from "../models/Notification.js";
import PushToken from "../models/PushToken.js";

const getIO = () => {
  return global.io;
};

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const EXPO_TOKEN_REGEX = /^Expo(?:nent)?PushToken\[[^\]]+\]$/;
const FCM_INVALID_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

let firebaseInitAttempted = false;
let firebaseMessagingInstance = null;

function loadFirebaseServiceAccount() {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (rawJson) {
    try {
      const decoded = rawJson.startsWith("{")
        ? rawJson
        : Buffer.from(rawJson, "base64").toString("utf8");
      return JSON.parse(decoded);
    } catch (err) {
      console.error("[Push] Invalid FIREBASE_SERVICE_ACCOUNT_JSON:", err.message);
    }
  }

  const candidatePaths = [
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim(),
    path.resolve(process.cwd(), "firebase-service-account.json"),
  ].filter(Boolean);

  for (const filePath of candidatePaths) {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
      }
    } catch (err) {
      console.error(`[Push] Failed to read Firebase service account at ${filePath}:`, err.message);
    }
  }

  return null;
}

function getFirebaseMessaging() {
  if (firebaseMessagingInstance) return firebaseMessagingInstance;
  if (admin.apps.length > 0) {
    firebaseMessagingInstance = admin.messaging();
    return firebaseMessagingInstance;
  }
  if (firebaseInitAttempted) return null;
  firebaseInitAttempted = true;

  const serviceAccount = loadFirebaseServiceAccount();
  if (!serviceAccount) {
    console.warn(
      "[Push] Firebase Admin credentials not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON / FIREBASE_SERVICE_ACCOUNT_PATH or place firebase-service-account.json in backend/."
    );
    return null;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseMessagingInstance = admin.messaging();
    return firebaseMessagingInstance;
  } catch (err) {
    console.error("[Push] Firebase Admin initialization failed:", err.message);
    return null;
  }
}

/**
 * Split an array of items into batches of size N
 */
function chunkArray(items, size) {
  const chunks = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function serializeFcmData(data = {}) {
  const result = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      result[key] = typeof value === "string" ? value : JSON.stringify(value);
    }
  }
  return result;
}

async function deactivateInvalidTokens(tokens) {
  if (!tokens || tokens.length === 0) return;
  await PushToken.updateMany(
    { token: { $in: tokens } },
    { $set: { isActive: false } }
  ).catch((e) => console.warn("[Push] Token cleanup error:", e.message));
}

async function sendExpoBatch(messages) {
  if (!messages || messages.length === 0) return { count: 0, invalidTokens: [] };

  const chunks = chunkArray(messages, 100);
  let sentCount = 0;
  const invalidTokens = [];

  for (const chunk of chunks) {
    try {
      const res = await axios.post(EXPO_PUSH_URL, chunk, {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });

      const tickets = res.data?.data || [];
      tickets.forEach((ticket, idx) => {
        if (ticket.status === "ok") {
          sentCount++;
        } else if (ticket.status === "error") {
          console.warn("[Push] Expo ticket error:", ticket.message, ticket.details);
          if (
            ticket.details?.error === "DeviceNotRegistered" ||
            ticket.message?.includes("not registered")
          ) {
            invalidTokens.push(chunk[idx].to);
          }
        }
      });
    } catch (err) {
      console.error("[Push] Expo batch send failed:", err.message);
    }
  }

  return { count: sentCount, invalidTokens };
}

async function sendFcmBatch(messages) {
  if (!messages || messages.length === 0) {
    return { count: 0, invalidTokens: [], configured: true };
  }

  const messaging = getFirebaseMessaging();
  if (!messaging) {
    return { count: 0, invalidTokens: [], configured: false };
  }

  const chunks = chunkArray(messages, 500);
  let sentCount = 0;
  const invalidTokens = [];

  for (const chunk of chunks) {
    const sample = chunk[0];
    try {
      const response = await messaging.sendEachForMulticast({
        tokens: chunk.map((m) => m.to),
        notification: {
          title: sample.title,
          body: sample.body,
        },
        data: serializeFcmData(sample.data),
        android: {
          priority: "high",
          notification: {
            channelId: sample.channelId || "live-stream",
            sound: sample.sound || "default",
            priority: "max",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: sample.sound || "default",
              badge: typeof sample.badge === "number" ? sample.badge : 1,
            },
          },
        },
      });

      sentCount += response.successCount;
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error) {
          console.warn("[Push] FCM token error:", resp.error.code, resp.error.message);
          if (FCM_INVALID_TOKEN_CODES.has(resp.error.code)) {
            invalidTokens.push(chunk[idx].to);
          }
        }
      });
    } catch (err) {
      console.error("[Push] FCM batch send failed:", err.message);
    }
  }

  return { count: sentCount, invalidTokens, configured: true };
}

/**
 * Send push notifications via Expo Push API (for ExponentPushToken) and Firebase FCM (for native device tokens)
 */
export const sendPushNotifications = async (messages) => {
  if (!messages || messages.length === 0) return { success: true, count: 0 };

  const expoMessages = [];
  const fcmMessages = [];

  for (const msg of messages) {
    if (msg?.to && EXPO_TOKEN_REGEX.test(msg.to)) {
      expoMessages.push(msg);
    } else if (msg?.to) {
      fcmMessages.push(msg);
    }
  }

  const [expoResult, fcmResult] = await Promise.all([
    sendExpoBatch(expoMessages),
    sendFcmBatch(fcmMessages),
  ]);

  await deactivateInvalidTokens([
    ...expoResult.invalidTokens,
    ...fcmResult.invalidTokens,
  ]);

  return {
    success: fcmResult.configured || expoMessages.length > 0,
    count: expoResult.count + fcmResult.count,
    fcmConfigured: fcmResult.configured,
  };
};

export const sendExpoPushNotifications = sendPushNotifications;

const sendLiveStarted = async (stream) => {
  const notifTitle = "🔴 লাইভ বয়ান শুরু হয়েছে!";
  const speakerText = stream.author ? ` (${stream.author})` : "";
  const notifBody = `${stream.title}${speakerText} — সরাসরি বয়ান শুনতে এখনই যুক্ত হোন।`;

  // 1. Store notification in database
  const notification = await Notification.create({
    title: notifTitle,
    message: notifBody,
    type: "live_started",
    data: {
      streamId: String(stream._id),
      roomName: stream.roomName,
      title: stream.title,
      author: stream.author,
      category: stream.category,
      location: stream.location,
    },
  });

  // 2. Real-time instant Socket.io broadcast to all connected devices
  const io = getIO();
  if (io) {
    io.emit("live:started", {
      id: notification._id,
      title: notifTitle,
      message: notifBody,
      streamId: String(stream._id),
      roomName: stream.roomName,
      streamTitle: stream.title,
      author: stream.author,
      category: stream.category,
      location: stream.location,
    });
    notification.isSocketSent = true;
  }

  // 3. Dispatch native Push Notifications to all registered mobile devices
  try {
    const activeTokens = await PushToken.find({ isActive: true })
      .select("token")
      .lean();

    if (activeTokens.length > 0) {
      const messages = activeTokens.map((item) => ({
        to: item.token,
        sound: "default",
        title: notifTitle,
        body: notifBody,
        channelId: "live-stream",
        priority: "high",
        badge: 1,
        data: {
          type: "live_started",
          streamId: String(stream._id),
          roomName: stream.roomName,
          title: stream.title,
          author: stream.author,
          category: stream.category,
          location: stream.location,
        },
      }));

      const pushResult = await sendPushNotifications(messages);
      notification.isPushSent = pushResult.count > 0;
      console.log(
        `[Push] Live Started notification sent to ${pushResult.count}/${activeTokens.length} active devices.`
      );
    } else {
      console.log("[Push] No active registered push tokens found.");
    }
  } catch (err) {
    console.error("[Push] Error sending live started push notifications:", err);
  }

  await notification.save();
  return notification;
};

const sendLiveEnded = async (stream) => {
  const notifTitle = "লাইভ বয়ান সমাপ্ত হয়েছে";
  const notifBody = `${stream.title} সমাপ্ত হয়েছে। সম্পূর্ণ বয়ানের অডিও শীঘ্রই অ্যাপে যুক্ত করা হবে।`;

  const notification = await Notification.create({
    title: notifTitle,
    message: notifBody,
    type: "live_ended",
    data: {
      streamId: String(stream._id),
      roomName: stream.roomName,
      title: stream.title,
      duration: stream.duration,
    },
  });

  const io = getIO();
  if (io) {
    io.emit("live:ended", {
      id: notification._id,
      title: notifTitle,
      message: notifBody,
      streamId: String(stream._id),
      roomName: stream.roomName,
      streamTitle: stream.title,
      duration: stream.duration,
    });
    notification.isSocketSent = true;
    await notification.save();
  }

  return notification;
};

const getNotifications = async () => {
  return Notification.find().sort({ createdAt: -1 }).limit(50);
};

export { sendLiveStarted, sendLiveEnded, getNotifications };
