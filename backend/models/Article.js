import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "pending"],
      default: "pending", // require admin approval or draft by default
    },
    image: { type: String },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

const Article = mongoose.models.Article || mongoose.model("Article", articleSchema);
export default Article;
