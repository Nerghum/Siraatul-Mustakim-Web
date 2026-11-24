import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },
    order: {
      type: Number,
      default: 1,
    },
    content: {
      type: String,
      default: "",
    },
  },
  { _id: true },
);

const kitabSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      default: "",
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      default: "",
    },
    bookType: {
      type: String,
      enum: ["pdf", "text"],
      default: "pdf",
    },
    chapters: {
      type: [chapterSchema],
      default: [],
    },
    coverImages: {
      type: [String],
      default: [],
    },
    pdf: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "draft",
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Kitab", kitabSchema);

