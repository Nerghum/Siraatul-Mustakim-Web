import mongoose from "mongoose";

const masailCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
}, { timestamps: true });

export default mongoose.model("MasailCategory", masailCategorySchema);
