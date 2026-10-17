"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNoticeList, getNoticeById, createNotice, updateNotice, deleteNotice } from "@/services/notice";
import type { CreateNoticePayload } from "@/types/notice";

export function useNoticeList(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["notice", params],
    queryFn: async () => {
      const res = await getNoticeList(params);
      return res.data;
    },
  });
}

export function useNotice(id: string) {
  return useQuery({
    queryKey: ["notice", id],
    queryFn: async () => {
      const res = await getNoticeById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNoticePayload) => createNotice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notice"] });
    },
  });
}

export function useUpdateNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateNoticePayload> }) =>
      updateNotice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notice"] });
    },
  });
}

export function useDeleteNotice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notice"] });
    },
  });
}
