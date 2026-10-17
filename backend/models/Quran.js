import mongoose from "mongoose";

const verseSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      description: "Verse number within the Surah (1-based)",
    },
    text_ar: {
      type: String,
      required: true,
      description: "Arabic verse text",
    },
    bn_meaning: {
      type: String,
      required: true,
      description: "Bengali meaning/translation",
    },
    bn_pronunciation: {
      type: String,
      default: "",
      description: "Bengali pronunciation guide (optional)",
    },
    tafsir: {
      type: String,
      default: "",
      description: "Bengali concise tafsir",
    },
    translation_footnotes: {
      type: String,
      default: "",
      description: "Footnotes for Bengali translation",
    },
    tafsir_footnotes: {
      type: String,
      default: "",
      description: "Footnotes for Bengali tafsir",
    },
    audio_url: {
      type: String,
      default: "",
      description: "URL to individual Ayah audio",
    },
    audioStart: {
      type: Number,
      default: 0,
      min: 0,
      description: "Start time in seconds within the Surah audio",
    },
  },
  { _id: false }
);

const surahAudioSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      default: null,
      description: "URL to full Surah audio file",
    },
    duration: {
      type: Number,
      default: null,
      description: "Audio duration in seconds",
    },
  },
  { _id: false }
);

const quranSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 114,
      description: "Surah number (1-114)",
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      description: "URL-friendly slug (e.g. surah-faatiha)",
    },
    para: {
      type: Number,
      default: 1,
      min: 1,
      max: 30,
      description: "Juz / Para number (1-30)",
    },
    name_ar: {
      type: String,
      required: true,
      description: "Surah name in Arabic",
    },
    name_bn: {
      type: String,
      required: true,
      description: "Surah name in Bengali (for search)",
    },
    name_en: {
      type: String,
      required: true,
      description: "Surah name in English",
    },
    meaning_en: {
      type: String,
      default: "",
      description: "English meaning of Surah name",
    },
    meaning_bn: {
      type: String,
      default: "",
      description: "Bengali meaning of Surah name",
    },
    listing_name_bn: {
      type: String,
      default: "",
      description: "Alternative or listing Bengali name",
    },
    type: {
      type: String,
      required: true,
      description: "Revelation type - Meccan or Medinan",
    },
    total_verses: {
      type: Number,
      required: true,
      min: 1,
      description: "Total number of verses in this Surah",
    },
    verses: [verseSchema],
    audio: {
      type: surahAudioSchema,
      default: () => ({ url: null, duration: null }),
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Create compound text index for search functionality
quranSchema.index({
  name_ar: "text",
  name_bn: "text",
  name_en: "text",
  meaning_en: "text",
  meaning_bn: "text",
  "verses.text_ar": "text",
  "verses.bn_meaning": "text",
  "verses.tafsir": "text",
});

const Quran = mongoose.model("Quran", quranSchema);

export default Quran;
