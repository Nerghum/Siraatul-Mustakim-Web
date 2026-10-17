import apiClient from "./api-client";
import type { Article, CreateArticlePayload } from "@/types/article";

export const getArticleList = (params?: Record<string, string | number | undefined>) =>
  apiClient.get<Article[]>("/articles", { params });

export const getArticleById = (id: string) =>
  apiClient.get<Article>(`/articles/${id}`);

export const createArticle = (data: CreateArticlePayload) => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("content", data.content);
  formData.append("status", data.status);
  if (data.tags) {
    formData.append("tags", data.tags);
  }
  if (data.image) {
    formData.append("image", data.image);
  }
  return apiClient.post<Article>("/articles/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateArticle = (id: string, data: Partial<CreateArticlePayload>) => {
  const formData = new FormData();
  if (data.title) formData.append("title", data.title);
  if (data.content) formData.append("content", data.content);
  if (data.status) formData.append("status", data.status);
  if (data.tags !== undefined) formData.append("tags", data.tags);
  if (data.image) {
    formData.append("image", data.image);
  }
  return apiClient.put<Article>(`/articles/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteArticle = (id: string) =>
  apiClient.delete<{ message: string }>(`/articles/${id}`);
