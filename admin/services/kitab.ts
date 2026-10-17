import apiClient from "./api-client";
import type { ApiResponse } from "@/types/api";
import type { Kitab, CreateKitabPayload, UpdateKitabPayload } from "@/types/kitab";

export const getKitabList = (params?: Record<string, string | number | undefined>) =>
  apiClient.get<ApiResponse<Kitab[]>>("/kitab", { params });

export const getKitabById = (id: string) =>
  apiClient.get<ApiResponse<Kitab>>(`/kitab/${id}`);

export const createKitab = (data: CreateKitabPayload) => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("author", data.author);
  formData.append("status", data.status);
  if (data.pdf) formData.append("pdf", data.pdf);
  if (data.content) formData.append("content", data.content);
  if (data.bookType) formData.append("bookType", data.bookType);
  if (data.chapters) formData.append("chapters", JSON.stringify(data.chapters));
  if (data.coverImages) {
    formData.append("coverImages", data.coverImages);
  }
  return apiClient.post<ApiResponse<Kitab>>("/kitab/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateKitab = (id: string, data: UpdateKitabPayload) => {
  const formData = new FormData();
  if (data.title) formData.append("title", data.title);
  if (data.author) formData.append("author", data.author);
  if (data.status) formData.append("status", data.status);
  if (data.content !== undefined) formData.append("content", data.content);
  if (data.pdf) formData.append("pdf", data.pdf);
  if (data.bookType) formData.append("bookType", data.bookType);
  if (data.chapters) formData.append("chapters", JSON.stringify(data.chapters));
  if (data.coverImages) {
    formData.append("coverImages", data.coverImages);
  }
  return apiClient.patch<ApiResponse<Kitab>>(`/kitab/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteKitab = (id: string) =>
  apiClient.delete<ApiResponse<null>>(`/kitab/${id}`);
