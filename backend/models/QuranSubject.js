import mongoose from "mongoose";

const surahTitleSchema = new mongoose.Schema(
  {
    bn: { type: String, default: "" },
    en: { type: String, default: "" },
    ar: { type: String, default: "" },
  },
  { _id: false }
);

const quranSubjectSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true },
    category_id: { type: Number, required: true },
    category_title: { type: String, required: true },
    surah_id: { type: Number },
    surah_title: { type: surahTitleSchema, default: () => ({}) },
    verse_number: { type: Number, required: true },
    verse_text: { type: String, required: true },
    author:{type:String,default:""},
    bn_meaning: { type: String, default: "" },
    bn_pronunciation: { type: String, default: "" },
    tafsir:{type:String,default:""}
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

quranSubjectSchema.index({ verse_text: "text", bn_meaning: "text", category_title: "text" });

const QuranSubject = mongoose.model("QuranSubject", quranSubjectSchema);

export default QuranSubject;
