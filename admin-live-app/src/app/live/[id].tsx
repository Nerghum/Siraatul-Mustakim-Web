import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Colors } from "../../constants/theme";
import { stopLiveBoyan } from "../../services/boyan";
import {
  endSignalingBroadcast,
  subscribeListenerCount,
} from "../../services/socket";
import { liveStreamer } from "../../services/streamer";

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, "0");
  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export default function LiveStudioScreen() {
  const router = useRouter();
  const { id, roomName, title, author, category, location } =
    useLocalSearchParams<{
      id: string;
      roomName: string;
      title: string;
      author: string;
      category: string;
      location: string;
    }>();

  const [duration, setDuration] = useState(0);
  const [listenerCount, setListenerCount] = useState(0);
  const [liveVolume, setLiveVolume] = useState(1.0); // 0.0 to 1.0
  const [isHeadphoneMonitoring, setIsHeadphoneMonitoring] = useState(true);
  const [monitorVolume, setMonitorVolume] = useState(0.8);
  const [audioLevel, setAudioLevel] = useState(0.4);
  const [stopping, setStopping] = useState(false);

  // Pulse animation for LIVE badge
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subscribe to listener count updates via socket
    const unsubscribe = subscribeListenerCount((count) => {
      setListenerCount(count);
    });

    // Wire streamer callbacks
    liveStreamer.start({
      streamId: id as string,
      roomName: roomName as string,
      onDurationUpdate: (sec) => setDuration(sec),
      onAudioLevel: (lvl) => setAudioLevel(lvl),
    });

    return () => {
      unsubscribe();
    };
  }, [id, roomName, pulseAnim]);

  const handleLiveVolumeChange = (delta: number) => {
    const next = Math.max(0, Math.min(1, Math.round((liveVolume + delta) * 10) / 10));
    setLiveVolume(next);
    liveStreamer.setLiveVolume(next);
  };

  const handleMonitorVolumeChange = (delta: number) => {
    const next = Math.max(0, Math.min(1, Math.round((monitorVolume + delta) * 10) / 10));
    setMonitorVolume(next);
    liveStreamer.setMonitorVolume(next);
  };

  const handleToggleMonitoring = async (val: boolean) => {
    setIsHeadphoneMonitoring(val);
    await liveStreamer.toggleHeadphoneMonitoring(val);
  };

  const handleEndLive = () => {
    Alert.alert(
      "লাইভ সমাপ্তি",
      "আপনি কি নিশ্চিতভাবে লাইভ সম্প্রচার শেষ করতে চান? সম্প্রচার শেষ হলে অডিওটি সার্ভার এবং আপনার মোবাইলে সংরক্ষিত হবে।",
      [
        { text: "না, চালু রাখুন", style: "cancel" },
        {
          text: "হ্যাঁ, শেষ করুন",
          style: "destructive",
          onPress: performEndLive,
        },
      ]
    );
  };

  const performEndLive = async () => {
    try {
      setStopping(true);

      // 1. Stop recording and save to local mobile storage
      const { localUri, duration: finalDuration } = await liveStreamer.stop();

      // 2. Notify signaling server
      endSignalingBroadcast(id as string, roomName as string);

      // 3. Inform VPS to finalize and store boyan on server
      const stopRes = await stopLiveBoyan(id as string, localUri);

      // 4. Navigate to summary screen
      router.replace({
        pathname: "/summary/[id]",
        params: {
          id: id as string,
          title: title || "",
          author: author || "",
          category: category || "",
          duration: finalDuration.toString(),
          peakListeners: listenerCount.toString(),
          localUri: localUri || "",
          serverBoyanId: stopRes.boyan?._id || "",
        },
      });
    } catch (err: any) {
      console.error("End live failed:", err);
      Alert.alert(
        "ত্রুটি",
        "লাইভ শেষ করার সময় সমস্যা হয়েছে। তবে লোকাল অডিও সংরক্ষিত আছে।"
      );
      setStopping(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Top Live Bar */}
        <View style={styles.topBar}>
          <View style={styles.liveIndicator}>
            <Animated.View style={[styles.redDot, { opacity: pulseAnim }]} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <View style={styles.timerBox}>
            <Feather name="clock" size={15} color="#E5E7EB" />
            <Text style={styles.timerText}>{formatDuration(duration)}</Text>
          </View>
          <View style={styles.listenerBox}>
            <Ionicons name="people" size={16} color="#34D399" />
            <Text style={styles.listenerText}>{listenerCount} শ্রোতা</Text>
          </View>
        </View>

        {/* Boyan Details Banner */}
        <View style={styles.boyanCard}>
          <View style={styles.tagRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{category || "বয়ান"}</Text>
            </View>
            {location ? (
              <View style={styles.locBadge}>
                <Feather name="map-pin" size={12} color="#9CA3AF" />
                <Text style={styles.locText}>{location}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.boyanTitle}>{title}</Text>
          <Text style={styles.boyanAuthor}>বক্তা: {author}</Text>
        </View>

        {/* Real-time Audio VU Meter */}
        <View style={styles.vuCard}>
          <Text style={styles.vuTitle}>মাইক্রোফোন অডিও স্তর (Live Audio Input)</Text>
          <View style={styles.vuMeterRow}>
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((threshold, idx) => {
              const active = audioLevel >= threshold;
              const barColor =
                idx >= 4 ? "#EF4444" : idx >= 3 ? "#F59E0B" : "#10B981";
              return (
                <View
                  key={idx}
                  style={[
                    styles.vuBar,
                    {
                      backgroundColor: active ? barColor : "#374151",
                      height: 14 + idx * 8,
                    },
                  ]}
                />
              );
            })}
          </View>
          <Text style={styles.vuStatusText}>
            {audioLevel > 0.1 ? "অডিও সঠিকভাবে প্রবাহিত হচ্ছে" : "শব্দ ধরা পড়ছে না..."}
          </Text>
        </View>

        {/* Live Audio Controls */}
        <View style={styles.controlsCard}>
          <Text style={styles.controlsSectionTitle}>অডিও ও ভলিউম নিয়ন্ত্রণ</Text>

          {/* Live Volume / Mic Gain */}
          <View style={styles.controlRow}>
            <View style={styles.controlInfo}>
              <View style={styles.controlIconWrap}>
                <Feather name="mic" size={20} color={Colors.white} />
              </View>
              <View>
                <Text style={styles.controlName}>লাইভ ব্রডকাস্ট ভলিউম</Text>
                <Text style={styles.controlSub}>
                  শ্রোতাদের কাছে যাওয়ার ভলিউম লেভেল
                </Text>
              </View>
            </View>
            <View style={styles.sliderControls}>
              <Pressable
                style={styles.stepBtn}
                onPress={() => handleLiveVolumeChange(-0.1)}
              >
                <Feather name="minus" size={18} color="#FFFFFF" />
              </Pressable>
              <Text style={styles.volValue}>{Math.round(liveVolume * 100)}%</Text>
              <Pressable
                style={styles.stepBtn}
                onPress={() => handleLiveVolumeChange(0.1)}
              >
                <Feather name="plus" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>

          {/* Headphone Monitor Switch */}
          <View style={[styles.controlRow, { marginTop: 16 }]}>
            <View style={styles.controlInfo}>
              <View style={[styles.controlIconWrap, { backgroundColor: "#065F46" }]}>
                <Ionicons name="headset" size={20} color={Colors.white} />
              </View>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.controlName}>হেডফোনে লাইভ শুনুন</Text>
                <Text style={styles.controlSub}>
                  হেডফোন পরে থাকলে নিজের কণ্ঠ মনিটর করুন
                </Text>
              </View>
            </View>
            <Switch
              value={isHeadphoneMonitoring}
              onValueChange={handleToggleMonitoring}
              trackColor={{ false: "#374151", true: "#10B981" }}
              thumbColor={Colors.white}
            />
          </View>

          {/* Headphone Monitor Volume */}
          {isHeadphoneMonitoring && (
            <View style={[styles.controlRow, { marginTop: 12 }]}>
              <View style={styles.controlInfo}>
                <Feather name="volume-2" size={18} color="#9CA3AF" />
                <Text style={[styles.controlName, { fontSize: 14, marginLeft: 8 }]}>
                  মনিটর ভলিউম
                </Text>
              </View>
              <View style={styles.sliderControls}>
                <Pressable
                  style={styles.stepBtnSmall}
                  onPress={() => handleMonitorVolumeChange(-0.1)}
                >
                  <Feather name="minus" size={16} color="#FFFFFF" />
                </Pressable>
                <Text style={styles.volValue}>
                  {Math.round(monitorVolume * 100)}%
                </Text>
                <Pressable
                  style={styles.stepBtnSmall}
                  onPress={() => handleMonitorVolumeChange(0.1)}
                >
                  <Feather name="plus" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Live Broadcast Notice */}
        <View style={styles.statusNotice}>
          <MaterialCommunityIcons name="broadcast" size={20} color="#34D399" />
          <Text style={styles.statusNoticeText}>
            আপনার কথাগুলো ভিপিএস সিগন্যালিং সার্ভারের মাধ্যমে সিরাতুল মুস্তাকিম মোবাইল অ্যাপে লাইভ বাজছে।
          </Text>
        </View>

        {/* End Live Button */}
        <Pressable
          style={[styles.endLiveBtn, stopping && styles.btnDisabled]}
          onPress={handleEndLive}
          disabled={stopping}
        >
          {stopping ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <>
              <Feather name="stop-circle" size={24} color={Colors.white} />
              <Text style={styles.endLiveBtnText}>লাইভ শেষ করুন (End Live)</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1F2937",
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC2626",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  liveText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  timerBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timerText: {
    color: "#F9FAFB",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  listenerBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#064E3B",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  listenerText: {
    color: "#34D399",
    fontSize: 13,
    fontWeight: "600",
  },
  boyanCard: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: "#064E3B",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    color: "#34D399",
    fontSize: 12,
    fontWeight: "600",
  },
  locBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locText: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  boyanTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    lineHeight: 24,
  },
  boyanAuthor: {
    color: "#D1D5DB",
    fontSize: 14,
  },
  vuCard: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  vuTitle: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 14,
  },
  vuMeterRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    height: 48,
    marginBottom: 10,
  },
  vuBar: {
    width: 18,
    borderRadius: 4,
  },
  vuStatusText: {
    color: "#6B7280",
    fontSize: 12,
  },
  controlsCard: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  controlsSectionTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 16,
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  controlInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  controlIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },
  controlName: {
    color: "#F9FAFB",
    fontSize: 14,
    fontWeight: "600",
  },
  controlSub: {
    color: "#9CA3AF",
    fontSize: 11,
    marginTop: 2,
  },
  sliderControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 10,
    padding: 4,
    gap: 8,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },
  stepBtnSmall: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#374151",
    justifyContent: "center",
    alignItems: "center",
  },
  volValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    minWidth: 44,
    textAlign: "center",
  },
  statusNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#064E3B",
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  statusNoticeText: {
    flex: 1,
    color: "#A7F3D0",
    fontSize: 12,
    lineHeight: 18,
  },
  endLiveBtn: {
    flexDirection: "row",
    backgroundColor: "#DC2626",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  endLiveBtnText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },
});
