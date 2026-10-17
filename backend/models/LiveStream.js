import mongoose from "mongoose";

const liveStreamSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    roomName: { type: String, required: true, unique: true },
    streamKey: { type: String, required: true },
    startedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    isLive: { type: Boolean, default: true },
    recordingUrl: { type: String, default: null },
    recordingPath: { type: String, default: null },
    duration: { type: Number, default: 0 },
    listenerCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["live", "ended", "processing"],
      default: "live",
    },
  },
  { timestamps: true }
);

export default mongoose.model("LiveStream", liveStreamSchema);
