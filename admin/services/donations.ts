import apiClient from "./api-client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  DonationConfig,
  PaymentRecord,
  DonorRecord,
  GatewaySettings,
  PaymentStatsData,
} from "@/types/donations";

export const getDonationConfig = () =>
  apiClient.get<ApiResponse<DonationConfig>>("/payments/donations/config");

export const updateDonationConfig = (data: Partial<DonationConfig>) =>
  apiClient.put<ApiResponse<DonationConfig>>("/payments/donations/config", data);

export const getDonationHistory = (
  params?: Record<string, string | number | undefined>
) =>
  apiClient.get<PaginatedResponse<PaymentRecord>>("/payments/donations/history", {
    params,
  });

export const getPaymentStats = () =>
  apiClient.get<ApiResponse<PaymentStatsData>>("/payments/admin/stats");

export const getGatewaySettings = () =>
  apiClient.get<ApiResponse<GatewaySettings>>("/payments/admin/gateways");

export const updateGatewaySettings = (data: Partial<GatewaySettings>) =>
  apiClient.put<ApiResponse<any>>("/payments/admin/gateways", data);

export const getDonorsList = (
  params?: Record<string, string | number | undefined>
) =>
  apiClient.get<PaginatedResponse<DonorRecord>>("/payments/admin/donors", {
    params,
  });

export const getSingleDonation = (id: string) =>
  apiClient.get<ApiResponse<PaymentRecord>>(`/payments/admin/donations/${id}`);

export const updateDonationStatus = (
  id: string,
  data: { status?: string; notes?: string }
) =>
  apiClient.patch<ApiResponse<PaymentRecord>>(
    `/payments/admin/donations/${id}/status`,
    data
  );
