/**
 * One row in a listing page (`/masail`, `/articles`). The Q&A listing has its
 * own item type — it carries an extra public question number.
 */
export type ListingItem = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  /** ISO date — formatted per locale at render time. */
  date: string;
  views: number;
  /** Matches a `slug` in `data/mockCategories.ts`. */
  category: string;
  /** Optional cover image URL — populated for books from the real API. */
  coverImage?: string;
};


/** i18n namespace holding a listing's `title`/`subtitle`/`searchPlaceholder`/`empty`. */
export type ListingNamespace =
  | "masail"
  | "articles"
  | "books"
  | "videos"
  | "bayan"
  | "malfujat-text"
  | "malfujat-audio";

export type VideoItem = ListingItem & {
  youtubeId: string;
};

export type MalfujatAudioItem = ListingItem & {
  location: string;
  audioUrl: string;
  /** Duration in seconds from the backend's audioDuration field. */
  durationSec?: number;
};
