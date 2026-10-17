import apiClient from "./api-client";
import type {
  Boyan,
  CreateBoyanPayload,
  UpdateBoyanPayload,
  BoyanCategory,
  CreateBoyanCategoryPayload,
  UpdateBoyanCategoryPayload,
} from "@/types/boyan";

export const getBoyanList = (
  params?: Record<string, string | number | undefined>
) =>
  apiClient.get<{
    items: Boyan[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>("/boyan", { params });

export const getBoyanById = (id: string) =>
  apiClient.get<Boyan>(`/boyan/${id}`);

export const getBoyanCategories = () =>
  apiClient.get<BoyanCategory[]>("/boyan/categories");

export const createBoyanCategory = (data: CreateBoyanCategoryPayload) =>
  apiClient.post<BoyanCategory>("/boyan/categories/create", data);

export const updateBoyanCategory = (id: string, data: UpdateBoyanCategoryPayload) =>
  apiClient.patch<BoyanCategory>(`/boyan/categories/${id}`, data);

export const deleteBoyanCategory = (id: string) =>
  apiClient.delete<null>(`/boyan/categories/${id}`);

export const getBoyanAuthors = () =>
  apiClient.get<string[]>("/boyan/authors");

export const getBoyanLocations = () =>
  apiClient.get<string[]>("/boyan/locations");

export const createBoyan = (data: CreateBoyanPayload) => {
  if (data.mediaType === "video") {
    return apiClient.post<Boyan>("/boyan/create", {
      title: data.title,
      category: data.category,
      author: data.author || "",
      location: data.location || "",
      mediaType: "video",
      youtubeUrl: data.youtubeUrl || "",
    });
  }

  if (data.audio) {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("category", data.category);
    if (data.author) formData.append("author", data.author);
    if (data.location) formData.append("location", data.location);
    formData.append("mediaType", "audio");
    formData.append("audio", data.audio);
    return apiClient.post<Boyan>("/boyan/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return apiClient.post<Boyan>("/boyan/create", {
    title: data.title,
    category: data.category,
    author: data.author || "",
    location: data.location || "",
    mediaType: "audio",
  });
};

export const updateBoyan = (id: string, data: UpdateBoyanPayload) => {
  if (data.mediaType === "video") {
    return apiClient.put<Boyan>(`/boyan/${id}`, {
      title: data.title,
      category: data.category,
      author: data.author,
      location: data.location,
      mediaType: "video",
      youtubeUrl: data.youtubeUrl || "",
    });
  }

  if (data.audio) {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.category) formData.append("category", data.category);
    if (data.author !== undefined) formData.append("author", data.author);
    if (data.location !== undefined) formData.append("location", data.location);
    formData.append("mediaType", "audio");
    formData.append("audio", data.audio);
    return apiClient.put<Boyan>(`/boyan/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return apiClient.put<Boyan>(`/boyan/${id}`, {
    title: data.title,
    category: data.category,
    author: data.author,
    location: data.location,
    mediaType: data.mediaType || "audio",
    youtubeUrl: data.youtubeUrl,
  });
};

export const deleteBoyan = (id: string) =>
  apiClient.delete(`/boyan/${id}`);
