import mongoose from "mongoose";

const malfuzatSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      enum: ["text", "audio"],
      required: true,
      default: "text",
    },
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
    description: {
      type: String,
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
  },
  { timestamps: true }
);

malfuzatSchema.index({ mode: 1, category: 1 });
malfuzatSchema.index({ createdAt: -1 });

const Malfuzat = mongoose.model("Malfuzat", malfuzatSchema);

export default Malfuzat;
