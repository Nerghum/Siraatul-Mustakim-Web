/**
 * Dynamic Bayan Schedule API client.
 * Fetches real events-schedule from the backend and normalizes into BayanEvent models.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

export type EventContactItem = {
  _id?: string;
  name: string;
  phone: string;
};

export type EventsScheduleApiItem = {
  _id: string;
  districtName: string;
  date: string;
  time: string;
  location: string;
  path: string;
  googleMapsUrl: string;
  title?: string;
  timeText?: string;
  type?: "amber" | "green";
  image?: string;
  contacts?: EventContactItem[];
  createdAt?: string;
  updatedAt?: string;
};

export type BayanEvent = {
  id: string;
  date: string;
  title: string;
  time: string;
  location: string;
  districtName?: string;
  type: "amber" | "green";
  image?: string;
  highlight?: string;
  contact?: string;
  contacts?: { name: string; phone: string }[];
  mapsUrl?: string;
};

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

function toBnDigits(input: string | number): string {
  return String(input).replace(/\d/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

function formatBanglaTime24To12(timeRaw: string): string {
  const clean = (timeRaw || "").trim().split(" ")[0] || "";
  const [hh, mm] = clean.split(":").map(Number);
  if (Number.isNaN(hh) || Number.isNaN(mm)) return toBnDigits(clean);

  const hour12 = hh % 12 || 12;
  const mins = String(mm).padStart(2, "0");
  const hoursStr = String(hour12).padStart(2, "0");
  return `${toBnDigits(hoursStr)}:${toBnDigits(mins)}`;
}

export function normalizeEventDate(value?: string | null): string {
  const input = (value || "").replace(/\s+/g, " ").trim();
  if (!input) return "";

  const ymd = input.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymd) {
    const [, year, month, day] = ymd;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const dmy = input.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmy) {
    const [, day, month, year] = dmy;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return input;

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function mapEventsScheduleToBayanEvent(
  item: EventsScheduleApiItem,
  fallbackIndex = 0,
): BayanEvent {
  const id = item._id || `evt-${fallbackIndex}`;
  const date = normalizeEventDate(item.date);
  const rawTime = (item.time || "").trim();
  const timeTextStr = (item.timeText || "").trim();
  const formattedClock = rawTime ? formatBanglaTime24To12(rawTime) : "";

  let displayTime = formattedClock;
  if (timeTextStr && formattedClock) {
    displayTime = `${timeTextStr} (${formattedClock})`;
  } else if (timeTextStr) {
    displayTime = timeTextStr;
  }

  const title = (item.title || "").trim() || (item.path || "").trim() || "বয়ানের মজলিস";
  const location = (item.location || "").trim() || (item.districtName || "").trim();
  const districtName = (item.districtName || "").trim();
  const highlight = (item.path || "").trim() || `${title} — বিশেষ নসীহত ও দোয়া`;

  const contactsList = Array.isArray(item.contacts)
    ? item.contacts
        .map((c) => ({
          name: (c.name || "").trim(),
          phone: (c.phone || "").trim(),
        }))
        .filter((c) => c.name || c.phone)
    : [];

  let singleContact = "";
  if (contactsList.length > 0) {
    const first = contactsList[0];
    singleContact = first.name ? `${first.name} (${first.phone})` : first.phone;
  }

  const mapsUrl = (item.googleMapsUrl || "").trim()
    ? item.googleMapsUrl.trim()
    : `https://maps.google.com/?q=${encodeURIComponent(location + (districtName ? ` ${districtName}` : ""))}`;

  const type: "amber" | "green" =
    item.type === "amber" || item.type === "green"
      ? item.type
      : fallbackIndex % 2 === 0
        ? "green"
        : "amber";

  const rawImage = (item.image || "").trim();
  const image = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${API_BASE}${rawImage.startsWith("/") ? "" : "/"}${rawImage}`
    : undefined;

  return {
    id,
    date,
    title,
    time: displayTime,
    location,
    districtName,
    type,
    image,
    highlight,
    contact: singleContact,
    contacts: contactsList,
    mapsUrl,
  };
}

export async function fetchBayanEvents(): Promise<BayanEvent[]> {
  const endpoints = [
    `${API_BASE}/api/events-schedule`,
    `${API_BASE}/api/bayan-schedule`,
  ];

  let items: EventsScheduleApiItem[] | null = null;
  let lastError: Error | null = null;

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        cache: "no-store",
      });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) {
          items = json;
          break;
        }
      }
    } catch (err) {
      lastError = err as Error;
    }
  }

  if (items === null) {
    throw lastError || new Error("Failed to reach backend events schedule API");
  }

  return items.map((item, idx) => mapEventsScheduleToBayanEvent(item, idx));
}

export async function fetchBayanEventById(id: string): Promise<BayanEvent | null> {
  if (!id) return null;
  try {
    const endpoints = [
      `${API_BASE}/api/events-schedule/${id}`,
      `${API_BASE}/api/bayan-schedule/${id}`,
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, {
          cache: "no-store",
        });
        if (res.ok) {
          const item = (await res.json()) as EventsScheduleApiItem;
          if (item && (item._id || item.date)) {
            return mapEventsScheduleToBayanEvent(item, 0);
          }
        }
      } catch {
        // try next
      }
    }

    // fallback: find in all list
    const all = await fetchBayanEvents();
    return all.find((e) => e.id === id) || null;
  } catch (error) {
    console.error("fetchBayanEventById error:", error);
    return null;
  }
}
