import apiClient from "./api-client";
import type { Ad, CreateAdPayload, UpdateAdPayload } from "@/types/ad";

export const getAdList = (params?: Record<string, string | number | boolean | undefined>) =>
  apiClient.get<Ad[]>("/ads", { params: { admin: true, ...params } });

export const getAdById = (id: string) =>
  apiClient.get<Ad>(`/ads/${id}`);

export const createAd = (data: CreateAdPayload) => {
  const formData = new FormData();
  formData.append("title", data.title);
  if (data.description) formData.append("description", data.description);
  if (data.link) formData.append("link", data.link);
  if (data.buttonText) formData.append("buttonText", data.buttonText);
  if (data.isActive !== undefined) formData.append("isActive", String(data.isActive));
  if (data.priority !== undefined) formData.append("priority", String(data.priority));
  formData.append("placements", JSON.stringify(data.placements));

  if (data.image) {
    formData.append("image", data.image);
  }

  return apiClient.post<Ad>("/ads/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateAd = (id: string, data: UpdateAdPayload) => {
  const formData = new FormData();
  if (data.title !== undefined) formData.append("title", data.title);
  if (data.description !== undefined) formData.append("description", data.description);
  if (data.link !== undefined) formData.append("link", data.link);
  if (data.buttonText !== undefined) formData.append("buttonText", data.buttonText);
  if (data.isActive !== undefined) formData.append("isActive", String(data.isActive));
  if (data.priority !== undefined) formData.append("priority", String(data.priority));
  if (data.placements !== undefined) formData.append("placements", JSON.stringify(data.placements));

  if (data.image) {
    formData.append("image", data.image);
  }

  return apiClient.patch<Ad>(`/ads/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteAd = (id: string) =>
  apiClient.delete<{ message: string }>(`/ads/${id}`);
