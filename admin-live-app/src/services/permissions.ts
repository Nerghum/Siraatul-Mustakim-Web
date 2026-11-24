import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  type PermissionResponse,
} from "expo-audio";
import { Alert, PermissionsAndroid, Platform } from "react-native";
import { checkAndRequestBatteryOptimization } from "./nativeService";

export interface AppPermissionStatus {
  microphone: boolean;
  notifications: boolean;
}

export async function checkMicrophonePermission(): Promise<PermissionResponse> {
  try {
    return await getRecordingPermissionsAsync();
  } catch (err) {
    console.warn("[permissions] Failed to check recording permission:", err);
    return {
      status: "undetermined" as any,
      expires: "never",
      granted: false,
      canAskAgain: true,
    };
  }
}

export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const current = await getRecordingPermissionsAsync();
    if (current.granted) {
      return true;
    }
    const result = await requestRecordingPermissionsAsync();
    return result.granted;
  } catch (err) {
    console.warn("[permissions] Failed to request recording permission:", err);
    return false;
  }
}

/**
 * Requests all required app permissions upfront (Microphone & Notifications).
 * Called on install and initial app startup.
 */
export async function requestAllAppPermissions(): Promise<AppPermissionStatus> {
  const status: AppPermissionStatus = {
    microphone: false,
    notifications: true,
  };

  try {
    // 1. Microphone permission via expo-audio
    const micRes = await requestRecordingPermissionsAsync();
    status.microphone = micRes.granted;

    // 2. Android 13+ (API 33+) Notification permission via PermissionsAndroid
    if (Platform.OS === "android") {
      if (Platform.Version >= 33) {
        try {
          const notifStatus = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: "নোটিফিকেশন অনুমতি",
              message:
                "অ্যাপ মিনিমাইজ বা ব্যাকগ্রাউন্ডে রাখলেও লাইভ সম্প্রচার সচল রাখার জন্য নোটিফিকেশন অনুমতি প্রয়োজন।",
              buttonPositive: "অনুমতি দিন",
              buttonNegative: "বাতিল",
            }
          );
          status.notifications = notifStatus === PermissionsAndroid.RESULTS.GRANTED;
        } catch (e) {
          console.warn("[permissions] Notification permission request error:", e);
        }
      }

      // Check battery optimization exemption in background
      checkAndRequestBatteryOptimization().catch(() => {});
    }
  } catch (err) {
    console.warn("[permissions] requestAllAppPermissions error:", err);
  }

  return status;
}

export async function ensureMicrophonePermission(alertUser = true): Promise<boolean> {
  try {
    const current = await getRecordingPermissionsAsync();
    if (current.granted) {
      return true;
    }

    const requested = await requestRecordingPermissionsAsync();
    if (requested.granted) {
      return true;
    }

    if (alertUser) {
      Alert.alert(
        "মাইক্রোফোন অনুমতি প্রয়োজন",
        "লাইভ বয়ান ব্রডকাস্ট করার জন্য ফোনের মাইক্রোফোন অনুমতি চালু করা আবশ্যক। অনুগ্রহ করে আপনার ফোনের সেটিংস থেকে অনুমতি দিন।",
        [{ text: "ঠিক আছে", style: "default" }]
      );
    }
    return false;
  } catch (err) {
    console.warn("[permissions] ensureMicrophonePermission error:", err);
    return false;
  }
}
