import mongoose from "mongoose";

const pushTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    platform: {
      type: String,
      enum: ["android", "ios", "web", "unknown"],
      default: "android",
    },
    deviceId: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

pushTokenSchema.index({ token: 1 });
pushTokenSchema.index({ isActive: 1 });

export default mongoose.model("PushToken", pushTokenSchema);
