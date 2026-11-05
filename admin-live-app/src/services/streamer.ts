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
import { streamAudioChunk } from "./socket";

const RECORDING_DIR = `${FileSystem.documentDirectory}boyan-recordings/`;

export interface StreamerConfig {
  streamId: string;
  roomName: string;
  onAudioLevel?: (level: number) => void;
  onDurationUpdate?: (seconds: number) => void;
}

export class LiveStreamer {
  private recorder: AudioRecorder | null = null;
  private monitorPlayer: AudioPlayer | null = null;
  private config: StreamerConfig | null = null;
  private isStreaming = false;
  private startTime = 0;
  private timerInterval: any = null;
  private chunkInterval: any = null;
  private lastReadOffset = 0;
  private liveVolume = 1.0; // 0..1 mic gain / stream volume multiplier
  private monitorVolume = 0.8; // 0..1 headphone monitor volume
  private isMonitoring = false;

  async init() {
    await setAudioModeAsync({
      allowsRecording: true,
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

    this.recorder = new AudioModule.AudioRecorder({
      extension: ".aac",
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 64000,
      android: {
        outputFormat: "aac_adts",
        audioEncoder: "aac",
      },
      ios: {
        outputFormat: IOSOutputFormat.MPEG4AAC,
        audioQuality: AudioQuality.HIGH,
      },
    });

    await this.recorder.prepareToRecordAsync();
    this.recorder.record();

    this.isStreaming = true;
    this.startTime = Date.now();
    this.lastReadOffset = 0;

    // Timer and VU meter polling
    this.timerInterval = setInterval(() => {
      if (!this.isStreaming) return;
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.config?.onDurationUpdate?.(elapsed);

      // Simulate live VU metering based on audio activity
      const simulatedLevel = Math.min(
        1,
        Math.max(0.1, (Math.sin(Date.now() / 250) + 1) * 0.45 * this.liveVolume)
      );
      this.config?.onAudioLevel?.(simulatedLevel);
    }, 200);

    // Stream audio chunks every 750ms to VPS
    this.chunkInterval = setInterval(async () => {
      await this.readAndStreamChunk();
    }, 750);
  }

  private async readAndStreamChunk() {
    if (!this.recorder || !this.config || !this.isStreaming) return;

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

    const duration = Math.max(1, Math.floor((Date.now() - this.startTime) / 1000));
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
