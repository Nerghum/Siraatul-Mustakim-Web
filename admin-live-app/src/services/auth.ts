import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  API_BASE_URL,
  FALLBACK_API_BASE_URL,
} from "../constants/api";

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
  const cleanPass = password;

  const payload = {
    email: cleanId,
    username: cleanId,
    identifier: cleanId,
    password: cleanPass,
  };

  // Try primary live server first (https://api.siraatulmustaqim.com/api/auth/login)
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, payload, {
      timeout: 12000,
      headers: { "Content-Type": "application/json" },
    });

    const { token, user } = res.data;
    if (!token) {
      throw new Error("সার্ভার থেকে টোকেন পাওয়া যায়নি");
    }

    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    return { user, token };
  } catch (err: any) {
    console.warn(`[auth] Login on ${API_BASE_URL} failed:`, err.message);

    // If network error occurred, try fallback server
    const isNetworkErr =
      !err.response ||
      err.code === "ECONNABORTED" ||
      err.message?.includes("Network Error");

    if (isNetworkErr && FALLBACK_API_BASE_URL && FALLBACK_API_BASE_URL !== API_BASE_URL) {
      console.log(`[auth] Primary failed with network error, trying fallback server ${FALLBACK_API_BASE_URL}...`);
      try {
        const fallbackRes = await axios.post(
          `${FALLBACK_API_BASE_URL}/auth/login`,
          payload,
          {
            timeout: 12000,
            headers: { "Content-Type": "application/json" },
          }
        );
        const { token, user } = fallbackRes.data;
        if (token) {
          await AsyncStorage.setItem(TOKEN_KEY, token);
          await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
          return { user, token };
        }
      } catch (fallbackErr: any) {
        throw fallbackErr;
      }
    }

    throw err;
  }
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
