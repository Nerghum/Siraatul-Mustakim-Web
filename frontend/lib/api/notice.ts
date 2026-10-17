/**
 * Notice API client.
 * Talks to backend at NEXT_PUBLIC_API_URL/api/notice
 */

import type { NoticeItem } from "@/types/notice";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export type NoticeApiItem = {
  _id: string;
  title: string;
  date: string;
  description: string;
  image?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type NoticeListResult = {
  items: NoticeItem[];
  total: number;
  totalPages: number;
  page: number;
};

/**
 * Resolves full public URL for uploaded notice image.
 */
export function resolveNoticeImageUrl(value?: string | null): string {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return `${API_BASE}${normalizedPath}`;
}

/**
 * Truncates description for card excerpt.
 */
export function formatNoticeExcerpt(description?: string, maxLength = 160): string {
  if (!description) return "";
  const cleaned = description.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength).trim() + "...";
}

/**
 * Maps backend API item into frontend NoticeItem.
 */
export function mapNoticeApiItem(item: NoticeApiItem, index = 0): NoticeItem {
  return {
    id: item._id,
    _id: item._id,
    title: item.title || "",
    date: item.date,
    description: item.description || "",
    excerpt: formatNoticeExcerpt(item.description),
    image: item.image ? resolveNoticeImageUrl(item.image) : null,
    styleType: index % 2 === 0 ? "green" : "amber",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

/**
 * Fetches notice list with optional search, pagination, and sorting.
 */
export async function fetchNoticeList(params?: {
  q?: string;
  page?: number;
  limit?: number;
}): Promise<NoticeListResult> {
  const query = params?.q?.trim();
  const endpoint = query
    ? `${API_BASE}/api/notice/search?q=${encodeURIComponent(query)}`
    : `${API_BASE}/api/notice`;

  const response = await fetch(endpoint, {
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch notices: ${response.status}`);
  }

  const rawData: NoticeApiItem[] = await response.json();

  // Sort by date or createdAt descending
  const sorted = [...rawData].sort((a, b) => {
    const timeA = new Date(a.date || a.createdAt || 0).getTime();
    const timeB = new Date(b.date || b.createdAt || 0).getTime();
    return timeB - timeA;
  });

  const page = Math.max(1, params?.page ?? 1);
  const limit = Math.max(1, params?.limit ?? 10);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const pageItems = sorted
    .slice(start, start + limit)
    .map((item, idx) => mapNoticeApiItem(item, start + idx));

  return {
    items: pageItems,
    total,
    totalPages,
    page,
  };
}

/**
 * Fetches a single notice by its ID.
 */
export async function fetchNoticeById(id: string): Promise<NoticeItem | null> {
  if (!id) return null;

  const response = await fetch(`${API_BASE}/api/notice/${id}`, {
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    return null;
  }

  const rawItem: NoticeApiItem = await response.json();
  return mapNoticeApiItem(rawItem);
}
