import apiClient from "./api-client";
import type { ApiResponse } from "@/types/api";
import type { Faq, CreateFaqPayload, AnswerFaqPayload, FaqFilters, MuftiUser } from "@/types/faq";

export const getFaqList = (params?: Record<string, string | number | undefined>) =>
  apiClient.get<ApiResponse<Faq[]>>("/faq", { params });

export const getFaqFilters = () =>
  apiClient.get<FaqFilters>("/faq/filters");

export const getFaqById = (id: string) =>
  apiClient.get<Faq>(`/faq/${id}`);

export const createFaq = (data: CreateFaqPayload) =>
  apiClient.post<ApiResponse<Faq>>("/faq/create", data);

export const answerFaq = (id: string, data: AnswerFaqPayload) =>
  apiClient.post<ApiResponse<Faq>>(`/faq/${id}/answer`, data);

export const deleteFaq = (id: string) =>
  apiClient.delete<ApiResponse<null>>(`/faq/${id}`);

export const getMuftiUsers = () =>
  apiClient.get<MuftiUser[]>("/faq/mufti-users");
