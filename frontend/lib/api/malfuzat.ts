/**
 * Malfuzat API client.
 * Talks to the backend at NEXT_PUBLIC_API_URL/api/malfuzat.
 *
 * The backend supports server-side filtering:
 *   ?q=      — search title/author/category
 *   ?category= — exact category match
 *   ?mode=   — "text" | "audio"
 *   ?page=   — 1-indexed
 *   ?limit=  — items per page (default 50)
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export type MalfuzatApiItem = {
  _id: string;
  mode: "text" | "audio";
  title: string;
  category: string;
  author: string;
  description: string;
  audioUrl: string | null;
  audioFormat: string | null;
  audioDuration: number | null;
  createdAt: string;
  updatedAt: string;
};

export type MalfuzatListResult = {
  items: MalfuzatApiItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function fetchMalfuzatList(params: {
  q?: string;
  category?: string;
  mode?: "text" | "audio";
  page?: number;
  limit?: number;
}): Promise<MalfuzatListResult> {
  const url = new URL(`${API_BASE}/api/malfuzat`);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.category) url.searchParams.set("category", params.category);
  if (params.mode) url.searchParams.set("mode", params.mode);
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.limit) url.searchParams.set("limit", String(params.limit));

  const res = await fetch(url.toString(), { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Failed to fetch malfuzat: ${res.status}`);
  return res.json();
}

export async function fetchMalfuzatById(id: string): Promise<MalfuzatApiItem> {
  const res = await fetch(`${API_BASE}/api/malfuzat/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Malfuzat not found: ${res.status}`);
  return res.json();
}

/** Resolve a relative audio path to a full URL. */
export function malfuzatAudioUrl(url: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}/${url.replace(/^\//, "")}`;
}
