import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const envPath = fs.existsSync(path.join(process.cwd(), "backend", ".env"))
  ? path.join(process.cwd(), "backend", ".env")
  : path.join(process.cwd(), ".env");
dotenv.config({ path: envPath });

import connectDB from "../config/db.js";
import Quran from "../models/Quran.js";

const quranDataDir = fs.existsSync(path.join(process.cwd(), "backend", "data", "quran"))
  ? path.join(process.cwd(), "backend", "data", "quran")
  : path.join(process.cwd(), "data", "quran");

function normalizeBengaliText(text) {
  if (!text) return "";
  return text
    .replace(/\u00af\u09cd\u09b0/g, "স্র")
    .replace(/\u00af/g, "স")
    .replace(/\s+([।!?])/g, "$1");
}

export async function importCompleteQuran() {
  await connectDB();
  console.log("Connected to MongoDB. Starting full Quran import with translation & tafsir...");

  const surahsFile = path.join(quranDataDir, "surahs.json");
  if (!fs.existsSync(surahsFile)) {
    throw new Error(`surahs.json not found at ${surahsFile}`);
  }

  const surahs = JSON.parse(fs.readFileSync(surahsFile, "utf-8"));
  console.log(`Found ${surahs.length} surahs in surahs.json`);

  let imported = 0;

  for (const surah of surahs) {
    try {
      const transPath = path.join(quranDataDir, "rwwad", `${surah.number}.json`);
      const tafsirPath = path.join(quranDataDir, "mokhtasar", `${surah.number}.json`);

      let translations = [];
      let tafsirs = [];

      if (fs.existsSync(transPath)) {
        const transData = JSON.parse(fs.readFileSync(transPath, "utf-8"));
        translations = transData.result || [];
      }

      if (fs.existsSync(tafsirPath)) {
        const tafsirData = JSON.parse(fs.readFileSync(tafsirPath, "utf-8"));
        tafsirs = tafsirData.result || [];
      }

      const tafsirMap = new Map();
      tafsirs.forEach((t) => {
        tafsirMap.set(Number(t.aya), t);
      });

      // Preserve existing audio if already set
      const existingDoc = await Quran.findOne({ id: surah.number });
      const existingAudio = existingDoc?.audio?.url ? existingDoc.audio : {
        url: `https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/${surah.number}.mp3`,
        duration: null,
      };

      // Preserve existing verses timestamps if available
      const existingVerseMap = new Map();
      if (existingDoc?.verses) {
        existingDoc.verses.forEach((v) => existingVerseMap.set(v.id, v));
      }

      const verses = translations.map((ayah) => {
        const verseNum = Number(ayah.aya);
        const tafsirItem = tafsirMap.get(verseNum);
        const existingVerse = existingVerseMap.get(verseNum);

        return {
          id: verseNum,
          text_ar: ayah.arabic_text,
          bn_meaning: normalizeBengaliText(ayah.translation),
          translation_footnotes: normalizeBengaliText(ayah.footnotes || ""),
          tafsir: normalizeBengaliText(tafsirItem?.translation || ""),
          tafsir_footnotes: normalizeBengaliText(tafsirItem?.footnotes || ""),
          bn_pronunciation: existingVerse?.bn_pronunciation || "",
          audioStart: existingVerse?.audioStart ?? 0,
          audio_url: existingVerse?.audio_url || `https://everyayah.com/data/Alafasy_128kbps/${String(surah.number).padStart(3, "0")}${String(verseNum).padStart(3, "0")}.mp3`,
        };
      });

      const surahDoc = {
        id: surah.number,
        slug: surah.slug,
        para: existingDoc?.para || 1,
        name_ar: surah.nameArabic,
        name_bn: surah.nameBengali,
        listing_name_bn: surah.listingNameBengali || surah.nameBengali,
        name_en: surah.nameEnglish,
        meaning_en: surah.meaningEnglish || "",
        meaning_bn: surah.meaningBengali || "",
        type: surah.origin === "makki" ? "Meccan" : "Medinan",
        total_verses: surah.ayahCount || verses.length,
        verses,
        audio: existingAudio,
        updated_at: new Date(),
      };

      await Quran.findOneAndUpdate(
        { id: surah.number },
        { $set: surahDoc },
        { upsert: true, new: true }
      );

      imported++;
      if (imported % 10 === 0 || imported === surahs.length) {
        console.log(`[${imported}/${surahs.length}] Imported Surah ${surah.number} (${surah.nameEnglish}) with ${verses.length} verses & tafsir.`);
      }
    } catch (err) {
      console.error(`Error importing Surah ${surah.number}:`, err.message);
    }
  }

  console.log(`\nImport complete! Total Surahs imported: ${imported}`);
  return imported;
}

if (process.argv[1]?.endsWith("importCompleteQuran.js")) {
  importCompleteQuran()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Import failed:", err);
      process.exit(1);
    });
}
