import apiClient from "./api-client";
import type { ApiResponse } from "@/types/api";
import type {
  Malfuzat,
  CreateMalfuzatPayload,
  UpdateMalfuzatPayload,
} from "@/types/malfuzat";

export const getMalfuzatList = (
  params?: Record<string, string | number | undefined>
) =>
  apiClient.get<{
    items: Malfuzat[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>("/malfuzat", { params });

export const getMalfuzatById = (id: string) =>
  apiClient.get<Malfuzat>(`/malfuzat/${id}`);

export const getMalfuzatCategories = () =>
  apiClient.get<string[]>("/malfuzat/categories");

export const getLatestAudioMalfuzat = (limit?: number) =>
  apiClient.get<Malfuzat[]>("/malfuzat/latest-audio", {
    params: limit ? { limit } : undefined,
  });

export const createMalfuzat = (data: CreateMalfuzatPayload) => {
  if (data.mode === "audio" && data.audio) {
    const formData = new FormData();
    formData.append("mode", data.mode);
    formData.append("title", data.title);
    formData.append("category", data.category);
    if (data.author) formData.append("author", data.author);
    formData.append("audio", data.audio);
    return apiClient.post<Malfuzat>("/malfuzat/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return apiClient.post<Malfuzat>("/malfuzat/create", {
    mode: data.mode,
    title: data.title,
    category: data.category,
    author: data.author || "",
    description: data.description || "",
  });
};

export const updateMalfuzat = (id: string, data: UpdateMalfuzatPayload) => {
  if (data.audio) {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.category) formData.append("category", data.category);
    if (data.author) formData.append("author", data.author);
    if (data.description) formData.append("description", data.description);
    if (data.mode) formData.append("mode", data.mode);
    formData.append("audio", data.audio);
    return apiClient.put<Malfuzat>(`/malfuzat/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  const payload: Record<string, string> = {};
  if (data.title !== undefined) payload.title = data.title;
  if (data.category !== undefined) payload.category = data.category;
  if (data.author !== undefined) payload.author = data.author;
  if (data.description !== undefined) payload.description = data.description;
  if (data.mode !== undefined) payload.mode = data.mode;
  return apiClient.put<Malfuzat>(`/malfuzat/${id}`, payload);
};

export const deleteMalfuzat = (id: string) =>
  apiClient.delete<null>(`/malfuzat/${id}`);
