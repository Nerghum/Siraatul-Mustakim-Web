import { readFile } from "node:fs/promises";
import path from "node:path";
import surahRows from "./quran/surahs.json";

export type QuranOrigin = "makki" | "madani";

export type QuranSurah = {
  number: number;
  slug: string;
  nameArabic: string;
  nameEnglish: string;
  meaningEnglish: string;
  meaningBengali: string;
  nameBengali: string;
  listingNameBengali?: string;
  ayahCount: number;
  origin: QuranOrigin;
};

export type QuranAyah = {
  number: number;
  arabic: string;
  translation: string;
  translationFootnotes: string;
  tafsir: string;
  tafsirFootnotes: string;
};

export type QuranSurahContent = QuranSurah & { ayahs: QuranAyah[] };

type QuranEncAyah = {
  aya: string;
  arabic_text: string;
  translation: string;
  footnotes?: string;
};

type QuranEncResponse = { result: QuranEncAyah[] };

const surahs = surahRows as QuranSurah[];
const dataDirectory = path.join(process.cwd(), "data", "quran");
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

function normalizeBengaliText(text?: string): string {
  if (!text) return "";
  return text
    .replace(/\u00af\u09cd\u09b0/g, "স্র")
    .replace(/\u00af/g, "স")
    .replace(/\s+([।!?])/g, "$1");
}

export async function getQuranSurahs(): Promise<QuranSurah[]> {
  try {
    const res = await fetch(`${API_BASE}/api/quran?limit=114`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const json = await res.json();
      const list = json.data || json;
      if (Array.isArray(list) && list.length > 0) {
        return list.map((item: any) => ({
          number: Number(item.id),
          slug: item.slug || `surah-${item.id}`,
          nameArabic: item.name_ar,
          nameEnglish: item.name_en,
          meaningEnglish: item.meaning_en || "",
          meaningBengali: item.meaning_bn || "",
          nameBengali: item.name_bn,
          listingNameBengali: item.listing_name_bn || item.name_bn,
          ayahCount: Number(item.total_verses || item.verses?.length || 0),
          origin: (String(item.type || "").toLowerCase() === "madani" ? "madani" : "makki") as QuranOrigin,
        }));
      }
    }
  } catch {
    // Fallback to local data if backend is unreachable during static generation
  }
  return surahs;
}

export async function getQuranSurah(slug: string): Promise<QuranSurahContent | null> {
  // First, try fetching directly from backend API
  try {
    const res = await fetch(`${API_BASE}/api/quran/surah/${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.id) {
        return {
          number: Number(data.id),
          slug: data.slug || slug,
          nameArabic: data.name_ar,
          nameEnglish: data.name_en,
          meaningEnglish: data.meaning_en || "",
          meaningBengali: data.meaning_bn || "",
          nameBengali: data.name_bn,
          listingNameBengali: data.listing_name_bn || data.name_bn,
          ayahCount: Number(data.total_verses || data.verses?.length || 0),
          origin: (String(data.type || "").toLowerCase() === "madani" ? "madani" : "makki") as QuranOrigin,
          ayahs: Array.isArray(data.verses)
            ? data.verses.map((v: any) => ({
                number: Number(v.id),
                arabic: v.text_ar || v.text || "",
                translation: normalizeBengaliText(v.bn_meaning || v.translation || ""),
                translationFootnotes: normalizeBengaliText(v.translation_footnotes || ""),
                tafsir: normalizeBengaliText(v.tafsir || ""),
                tafsirFootnotes: normalizeBengaliText(v.tafsir_footnotes || ""),
              }))
            : [],
        };
      }
    }
  } catch {
    // Fallback to local JSON files if backend is unreachable
  }

  // Fallback to local JSON files
  const surah = surahs.find((entry) => entry.slug === slug || String(entry.number) === slug);
  if (!surah) return null;

  try {
    const [translationFile, tafsirFile] = await Promise.all([
      readFile(path.join(dataDirectory, "rwwad", `${surah.number}.json`), "utf8"),
      readFile(path.join(dataDirectory, "mokhtasar", `${surah.number}.json`), "utf8"),
    ]);
    const translations = (JSON.parse(translationFile) as QuranEncResponse).result;
    const tafsirs = (JSON.parse(tafsirFile) as QuranEncResponse).result;
    const tafsirByAyah = new Map(tafsirs.map((ayah) => [Number(ayah.aya), ayah]));

    return {
      ...surah,
      ayahs: translations.map((ayah) => {
        const tafsir = tafsirByAyah.get(Number(ayah.aya));
        return {
          number: Number(ayah.aya),
          arabic: ayah.arabic_text,
          translation: normalizeBengaliText(ayah.translation),
          translationFootnotes: normalizeBengaliText(ayah.footnotes ?? ""),
          tafsir: normalizeBengaliText(tafsir?.translation ?? ""),
          tafsirFootnotes: normalizeBengaliText(tafsir?.footnotes ?? ""),
        };
      }),
    };
  } catch {
    return null;
  }
}
