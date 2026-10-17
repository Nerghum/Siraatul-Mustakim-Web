"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getQuranList,
  getQuranSurah,
  createQuranSurah,
  updateQuranSurah,
  deleteQuranSurah,
  createQuranVerse,
  updateQuranVerse,
  deleteQuranVerse,
  uploadQuranSurahAudio,
  syncQuranData,
} from "@/services/quran";
import type { CreateQuranSurahPayload, UpdateQuranSurahPayload, UpdateQuranVersePayload, CreateQuranVersePayload } from "@/types/quran";

export function useQuranList(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["quran", params],
    queryFn: async () => {
      const res = await getQuranList(params);
      return res.data;
    },
  });
}

export function useQuranSurah(surahId: number) {
  return useQuery({
    queryKey: ["quran", surahId],
    queryFn: async () => {
      const res = await getQuranSurah(surahId);
      return res.data;
    },
    enabled: !!surahId,
  });
}

export function useCreateQuranSurah() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuranSurahPayload) => createQuranSurah(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quran"] });
    },
  });
}

export function useUpdateQuranSurah() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ surahId, data }: { surahId: number; data: UpdateQuranSurahPayload }) =>
      updateQuranSurah(surahId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quran"] });
    },
  });
}

export function useDeleteQuranSurah() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (surahId: number) => deleteQuranSurah(surahId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quran"] });
    },
  });
}

export function useUpdateQuranVerse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ surahId, verseId, data }: { surahId: number; verseId: number; data: UpdateQuranVersePayload }) =>
      updateQuranVerse(surahId, verseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quran"] });
    },
  });
}

export function useDeleteQuranVerse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ surahId, verseId }: { surahId: number; verseId: number }) =>
      deleteQuranVerse(surahId, verseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quran"] });
    },
  });
}

export function useCreateQuranVerse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ surahId, data }: { surahId: number; data: CreateQuranVersePayload }) =>
      createQuranVerse(surahId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quran"] });
    },
  });
}

export function useUploadQuranSurahAudio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ surahId, formData }: { surahId: number; formData: FormData }) =>
      uploadQuranSurahAudio(surahId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quran"] });
    },
  });
}

export function useSyncQuranData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => syncQuranData(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quran"] });
    },
  });
}

