/**
 * Masail API client.
 * Talks to the backend at NEXT_PUBLIC_API_URL/api/masail.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export type MasailApiItem = {
  _id: string;
  title: string;
  description: string;
  category?: string;
  sl: number;
  createdAt: string;
  updatedAt: string;
};

export async function fetchMasailList(): Promise<MasailApiItem[]> {
  const res = await fetch(`${API_BASE}/api/masail`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Failed to fetch masail: ${res.status}`);
  return res.json();
}

export async function fetchMasailById(id: string): Promise<MasailApiItem> {
  const res = await fetch(`${API_BASE}/api/masail/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Masail not found: ${res.status}`);
  return res.json();
}

export type CategoryApiItem = {
  id: string;
  slug: string;
  translationKey: string;
  name: string;
  count: number;
};

export async function fetchMasailCategories(): Promise<CategoryApiItem[]> {
  const res = await fetch(`${API_BASE}/api/masail/categories`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  return res.json();
}
