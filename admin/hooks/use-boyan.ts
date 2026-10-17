"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getBoyanList,
  getBoyanById,
  getBoyanCategories,
  createBoyanCategory,
  updateBoyanCategory,
  deleteBoyanCategory,
  getBoyanAuthors,
  getBoyanLocations,
  createBoyan,
  updateBoyan,
  deleteBoyan,
} from "@/services/boyan";
import type {
  CreateBoyanCategoryPayload,
  UpdateBoyanCategoryPayload,
} from "@/types/boyan";

export function useBoyanList(
  params?: Record<string, string | number | undefined>
) {
  return useQuery({
    queryKey: ["boyan", params],
    queryFn: async () => {
      const res = await getBoyanList(params);
      return res.data;
    },
  });
}

export function useBoyan(id: string) {
  return useQuery({
    queryKey: ["boyan", id],
    queryFn: async () => {
      const res = await getBoyanById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useBoyanCategories() {
  return useQuery({
    queryKey: ["boyan-categories"],
    queryFn: async () => {
      const res = await getBoyanCategories();
      return res.data;
    },
  });
}

export function useCreateBoyanCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBoyanCategoryPayload) => createBoyanCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boyan-categories"] });
      queryClient.invalidateQueries({ queryKey: ["boyan"] });
    },
  });
}

export function useUpdateBoyanCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateBoyanCategoryPayload;
    }) => updateBoyanCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boyan-categories"] });
      queryClient.invalidateQueries({ queryKey: ["boyan"] });
    },
  });
}

export function useDeleteBoyanCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBoyanCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boyan-categories"] });
      queryClient.invalidateQueries({ queryKey: ["boyan"] });
    },
  });
}

export function useBoyanAuthors() {
  return useQuery({
    queryKey: ["boyan-authors"],
    queryFn: async () => {
      const res = await getBoyanAuthors();
      return res.data;
    },
  });
}

export function useBoyanLocations() {
  return useQuery({
    queryKey: ["boyan-locations"],
    queryFn: async () => {
      const res = await getBoyanLocations();
      return res.data;
    },
  });
}

export function useCreateBoyan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBoyan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boyan"] });
      queryClient.invalidateQueries({ queryKey: ["boyan-categories"] });
    },
  });
}

export function useUpdateBoyan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateBoyan>[1];
    }) => updateBoyan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boyan"] });
      queryClient.invalidateQueries({ queryKey: ["boyan-categories"] });
    },
  });
}

export function useDeleteBoyan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBoyan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boyan"] });
      queryClient.invalidateQueries({ queryKey: ["boyan-categories"] });
    },
  });
}
