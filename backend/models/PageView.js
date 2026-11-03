import mongoose from "mongoose";

const pageViewSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    entityType: {
      type: String,
      default: "page",
      trim: true,
      index: true,
    },
    entityId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },
  },
  { timestamps: true }
);

const PageView = mongoose.models.PageView || mongoose.model("PageView", pageViewSchema);

export default PageView;
