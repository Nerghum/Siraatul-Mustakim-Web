import mongoose from "mongoose";

const kitabSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug:{
      type: String,
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
  },
  { timestamps: true },
);

export default mongoose.model("Kitab", kitabSchema);
