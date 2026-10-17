import apiClient from "./api-client";
import type { Notice, CreateNoticePayload } from "@/types/notice";

export const getNoticeList = (params?: Record<string, string | number | undefined>) =>
  apiClient.get<Notice[]>("/notice", { params });

export const getNoticeById = (id: string) =>
  apiClient.get<Notice>(`/notice/${id}`);

export const createNotice = (data: CreateNoticePayload) => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("date", data.date);
  formData.append("description", data.description);
  if (data.image) {
    formData.append("image", data.image);
  }
  return apiClient.post<Notice>("/notice/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateNotice = (id: string, data: Partial<CreateNoticePayload>) => {
  const formData = new FormData();
  if (data.title) formData.append("title", data.title);
  if (data.date) formData.append("date", data.date);
  if (data.description) formData.append("description", data.description);
  if (data.image) {
    formData.append("image", data.image);
  }
  return apiClient.patch<Notice>(`/notice/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteNotice = (id: string) =>
  apiClient.delete<{ message: string }>(`/notice/${id}`);
