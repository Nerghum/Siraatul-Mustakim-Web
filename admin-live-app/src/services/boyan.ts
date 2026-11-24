import axios from "axios";
import { API_BASE_URL, FALLBACK_API_BASE_URL } from "../constants/api";
import { getAuthHeaders } from "./auth";

export interface CategoryItem {
  _id: string;
  name: string;
  slug?: string;
}

export interface AuthorItem {
  _id: string;
  name: string;
}

export interface BayanScheduleContact {
  name: string;
  phone: string;
}

export interface BayanScheduleItem {
  _id: string;
  districtName: string;
  date: string;
  time: string;
  location: string;
  path?: string;
  googleMapsUrl?: string;
  title?: string;
  timeText?: string;
  type?: "amber" | "green" | string;
  image?: string;
  contacts?: BayanScheduleContact[];
}

export interface BoyanItem {
  _id: string;
  title: string;
  category: string;
  author?: string;
  location?: string;
  mediaType: "audio" | "video";
  youtubeUrl?: string;
  audioUrl?: string;
  audioFormat?: string;
  audioDuration?: number;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LiveHistoryItem {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  author?: string;
  location?: string;
  roomName: string;
  isLive: boolean;
  status: string;
  duration?: number;
  listenerCount: number;
  startedAt: string;
  endedAt?: string;
  boyanId?: any;
  recordingUrl?: string;
}

export interface StartLivePayload {
  title: string;
  category: string;
  author: string;
  location?: string;
  description?: string;
}

export interface LiveStreamData {
  _id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  location: string;
  roomName: string;
  isLive: boolean;
  listenerCount: number;
  status: string;
  streamKey: string;
}

export interface CreateBoyanPayload {
  title: string;
  category: string;
  author?: string;
  location?: string;
  mediaType: "audio" | "video";
  youtubeUrl?: string;
  audioUrl?: string;
  audioFileUri?: string;
  audioFileName?: string;
  audioMimeType?: string;
}

export interface UpdateBoyanPayload {
  title?: string;
  category?: string;
  author?: string;
  location?: string;
  mediaType?: "audio" | "video";
  youtubeUrl?: string;
  audioUrl?: string;
  audioFileUri?: string;
  audioFileName?: string;
  audioMimeType?: string;
}

export interface FetchBoyansParams {
  search?: string;
  category?: string;
  mediaType?: string;
  page?: number;
  limit?: number;
}

// Helper to normalize any date string to YYYY-MM-DD
export function normalizeDate(value?: string | null): string {
  if (!value) return "";
  const input = value.replace(/\s+/g, " ").trim();

  const ymd = input.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymd) {
    return `${ymd[1]}-${ymd[2].padStart(2, "0")}-${ymd[3].padStart(2, "0")}`;
  }

  const dmy = input.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  }

  const parsed = new Date(input);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return input;
}

// Get current date in local YYYY-MM-DD
export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  try {
    const res = await axios.get(`${API_BASE_URL}/boyan/categories`);
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.items)) return data.items;
    return [];
  } catch (err) {
    console.warn("Failed to fetch categories:", err);
    return [
      { _id: "1", name: "ইসলাহি মজলিস" },
      { _id: "2", name: "ঈমান ও আকীদা" },
      { _id: "3", name: "আমল ও ইবাদত" },
      { _id: "4", name: "তাফসীর" },
      { _id: "5", name: "সিরাত ও আখলাক" },
      { _id: "6", name: "হজ ও উমরাহ" },
      { _id: "7", name: "সাধারণ বয়ান" },
    ];
  }
}

export async function fetchAuthors(): Promise<AuthorItem[]> {
  try {
    const res = await axios.get(`${API_BASE_URL}/boyan/authors`);
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.items)) return data.items;
    return [];
  } catch (err) {
    console.warn("Failed to fetch authors:", err);
    return [
      { _id: "1", name: "মুফতি জাফর আহমেদ" },
      { _id: "2", name: "মাওলানা তারিক জামিল" },
      { _id: "3", name: "মুফতি তকী উসমানী" },
    ];
  }
}

/**
 * Fetch upcoming schedules from /bayan-schedule (or /events-schedule)
 * Filters to only show dates >= today (not done yet).
 */
export async function fetchUpcomingSchedules(): Promise<BayanScheduleItem[]> {
  const endpoints = [
    `${API_BASE_URL}/bayan-schedule`,
    `${API_BASE_URL}/events-schedule`,
  ];

  let rawList: BayanScheduleItem[] = [];

  for (const url of endpoints) {
    try {
      const res = await axios.get(url, { timeout: 6000 });
      if (Array.isArray(res.data)) {
        rawList = res.data;
        break;
      }
    } catch {
      // try next
    }
  }

  // Fallback if backend returned empty or offline
  if (!rawList || rawList.length === 0) {
    const today = getTodayDateString();
    return [
      {
        _id: "sched-default-1",
        title: "ইসলাহি মজলিস ও দোয়া",
        districtName: "ঢাকা",
        date: today,
        time: "17:30",
        timeText: "বাদ মাগরিব",
        location: "মারকাযুল হিকমাহ, ঢাকা",
        path: "ইসলাহি মজলিস — আত্মশুদ্ধি ও বিশেষ বয়ান",
        contacts: [{ name: "মুফতি জাফর আহমেদ অফিস", phone: "০১৭১৩৪৫৪৫৪৫" }],
      },
    ];
  }

  const todayStr = getTodayDateString();

  // Filter only schedules not done yet (date >= todayStr)
  const upcoming = rawList.filter((item) => {
    const norm = normalizeDate(item.date);
    if (!norm) return true; // keep if indeterminate
    return norm >= todayStr;
  });

  // Sort ascending: closest date first
  upcoming.sort((a, b) => {
    const normA = normalizeDate(a.date);
    const normB = normalizeDate(b.date);
    return normA.localeCompare(normB);
  });

  return upcoming;
}

/**
 * Fetch all boyans (live recordings and uploaded boyans)
 */
export async function fetchBoyans(params: FetchBoyansParams = {}): Promise<{
  items: BoyanItem[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const queryParts: string[] = [];
  if (params.search?.trim()) queryParts.push(`q=${encodeURIComponent(params.search.trim())}`);
  if (params.category?.trim()) queryParts.push(`category=${encodeURIComponent(params.category.trim())}`);
  if (params.mediaType && params.mediaType !== "all") queryParts.push(`mediaType=${encodeURIComponent(params.mediaType)}`);
  if (params.page) queryParts.push(`page=${params.page}`);
  if (params.limit) queryParts.push(`limit=${params.limit}`);

  const qs = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  const res = await axios.get(`${API_BASE_URL}/boyan${qs}`, { timeout: 10000 });
  const data = res.data;

  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page: 1,
      totalPages: 1,
    };
  }

  return {
    items: Array.isArray(data.items) ? data.items : [],
    total: data.total || 0,
    page: data.page || 1,
    totalPages: data.totalPages || 1,
  };
}

/**
 * Create a new regular Boyan (Audio or Video)
 */
export async function createBoyan(payload: CreateBoyanPayload): Promise<BoyanItem> {
  const headers = await getAuthHeaders();

  if (payload.mediaType === "audio" && payload.audioFileUri) {
    const formData = new FormData();
    formData.append("title", payload.title.trim());
    formData.append("category", payload.category.trim());
    if (payload.author) formData.append("author", payload.author.trim());
    if (payload.location) formData.append("location", payload.location.trim());
    formData.append("mediaType", "audio");

    const filename = payload.audioFileName || payload.audioFileUri.split("/").pop() || "boyan.mp3";
    const mime = payload.audioMimeType || "audio/mpeg";

    formData.append("audio", {
      uri: payload.audioFileUri,
      name: filename,
      type: mime,
    } as any);

    const res = await axios.post(`${API_BASE_URL}/boyan/create`, formData, {
      headers: {
        ...headers,
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000,
    });
    return res.data;
  }

  // JSON creation (video or audio with URL)
  const res = await axios.post(
    `${API_BASE_URL}/boyan/create`,
    {
      title: payload.title.trim(),
      category: payload.category.trim(),
      author: payload.author?.trim() || "",
      location: payload.location?.trim() || "",
      mediaType: payload.mediaType,
      youtubeUrl: payload.youtubeUrl?.trim() || "",
      audioUrl: payload.audioUrl?.trim() || "",
    },
    { headers, timeout: 15000 }
  );
  return res.data;
}

/**
 * Update an existing Boyan
 */
export async function updateBoyan(id: string, payload: UpdateBoyanPayload): Promise<BoyanItem> {
  const headers = await getAuthHeaders();

  if (payload.audioFileUri) {
    const formData = new FormData();
    if (payload.title !== undefined) formData.append("title", payload.title.trim());
    if (payload.category !== undefined) formData.append("category", payload.category.trim());
    if (payload.author !== undefined) formData.append("author", payload.author.trim());
    if (payload.location !== undefined) formData.append("location", payload.location.trim());
    if (payload.mediaType !== undefined) formData.append("mediaType", payload.mediaType);
    if (payload.youtubeUrl !== undefined) formData.append("youtubeUrl", payload.youtubeUrl.trim());

    const filename = payload.audioFileName || payload.audioFileUri.split("/").pop() || "boyan.mp3";
    const mime = payload.audioMimeType || "audio/mpeg";

    formData.append("audio", {
      uri: payload.audioFileUri,
      name: filename,
      type: mime,
    } as any);

    const res = await axios.put(`${API_BASE_URL}/boyan/${id}`, formData, {
      headers: {
        ...headers,
        "Content-Type": "multipart/form-data",
      },
      timeout: 60000,
    });
    return res.data;
  }

  const res = await axios.put(`${API_BASE_URL}/boyan/${id}`, payload, {
    headers,
    timeout: 15000,
  });
  return res.data;
}

/**
 * Delete a Boyan
 */
export async function deleteBoyan(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  await axios.delete(`${API_BASE_URL}/boyan/${id}`, {
    headers,
    timeout: 10000,
  });
}

/**
 * Fetch past Live broadcast history
 */
export async function fetchLiveHistory(): Promise<LiveHistoryItem[]> {
  try {
    const res = await axios.get(`${API_BASE_URL}/live/history`, { timeout: 10000 });
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    return [];
  } catch (err) {
    console.warn("fetchLiveHistory failed:", err);
    return [];
  }
}

/**
 * Delete a past Live broadcast record
 */
export async function deleteLiveStream(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  await axios.delete(`${API_BASE_URL}/live/${id}`, {
    headers,
    timeout: 10000,
  });
}

export async function startLiveBoyan(payload: StartLivePayload): Promise<{
  stream: LiveStreamData;
  token?: string;
  wsUrl?: string;
  streamUrl?: string;
}> {
  const headers = await getAuthHeaders();
  const res = await axios.post(
    `${API_BASE_URL}/live/start`,
    {
      title: payload.title,
      category: payload.category,
      author: payload.author,
      location: payload.location || "",
      description: payload.description || "",
    },
    { headers, timeout: 15000 }
  );

  return res.data.data;
}

export async function stopLiveBoyan(
  streamId: string,
  localAudioUri?: string | null
): Promise<{ stream: LiveStreamData; boyan?: any }> {
  const headers = await getAuthHeaders();

  // Try uploading local audio if present
  if (localAudioUri) {
    try {
      const formData = new FormData();
      formData.append("streamId", streamId);
      const filename = localAudioUri.split("/").pop() || `live-${streamId}.aac`;
      const isAac = filename.endsWith(".aac");
      formData.append("audio", {
        uri: localAudioUri,
        name: filename,
        type: isAac ? "audio/aac" : "audio/m4a",
      } as any);

      const res = await axios.post(`${API_BASE_URL}/live/stop`, formData, {
        headers: {
          ...headers,
          Accept: "application/json",
        },
        timeout: 20000,
      });
      if (res.data?.data) {
        return res.data.data;
      }
    } catch (uploadErr) {
      console.warn("[stopLiveBoyan] Multipart upload warning, falling back to JSON stop:", uploadErr);
    }
  }

  // Guaranteed fallback: terminate stream via JSON
  const res = await axios.post(
    `${API_BASE_URL}/live/stop`,
    { streamId },
    { headers, timeout: 10000 }
  );
  return res.data?.data || res.data;
}

export async function pauseLiveBoyan(
  streamId: string,
  message?: string
): Promise<{ success: boolean; data?: any }> {
  const pauseMessage = message || "সাময়িক বিরতি চলছে। কিছুক্ষণ পর আবার সম্প্রচার শুরু হবে।";
  try {
    const headers = await getAuthHeaders();
    const res = await axios.post(
      `${API_BASE_URL}/live/pause`,
      {
        streamId,
        message: pauseMessage,
      },
      { headers, timeout: 6000 }
    );
    return res.data;
  } catch (err: any) {
    console.warn("[pauseLiveBoyan] Primary API call error, trying backup:", err?.message || err);
    try {
      const headers = await getAuthHeaders();
      const res = await axios.post(
        `${FALLBACK_API_BASE_URL}/live/pause`,
        {
          streamId,
          message: pauseMessage,
        },
        { headers, timeout: 6000 }
      );
      return res.data;
    } catch (backupErr: any) {
      console.warn("[pauseLiveBoyan] Backup API call error:", backupErr?.message || backupErr);
    }
    return { success: false };
  }
}

export async function resumeLiveBoyan(
  streamId: string
): Promise<{ success: boolean; data?: any }> {
  try {
    const headers = await getAuthHeaders();
    const res = await axios.post(
      `${API_BASE_URL}/live/resume`,
      { streamId },
      { headers, timeout: 6000 }
    );
    return res.data;
  } catch (err: any) {
    console.warn("[resumeLiveBoyan] Primary API call error, trying backup:", err?.message || err);
    try {
      const headers = await getAuthHeaders();
      const res = await axios.post(
        `${FALLBACK_API_BASE_URL}/live/resume`,
        { streamId },
        { headers, timeout: 6000 }
      );
      return res.data;
    } catch (backupErr: any) {
      console.warn("[resumeLiveBoyan] Backup API call error:", backupErr?.message || backupErr);
    }
    return { success: false };
  }
}
