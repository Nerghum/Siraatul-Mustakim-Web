import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors } from "../../constants/theme";

function formatSeconds(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m} মিনিট ${s} সেকেন্ড`;
}

export default function SummaryScreen() {
  const router = useRouter();
  const {
    id,
    title,
    author,
    category,
    duration,
    peakListeners,
    localUri,
    serverBoyanId,
  } = useLocalSearchParams<{
    id: string;
    title: string;
    author: string;
    category: string;
    duration: string;
    peakListeners: string;
    localUri: string;
    serverBoyanId: string;
  }>();

  const [player, setPlayer] = useState<AudioPlayer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let p: AudioPlayer | null = null;
    if (localUri) {
      try {
        p = createAudioPlayer({ uri: localUri });
        setPlayer(p);
      } catch (err) {
        console.warn("Failed to create preview player:", err);
      }
    }

    return () => {
      if (p) {
        try {
          p.pause();
        } catch (e) {}
      }
    };
  }, [localUri]);

  const handleTogglePlayback = () => {
    if (!player) return;
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  };

  const durNum = parseInt(duration || "0", 10);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      {/* Success Badge */}
      <View style={styles.successHeader}>
        <View style={styles.successIconCircle}>
          <Feather name="check" size={36} color={Colors.white} />
        </View>
        <Text style={styles.successTitle}>লাইভ সফলভাবে সম্পন্ন হয়েছে</Text>
        <Text style={styles.successSubtitle}>
          সম্পূর্ণ লাইভ অডিওটি সার্ভার এবং আপনার মোবাইল মেমরিতে সংরক্ষিত হয়েছে
        </Text>
      </View>

      {/* Boyan Overview */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>বয়ান বিবরণ</Text>
        <Text style={styles.boyanTitle}>{title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>বক্তা:</Text>
            <Text style={styles.metaVal}>{author}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>ক্যাটাগরি:</Text>
            <Text style={styles.metaVal}>{category}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Feather name="clock" size={20} color={Colors.primary} />
            <Text style={styles.statNum}>{formatSeconds(durNum)}</Text>
            <Text style={styles.statLabel}>মোট সময়কাল</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="people" size={20} color={Colors.primary} />
            <Text style={styles.statNum}>{peakListeners || 0}</Text>
            <Text style={styles.statLabel}>সর্বোচ্চ শ্রোতা</Text>
          </View>
        </View>
      </View>

      {/* Storage Persistence Confirmation Cards */}
      <View style={styles.storageCard}>
        <Text style={styles.cardSectionTitle}>অডিও সংরক্ষণ স্ট্যাটাস</Text>

        {/* Server Storage */}
        <View style={styles.storageItem}>
          <View style={styles.storageIconSuccess}>
            <MaterialCommunityIcons name="cloud-check" size={24} color="#059669" />
          </View>
          <View style={styles.storageInfo}>
            <Text style={styles.storageName}>সার্ভার স্টোরেজ (VPS Server)</Text>
            <Text style={styles.storageDesc}>
              {serverBoyanId
                ? `বয়ান হিসেবে ডাটাবেজে অন্তর্ভুক্ত হয়েছে (ID: ${serverBoyanId.slice(-6)})`
                : "সার্ভার ফাইল স্টোরেজে পূর্ণ অডিও সংরক্ষিত"}
            </Text>
            <View style={styles.savedBadge}>
              <Text style={styles.savedBadgeText}>✓ সংরক্ষিত</Text>
            </View>
          </View>
        </View>

        {/* Mobile Storage */}
        <View style={[styles.storageItem, { marginTop: 14 }]}>
          <View style={styles.storageIconSuccess}>
            <MaterialCommunityIcons name="cellphone-check" size={24} color="#059669" />
          </View>
          <View style={styles.storageInfo}>
            <Text style={styles.storageName}>মোবাইল স্টোরেজ (This Device)</Text>
            <Text style={styles.storageDesc} numberOfLines={2}>
              {localUri || "ডিভাইসের ডকুমেন্ট ডিরেক্টরিতে সংরক্ষিত"}
            </Text>
            <View style={styles.savedBadge}>
              <Text style={styles.savedBadgeText}>✓ সংরক্ষিত</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Local Recording Audio Player Preview */}
      {localUri ? (
        <View style={styles.playerCard}>
          <Text style={styles.playerTitle}>রেকর্ডিং প্রিভিউ শুনুন</Text>
          <Pressable style={styles.playBtn} onPress={handleTogglePlayback}>
            <Feather
              name={isPlaying ? "pause" : "play"}
              size={24}
              color={Colors.white}
            />
            <Text style={styles.playBtnText}>
              {isPlaying ? "থামান" : "প্লে করুন"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* Back to Dashboard Button */}
      <Pressable
        style={styles.doneBtn}
        onPress={() => router.replace("/dashboard")}
      >
        <Feather name="home" size={20} color={Colors.white} />
        <Text style={styles.doneBtnText}>ড্যাশবোর্ডে ফিরে যান</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  successHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 12,
  },
  boyanTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 10,
    lineHeight: 23,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    gap: 4,
  },
  metaLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  metaVal: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statNum: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.primary,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  storageCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  storageItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  storageIconSuccess: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },
  storageInfo: {
    flex: 1,
  },
  storageName: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
  },
  storageDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  savedBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  savedBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#059669",
  },
  playerCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  playerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  playBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "bold",
  },
  doneBtn: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  doneBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});
