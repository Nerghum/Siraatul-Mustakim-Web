export interface DuaChapter {
  _id: string;
  chapterId: string;
  title: string;
  icon: string;
  serial: number;
  createdAt: string;
  updatedAt: string;
}

export interface DuaItem {
  _id: string;
  duaId: string;
  chapterId: string;
  serial: number;
  title: string;
  sourceLabel?: string;
  sourceLabelBangla?: string;
  sourceLabelArabic?: string;
  ayahLabel?: string;
  arabic: string;
  pronunciation?: string;
  translation: string;
  tafsir?: string;
  audioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChapterPayload {
  chapterId: string;
  title: string;
  icon: string;
  serial?: number;
}

export interface UpdateChapterPayload {
  title?: string;
  icon?: string;
  serial?: number;
}

export interface CreateDuaPayload {
  duaId?: string;
  chapterId: string;
  title: string;
  sourceLabel?: string;
  sourceLabelBangla?: string;
  sourceLabelArabic?: string;
  ayahLabel?: string;
  arabic: string;
  pronunciation?: string;
  translation: string;
  tafsir?: string;
  audioUrl?: string;
}

export interface UpdateDuaPayload {
  chapterId?: string;
  serial?: number;
  title?: string;
  sourceLabel?: string;
  sourceLabelBangla?: string;
  sourceLabelArabic?: string;
  ayahLabel?: string;
  arabic?: string;
  pronunciation?: string;
  translation?: string;
  tafsir?: string;
  audioUrl?: string;
}
