import Constants from "expo-constants";
import { Platform } from "react-native";

function getExpoHostIp() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as unknown as {
      manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
    }).manifest2?.extra?.expoClient?.hostUri;

  if (!hostUri) return "";
  return hostUri.split(":")[0] || "";
}

export function resolveBackendBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (envUrl) {
    if (!/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(envUrl)) {
      return envUrl.replace(/\/api\/?$/, "");
    }
    const hostIp = getExpoHostIp();
    if (hostIp) {
      return envUrl.replace(/localhost|127\.0\.0\.1/i, hostIp).replace(/\/api\/?$/, "");
    }
    if (Platform.OS === "android") {
      return envUrl.replace(/localhost|127\.0\.0\.1/i, "10.0.2.2").replace(/\/api\/?$/, "");
    }
    return envUrl.replace(/\/api\/?$/, "");
  }

  // Default to the VPS production server or host IP
  const hostIp = getExpoHostIp();
  if (hostIp) {
    return `http://${hostIp}:5001`;
  }
  if (Platform.OS === "android") {
    return "https://api.siraatulmustaqim.com";
  }
  return "https://api.siraatulmustaqim.com";
}

export const BACKEND_URL = resolveBackendBaseUrl();
export const API_BASE_URL = `${BACKEND_URL}/api`;
export const SOCKET_URL = BACKEND_URL;
