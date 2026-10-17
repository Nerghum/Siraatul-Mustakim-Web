import apiClient from "./api-client";
import type { DuaChapter, DuaItem, CreateChapterPayload, UpdateChapterPayload, CreateDuaPayload, UpdateDuaPayload } from "@/types/dua";

export const getChapters = (q?: string) =>
  apiClient.get<{ chapters: DuaChapter[] }>("/dua/chapters", { params: { q } });

export const getChapter = (chapterId: string) =>
  apiClient.get<{ chapter: DuaChapter }>(`/dua/chapters/${chapterId}`);

export const createChapter = (data: CreateChapterPayload) =>
  apiClient.post<{ chapter: DuaChapter }>("/dua/chapters", data);

export const updateChapter = (chapterId: string, data: UpdateChapterPayload) =>
  apiClient.put<{ chapter: DuaChapter }>(`/dua/chapters/${chapterId}`, data);

export const deleteChapter = (chapterId: string) =>
  apiClient.delete<{ message: string }>(`/dua/chapters/${chapterId}`);

export const getChapterItems = (chapterId: string, params?: Record<string, string | number | undefined>) =>
  apiClient.get<{ chapter: DuaChapter; items: DuaItem[] }>(`/dua/chapters/${chapterId}/items`, { params });

export const getItems = (params?: Record<string, string | number | undefined>) =>
  apiClient.get<{ items: DuaItem[] }>("/dua/items", { params });

export const getItem = (id: string) =>
  apiClient.get<{ item: DuaItem; chapter: DuaChapter }>(`/dua/items/${id}`);

export const createDua = (data: CreateDuaPayload) =>
  apiClient.post<{ item: DuaItem }>("/dua/items", data);

export const updateDua = (id: string, data: UpdateDuaPayload) =>
  apiClient.put<{ item: DuaItem }>(`/dua/items/${id}`, data);

export const deleteDua = (id: string) =>
  apiClient.delete<{ message: string }>(`/dua/items/${id}`);
