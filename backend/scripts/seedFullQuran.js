import "dotenv/config";
import Quran from "../models/Quran.js";
import connectDB from "../config/db.js";

// Standard accepted Bengali Surah names list (1 to 114)
const SURAH_NAMES_BN = [
  "আল-ফাতিহা", "আল-বাকারা", "আলে-ইমরান", "আন-নিসা", "আল-মায়িদাহ", "আল-আনআম", "আল-আরাফ", "আল-আনফাল",
  "আত-তাওবাহ", "ইউনুস", "হূদ", "ইউসুফ", "আর-রাদ", "ইবরাহীম", "আল-হিজর", "আন-নাহল",
  "বনী ইসরাঈল", "আল-কাহফ", "মারইয়াম", "ত্বা-হা", "আল-আম্বিয়া", "আল-হাজ্জ", "আল-মুমিনূন", "আন-নূর",
  "আল-ফুরকান", "আশ-শুআরা", "আন-নামল", "আল-কাসাস", "আল-আনকাবূত", "আর-রূম", "লুকমান", "আস-সাজদাহ",
  "আল-আহযাব", "সাবা", "ফাতির", "ইয়াসীন", "আস-সাফফাত", "সোয়াদ", "আজ-জুমার", "আল-মু'মিন",
  "ফুসসিলাত", "আশ-শূরা", "আজ-জুখরূফ", "আদ-দুখান", "আল-জাসিয়াহ", "আল-আহকাফ", "মুহাম্মদ", "আল-ফাতহ",
  "আল-হুজুরাত", "কাফ", "আয-যারিয়াত", "আত-তূর", "আন-নাজম", "আল-কামার", "আর-রাহমান", "আল-ওয়াকিয়াহ",
  "আল-হাদীদ", "আল-মুজাদালাহ", "আল-হাশর", "আল-মুমতাহানাহ", "আস-সাফ", "আল-জুমুআহ", "আল-মুনাফিকূন", "আত-তাগাবুন",
  "আত-ত্বালাক", "আত-তাহরীম", "আল-মুলক", "আল-কলম", "আল-হাক্কাহ", "আল-মাআরিজ", "নূহ", "আল-জ্বিন",
  "আল-মুযযাম্মিল", "আল-মুদ্দাসসির", "আল-কিয়ামাহ", "আল-ইনসান", "আল-মুরসালাত", "আন-নাবা", "আন-নাযিআত", "আবাসা",
  "আত-তাকবীর", "আল-ইনফিতার", "আল-মুতাফফিফীন", "আল-ইনশিকাক", "আল-বুরূজ", "আত-তারিক", "আল-আলা", "আল-গাশিয়াহ",
  "আল-ফজর", "আল-বালাদ", "আশ-শামস", "আল-লাইল", "আদ-দুহা", "আল-ইনশিরাহ", "আত-তীন", "আল-আলাক",
  "আল-কদর", "আল-বায়্যিনাহ", "আল-যিলযাল", "আল-আদিয়াত", "আল-কারিয়াহ", "আত-তাকাসুর", "আল-আসর", "আল-হুমাযাহ",
  "আল-ফীল", "কুরাইশ", "আল-মাউন", "আল-কাউসার", "আল-কাফিরূন", "আন-নাসর", "আল-লাহাব", "আল-ইখলাস",
  "আল-ফালাক", "আন-নাস"
];

async function fetchWithRetry(url, retries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, delay * attempt));
    }
  }
}

async function fetchSurahData(id) {
  const [surahRes, audioRes] = await Promise.all([
    fetchWithRetry(`https://api.alquran.cloud/v1/surah/${id}/editions/quran-uthmani,bn.bengali`),
    fetchWithRetry(`https://api.quran.com/api/v4/chapter_recitations/7/${id}?segments=true`).catch(() => null)
  ]);

  if (!surahRes?.data || surahRes.data.length < 2) {
    throw new Error(`Failed to fetch surah text for Surah ${id}`);
  }

  const uthmani = surahRes.data[0];
  const bengali = surahRes.data[1];
  const audioFile = audioRes?.audio_file;

  const totalVerses = uthmani.ayahs.length;
  const juzNumber = uthmani.ayahs[0]?.juz || 1;

  // Calculate audio duration & timestamps
  const timestamps = audioFile?.timestamps || [];
  let duration = 0;
  if (timestamps.length > 0) {
    const lastTimestamp = timestamps[timestamps.length - 1];
    duration = Math.round((lastTimestamp.timestamp_to || lastTimestamp.timestamp_from) / 1000);
  }

  // Build timestamp map: verse_key "surahId:verseId" -> audioStart in seconds
  const timestampMap = new Map();
  timestamps.forEach((ts) => {
    if (ts.verse_key) {
      const parts = ts.verse_key.split(":");
      const vNum = parseInt(parts[1], 10);
      timestampMap.set(vNum, ts.timestamp_from / 1000);
    }
  });

  // Map verses
  const verses = uthmani.ayahs.map((ayah, index) => {
    const verseId = ayah.numberInSurah;
    const bnAyah = bengali.ayahs[index];
    const audioStart = timestampMap.has(verseId)
      ? timestampMap.get(verseId)
      : index === 0 ? 0 : 0;

    return {
      id: verseId,
      text_ar: ayah.text,
      bn_meaning: bnAyah?.text || "",
      bn_pronunciation: "",
      audioStart: Number(audioStart.toFixed(3)),
    };
  });

  const audioUrl = audioFile?.audio_url || `https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/${id}.mp3`;

  return {
    id,
    para: juzNumber,
    name_ar: uthmani.name,
    name_bn: SURAH_NAMES_BN[id - 1] || uthmani.englishName,
    name_en: uthmani.englishName,
    type: uthmani.revelationType === "Meccan" ? "Meccan" : "Medinan",
    total_verses: totalVerses,
    verses,
    audio: {
      url: audioUrl,
      duration: duration || null,
    },
  };
}

export async function seedQuranDatabase(onProgress) {
  await connectDB();
  console.log("Connected to MongoDB. Starting full Quran import (114 Surahs)...");

  const totalSurahs = 114;
  const batchSize = 6; // 6 concurrent downloads
  let completed = 0;

  for (let i = 1; i <= totalSurahs; i += batchSize) {
    const batch = [];
    for (let j = i; j < i + batchSize && j <= totalSurahs; j++) {
      batch.push(j);
    }

    const batchResults = await Promise.all(
      batch.map(async (surahId) => {
        try {
          const surahDoc = await fetchSurahData(surahId);
          await Quran.findOneAndUpdate(
            { id: surahDoc.id },
            surahDoc,
            { upsert: true, new: true }
          );
          completed++;
          if (onProgress) onProgress(completed, totalSurahs, surahDoc.name_en);
          console.log(`[${completed}/${totalSurahs}] Surah ${surahDoc.id}: ${surahDoc.name_en} (${surahDoc.name_bn}) - ${surahDoc.total_verses} verses synced with audio.`);
          return true;
        } catch (err) {
          console.error(`Error syncing Surah ${surahId}:`, err.message);
          return false;
        }
      })
    );

    // Small delay between batches to respect rate limits
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log("\nFull Quran data import finished!");
  return completed;
}

// If executed directly from command line
if (process.argv[1]?.endsWith("seedFullQuran.js")) {
  seedQuranDatabase()
    .then((count) => {
      console.log(`Successfully seeded ${count} surahs!`);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}
