"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getQuranSubjectList,
  getQuranSubjectById,
  createQuranSubject,
  updateQuranSubject,
  deleteQuranSubject,
  getQuranSubjectCategories,
  getQuranSubjectByCategory,
} from "@/services/quran-subject";
import type { CreateQuranSubjectPayload } from "@/types/quran-subject";

export function useQuranSubjectList(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["quran-subject", params],
    queryFn: async () => {
      const res = await getQuranSubjectList(params);
      return res.data.data;
    },
  });
}

export function useQuranSubject(id: number) {
  return useQuery({
    queryKey: ["quran-subject", id],
    queryFn: async () => {
      const res = await getQuranSubjectById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useQuranSubjectCategories() {
  return useQuery({
    queryKey: ["quran-subject", "categories"],
    queryFn: getQuranSubjectCategories,
  });
}

export function useQuranSubjectByCategory(categoryId: number) {
  return useQuery({
    queryKey: ["quran-subject", "by-category", categoryId],
    queryFn: async () => {
      const res = await getQuranSubjectByCategory(categoryId);
      return res.data.data;
    },
    enabled: !!categoryId,
  });
}

export function useCreateQuranSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateQuranSubjectPayload) => createQuranSubject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quran-subject"] });
    },
  });
}

export function useUpdateQuranSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreateQuranSubjectPayload> }) =>
      updateQuranSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quran-subject"] });
    },
  });
}

export function useDeleteQuranSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteQuranSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quran-subject"] });
    },
  });
}
