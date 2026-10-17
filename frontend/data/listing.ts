/**
 * Listing endpoint shared by all content types.
 * – masail          → real backend API  (GET /api/masail)
 * – books           → real backend API  (GET /api/kitab)
 * – malfujat-text   → real backend API  (GET /api/malfuzat?mode=text)
 * – malfujat-audio  → real backend API  (GET /api/malfuzat?mode=audio)
 * – everything else → mock datasets (to be replaced one-by-one)
 */

import { mockFetch } from "@/lib/mock-api";
import { fetchKitabList } from "@/lib/api/kitab";
import { fetchMasailList } from "@/lib/api/masail";
import { fetchMalfuzatList } from "@/lib/api/malfuzat";
import { fetchPublicArticles } from "@/lib/api/articles";
import type { ListingItem, ListingNamespace, VideoItem } from "@/types/listing";
import { MOCK_ARTICLES, MOCK_ARTICLES_TOTAL_PAGES } from "./mockArticles";
import { fetchBoyanList, boyanAudioUrl, extractYoutubeId } from "@/lib/api/boyan";
import { MOCK_VIDEOS, MOCK_VIDEOS_TOTAL_PAGES } from "./mockVideos";

const MOCK_SOURCES: Record<
  string,
  { items: ListingItem[]; totalPages: number }
> = {
  videos: { items: MOCK_VIDEOS, totalPages: MOCK_VIDEOS_TOTAL_PAGES },
};

export type ListingParams = {
  query?: string;
  category?: string | null;
  location?: string | null;
  page?: number;
};

export type ListingResult = {
  items: ListingItem[];
  totalPages: number;
};

export async function getListing(
  namespace: ListingNamespace,
  params: ListingParams,
): Promise<ListingResult> {
  // ── Articles: real API ───────────────────────────────────────────────────
  if (namespace === "articles") {
    try {
      const all = await fetchPublicArticles({ limit: 1000 });
      const needle = (params.query ?? "").trim().toLowerCase();
      const category = params.category ?? null;

      let filtered = all.items.filter((a: any) => {
        if (needle && !a.title.toLowerCase().includes(needle) && !a.content.toLowerCase().includes(needle)) return false;
        if (category && (!a.tags || !a.tags.includes(category))) return false;
        return true;
      });

      const limit = 20;
      const page = params.page ?? 1;
      const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
      const start = (page - 1) * limit;
      const pageItems = filtered.slice(start, start + limit);

      const items: ListingItem[] = pageItems.map((a: any) => ({
        id: a.id,
        title: a.title,
        excerpt: a.excerpt,
        author: a.author?.name || "লেখক",
        date: a.date,
        views: 0,
        category: a.tags?.[0] || "",
      }));

      return { items, totalPages };
    } catch {
      return { items: [], totalPages: 1 };
    }
  }

  // ── Masail: real API ─────────────────────────────────────────────────────
  if (namespace === "masail") {
    try {
      const all = await fetchMasailList();
      const needle = (params.query ?? "").trim().toLowerCase();
      const category = params.category ?? null;

      let filtered = all.filter((m) => {
        if (needle && !m.title.toLowerCase().includes(needle) && !m.description.toLowerCase().includes(needle)) return false;
        if (category && m.category !== category) return false;
        return true;
      });

      const limit = 20;
      const page = params.page ?? 1;
      const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
      const start = (page - 1) * limit;
      const pageItems = filtered.slice(start, start + limit);

      const items: ListingItem[] = pageItems.map((m) => ({
        id: m._id,
        title: m.title,
        excerpt: (m.description || "").replace(/<[^>]*>?/gm, '').slice(0, 200),
        author: "সিরাতুল মুস্তাকিম",
        date: m.createdAt,
        views: 0,
        category: m.category ?? "",
      }));

      return { items, totalPages };
    } catch {
      return { items: [], totalPages: 1 };
    }
  }

  // ── Books: real API ──────────────────────────────────────────────────────
  if (namespace === "books") {
    try {
      const result = await fetchKitabList({
        q: params.query ?? "",
        category: params.category,
        page: params.page ?? 1,
        limit: 20,
        status: "published",
      });

      // Map KitabItem → ListingItem
      const items: ListingItem[] = result.items.map((k) => ({
        id: k._id,
        title: k.title,
        author: k.author,
        excerpt: k.content?.slice(0, 200) ?? "",
        date: k.createdAt,
        views: 0,
        category: k.category ?? "",
        // Pass cover image URL through so BookCard can use it
        coverImage: k.coverImages?.[0] ?? "",
      }));

      return { items, totalPages: result.totalPages };
    } catch {
      // Fallback: return empty so the UI shows the empty state gracefully
      return { items: [], totalPages: 1 };
    }
  }

  // ── Videos (Video Bayan): real API ────────────────────────────────────────
  if (namespace === "videos") {
    try {
      const result = await fetchBoyanList({
        mediaType: "video",
        q: params.query ?? "",
        category: params.category ?? undefined,
        page: params.page ?? 1,
        limit: 12,
      });

      const items: VideoItem[] = result.items.map((b) => ({
        id: b._id,
        title: b.title,
        excerpt: "",
        author: b.author ?? "",
        date: b.createdAt,
        views: 0,
        category: b.category ?? "",
        youtubeId: extractYoutubeId(b.youtubeUrl),
      }));

      return { items, totalPages: Math.max(1, result.totalPages) };
    } catch (err) {
      console.error("Failed to fetch video boyans:", err);
      return { items: [], totalPages: 1 };
    }
  }

  // ── Boyans: real API ──────────────────────────────────────────────────────
  if (namespace === "bayan") {
    try {
      const result = await fetchBoyanList({
        mediaType: "audio",
        q: params.query ?? "",
        category: params.category ?? undefined,
        location: params.location ?? undefined,
        page: params.page ?? 1,
        limit: 20,
      });

      const items: ListingItem[] = result.items.map((b) => ({
        id: b._id,
        title: b.title,
        excerpt: "",
        author: b.author ?? "",
        date: b.createdAt,
        views: 0,
        category: b.category ?? "",
        audioUrl: boyanAudioUrl(b.audioUrl),
        location: b.location ?? "",
        durationSec: b.audioDuration ?? 0,
      }));

      return { items, totalPages: result.totalPages };
    } catch {
      return { items: [], totalPages: 1 };
    }
  }

  // ── Malfujat text/audio: real API ────────────────────────────────────────
  if (namespace === "malfujat-text" || namespace === "malfujat-audio") {
    const mode = namespace === "malfujat-audio" ? "audio" : "text";
    try {
      const result = await fetchMalfuzatList({
        q: params.query ?? "",
        category: params.category ?? undefined,
        mode,
        page: params.page ?? 1,
        limit: 20,
      });

      const items: ListingItem[] = result.items.map((m) => ({
        id: m._id,
        title: m.title,
        excerpt: m.description ?? "",
        author: m.author ?? "",
        date: m.createdAt,
        views: 0,
        category: m.category ?? "",
        // Carry audio-specific fields for the audio card
        ...(mode === "audio" && {
          audioUrl: m.audioUrl ?? "",
          location: "",
          durationSec: m.audioDuration ?? 0,
        }),
      }));

      return { items, totalPages: result.totalPages };
    } catch {
      return { items: [], totalPages: 1 };
    }
  }

  // ── Everything else: mock data ───────────────────────────────────────────
  const source = MOCK_SOURCES[namespace as Exclude<ListingNamespace, "books" | "masail" | "malfujat-text" | "malfujat-audio" | "articles" | "bayan">];
  const needle = (params.query ?? "").trim().toLowerCase();
  const category = params.category ?? null;

  const items = source.items.filter((item) => {
    if (category && item.category !== category) return false;
    if (
      params.location &&
      "location" in item &&
      (item as { location?: string }).location !== params.location
    ) {
      return false;
    }
    if (!needle) return true;
    return item.title.toLowerCase().includes(needle) || item.excerpt.toLowerCase().includes(needle);
  });

  const isFiltered = Boolean(needle || category);

  const paddedItems = [];
  if (items.length > 0) {
    for (let i = 0; i < 20; i++) {
      paddedItems.push({
        ...items[i % items.length],
        id: `${items[i % items.length].id}-${i}`,
      });
    }
  }

  return mockFetch({ items: paddedItems, totalPages: isFiltered ? 1 : source.totalPages });
}

