import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../constants/api";

const TOKEN_KEY = "@admin_live_token";
const USER_KEY = "@admin_live_user";

export interface AdminUser {
  id: string;
  _id?: string;
  email: string;
  phone?: string;
  name?: string;
  role: string;
}

export async function loginWithEmail(
  identifier: string,
  password: string
): Promise<{ user: AdminUser; token: string }> {
  const cleanId = identifier.trim();
  const res = await axios.post(`${API_BASE_URL}/auth/login`, {
    email: cleanId,
    username: cleanId,
    identifier: cleanId,
    password,
  });

  const { token, user } = res.data;
  if (!token) {
    throw new Error("No token returned by server");
  }

  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  return { user, token };
}

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function getStoredUser(): Promise<AdminUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function logout(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

export async function getAuthHeaders(): Promise<{ Authorization: string } | {}> {
  const token = await getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
