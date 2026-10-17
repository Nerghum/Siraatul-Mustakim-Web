"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFaqList, getFaqFilters, getFaqById, createFaq, answerFaq, deleteFaq, getMuftiUsers } from "@/services/faq";

export function useFaqList(params?: Record<string, string | number | undefined>) {
  return useQuery({
    queryKey: ["faq", params],
    queryFn: async () => {
      const res = await getFaqList(params);
      return res.data;
    },
  });
}

export function useFaqFilters() {
  return useQuery({
    queryKey: ["faq", "filters"],
    queryFn: async () => {
      const res = await getFaqFilters();
      return res.data;
    },
  });
}

export function useFaq(id: string) {
  return useQuery({
    queryKey: ["faq", id],
    queryFn: async () => {
      const res = await getFaqById(id);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq"] });
    },
  });
}

export function useAnswerFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof answerFaq>[1] }) =>
      answerFaq(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq"] });
    },
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq"] });
    },
  });
}

export function useMuftiUsers() {
  return useQuery({
    queryKey: ["mufti-users"],
    queryFn: async () => {
      const res = await getMuftiUsers();
      return res.data;
    },
  });
}
