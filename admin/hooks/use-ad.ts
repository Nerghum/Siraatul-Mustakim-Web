import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdList, getAdById, createAd, updateAd, deleteAd } from "@/services/ad";
import type { CreateAdPayload, UpdateAdPayload } from "@/types/ad";

export function useAdList(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ["ads", params],
    queryFn: async () => {
      const res = await getAdList(params);
      return res.data;
    },
  });
}

export function useAd(id: string) {
  return useQuery({
    queryKey: ["ads", id],
    queryFn: async () => {
      const res = await getAdById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAdPayload) => createAd(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useUpdateAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAdPayload }) =>
      updateAd(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

export function useDeleteAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}
