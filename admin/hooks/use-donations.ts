"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDonationConfig,
  updateDonationConfig,
  getDonationHistory,
  getPaymentStats,
  getGatewaySettings,
  updateGatewaySettings,
  getDonorsList,
  getSingleDonation,
  updateDonationStatus,
} from "@/services/donations";
import type { GatewaySettings } from "@/types/donations";

export function useDonationConfig() {
  return useQuery({
    queryKey: ["donation-config"],
    queryFn: async () => {
      const res = await getDonationConfig();
      return res.data.data;
    },
  });
}

export function useUpdateDonationConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDonationConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donation-config"] });
    },
  });
}

export function useDonationHistory(
  params?: Record<string, string | number | undefined>
) {
  return useQuery({
    queryKey: ["donation-history", params],
    queryFn: async () => {
      const res = await getDonationHistory(params);
      return res.data;
    },
  });
}

export function usePaymentStats() {
  return useQuery({
    queryKey: ["payment-stats"],
    queryFn: async () => {
      const res = await getPaymentStats();
      return res.data.data;
    },
  });
}

export function useGatewaySettings() {
  return useQuery({
    queryKey: ["gateway-settings"],
    queryFn: async () => {
      const res = await getGatewaySettings();
      return res.data.data;
    },
  });
}

export function useUpdateGatewaySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<GatewaySettings>) => updateGatewaySettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gateway-settings"] });
    },
  });
}

export function useDonorsList(
  params?: Record<string, string | number | undefined>
) {
  return useQuery({
    queryKey: ["donors-list", params],
    queryFn: async () => {
      const res = await getDonorsList(params);
      return res.data;
    },
  });
}

export function useSingleDonation(id: string) {
  return useQuery({
    queryKey: ["single-donation", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await getSingleDonation(id);
      return res.data.data;
    },
    enabled: Boolean(id),
  });
}

export function useUpdateDonationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { status?: string; notes?: string };
    }) => updateDonationStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donation-history"] });
      queryClient.invalidateQueries({ queryKey: ["payment-stats"] });
      queryClient.invalidateQueries({ queryKey: ["donors-list"] });
    },
  });
}
