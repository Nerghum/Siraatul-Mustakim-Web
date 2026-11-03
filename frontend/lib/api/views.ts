const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export type ViewTarget = {
  entityType?: string;
  entityId?: string;
  path?: string;
};

export function getTargetIdentifier(target: ViewTarget): string {
  if (target.entityType && target.entityId) {
    return `${target.entityType.toLowerCase()}:${target.entityId}`;
  }
  if (target.path) {
    const cleanPath = target.path.startsWith("/") ? target.path : `/${target.path}`;
    return `page:${cleanPath}`;
  }
  return "";
}

/**
 * Record a view for an entity or page path.
 * Deduplicates in sessionStorage so rapid refresh within the same session doesn't spam increments,
 * while still retrieving the fresh live view count.
 */
export async function recordView(target: ViewTarget): Promise<number | null> {
  const identifier = getTargetIdentifier(target);
  if (!identifier) return null;

  try {
    const storageKey = `sm_viewed_${identifier}`;
    const alreadyViewed = typeof window !== "undefined" && window.sessionStorage.getItem(storageKey);

    if (alreadyViewed) {
      return await fetchViewCount(target);
    }

    const res = await fetch(`${API_BASE}/api/views`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(target),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(storageKey, "1");
    }
    return typeof data.views === "number" ? data.views : null;
  } catch (error) {
    console.error("Failed to record view:", error);
    return null;
  }
}

/**
 * Fetch view count for an entity or path without incrementing.
 */
export async function fetchViewCount(target: ViewTarget): Promise<number | null> {
  const identifier = getTargetIdentifier(target);
  if (!identifier) return null;

  try {
    const params = new URLSearchParams();
    if (target.entityType && target.entityId) {
      params.set("entityType", target.entityType);
      params.set("entityId", target.entityId);
    } else if (target.path) {
      params.set("path", target.path);
    } else {
      params.set("identifier", identifier);
    }

    const res = await fetch(`${API_BASE}/api/views?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.views === "number" ? data.views : null;
  } catch (error) {
    console.error("Failed to fetch view count:", error);
    return null;
  }
}
