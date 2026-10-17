import apiClient from "./api-client";
import type { ApiResponse } from "@/types/api";
import type { 
  Masail, 
  CreateMasailPayload, 
  UpdateMasailPayload,
  MasailCategory,
  CreateCategoryPayload,
  UpdateCategoryPayload
} from "@/types/masail";

export const getMasailList = (params?: Record<string, string | number | undefined>) =>
  apiClient.get<ApiResponse<Masail[]>>("/masail", { params });

export const getMasailById = (id: string) =>
  apiClient.get<ApiResponse<Masail>>(`/masail/${id}`);

export const createMasail = (data: CreateMasailPayload) =>
  apiClient.post<ApiResponse<Masail>>("/masail/create", data);

export const updateMasail = (id: string, data: UpdateMasailPayload) =>
  apiClient.patch<ApiResponse<Masail>>(`/masail/${id}`, data);

export const deleteMasail = (id: string) =>
  apiClient.delete<ApiResponse<null>>(`/masail/${id}`);

export const getMasailCategories = () =>
  apiClient.get<MasailCategory[]>("/masail/categories");

export const createMasailCategory = (data: CreateCategoryPayload) =>
  apiClient.post<MasailCategory>("/masail/categories/create", data);

export const updateMasailCategory = (id: string, data: UpdateCategoryPayload) =>
  apiClient.patch<MasailCategory>(`/masail/categories/${id}`, data);

export const deleteMasailCategory = (id: string) =>
  apiClient.delete<null>(`/masail/categories/${id}`);
