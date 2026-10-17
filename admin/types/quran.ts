export interface QuranSurahAudio {
  url?: string | null;
  duration?: number | null;
}

export interface QuranVerse {
  id: number;
  text_ar: string;
  bn_meaning: string;
  bn_pronunciation?: string;
  audioStart?: number;
  tafsir?: string;
  translation_footnotes?: string;
  tafsir_footnotes?: string;
  audio_url?: string;
}

export interface QuranSurah {
  _id: string;
  id: number;
  slug?: string;
  para: number;
  name_ar: string;
  name_bn: string;
  name_en: string;
  meaning_en?: string;
  meaning_bn?: string;
  listing_name_bn?: string;
  type: string;
  total_verses: number;
  verses?: QuranVerse[];
  audio?: QuranSurahAudio;
  created_at: string;
  updated_at: string;
}

export interface CreateQuranSurahPayload {
  id: number;
  slug?: string;
  para: number;
  name_ar: string;
  name_bn: string;
  name_en: string;
  meaning_en?: string;
  meaning_bn?: string;
  listing_name_bn?: string;
  type: string;
  total_verses: number;
  verses?: CreateQuranVersePayload[];
}

export interface CreateQuranVersePayload {
  id: number;
  text_ar: string;
  bn_meaning: string;
  bn_pronunciation?: string;
  audioStart?: number;
  tafsir?: string;
  translation_footnotes?: string;
  tafsir_footnotes?: string;
  audio_url?: string;
}

export interface UpdateQuranSurahPayload {
  slug?: string;
  para?: number;
  name_ar?: string;
  name_bn?: string;
  name_en?: string;
  meaning_en?: string;
  meaning_bn?: string;
  listing_name_bn?: string;
  type?: string;
}

export interface UpdateQuranVersePayload {
  text_ar?: string;
  bn_meaning?: string;
  bn_pronunciation?: string;
  audioStart?: number;
  tafsir?: string;
  translation_footnotes?: string;
  tafsir_footnotes?: string;
  audio_url?: string;
}

export interface QuranAudioUploadResponse {
  data: QuranSurah;
  message: string;
}
