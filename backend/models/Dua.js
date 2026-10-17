import mongoose from "mongoose";

const duaSchema = new mongoose.Schema(
  {
    duaId: {
      type: String,
      required: true,
      unique: true,
    },
    chapterId: {
      type: String,
      required: true,
      index: true,
    },
    serial: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    sourceLabel: {
      type: String,
    },
    sourceLabelBangla: {
      type: String,
    },
    sourceLabelArabic: {
      type: String,
    },
    ayahLabel: {
      type: String,
    },
    arabic: {
      type: String,
      required: true,
    },
    pronunciation: {
      type: String,
      default: "",
    },
    translation: {
      type: String,
      required: true,
    },
    tafsir: {
      type: String,
    },
    audioUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Dua = mongoose.model("Dua", duaSchema);

export default Dua;
