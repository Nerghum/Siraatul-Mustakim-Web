import apiClient from "./api-client";
import type { QuranSurah, CreateQuranSurahPayload, UpdateQuranSurahPayload, UpdateQuranVersePayload, CreateQuranVersePayload, QuranAudioUploadResponse } from "@/types/quran";

export const getQuranList = (params?: Record<string, string | number | undefined>) =>
  apiClient.get<{ data: QuranSurah[]; pagination: { total: number; page: number; limit: number; pages: number } }>("/quran", { params });

export const getQuranSurah = (surahId: number) =>
  apiClient.get<QuranSurah>(`/quran/surah/${surahId}`);

export const createQuranSurah = (data: CreateQuranSurahPayload) =>
  apiClient.post<{ data: QuranSurah; message: string }>("/quran/admin/surah", data);

export const updateQuranSurah = (surahId: number, data: UpdateQuranSurahPayload) =>
  apiClient.put<{ data: QuranSurah; message: string }>(`/quran/admin/surah/${surahId}`, data);

export const deleteQuranSurah = (surahId: number) =>
  apiClient.delete<{ data: QuranSurah; message: string }>(`/quran/admin/surah/${surahId}`);

export const updateQuranVerse = (surahId: number, verseId: number, data: UpdateQuranVersePayload) =>
  apiClient.put<{ data: QuranSurah; message: string }>(`/quran/admin/surah/${surahId}/verse/${verseId}`, data);

export const deleteQuranVerse = (surahId: number, verseId: number) =>
  apiClient.delete<{ data: QuranSurah; message: string }>(`/quran/admin/surah/${surahId}/verse/${verseId}`);

export const createQuranVerse = (surahId: number, data: CreateQuranVersePayload) =>
  apiClient.post<{ data: QuranSurah; message: string }>(`/quran/admin/surah/${surahId}/verse`, data);

export const uploadQuranSurahAudio = (surahId: number, formData: FormData) =>
  apiClient.post<QuranAudioUploadResponse>(`/quran/admin/surah/${surahId}/audio`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 300000, // 5 min for large audio files
  });

export const syncQuranData = () =>
  apiClient.post<{ success: boolean; count: number; message: string }>("/quran/admin/sync-quran");
