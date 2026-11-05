import axios from "axios";
import { API_BASE_URL } from "../constants/api";
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
      { _id: "1", name: "ঈমান ও আকীদা" },
      { _id: "2", name: "আমল ও ইবাদত" },
      { _id: "3", name: "তাফসীর" },
      { _id: "4", name: "সিরাত ও আখলাক" },
      { _id: "5", name: "হজ ও উমরাহ" },
      { _id: "6", name: "সাধারণ বয়ান" },
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
    { headers }
  );

  return res.data.data;
}

export async function stopLiveBoyan(
  streamId: string,
  localAudioUri?: string | null
): Promise<{ stream: LiveStreamData; boyan?: any }> {
  const headers = await getAuthHeaders();

  if (localAudioUri) {
    const formData = new FormData();
    formData.append("streamId", streamId);
    const filename = localAudioUri.split("/").pop() || `live-${streamId}.m4a`;
    formData.append("audio", {
      uri: localAudioUri,
      name: filename,
      type: "audio/m4a",
    } as any);

    const res = await axios.post(`${API_BASE_URL}/live/stop`, formData, {
      headers: {
        ...headers,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.data;
  }

  const res = await axios.post(
    `${API_BASE_URL}/live/stop`,
    { streamId },
    { headers }
  );
  return res.data.data;
}
