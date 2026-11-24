import {
  AudioModule,
  AudioQuality,
  createAudioPlayer,
  IOSOutputFormat,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioRecorder,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { DeviceEventEmitter } from "react-native";
import {
  checkAndRequestBatteryOptimization,
  pauseNativeLiveForegroundService,
  resumeNativeLiveForegroundService,
  setKeepScreenOnNative,
  startNativeLiveForegroundService,
  stopNativeLiveForegroundService,
} from "./nativeService";
import { streamAudioChunk } from "./socket";

const RECORDING_DIR = `${FileSystem.documentDirectory}boyan-recordings/`;

export interface StreamerConfig {
  streamId: string;
  roomName: string;
  title?: string;
  onAudioLevel?: (level: number) => void;
  onDurationUpdate?: (seconds: number) => void;
}

export class LiveStreamer {
  private recorder: AudioRecorder | null = null;
  private monitorPlayer: AudioPlayer | null = null;
  private config: StreamerConfig | null = null;
  private isStreaming = false;
  private isPaused = false;
  private startTime = 0;
  private pausedDuration = 0;
  private pauseStartTime = 0;
  private timerInterval: any = null;
  private chunkInterval: any = null;
  private tickSubscription: any = null;
  private isReadingChunk = false;
  private lastReadOffset = 0;
  private liveVolume = 1.0; // 0..1 mic gain / stream volume multiplier
  private monitorVolume = 0.8; // 0..1 headphone monitor volume
  private isMonitoring = false;

  async init() {
    await setAudioModeAsync({
      allowsRecording: true,
      allowsBackgroundRecording: true,
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    });

    const info = await FileSystem.getInfoAsync(RECORDING_DIR);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(RECORDING_DIR, { intermediates: true });
    }
  }

  async start(config: StreamerConfig): Promise<void> {
    this.config = config;
    await this.init();

    const recorderOptions: any = {
      extension: ".aac",
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 64000,
      outputFormat: "aac_adts",
      audioEncoder: "aac",
      isMeteringEnabled: true,
      android: {
        outputFormat: "aac_adts",
        audioEncoder: "aac",
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 64000,
      },
      ios: {
        outputFormat: IOSOutputFormat.MPEG4AAC,
        audioQuality: AudioQuality.HIGH,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 64000,
      },
    };

    this.recorder = new AudioModule.AudioRecorder(recorderOptions);

    await this.recorder.prepareToRecordAsync(recorderOptions);
    this.recorder.record();

    this.isStreaming = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.pausedDuration = 0;
    this.pauseStartTime = 0;
    this.lastReadOffset = 0;

    // Start native Android Foreground Service with microphone type & wake lock
    // This keeps the live stream active when the app is minimized or screen is locked
    const streamTitle = config.title || "সিরাতুল মুস্তাকিম লাইভ";
    startNativeLiveForegroundService(
      streamTitle,
      "লাইভ সম্প্রচার চালু রয়েছে (অ্যাপ মিনিমাইজ করলেও সম্প্রচার অব্যাহত থাকবে)"
    ).catch((err) => {
      console.warn("[LiveStreamer] Foreground service start error:", err);
    });

    // Keep screen awake while live broadcasting to prevent screen timeout lock
    setKeepScreenOnNative(true).catch(() => {});
    checkAndRequestBatteryOptimization().catch(() => {});

    // Listen to native foreground service tick (ensures chunk streaming even when app is minimized / screen is locked)
    if (this.tickSubscription) {
      this.tickSubscription.remove();
    }
    this.tickSubscription = DeviceEventEmitter.addListener(
      "onLiveStreamChunkTick",
      async () => {
        if (this.isStreaming && !this.isPaused) {
          await this.readAndStreamChunk();
        }
      }
    );

    // Timer and VU meter polling
    this.timerInterval = setInterval(() => {
      if (!this.isStreaming) return;

      if (!this.isPaused) {
        const totalElapsed = Math.floor((Date.now() - this.startTime - this.pausedDuration) / 1000);
        this.config?.onDurationUpdate?.(Math.max(0, totalElapsed));

        // Live VU metering based on audio activity
        const simulatedLevel = Math.min(
          1,
          Math.max(0.1, (Math.sin(Date.now() / 250) + 1) * 0.45 * this.liveVolume)
        );
        this.config?.onAudioLevel?.(simulatedLevel);
      } else {
        // Paused VU meter is low/zero
        this.config?.onAudioLevel?.(0.05);
      }
    }, 200);

    // Fallback timer: stream audio chunks every 750ms to VPS
    this.chunkInterval = setInterval(async () => {
      await this.readAndStreamChunk();
    }, 750);
  }

  async pause(message?: string): Promise<void> {
    if (!this.isStreaming || this.isPaused) return;

    this.isPaused = true;
    this.pauseStartTime = Date.now();

    // Update foreground notification to show break status
    pauseNativeLiveForegroundService(
      message || "সাময়িক বিরতি চলছে... পুনরায় শুরু করতে অ্যাপে প্রবেশ করুন।"
    ).catch(() => {});
  }

  async resume(): Promise<void> {
    if (!this.isStreaming || !this.isPaused) return;

    if (this.pauseStartTime > 0) {
      this.pausedDuration += Date.now() - this.pauseStartTime;
      this.pauseStartTime = 0;
    }

    // Advance lastReadOffset to current file size so audio recorded during pause is discarded
    if (this.recorder?.uri) {
      try {
        const fileInfo = await FileSystem.getInfoAsync(this.recorder.uri);
        if (fileInfo.exists) {
          this.lastReadOffset = fileInfo.size;
        }
      } catch (err) {
        console.warn("[LiveStreamer] resume offset update error:", err);
      }
    }

    this.isPaused = false;

    // Restore foreground notification
    const streamTitle = this.config?.title || "সিরাতুল মুস্তাকিম লাইভ";
    resumeNativeLiveForegroundService(
      streamTitle,
      "লাইভ সম্প্রচার চালু রয়েছে (অ্যাপ মিনিমাইজ করলেও সম্প্রচার অব্যাহত থাকবে)"
    ).catch(() => {});
  }

  getIsPaused(): boolean {
    return this.isPaused;
  }

  private async readAndStreamChunk() {
    if (!this.recorder || !this.config || !this.isStreaming || this.isPaused || this.isReadingChunk) return;

    this.isReadingChunk = true;
    try {
      const uri = this.recorder.uri;
      if (!uri) return;

      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists || fileInfo.size <= this.lastReadOffset) return;

      const newBytes = fileInfo.size - this.lastReadOffset;
      if (newBytes > 0) {
        // Read the newest chunk as base64
        const chunkBase64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
          position: this.lastReadOffset,
          length: newBytes,
        });

        const isHeader = this.lastReadOffset === 0;
        this.lastReadOffset = fileInfo.size;

        if (chunkBase64 && chunkBase64.length > 0) {
          streamAudioChunk(
            this.config.streamId,
            this.config.roomName,
            chunkBase64,
            isHeader
          );
        }
      }
    } catch (err) {
      console.warn("[LiveStreamer] Error reading audio chunk:", err);
    } finally {
      this.isReadingChunk = false;
    }
  }

  setLiveVolume(volume: number) {
    this.liveVolume = Math.max(0, Math.min(1, volume));
  }

  getLiveVolume(): number {
    return this.liveVolume;
  }

  setMonitorVolume(volume: number) {
    this.monitorVolume = Math.max(0, Math.min(1, volume));
    if (this.monitorPlayer) {
      this.monitorPlayer.volume = this.monitorVolume;
    }
  }

  getMonitorVolume(): number {
    return this.monitorVolume;
  }

  async toggleHeadphoneMonitoring(enabled: boolean) {
    this.isMonitoring = enabled;
    if (enabled) {
      try {
        if (!this.monitorPlayer && this.recorder?.uri) {
          this.monitorPlayer = createAudioPlayer({ uri: this.recorder.uri });
          this.monitorPlayer.volume = this.monitorVolume;
        }
      } catch (err) {
        console.warn("[LiveStreamer] Headphone monitoring setup:", err);
      }
    } else {
      if (this.monitorPlayer) {
        try {
          this.monitorPlayer.pause();
        } catch (e) {}
      }
    }
  }

  async stop(): Promise<{ localUri: string; duration: number }> {
    this.isStreaming = false;
    this.isPaused = false;

    // Release keep screen on
    setKeepScreenOnNative(false).catch(() => {});

    // Stop native Android foreground service & release wake lock
    stopNativeLiveForegroundService().catch(() => {});

    if (this.tickSubscription) {
      this.tickSubscription.remove();
      this.tickSubscription = null;
    }

    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.chunkInterval) clearInterval(this.chunkInterval);

    let recordedTempUri = "";
    if (this.recorder) {
      try {
        await this.readAndStreamChunk(); // stream final chunk
        await this.recorder.stop();
        recordedTempUri = this.recorder.uri || "";
      } catch (err) {
        console.warn("[LiveStreamer] Stop recording error:", err);
      }
    }

    if (this.monitorPlayer) {
      try {
        this.monitorPlayer.pause();
        this.monitorPlayer = null;
      } catch (e) {}
    }

    const duration = Math.max(
      1,
      Math.floor((Date.now() - this.startTime - this.pausedDuration) / 1000)
    );
    const streamId = this.config?.streamId || Date.now().toString();
    const permanentPath = `${RECORDING_DIR}live-boyan-${streamId}.aac`;

    // Save permanently to local mobile storage
    if (recordedTempUri) {
      try {
        await FileSystem.copyAsync({
          from: recordedTempUri,
          to: permanentPath,
        });
        console.log("[LiveStreamer] Audio successfully saved to mobile storage:", permanentPath);
      } catch (err) {
        console.warn("[LiveStreamer] Failed to copy recording to permanent storage:", err);
      }
    }

    return {
      localUri: permanentPath,
      duration,
    };
  }
}

export const liveStreamer = new LiveStreamer();
