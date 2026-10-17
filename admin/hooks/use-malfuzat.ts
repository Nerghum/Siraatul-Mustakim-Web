"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getMalfuzatList,
  getMalfuzatById,
  getMalfuzatCategories,
  getLatestAudioMalfuzat,
  createMalfuzat,
  updateMalfuzat,
  deleteMalfuzat,
} from "@/services/malfuzat";

export function useMalfuzatList(
  params?: Record<string, string | number | undefined>
) {
  return useQuery({
    queryKey: ["malfuzat", params],
    queryFn: async () => {
      const res = await getMalfuzatList(params);
      return res.data;
    },
  });
}

export function useMalfuzat(id: string) {
  return useQuery({
    queryKey: ["malfuzat", id],
    queryFn: async () => {
      const res = await getMalfuzatById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useMalfuzatCategories() {
  return useQuery({
    queryKey: ["malfuzat-categories"],
    queryFn: async () => {
      const res = await getMalfuzatCategories();
      return res.data;
    },
  });
}

export function useLatestAudioMalfuzat(limit?: number) {
  return useQuery({
    queryKey: ["malfuzat-latest-audio", limit],
    queryFn: async () => {
      const res = await getLatestAudioMalfuzat(limit);
      return res.data;
    },
  });
}

export function useCreateMalfuzat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMalfuzat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["malfuzat"] });
    },
  });
}

export function useUpdateMalfuzat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateMalfuzat>[1];
    }) => updateMalfuzat(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["malfuzat"] });
    },
  });
}

export function useDeleteMalfuzat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMalfuzat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["malfuzat"] });
    },
  });
}
