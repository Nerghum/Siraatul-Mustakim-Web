import mongoose from "mongoose";

const liveStreamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "বয়ান" },
    author: { type: String, trim: true, default: "মুফতি জাফর আহমেদ" },
    location: { type: String, trim: true, default: "" },
    roomName: { type: String, required: true, unique: true },
    streamKey: { type: String, required: true },
    startedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    isLive: { type: Boolean, default: true },
    isPaused: { type: Boolean, default: false },
    pauseMessage: {
      type: String,
      trim: true,
      default: "সাময়িক বিরতি চলছে। কিছুক্ষণ পর আবার সম্প্রচার শুরু হবে।",
    },
    recordingUrl: { type: String, default: null },
    recordingPath: { type: String, default: null },
    duration: { type: Number, default: 0 },
    listenerCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["live", "paused", "ended", "processing"],
      default: "live",
    },
    boyanId: { type: mongoose.Schema.Types.ObjectId, ref: "Boyan", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("LiveStream", liveStreamSchema);
