import type { AdvertisementItem } from "@/types/ad";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

// In-memory cache for ultra-fast instant rendering without layout shift
const adCache = new Map<string, { data: AdvertisementItem[]; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute

export function getCachedAdsSync(placement?: string): AdvertisementItem[] | null {
  const key = placement || "all";
  const entry = adCache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  if (typeof window !== "undefined") {
    try {
      const raw = sessionStorage.getItem(`ad_cache_${key}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          adCache.set(key, parsed);
          return parsed.data;
        }
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }
  return null;
}

/**
 * Resolves full public URL for uploaded ad banner/image.
 */
export function resolveAdImageUrl(value?: string | null): string {
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return `${API_BASE}${normalizedPath}`;
}

/**
 * Fetches active advertisements for a specific placement or all active ads.
 */
export async function fetchAds(placement?: string): Promise<AdvertisementItem[]> {
  const key = placement || "all";
  try {
    const url = new URL(`${API_BASE}/api/ads`);
    if (placement) {
      url.searchParams.set("placement", placement);
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      return [];
    }

    const data: AdvertisementItem[] = await response.json();
    const entry = { data, timestamp: Date.now() };
    adCache.set(key, entry);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(`ad_cache_${key}`, JSON.stringify(entry));
      } catch {
        // Ignore
      }
    }
    return data;
  } catch (error) {
    console.warn("Failed to fetch ads:", error);
    return [];
  }
}

/**
 * Tracks click on an advertisement.
 */
export async function trackAdClick(id: string): Promise<void> {
  if (!id) return;
  try {
    await fetch(`${API_BASE}/api/ads/${id}/click`, {
      method: "POST",
    });
  } catch {
    // Non-blocking telemetry
  }
}
