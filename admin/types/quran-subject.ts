export interface SurahTitle {
  bn: string;
  en: string;
  ar: string;
}

export interface QuranSubject {
  _id: string;
  id: number;
  category_id: number;
  category_title: string;
  surah_id: number;
  surah_title: SurahTitle;
  verse_number: number;
  verse_text: string;
  author: string;
  bn_meaning: string;
  bn_pronunciation: string;
  tafsir: string;
  created_at: string;
  updated_at: string;
}

export interface CreateQuranSubjectPayload {
  id?: number;
  category_id: number;
  category_title: string;
  surah_id?: number;
  surah_title?: SurahTitle;
  verse_number: number;
  verse_text: string;
  author?: string;
  bn_meaning?: string;
  bn_pronunciation?: string;
  tafsir?: string;
}
