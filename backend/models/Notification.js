import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["live_started", "live_ended", "general"],
      default: "general",
    },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    isPushSent: { type: Boolean, default: false },
    isSocketSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
