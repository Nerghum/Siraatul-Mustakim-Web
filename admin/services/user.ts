import apiClient from "./api-client";
import type {
  UserListResponse,
  User,
  UpdateUserPayload,
  CreateUserPayload,
} from "@/types/user";

export const createUser = (data: CreateUserPayload) =>
  apiClient.post<User>("/admin/users", data);

export const getUserList = (params?: Record<string, string | number | undefined>) =>
  apiClient.get<UserListResponse>("/admin/users", { params });

export const getUserById = (id: string) =>
  apiClient.get<User>(`/admin/users/${id}`);

export const updateUser = (id: string, data: UpdateUserPayload) =>
  apiClient.patch<User>(`/admin/users/${id}`, data);

export const deleteUser = (id: string) =>
  apiClient.delete<{ message: string }>(`/admin/users/${id}`);
