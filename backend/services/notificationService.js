import Notification from "../models/Notification.js";

const getIO = () => {
  return global.io;
};

const sendLiveStarted = async (stream) => {
  const notification = await Notification.create({
    title: "Live Started",
    message: `${stream.title} is now live`,
    type: "live_started",
    data: {
      streamId: stream._id,
      roomName: stream.roomName,
      title: stream.title,
    },
  });

  const io = getIO();
  if (io) {
    io.emit("live:started", {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      streamId: stream._id,
      roomName: stream.roomName,
      streamTitle: stream.title,
    });
    notification.isSocketSent = true;
    await notification.save();
  }

  // Placeholder for FCM push notification
  console.log(`[Push] Live Started: ${stream.title} is now live`);

  return notification;
};

const sendLiveEnded = async (stream) => {
  const notification = await Notification.create({
    title: "Live Ended",
    message: `${stream.title} has ended`,
    type: "live_ended",
    data: {
      streamId: stream._id,
      roomName: stream.roomName,
      title: stream.title,
      duration: stream.duration,
    },
  });

  const io = getIO();
  if (io) {
    io.emit("live:ended", {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      streamId: stream._id,
      roomName: stream.roomName,
      streamTitle: stream.title,
      duration: stream.duration,
    });
    notification.isSocketSent = true;
    await notification.save();
  }

  console.log(`[Push] Live Ended: ${stream.title} has ended (${stream.duration}s)`);

  return notification;
};

const getNotifications = async () => {
  return Notification.find().sort({ createdAt: -1 }).limit(50);
};

export { sendLiveStarted, sendLiveEnded, getNotifications };
