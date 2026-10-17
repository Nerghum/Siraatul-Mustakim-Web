"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getChapters,
  getChapter,
  createChapter,
  updateChapter,
  deleteChapter,
  getChapterItems,
  getItems,
  createDua,
  updateDua,
  deleteDua,
} from "@/services/dua";
import type { CreateChapterPayload, UpdateChapterPayload, CreateDuaPayload, UpdateDuaPayload } from "@/types/dua";

export function useChapters(q?: string) {
  return useQuery({
    queryKey: ["dua-chapters", q || ""],
    queryFn: async () => {
      const res = await getChapters(q);
      return res.data.chapters;
    },
  });
}

export function useChapter(chapterId: string) {
  return useQuery({
    queryKey: ["dua-chapter", chapterId],
    queryFn: async () => {
      const res = await getChapter(chapterId);
      return res.data.chapter;
    },
    enabled: !!chapterId,
  });
}

export function useCreateChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChapterPayload) => createChapter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dua-chapters"] });
    },
  });
}

export function useUpdateChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chapterId, data }: { chapterId: string; data: UpdateChapterPayload }) =>
      updateChapter(chapterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dua-chapters"] });
    },
  });
}

export function useDeleteChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteChapter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dua-chapters"] });
    },
  });
}

export function useChapterItems(chapterId: string, q?: string) {
  return useQuery({
    queryKey: ["dua-items", chapterId, q || ""],
    queryFn: async () => {
      const res = await getChapterItems(chapterId, q ? { q } : undefined);
      return { chapter: res.data.chapter, items: res.data.items };
    },
    enabled: !!chapterId,
  });
}

export function useAllDuaItems(params?: { chapterId?: string; q?: string }) {
  return useQuery({
    queryKey: ["all-dua-items", params?.chapterId || "", params?.q || ""],
    queryFn: async () => {
      const res = await getItems(params);
      return res.data.items;
    },
  });
}

export function useCreateDua() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDuaPayload) => createDua(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dua-items"] });
      queryClient.invalidateQueries({ queryKey: ["all-dua-items"] });
      queryClient.invalidateQueries({ queryKey: ["dua-chapters"] });
    },
  });
}

export function useUpdateDua() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDuaPayload; chapterId?: string }) =>
      updateDua(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dua-items"] });
      queryClient.invalidateQueries({ queryKey: ["all-dua-items"] });
      queryClient.invalidateQueries({ queryKey: ["dua-chapters"] });
    },
  });
}

export function useDeleteDua() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; chapterId?: string }) =>
      deleteDua(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dua-items"] });
      queryClient.invalidateQueries({ queryKey: ["all-dua-items"] });
      queryClient.invalidateQueries({ queryKey: ["dua-chapters"] });
    },
  });
}
