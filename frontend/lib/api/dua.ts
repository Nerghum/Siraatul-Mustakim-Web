/**
 * Dua API client.
 * Talks to the backend at NEXT_PUBLIC_API_URL/api/dua.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export type DuaChapterApiItem = {
  _id: string;
  chapterId: string;
  id: string;
  title: string;
  icon: string;
  serial: number;
  count?: number;
  items?: DuaApiItem[];
  createdAt?: string;
  updatedAt?: string;
};

export type DuaApiItem = {
  _id: string;
  duaId: string;
  id: string;
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
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchDuaChapters(params?: {
  q?: string;
  includeItems?: boolean;
}): Promise<DuaChapterApiItem[]> {
  const url = new URL(`${API_BASE}/api/dua/chapters`);
  if (params?.q) url.searchParams.set("q", params.q);
  if (params?.includeItems) url.searchParams.set("includeItems", "true");

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch dua chapters: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.chapters) ? data.chapters : [];
}

export async function fetchDuaChapterById(chapterId: string): Promise<DuaChapterApiItem | null> {
  const res = await fetch(`${API_BASE}/api/dua/chapters/${chapterId}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data?.chapter ?? null;
}

export async function fetchDuaChapterItems(
  chapterId: string,
  q?: string
): Promise<{ chapter: DuaChapterApiItem | null; items: DuaApiItem[] }> {
  const url = new URL(`${API_BASE}/api/dua/chapters/${chapterId}/items`);
  if (q) url.searchParams.set("q", q);

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch chapter duas: ${res.status}`);
  const data = await res.json();
  return {
    chapter: data?.chapter ?? null,
    items: Array.isArray(data?.items) ? data.items : [],
  };
}

export async function fetchDuaItems(params?: {
  chapterId?: string;
  q?: string;
  ids?: string[];
}): Promise<DuaApiItem[]> {
  const url = new URL(`${API_BASE}/api/dua/items`);
  if (params?.chapterId) url.searchParams.set("chapterId", params.chapterId);
  if (params?.q) url.searchParams.set("q", params.q);
  if (params?.ids?.length) url.searchParams.set("ids", params.ids.join(","));

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch duas: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data?.items) ? data.items : [];
}

export async function fetchDuaById(
  id: string
): Promise<{ item: DuaApiItem | null; chapter: DuaChapterApiItem | null }> {
  const res = await fetch(`${API_BASE}/api/dua/items/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return { item: null, chapter: null };
  const data = await res.json();
  return {
    item: data?.item ?? null,
    chapter: data?.chapter ?? null,
  };
}
