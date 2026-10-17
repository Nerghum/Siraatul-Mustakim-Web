"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMasailList,
  getMasailById,
  createMasail,
  updateMasail,
  deleteMasail,
  getMasailCategories,
  createMasailCategory,
  updateMasailCategory,
  deleteMasailCategory,
} from "@/services/masail";

export function useMasailList(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["masail", params],
    queryFn: async () => {
      const res = await getMasailList(params);
      return res.data;
    },
  });
}

export function useMasail(id: string) {
  return useQuery({
    queryKey: ["masail", id],
    queryFn: async () => {
      const res = await getMasailById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateMasail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMasail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["masail"] });
    },
  });
}

export function useUpdateMasail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateMasail>[1] }) =>
      updateMasail(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["masail"] });
    },
  });
}

export function useDeleteMasail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMasail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["masail"] });
    },
  });
}

export function useMasailCategories() {
  return useQuery({
    queryKey: ["masail-categories"],
    queryFn: async () => {
      const res = await getMasailCategories();
      return res.data;
    },
  });
}

export function useCreateMasailCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMasailCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["masail-categories"] });
    },
  });
}

export function useUpdateMasailCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateMasailCategory>[1] }) =>
      updateMasailCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["masail-categories"] });
    },
  });
}

export function useDeleteMasailCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMasailCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["masail-categories"] });
    },
  });
}
