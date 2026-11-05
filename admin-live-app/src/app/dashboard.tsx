import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Colors } from "../constants/theme";
import { getStoredUser, logout, type AdminUser } from "../services/auth";
import {
  fetchAuthors,
  fetchCategories,
  startLiveBoyan,
  type AuthorItem,
  type CategoryItem,
} from "../services/boyan";
import { registerBroadcaster } from "../services/socket";
import { liveStreamer } from "../services/streamer";

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [authors, setAuthors] = useState<AuthorItem[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form fields
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ঈমান ও আকীদা");
  const [author, setAuthor] = useState("মুফতি জাফর আহমেদ");
  const [location, setLocation] = useState("ঢাকা");
  const [description, setDescription] = useState("");
  const [enableHeadphoneMonitor, setEnableHeadphoneMonitor] = useState(true);

  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingInitial(true);
      const [currentUser, cats, auths] = await Promise.all([
        getStoredUser(),
        fetchCategories(),
        fetchAuthors(),
      ]);
      setUser(currentUser);
      setCategories(cats);
      setAuthors(auths);
      if (cats.length > 0 && cats[0]?.name) {
        setSelectedCategory(cats[0].name);
      }
      if (auths.length > 0 && auths[0]?.name) {
        setAuthor(auths[0].name);
      }
    } catch (err) {
      console.warn("Failed to load dashboard data:", err);
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("লগআউট", "আপনি কি নিশ্চিতভাবে লগআউট করতে চান?", [
      { text: "বাতিল", style: "cancel" },
      {
        text: "লগআউট",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const handleGoLive = async () => {
    if (!title.trim()) {
      setError("দয়া করে বয়ানের শিরোনাম লিখুন");
      return;
    }
    if (!selectedCategory.trim()) {
      setError("দয়া করে বয়ানের একটি ক্যাটাগরি নির্বাচন করুন");
      return;
    }
    if (!author.trim()) {
      setError("দয়া করে বয়ানকারীর নাম লিখুন");
      return;
    }

    try {
      setStarting(true);
      setError(null);

      // 1. Initialize audio system
      await liveStreamer.init();

      // 2. Start Live Stream on VPS server
      const { stream, streamUrl } = await startLiveBoyan({
        title: title.trim(),
        category: selectedCategory.trim(),
        author: author.trim(),
        location: location.trim(),
        description: description.trim(),
      });

      // 3. Register broadcaster on VPS Socket.io signaling server
      await registerBroadcaster(stream._id, stream.roomName);

      // 4. Start local microphone recording & streaming
      await liveStreamer.start({
        streamId: stream._id,
        roomName: stream.roomName,
      });

      // 5. Configure initial headphone monitoring
      if (enableHeadphoneMonitor) {
        await liveStreamer.toggleHeadphoneMonitoring(true);
      }

      // 6. Navigate to live broadcast studio
      router.push({
        pathname: "/live/[id]",
        params: {
          id: stream._id,
          roomName: stream.roomName,
          title: stream.title,
          author: stream.author,
          category: stream.category,
          location: stream.location,
          streamUrl: streamUrl || "",
        },
      });
    } catch (err: any) {
      console.error("Go live failed:", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "লাইভ শুরু করতে ব্যর্থ হয়েছে। সার্ভার কানেকশন চেক করুন।";
      setError(msg);
    } finally {
      setStarting(false);
    }
  };

  if (loadingInitial) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>সেটিংস লোড হচ্ছে...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Admin Header */}
        <View style={styles.userBar}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Feather name="user-check" size={20} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.userName}>{user?.name || user?.email || "অ্যাডমিন"}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role?.toUpperCase() || "ADMIN"}</Text>
              </View>
            </View>
          </View>
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <Feather name="log-out" size={18} color={Colors.dangerDark} />
            <Text style={styles.logoutText}>লগআউট</Text>
          </Pressable>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="broadcast" size={24} color={Colors.primary} />
            <Text style={styles.cardTitle}>নতুন লাইভ বয়ান তৈরি করুন</Text>
          </View>
          <Text style={styles.cardSubtitle}>
            নিয়মিত বয়ানের মতো তথ্য পূরণ করে সরাসরি লাইভ ব্রডকাস্ট শুরু করুন
          </Text>

          {error && (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={18} color={Colors.dangerDark} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              বয়ান শিরোনাম <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="যেমন: ঈমানের গুরুত্ব ও আধুনিক ফেতনা"
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Category Chips */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              ক্যাটাগরি <Text style={styles.required}>*</Text>
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <Pressable
                    key={cat._id}
                    style={[styles.chip, isSelected && styles.chipActive]}
                    onPress={() => setSelectedCategory(cat.name)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Speaker / Author */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              বয়ানকারী / বক্তার নাম <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="বক্তার নাম লিখুন"
              placeholderTextColor={Colors.textMuted}
              value={author}
              onChangeText={setAuthor}
            />
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>স্থান / জেলা</Text>
            <TextInput
              style={styles.input}
              placeholder="যেমন: ঢাকা, চট্টগ্রাম, বা নির্দিষ্ট মসজিদ"
              placeholderTextColor={Colors.textMuted}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>সংক্ষিপ্ত বিবরণ (ঐচ্ছিক)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="আজকের আলোচনার মূল বিষয়বস্তু..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Device Setup & Headphone Pass-through Switch */}
          <View style={styles.setupCard}>
            <View style={styles.setupRow}>
              <View style={styles.setupLeft}>
                <Ionicons name="headset" size={22} color={Colors.primary} />
                <View>
                  <Text style={styles.setupTitle}>হেডফোনে লাইভ শুনুন (Pass-through)</Text>
                  <Text style={styles.setupDesc}>
                    হেডফোন পরলে লাইভ কথা শোনার জন্য অডিও মনিটর চালু রাখুন
                  </Text>
                </View>
              </View>
              <Switch
                value={enableHeadphoneMonitor}
                onValueChange={setEnableHeadphoneMonitor}
                trackColor={{ false: "#D1D5DB", true: Colors.accent }}
                thumbColor={Colors.white}
              />
            </View>

            <View style={styles.noticeBox}>
              <Feather name="info" size={16} color={Colors.primary} />
              <Text style={styles.noticeText}>
                ফোনটি মাইক্রোফোন হিসেবে কাজ করবে এবং স্বয়ংক্রিয়ভাবে সার্ভার ও অ্যাপ ব্যবহারকারীদের কাছে লাইভ সম্প্রচার করবে।
              </Text>
            </View>
          </View>

          {/* Go Live Button */}
          <Pressable
            style={[styles.goLiveBtn, starting && styles.btnDisabled]}
            onPress={handleGoLive}
            disabled={starting}
          >
            {starting ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <View style={styles.pulseDot} />
                <Text style={styles.goLiveBtnText}>লাইভ শুরু করুন (Go Live)</Text>
                <Feather name="radio" size={22} color={Colors.white} />
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 15,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  userBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.text,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.primary,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: Colors.dangerLight,
  },
  logoutText: {
    color: Colors.dangerDark,
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.dangerLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    color: Colors.dangerDark,
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  required: {
    color: Colors.danger,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: "#FAFAFA",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  chipsRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.borderLight,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  chipTextActive: {
    color: Colors.white,
    fontWeight: "bold",
  },
  setupCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
  },
  setupRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  setupLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  setupTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.primary,
  },
  setupDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 10,
    borderRadius: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primaryHover,
    lineHeight: 16,
  },
  goLiveBtn: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EF4444",
  },
  goLiveBtnText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: "bold",
  },
});
