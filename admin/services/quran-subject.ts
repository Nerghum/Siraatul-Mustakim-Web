import apiClient from "./api-client";
import type { QuranSubject, CreateQuranSubjectPayload } from "@/types/quran-subject";

export interface CategoryOption {
  id: number;
  title: string;
}

export const getQuranSubjectList = (params?: Record<string, string | number | undefined>) =>
  apiClient.get<{ data: QuranSubject[] }>("/quran-subjects/all", { params });

export const getQuranSubjectById = (id: number) =>
  apiClient.get<QuranSubject>(`/quran-subjects/single-subject/${id}`);

export const createQuranSubject = (data: CreateQuranSubjectPayload) =>
  apiClient.post<{ data: QuranSubject; message: string }>("/quran-subjects/create", data);

export const updateQuranSubject = (id: number, data: Partial<CreateQuranSubjectPayload>) =>
  apiClient.put<{ data: QuranSubject }>(`/quran-subjects/edit/${id}`, data);

export const deleteQuranSubject = (id: number) =>
  apiClient.delete<{ data: QuranSubject }>(`/quran-subjects/delete/${id}`);

export const getQuranSubjectCategories = async (): Promise<CategoryOption[]> => {
  const res = await apiClient.get<{ data: QuranSubject[] }>("/quran-subjects/all");
  const subjects = res.data.data;
  const map = new Map<number, string>();
  subjects.forEach((s) => {
    if (!map.has(s.category_id)) {
      map.set(s.category_id, s.category_title);
    }
  });
  return Array.from(map.entries())
    .map(([id, title]) => ({ id, title }))
    .sort((a, b) => a.id - b.id);
};

export const getQuranSubjectByCategory = (categoryId: number) =>
  apiClient.get<{ data: QuranSubject[] }>(`/quran-subjects/by-category/${categoryId}`);
