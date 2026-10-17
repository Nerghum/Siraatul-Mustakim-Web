"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getKitabList,
  getKitabById,
  createKitab,
  updateKitab,
  deleteKitab,
} from "@/services/kitab";

export function useKitabList(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["kitab", params],
    queryFn: async () => {
      const res = await getKitabList(params);
      return res.data ?? [];
    },
  });
}

export function useKitab(id: string) {
  return useQuery({
    queryKey: ["kitab", id],
    queryFn: async () => {
      const res = await getKitabById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateKitab() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createKitab,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitab"] });
    },
  });
}

export function useUpdateKitab() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateKitab>[1] }) =>
      updateKitab(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitab"] });
    },
  });
}

export function useDeleteKitab() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteKitab,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitab"] });
    },
  });
}
