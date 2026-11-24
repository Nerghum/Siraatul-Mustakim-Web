import { NativeModules, Platform } from "react-native";

const { LiveStreamServiceModule } = NativeModules;

export async function startNativeLiveForegroundService(
  title: string,
  message?: string
): Promise<boolean> {
  if (Platform.OS !== "android" || !LiveStreamServiceModule) {
    return false;
  }
  try {
    const text = message || "লাইভ সম্প্রচার চালু রয়েছে (অ্যাপ মিনিমাইজ করলেও সম্প্রচার চলবে)";
    await LiveStreamServiceModule.startLiveService(title, text);
    return true;
  } catch (err) {
    console.warn("[nativeService] startLiveService failed:", err);
    return false;
  }
}

export async function pauseNativeLiveForegroundService(
  message?: string
): Promise<boolean> {
  if (Platform.OS !== "android" || !LiveStreamServiceModule) {
    return false;
  }
  try {
    const text = message || "সাময়িক বিরতি চলছে... পুনরায় শুরু করতে অ্যাপে প্রবেশ করুন।";
    await LiveStreamServiceModule.pauseLiveService(text);
    return true;
  } catch (err) {
    console.warn("[nativeService] pauseLiveService failed:", err);
    return false;
  }
}

export async function resumeNativeLiveForegroundService(
  title: string,
  message?: string
): Promise<boolean> {
  if (Platform.OS !== "android" || !LiveStreamServiceModule) {
    return false;
  }
  try {
    const text = message || "লাইভ সম্প্রচার চালু রয়েছে (অ্যাপ মিনিমাইজ করলেও সম্প্রচার চলবে)";
    await LiveStreamServiceModule.resumeLiveService(title, text);
    return true;
  } catch (err) {
    console.warn("[nativeService] resumeLiveService failed:", err);
    return false;
  }
}

export async function stopNativeLiveForegroundService(): Promise<boolean> {
  if (Platform.OS !== "android" || !LiveStreamServiceModule) {
    return false;
  }
  try {
    await LiveStreamServiceModule.stopLiveService();
    return true;
  } catch (err) {
    console.warn("[nativeService] stopLiveService failed:", err);
    return false;
  }
}

export async function setKeepScreenOnNative(enable: boolean): Promise<boolean> {
  if (Platform.OS !== "android" || !LiveStreamServiceModule?.setKeepScreenOn) {
    return false;
  }
  try {
    await LiveStreamServiceModule.setKeepScreenOn(enable);
    return true;
  } catch (err) {
    console.warn("[nativeService] setKeepScreenOn failed:", err);
    return false;
  }
}

export async function checkAndRequestBatteryOptimization(): Promise<void> {
  if (Platform.OS !== "android" || !LiveStreamServiceModule) {
    return;
  }
  try {
    const isIgnored = await LiveStreamServiceModule.isBatteryOptimizationIgnored();
    if (!isIgnored) {
      await LiveStreamServiceModule.requestBatteryOptimizationExemption();
    }
  } catch (err) {
    console.warn("[nativeService] battery optimization request failed:", err);
  }
}

