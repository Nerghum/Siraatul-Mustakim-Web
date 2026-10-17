/**
 * Boyan API client.
 * Talks to the backend at NEXT_PUBLIC_API_URL/api/boyans.
 *
 * The backend supports server-side filtering:
 *   ?q=        — search title/author/category/location
 *   ?category= — exact category match
 *   ?location= — district/location match
 *   ?page=     — 1-indexed
 *   ?limit=    — items per page (default 50)
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export type BoyanApiItem = {
  _id: string;
  title: string;
  category: string;
  author: string;
  location?: string;
  mediaType?: "audio" | "video";
  youtubeUrl?: string;
  audioUrl: string | null;
  audioFormat: string | null;
  audioDuration: number | null;
  createdAt: string;
  updatedAt: string;
};

export type BoyanCategoryItem = {
  id: string;
  _id: string;
  name: string;
  slug: string;
  count: number;
};

export type BoyanListResult = {
  items: BoyanApiItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function extractYoutubeId(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : "";
}

export async function fetchBoyanList(params: {
  q?: string;
  category?: string;
  location?: string;
  mediaType?: "audio" | "video";
  page?: number;
  limit?: number;
}): Promise<BoyanListResult> {
  const url = new URL(`${API_BASE}/api/boyan`);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.category) url.searchParams.set("category", params.category);
  if (params.location) url.searchParams.set("location", params.location);
  if (params.mediaType) url.searchParams.set("mediaType", params.mediaType);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.limit) url.searchParams.set("limit", String(params.limit));

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch boyans: ${res.status}`);
  return res.json();
}

export async function fetchBoyanById(id: string): Promise<BoyanApiItem> {
  const res = await fetch(`${API_BASE}/api/boyan/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Boyan not found: ${res.status}`);
  return res.json();
}

export async function fetchBoyanCategories(): Promise<BoyanCategoryItem[]> {
  const res = await fetch(`${API_BASE}/api/boyan/categories`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Failed to fetch boyan categories: ${res.status}`);
  return res.json();
}

/** Resolve a relative audio path to a full URL. */
export function boyanAudioUrl(url: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}/${url.replace(/^\//, "")}`;
}
