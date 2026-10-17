import mongoose from "mongoose";

const audioFileSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    filename: { type: String, required: true },
    fileUrl: { type: String, required: true },
    duration: { type: Number, default: 0 },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("AudioFile", audioFileSchema);
