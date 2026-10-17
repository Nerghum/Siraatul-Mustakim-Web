import mongoose from "mongoose";

const duaChapterSchema = new mongoose.Schema(
  {
    chapterId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    serial: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const DuaChapter = mongoose.model("DuaChapter", duaChapterSchema);

export default DuaChapter;
