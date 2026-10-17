import mongoose from "mongoose";

const boyanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      trim: true,
      default: "",
    },
    mediaType: {
      type: String,
      enum: ["audio", "video"],
      default: "audio",
    },
    youtubeUrl: {
      type: String,
      trim: true,
      default: "",
    },
    audioUrl: {
      type: String,
      default: null,
    },
    audioFormat: {
      type: String,
      default: null,
    },
    audioDuration: {
      type: Number,
      default: null,
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

boyanSchema.index({ category: 1 });
boyanSchema.index({ location: 1 });
boyanSchema.index({ mediaType: 1 });
boyanSchema.index({ createdAt: -1 });

const Boyan = mongoose.model("Boyan", boyanSchema);

export default Boyan;
