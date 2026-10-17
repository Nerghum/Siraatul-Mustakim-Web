"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getArticleList, getArticleById, createArticle, updateArticle, deleteArticle } from "@/services/article";
import type { CreateArticlePayload } from "@/types/article";

export function useArticleList(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["article", params],
    queryFn: async () => {
      const res = await getArticleList(params);
      return res.data;
    },
  });
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: ["article", id],
    queryFn: async () => {
      const res = await getArticleById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateArticlePayload) => createArticle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article"] });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateArticlePayload> }) =>
      updateArticle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article"] });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article"] });
    },
  });
}
