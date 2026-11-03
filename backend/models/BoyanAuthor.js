import mongoose from "mongoose";

const boyanAuthorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("BoyanAuthor", boyanAuthorSchema);
