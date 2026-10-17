/**
 * Kitab (Books) API client.
 * Talks to the backend at NEXT_PUBLIC_API_URL/api/kitab.
 * All functions return plain objects so they are safe to pass from Server
 * Components to Client Components without serialization issues.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export type KitabChapter = {
  _id?: string;
  title: string;
  order?: number;
  content?: string;
};

export type KitabItem = {
  _id: string;
  title: string;
  author: string;
  category: string;
  coverImages: string[];
  pdf: string;
  content: string;
  bookType?: "text" | "pdf";
  chapters?: KitabChapter[];
  status: "published" | "draft";
  createdAt: string;
  updatedAt: string;
  slug?: string;
};

export type KitabListResult = {
  items: KitabItem[];
  totalPages: number;
  total: number;
};

/** Returns the absolute URL for a backend file path/URL. */
export function kitabFileUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function fetchKitabList(params: {
  q?: string;
  category?: string | null;
  page?: number;
  limit?: number;
  status?: string;
}): Promise<KitabListResult> {
  const url = new URL(`${API_BASE}/api/kitab`);
  if (params.status) url.searchParams.set("status", params.status);

  const response = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch kitabs: ${response.status}`);
  }

  const data: KitabItem[] = await response.json();

  // Filter published only on the client side (backend returns all by default)
  let items = data.filter((k) => k.status === "published");

  // Apply search filter
  if (params.q) {
    const needle = params.q.trim().toLowerCase();
    items = items.filter(
      (k) =>
        k.title.toLowerCase().includes(needle) ||
        k.author.toLowerCase().includes(needle),
    );
  }

  // Apply category filter
  if (params.category) {
    items = items.filter((k) => k.category === params.category);
  }

  const limit = params.limit ?? 20;
  const page = params.page ?? 1;
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const pageItems = items.slice(start, start + limit);

  return { items: pageItems, total, totalPages };
}

export async function fetchKitabById(id: string): Promise<KitabItem> {
  const response = await fetch(`${API_BASE}/api/kitab/${id}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Kitab not found: ${response.status}`);
  }

  return response.json();
}
