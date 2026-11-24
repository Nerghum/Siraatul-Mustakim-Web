import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import { Colors } from "../constants/theme";
import { getStoredUser, logout, type AdminUser } from "../services/auth";
import {
  createBoyan,
  deleteBoyan,
  deleteLiveStream,
  fetchAuthors,
  fetchBoyans,
  fetchCategories,
  fetchLiveHistory,
  fetchUpcomingSchedules,
  getTodayDateString,
  normalizeDate,
  startLiveBoyan,
  updateBoyan,
  type AuthorItem,
  type BayanScheduleItem,
  type BoyanItem,
  type CategoryItem,
  type LiveHistoryItem,
} from "../services/boyan";
import {
  checkMicrophonePermission,
  ensureMicrophonePermission,
  requestAllAppPermissions,
  requestMicrophonePermission,
} from "../services/permissions";
import { registerBroadcaster } from "../services/socket";
import { liveStreamer } from "../services/streamer";

type TabKey = "live" | "boyans" | "add" | "history";

export default function DashboardScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("live");
  const [user, setUser] = useState<AdminUser | null>(null);

  // Microphone permission state
  const [hasMicPermission, setHasMicPermission] = useState<boolean>(true);

  // Common data
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [authors, setAuthors] = useState<AuthorItem[]>([]);
  const [schedules, setSchedules] = useState<BayanScheduleItem[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- TAB 1: GO LIVE STATE ---
  const [liveSourceMode, setLiveSourceMode] = useState<"schedule" | "custom">("schedule");
  const [selectedSchedule, setSelectedSchedule] = useState<BayanScheduleItem | null>(null);
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ইসলাহি মজলিস");
  const [author, setAuthor] = useState("মুফতি জাফর আহমেদ");
  const [location, setLocation] = useState("ঢাকা");
  const [description, setDescription] = useState("");
  const [enableHeadphoneMonitor, setEnableHeadphoneMonitor] = useState(true);
  const [startingLive, setStartingLive] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  // --- TAB 2: ALL BOYANS STATE ---
  const [boyansList, setBoyansList] = useState<BoyanItem[]>([]);
  const [boyansTotal, setBoyansTotal] = useState(0);
  const [loadingBoyans, setLoadingBoyans] = useState(false);
  const [boyanSearch, setBoyanSearch] = useState("");
  const [boyanFilterType, setBoyanFilterType] = useState<"all" | "live" | "audio" | "video">("all");
  const [boyanFilterCat, setBoyanFilterCat] = useState<string>("all");

  // Audio preview playback
  const [playingBoyanId, setPlayingBoyanId] = useState<string | null>(null);
  const previewPlayerRef = useRef<AudioPlayer | null>(null);

  // --- TAB 3: ADD BOYAN STATE ---
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("ইসলাহি মজলিস");
  const [newAuthor, setNewAuthor] = useState("মুফতি জাফর আহমেদ");
  const [newLocation, setNewLocation] = useState("ঢাকা");
  const [newMediaType, setNewMediaType] = useState<"audio" | "video">("audio");
  const [newYoutubeUrl, setNewYoutubeUrl] = useState("");
  const [newAudioUrl, setNewAudioUrl] = useState("");
  const [pickedFile, setPickedFile] = useState<{
    uri: string;
    name: string;
    size?: number;
    mimeType?: string;
  } | null>(null);
  const [submittingNewBoyan, setSubmittingNewBoyan] = useState(false);
  const [newBoyanError, setNewBoyanError] = useState<string | null>(null);

  // --- TAB 4: LIVE HISTORY STATE ---
  const [liveHistoryList, setLiveHistoryList] = useState<LiveHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // --- EDIT MODAL STATE ---
  const [editingBoyan, setEditingBoyan] = useState<BoyanItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editMediaType, setEditMediaType] = useState<"audio" | "video">("audio");
  const [editYoutubeUrl, setEditYoutubeUrl] = useState("");
  const [editAudioUrl, setEditAudioUrl] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    loadInitialData();
    checkMic();
    return () => {
      stopPreviewPlayer();
    };
  }, []);

  const checkMic = async () => {
    const perm = await checkMicrophonePermission();
    setHasMicPermission(perm.granted);
  };

  const handleRequestMic = async () => {
    const status = await requestAllAppPermissions();
    setHasMicPermission(status.microphone);
    if (!status.microphone) {
      Alert.alert(
        "মাইক্রোফোন ও নোটিফিকেশন অনুমতি প্রয়োজন",
        "লাইভ সম্প্রচারের জন্য এবং অ্যাপ মিনিমাইজ থাকলেও লাইভ চালু রাখার জন্য ফোন সেটিংস থেকে মাইক্রোফোন ও নোটিফিকেশন পারমিশন চালু করুন।"
      );
    }
  };

  const loadInitialData = async () => {
    try {
      setLoadingInitial(true);
      const [currentUser, cats, auths, scheds] = await Promise.all([
        getStoredUser(),
        fetchCategories(),
        fetchAuthors(),
        fetchUpcomingSchedules(),
      ]);
      setUser(currentUser);
      setCategories(cats);
      setAuthors(auths);
      setSchedules(scheds);

      // If upcoming schedules exist, auto-select the first one by default
      if (scheds.length > 0) {
        applyScheduleToLiveForm(scheds[0]);
      } else {
        if (cats.length > 0) setSelectedCategory(cats[0].name);
        if (auths.length > 0) setAuthor(auths[0].name);
      }

      await loadBoyans();
    } catch (err) {
      console.warn("Failed to load dashboard data:", err);
    } finally {
      setLoadingInitial(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        checkMic(),
        fetchUpcomingSchedules().then((s) => setSchedules(s)),
        loadBoyans(),
        loadHistory(),
      ]);
    } catch (err) {
      console.warn("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // --- SCHEDULE SELECTION LOGIC ---
  const applyScheduleToLiveForm = (sched: BayanScheduleItem) => {
    setSelectedSchedule(sched);
    const scheduleTitle = sched.title || sched.path || "ইসলাহি মজলিস";
    const loc = sched.location || sched.districtName || "";
    setTitle(`${scheduleTitle}${loc ? ` - ${loc}` : ""}`);
    setSelectedCategory("ইসলাহি মজলিস");
    setAuthor("মুফতি জাফর আহমেদ");
    setLocation(sched.districtName ? `${sched.districtName}${sched.location ? `, ${sched.location}` : ""}` : loc);
    
    let desc = `তারিখ: ${sched.date} (${sched.timeText || sched.time})`;
    if (sched.location) desc += `\nস্থান: ${sched.location}`;
    if (sched.contacts && sched.contacts.length > 0) {
      const c = sched.contacts[0];
      desc += `\nযোগাযোগ: ${c.name} (${c.phone})`;
    }
    setDescription(desc);
  };

  const handleSelectSchedule = (sched: BayanScheduleItem) => {
    applyScheduleToLiveForm(sched);
  };

  const handleSwitchToCustomLive = () => {
    setLiveSourceMode("custom");
    setSelectedSchedule(null);
  };

  const handleSwitchToScheduleLive = () => {
    setLiveSourceMode("schedule");
    if (schedules.length > 0) {
      applyScheduleToLiveForm(schedules[0]);
    }
  };

  // --- GO LIVE ---
  const handleGoLive = async () => {
    const hasPerm = await ensureMicrophonePermission();
    setHasMicPermission(hasPerm);
    if (!hasPerm) return;

    if (!title.trim()) {
      setLiveError("দয়া করে বয়ানের শিরোনাম লিখুন");
      return;
    }
    if (!selectedCategory.trim()) {
      setLiveError("দয়া করে বয়ানের একটি ক্যাটাগরি নির্বাচন করুন");
      return;
    }
    if (!author.trim()) {
      setLiveError("দয়া করে বয়ানকারীর নাম লিখুন");
      return;
    }

    try {
      setStartingLive(true);
      setLiveError(null);

      // 1. Initialize audio system
      await liveStreamer.init();

      // 2. Start Live Stream on server
      const { stream, streamUrl } = await startLiveBoyan({
        title: title.trim(),
        category: selectedCategory.trim(),
        author: author.trim(),
        location: location.trim(),
        description: description.trim(),
      });

      // 3. Register broadcaster socket
      await registerBroadcaster(stream._id, stream.roomName);

      // 4. Start audio stream
      await liveStreamer.start({
        streamId: stream._id,
        roomName: stream.roomName,
      });

      // 5. Configure headphone monitoring
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
      const rawMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message;
      const msg =
        rawMsg === "Network Error"
          ? "সার্ভারের সাথে সংযোগ পাওয়া যায়নি (Network Error)। সার্ভার স্ট্যাটাস ও ইন্টারনেট কানেকশন চেক করুন।"
          : rawMsg || "লাইভ শুরু করতে ব্যর্থ হয়েছে। সার্ভার কানেকশন চেক করুন।";
      setLiveError(msg);
    } finally {
      setStartingLive(false);
    }
  };

  // --- ALL BOYANS TAB LOGIC ---
  const loadBoyans = async () => {
    try {
      setLoadingBoyans(true);
      const res = await fetchBoyans({
        search: boyanSearch,
        category: boyanFilterCat !== "all" ? boyanFilterCat : undefined,
        mediaType: boyanFilterType !== "all" && boyanFilterType !== "live" ? boyanFilterType : undefined,
        limit: 100,
      });
      let items = res.items || [];
      if (boyanFilterType === "live") {
        items = items.filter((b) => b.category === "লাইভ বয়ান" || (b.title && b.title.includes("লাইভ")));
      }
      setBoyansList(items);
      setBoyansTotal(res.total || items.length);
    } catch (err) {
      console.warn("loadBoyans error:", err);
    } finally {
      setLoadingBoyans(false);
    }
  };

  const stopPreviewPlayer = () => {
    if (previewPlayerRef.current) {
      try {
        previewPlayerRef.current.pause();
        previewPlayerRef.current = null;
      } catch {}
    }
    setPlayingBoyanId(null);
  };

  const handleTogglePlayAudio = (boyan: BoyanItem) => {
    if (!boyan.audioUrl) {
      Alert.alert("অডিও অনুপলব্ধ", "এই বয়ানের কোনো অডিও লিংক পাওয়া যায়নি।");
      return;
    }

    if (playingBoyanId === boyan._id) {
      stopPreviewPlayer();
      return;
    }

    try {
      stopPreviewPlayer();
      const player = createAudioPlayer({ uri: boyan.audioUrl });
      player.play();
      previewPlayerRef.current = player;
      setPlayingBoyanId(boyan._id);
    } catch (err) {
      console.warn("Failed to play audio preview:", err);
      Alert.alert("ত্রুটি", "অডিও চালু করা যায়নি।");
    }
  };

  const handleDeleteBoyan = (boyan: BoyanItem) => {
    Alert.alert(
      "বয়ানের মুছুন",
      `আপনি কি নিশ্চিতভাবে "${boyan.title}" বয়ানটি মুছে ফেলতে চান?`,
      [
        { text: "বাতিল", style: "cancel" },
        {
          text: "মুছে ফেলুন",
          style: "destructive",
          onPress: async () => {
            try {
              if (playingBoyanId === boyan._id) stopPreviewPlayer();
              await deleteBoyan(boyan._id);
              setBoyansList((prev) => prev.filter((b) => b._id !== boyan._id));
              setBoyansTotal((prev) => Math.max(0, prev - 1));
              Alert.alert("সফল", "বয়ানের রেকর্ড সফলভাবে মুছে ফেলা হয়েছে।");
            } catch (err: any) {
              Alert.alert("ত্রুটি", err.message || "বয়ানের মুছতে ব্যর্থ হয়েছে।");
            }
          },
        },
      ]
    );
  };

  const handleOpenEditModal = (boyan: BoyanItem) => {
    setEditingBoyan(boyan);
    setEditTitle(boyan.title || "");
    setEditCategory(boyan.category || "সাধারণ বয়ান");
    setEditAuthor(boyan.author || "");
    setEditLocation(boyan.location || "");
    setEditMediaType(boyan.mediaType || "audio");
    setEditYoutubeUrl(boyan.youtubeUrl || "");
    setEditAudioUrl(boyan.audioUrl || "");
  };

  const handleSaveEdit = async () => {
    if (!editingBoyan) return;
    if (!editTitle.trim()) {
      Alert.alert("ভুল", "দয়া করে বয়ানের শিরোনাম দিন।");
      return;
    }

    try {
      setSavingEdit(true);
      const updated = await updateBoyan(editingBoyan._id, {
        title: editTitle.trim(),
        category: editCategory.trim(),
        author: editAuthor.trim(),
        location: editLocation.trim(),
        mediaType: editMediaType,
        youtubeUrl: editMediaType === "video" ? editYoutubeUrl.trim() : "",
        audioUrl: editMediaType === "audio" ? editAudioUrl.trim() : "",
      });

      setBoyansList((prev) =>
        prev.map((b) => (b._id === editingBoyan._id ? { ...b, ...updated } : b))
      );
      setEditingBoyan(null);
      Alert.alert("সফল", "বয়ানের তথ্য সফলভাবে আপডেট হয়েছে।");
    } catch (err: any) {
      Alert.alert("ত্রুটি", err.message || "আপডেট ব্যর্থ হয়েছে।");
    } finally {
      setSavingEdit(false);
    }
  };

  // --- ADD BOYAN TAB LOGIC ---
  const handlePickAudioFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["audio/*"],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];
        setPickedFile({
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
          mimeType: asset.mimeType,
        });
      }
    } catch (err) {
      console.warn("Document picker error:", err);
      Alert.alert("ত্রুটি", "ফাইল নির্বাচন করা সম্ভব হয়নি।");
    }
  };

  const handleCreateBoyan = async () => {
    if (!newTitle.trim()) {
      setNewBoyanError("বয়ানের শিরোনাম আবশ্যক");
      return;
    }
    if (!newCategory.trim()) {
      setNewBoyanError("ক্যাটাগরি নির্বাচন করুন");
      return;
    }
    if (newMediaType === "video" && !newYoutubeUrl.trim()) {
      setNewBoyanError("ভিডিও বয়ানের জন্য ইউটিউব লিংক আবশ্যক");
      return;
    }

    try {
      setSubmittingNewBoyan(true);
      setNewBoyanError(null);

      const created = await createBoyan({
        title: newTitle.trim(),
        category: newCategory.trim(),
        author: newAuthor.trim(),
        location: newLocation.trim(),
        mediaType: newMediaType,
        youtubeUrl: newYoutubeUrl.trim(),
        audioUrl: newAudioUrl.trim(),
        audioFileUri: pickedFile?.uri,
        audioFileName: pickedFile?.name,
        audioMimeType: pickedFile?.mimeType,
      });

      Alert.alert("সফল!", "নতুন বয়ান সফলভাবে যোগ করা হয়েছে।");
      // Reset form
      setNewTitle("");
      setPickedFile(null);
      setNewYoutubeUrl("");
      setNewAudioUrl("");
      // Add to list and switch to list tab
      setBoyansList((prev) => [created, ...prev]);
      setBoyansTotal((prev) => prev + 1);
      setActiveTab("boyans");
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "বয়ানের তৈরি করতে সমস্যা হয়েছে";
      setNewBoyanError(msg);
    } finally {
      setSubmittingNewBoyan(false);
    }
  };

  // --- LIVE HISTORY TAB LOGIC ---
  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await fetchLiveHistory();
      setLiveHistoryList(data);
    } catch (err) {
      console.warn("loadHistory error:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDeleteHistory = (item: LiveHistoryItem) => {
    Alert.alert(
      "হিস্ট্রি মুছুন",
      `আপনি কি নিশ্চিতভাবে "${item.title}" লাইভ ব্রডকাস্ট রেকর্ডটি মুছে ফেলতে চান?`,
      [
        { text: "বাতিল", style: "cancel" },
        {
          text: "মুছে ফেলুন",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteLiveStream(item._id);
              setLiveHistoryList((prev) => prev.filter((h) => h._id !== item._id));
            } catch (err: any) {
              Alert.alert("ত্রুটি", err.message || "হিস্ট্রি মুছতে ব্যর্থ হয়েছে।");
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("লগআউট", "আপনি কি নিশ্চিতভাবে অ্যাডমিন প্যানেল থেকে লগআউট করতে চান?", [
      { text: "বাতিল", style: "cancel" },
      {
        text: "লগআউট",
        style: "destructive",
        onPress: async () => {
          stopPreviewPlayer();
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  if (loadingInitial) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>অ্যাডমিন প্যানেল লোড হচ্ছে...</Text>
      </View>
    );
  }

  const todayStr = getTodayDateString();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Top Admin User Bar */}
      <View style={styles.userBar}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Feather name="shield" size={20} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.userName}>{user?.name || user?.email || "অ্যাডমিন"}</Text>
            <View style={styles.roleRow}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{user?.role?.toUpperCase() || "ADMIN"}</Text>
              </View>
              {hasMicPermission ? (
                <View style={[styles.micBadge, styles.micBadgeOk]}>
                  <Feather name="mic" size={10} color={Colors.primary} />
                  <Text style={styles.micTextOk}>মাইক প্রস্তুত</Text>
                </View>
              ) : (
                <Pressable style={[styles.micBadge, styles.micBadgeWarn]} onPress={handleRequestMic}>
                  <Feather name="mic-off" size={10} color={Colors.dangerDark} />
                  <Text style={styles.micTextWarn}>মাইক পারমিশন দিন</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        <View style={styles.topActions}>
          <Pressable style={styles.refreshBtn} onPress={onRefresh}>
            <Feather name="refresh-cw" size={16} color={Colors.primary} />
          </Pressable>
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <Feather name="log-out" size={16} color={Colors.dangerDark} />
          </Pressable>
        </View>
      </View>

      {/* Mic Warning Banner if permission denied */}
      {!hasMicPermission && (
        <View style={styles.permBanner}>
          <Feather name="alert-triangle" size={18} color="#92400E" />
          <View style={{ flex: 1 }}>
            <Text style={styles.permBannerTitle}>মাইক্রোফোন অনুমতি চালু নেই</Text>
            <Text style={styles.permBannerDesc}>
              লাইভ বয়ান ব্রডকাস্ট করার জন্য ফোনের মাইক্রোফোন পারমিশন প্রয়োজন।
            </Text>
          </View>
          <Pressable style={styles.permGrantBtn} onPress={handleRequestMic}>
            <Text style={styles.permGrantBtnText}>অনুমতি দিন</Text>
          </Pressable>
        </View>
      )}

      {/* Navigation Tabs */}
      <View style={styles.tabsContainer}>
        <Pressable
          style={[styles.tabBtn, activeTab === "live" && styles.tabBtnActive]}
          onPress={() => setActiveTab("live")}
        >
          <View style={styles.tabIconRow}>
            <View style={[styles.liveIndicatorDot, activeTab === "live" && styles.liveIndicatorDotActive]} />
            <Text style={[styles.tabBtnText, activeTab === "live" && styles.tabBtnTextActive]}>
              লাইভ শুরু
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.tabBtn, activeTab === "boyans" && styles.tabBtnActive]}
          onPress={() => {
            setActiveTab("boyans");
            loadBoyans();
          }}
        >
          <View style={styles.tabIconRow}>
            <Feather
              name="headphones"
              size={15}
              color={activeTab === "boyans" ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.tabBtnText, activeTab === "boyans" && styles.tabBtnTextActive]}>
              সকল বয়ান
            </Text>
            {boyansTotal > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{boyansTotal}</Text>
              </View>
            )}
          </View>
        </Pressable>

        <Pressable
          style={[styles.tabBtn, activeTab === "add" && styles.tabBtnActive]}
          onPress={() => setActiveTab("add")}
        >
          <View style={styles.tabIconRow}>
            <Feather
              name="plus-circle"
              size={15}
              color={activeTab === "add" ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.tabBtnText, activeTab === "add" && styles.tabBtnTextActive]}>
              নতুন বয়ান
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.tabBtn, activeTab === "history" && styles.tabBtnActive]}
          onPress={() => {
            setActiveTab("history");
            loadHistory();
          }}
        >
          <View style={styles.tabIconRow}>
            <Feather
              name="clock"
              size={15}
              color={activeTab === "history" ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.tabBtnText, activeTab === "history" && styles.tabBtnTextActive]}>
              হিস্ট্রি
            </Text>
          </View>
        </Pressable>
      </View>

      {/* =========================================================================
          TAB 1: GO LIVE (শিডিউল থেকে নির্বাচন বা কাস্টম)
         ========================================================================= */}
      {activeTab === "live" && (
        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {/* Card: Source Selection Mode */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="broadcast" size={24} color={Colors.primary} />
              <Text style={styles.cardTitle}>লাইভ সম্প্রচার কন্ট্রোল</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              ইসলাহি মজলিসের শিডিউল থেকে নির্বাচন করুন অথবা তাৎক্ষণিক কাস্টম বয়ান শুরু করুন
            </Text>

            {/* Segment Toggle */}
            <View style={styles.sourceToggle}>
              <Pressable
                style={[
                  styles.sourceToggleBtn,
                  liveSourceMode === "schedule" && styles.sourceToggleBtnActive,
                ]}
                onPress={handleSwitchToScheduleLive}
              >
                <Feather
                  name="calendar"
                  size={15}
                  color={liveSourceMode === "schedule" ? Colors.white : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.sourceToggleText,
                    liveSourceMode === "schedule" && styles.sourceToggleTextActive,
                  ]}
                >
                  শিডিউল থেকে লাইভ
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.sourceToggleBtn,
                  liveSourceMode === "custom" && styles.sourceToggleBtnActive,
                ]}
                onPress={handleSwitchToCustomLive}
              >
                <Feather
                  name="edit-3"
                  size={15}
                  color={liveSourceMode === "custom" ? Colors.white : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.sourceToggleText,
                    liveSourceMode === "custom" && styles.sourceToggleTextActive,
                  ]}
                >
                  তাৎক্ষণিক / কাস্টম
                </Text>
              </Pressable>
            </View>

            {liveError && (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={18} color={Colors.dangerDark} />
                <Text style={styles.errorText}>{liveError}</Text>
              </View>
            )}

            {/* SCHEDULE SELECTOR LIST (If Schedule Mode) */}
            {liveSourceMode === "schedule" && (
              <View style={styles.scheduleSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>
                    📅 আসন্ন শিডিউল তালিকা ({schedules.length}টি প্রস্তুত)
                  </Text>
                  <Text style={styles.sectionSubtext}>শুধুমাত্র বর্তমান ও ভবিষ্যতের শিডিউল</Text>
                </View>

                {schedules.length === 0 ? (
                  <View style={styles.emptyScheduleBox}>
                    <Feather name="calendar" size={24} color={Colors.textMuted} />
                    <Text style={styles.emptyScheduleText}>
                      বর্তমানে কোনো অমীমাংসিত শিডিউল নেই।
                    </Text>
                    <Pressable
                      style={styles.switchCustomSmallBtn}
                      onPress={handleSwitchToCustomLive}
                    >
                      <Text style={styles.switchCustomSmallText}>
                        কাস্টম তথ্য দিয়ে লাইভ শুরু করুন
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.scheduleHScroll}
                  >
                    {schedules.map((sched) => {
                      const isSelected = selectedSchedule?._id === sched._id;
                      const norm = normalizeDate(sched.date);
                      const isToday = norm === todayStr;

                      return (
                        <Pressable
                          key={sched._id}
                          style={[
                            styles.scheduleCard,
                            isSelected && styles.scheduleCardSelected,
                          ]}
                          onPress={() => handleSelectSchedule(sched)}
                        >
                          <View style={styles.scheduleCardHeader}>
                            <View
                              style={[
                                styles.dateBadge,
                                isToday ? styles.dateBadgeToday : styles.dateBadgeUpcoming,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.dateBadgeText,
                                  isToday && styles.dateBadgeTodayText,
                                ]}
                              >
                                {isToday ? "আজকে" : sched.date}
                              </Text>
                            </View>
                            {isSelected && (
                              <View style={styles.selectedIcon}>
                                <Feather name="check" size={14} color={Colors.white} />
                              </View>
                            )}
                          </View>

                          <Text style={styles.schedCardTitle} numberOfLines={2}>
                            {sched.title || sched.path || "ইসলাহি মজলিস"}
                          </Text>

                          <View style={styles.schedCardRow}>
                            <Feather name="map-pin" size={12} color={Colors.primary} />
                            <Text style={styles.schedCardLoc} numberOfLines={1}>
                              {sched.location || sched.districtName || "ঢাকা"}
                            </Text>
                          </View>

                          <View style={styles.schedCardRow}>
                            <Feather name="clock" size={12} color={Colors.textMuted} />
                            <Text style={styles.schedCardTime} numberOfLines={1}>
                              {sched.timeText || sched.time}
                            </Text>
                          </View>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                )}

                {/* Selected Schedule Banner */}
                {selectedSchedule && (
                  <View style={styles.selectedBanner}>
                    <View style={styles.selectedBannerLeft}>
                      <Feather name="check-circle" size={18} color={Colors.primary} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.selectedBannerTitle}>
                          শিডিউল স্বয়ংক্রিয়ভাবে সংযুক্ত হয়েছে
                        </Text>
                        <Text style={styles.selectedBannerSub}>
                          {selectedSchedule.title || "ইসলাহি মজলিস"} • {selectedSchedule.districtName}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      style={styles.clearSchedBtn}
                      onPress={handleSwitchToCustomLive}
                    >
                      <Text style={styles.clearSchedBtnText}>কাস্টমাইজ</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            )}

            {/* Live Boyan Form Fields */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  বয়ানের শিরোনাম <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="যেমন: ইসলাহি মজলিস — আত্মশুদ্ধির গুরুত্ব"
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

              {/* Speaker / Bokta */}
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
                {authors.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickAuthorsRow}>
                    {authors.map((a) => (
                      <Pressable
                        key={a._id}
                        style={styles.authorChip}
                        onPress={() => setAuthor(a.name)}
                      >
                        <Text style={styles.authorChipText}>+ {a.name}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </View>

              {/* Location */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>স্থান / জেলা</Text>
                <TextInput
                  style={styles.input}
                  placeholder="যেমন: ঢাকা, ঢালকানগর খানকা বা নির্দিষ্ট মসজিদ"
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
                  numberOfLines={2}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              {/* Device Setup & Headphone Pass-through Switch */}
              <View style={styles.setupCard}>
                <View style={styles.setupRow}>
                  <View style={styles.setupLeft}>
                    <Ionicons name="headset" size={22} color={Colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.setupTitle}>হেডফোনে লাইভ শুনুন (Pass-through)</Text>
                      <Text style={styles.setupDesc}>
                        হেডফোন ব্যবহার করলে কথা মনিটর করার জন্য অডিও চালু রাখুন
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
              </View>

              {/* Go Live Button */}
              <Pressable
                style={[styles.goLiveBtn, startingLive && styles.btnDisabled]}
                onPress={handleGoLive}
                disabled={startingLive}
              >
                {startingLive ? (
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
          </View>
        </ScrollView>
      )}

      {/* =========================================================================
          TAB 2: ALL BOYANS (সকল বয়ান ব্যবস্থাপনা)
         ========================================================================= */}
      {activeTab === "boyans" && (
        <View style={styles.tabContent}>
          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <View style={styles.searchBox}>
              <Feather name="search" size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="বয়ানের নাম, বক্তা বা স্থান দিয়ে খুঁজুন..."
                placeholderTextColor={Colors.textMuted}
                value={boyanSearch}
                onChangeText={(text) => {
                  setBoyanSearch(text);
                }}
                onSubmitEditing={loadBoyans}
              />
              {boyanSearch.length > 0 && (
                <Pressable
                  onPress={() => {
                    setBoyanSearch("");
                    loadBoyans();
                  }}
                >
                  <Feather name="x" size={16} color={Colors.textMuted} />
                </Pressable>
              )}
            </View>
            <Pressable style={styles.searchBtn} onPress={loadBoyans}>
              <Text style={styles.searchBtnText}>খুঁজুন</Text>
            </Pressable>
          </View>

          {/* Filter Pills */}
          <View style={styles.filterBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Pressable
                style={[styles.filterPill, boyanFilterType === "all" && styles.filterPillActive]}
                onPress={() => {
                  setBoyanFilterType("all");
                }}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    boyanFilterType === "all" && styles.filterPillTextActive,
                  ]}
                >
                  সব ({boyansTotal})
                </Text>
              </Pressable>

              <Pressable
                style={[styles.filterPill, boyanFilterType === "live" && styles.filterPillActive]}
                onPress={() => {
                  setBoyanFilterType("live");
                }}
              >
                <View style={styles.redDotSmall} />
                <Text
                  style={[
                    styles.filterPillText,
                    boyanFilterType === "live" && styles.filterPillTextActive,
                  ]}
                >
                  লাইভ রেকর্ড
                </Text>
              </Pressable>

              <Pressable
                style={[styles.filterPill, boyanFilterType === "audio" && styles.filterPillActive]}
                onPress={() => {
                  setBoyanFilterType("audio");
                }}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    boyanFilterType === "audio" && styles.filterPillTextActive,
                  ]}
                >
                  🎵 অডিও
                </Text>
              </Pressable>

              <Pressable
                style={[styles.filterPill, boyanFilterType === "video" && styles.filterPillActive]}
                onPress={() => {
                  setBoyanFilterType("video");
                }}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    boyanFilterType === "video" && styles.filterPillTextActive,
                  ]}
                >
                  🎬 ভিডিও
                </Text>
              </Pressable>
            </ScrollView>
          </View>

          {/* Boyans List */}
          {loadingBoyans ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>বয়ানের তালিকা লোড হচ্ছে...</Text>
            </View>
          ) : (
            <FlatList
              data={boyansList}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContent}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Feather name="inbox" size={40} color={Colors.textMuted} />
                  <Text style={styles.emptyListTitle}>কোনো বয়ান পাওয়া যায়নি</Text>
                  <Text style={styles.emptyListSub}>নতুন বয়ান তৈরি করতে "নতুন বয়ান" ট্যাবে যান।</Text>
                </View>
              }
              renderItem={({ item }) => {
                const isPlaying = playingBoyanId === item._id;
                const isLiveRecording =
                  item.category === "লাইভ বয়ান" ||
                  (item.audioUrl && item.audioUrl.includes("live-"));

                return (
                  <View style={styles.boyanCard}>
                    {/* Header info */}
                    <View style={styles.boyanCardTop}>
                      <View style={styles.badgeGroup}>
                        {isLiveRecording ? (
                          <View style={styles.liveBadge}>
                            <View style={styles.redDotSmall} />
                            <Text style={styles.liveBadgeText}>লাইভ রেকর্ড</Text>
                          </View>
                        ) : item.mediaType === "video" ? (
                          <View style={styles.videoBadge}>
                            <Feather name="video" size={10} color="#DC2626" />
                            <Text style={styles.videoBadgeText}>ভিডিও</Text>
                          </View>
                        ) : (
                          <View style={styles.audioBadge}>
                            <Feather name="volume-2" size={10} color={Colors.primary} />
                            <Text style={styles.audioBadgeText}>অডিও</Text>
                          </View>
                        )}

                        <View style={styles.categoryPill}>
                          <Text style={styles.categoryPillText}>{item.category}</Text>
                        </View>
                      </View>

                      {item.views !== undefined && (
                        <View style={styles.viewsBadge}>
                          <Feather name="eye" size={12} color={Colors.textMuted} />
                          <Text style={styles.viewsText}>{item.views}</Text>
                        </View>
                      )}
                    </View>

                    {/* Title */}
                    <Text style={styles.boyanTitle}>{item.title}</Text>

                    {/* Metadata */}
                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <Feather name="user" size={13} color={Colors.primary} />
                        <Text style={styles.metaText}>{item.author || "বক্তা উল্লেখ নেই"}</Text>
                      </View>
                      {item.location ? (
                        <View style={styles.metaItem}>
                          <Feather name="map-pin" size={13} color={Colors.textMuted} />
                          <Text style={styles.metaText}>{item.location}</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Action buttons bar */}
                    <View style={styles.cardActionsRow}>
                      {/* Play preview if audio exists */}
                      {item.audioUrl ? (
                        <Pressable
                          style={[styles.playPreviewBtn, isPlaying && styles.playPreviewBtnPlaying]}
                          onPress={() => handleTogglePlayAudio(item)}
                        >
                          <Feather
                            name={isPlaying ? "pause" : "play"}
                            size={14}
                            color={isPlaying ? Colors.white : Colors.primary}
                          />
                          <Text
                            style={[
                              styles.playPreviewText,
                              isPlaying && styles.playPreviewTextPlaying,
                            ]}
                          >
                            {isPlaying ? "থামান" : "শুনুন"}
                          </Text>
                        </Pressable>
                      ) : item.youtubeUrl ? (
                        <View style={styles.ytIndicator}>
                          <Feather name="youtube" size={14} color="#DC2626" />
                          <Text style={styles.ytIndicatorText}>ইউটিউব লিংক</Text>
                        </View>
                      ) : null}

                      <View style={styles.actionRightButtons}>
                        <Pressable
                          style={styles.editActionBtn}
                          onPress={() => handleOpenEditModal(item)}
                        >
                          <Feather name="edit-2" size={14} color={Colors.primary} />
                          <Text style={styles.editActionText}>সম্পাদনা</Text>
                        </Pressable>

                        <Pressable
                          style={styles.deleteActionBtn}
                          onPress={() => handleDeleteBoyan(item)}
                        >
                          <Feather name="trash-2" size={14} color={Colors.dangerDark} />
                          <Text style={styles.deleteActionText}>মুছুন</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      )}

      {/* =========================================================================
          TAB 3: ADD NEW BOYAN (নতুন বয়ান আপলোড বা লিংক)
         ========================================================================= */}
      {activeTab === "add" && (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="plus-circle" size={24} color={Colors.primary} />
              <Text style={styles.cardTitle}>নতুন বয়ান সংরক্ষণ করুন</Text>
            </View>
            <Text style={styles.cardSubtitle}>
              অডিও ফাইল আপলোড করুন অথবা ইউটিউব ভিডিও লিংক যুক্ত করে বয়ান পাবলিশ করুন
            </Text>

            {newBoyanError && (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={18} color={Colors.dangerDark} />
                <Text style={styles.errorText}>{newBoyanError}</Text>
              </View>
            )}

            {/* Media Type Switcher */}
            <View style={styles.mediaTypeRow}>
              <Pressable
                style={[styles.mediaTypeBtn, newMediaType === "audio" && styles.mediaTypeBtnActive]}
                onPress={() => setNewMediaType("audio")}
              >
                <Feather
                  name="volume-2"
                  size={16}
                  color={newMediaType === "audio" ? Colors.white : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.mediaTypeText,
                    newMediaType === "audio" && styles.mediaTypeTextActive,
                  ]}
                >
                  অডিও বয়ান (Audio)
                </Text>
              </Pressable>

              <Pressable
                style={[styles.mediaTypeBtn, newMediaType === "video" && styles.mediaTypeBtnActive]}
                onPress={() => setNewMediaType("video")}
              >
                <Feather
                  name="video"
                  size={16}
                  color={newMediaType === "video" ? Colors.white : Colors.textSecondary}
                />
                <Text
                  style={[
                    styles.mediaTypeText,
                    newMediaType === "video" && styles.mediaTypeTextActive,
                  ]}
                >
                  ভিডিও বয়ান (YouTube)
                </Text>
              </Pressable>
            </View>

            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                বয়ানের শিরোনাম <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="যেমন: তাকওয়ার তাৎপর্য ও সমাজ গঠন"
                placeholderTextColor={Colors.textMuted}
                value={newTitle}
                onChangeText={setNewTitle}
              />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                ক্যাটাগরি <Text style={styles.required}>*</Text>
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
                {categories.map((cat) => {
                  const isSelected = newCategory === cat.name;
                  return (
                    <Pressable
                      key={cat._id}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setNewCategory(cat.name)}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <TextInput
                style={[styles.input, { marginTop: 6 }]}
                placeholder="বা কাস্টম ক্যাটাগরি নাম লিখুন"
                placeholderTextColor={Colors.textMuted}
                value={newCategory}
                onChangeText={setNewCategory}
              />
            </View>

            {/* Speaker / Author */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>বয়ানকারী / বক্তা</Text>
              <TextInput
                style={styles.input}
                placeholder="বক্তার নাম লিখুন"
                placeholderTextColor={Colors.textMuted}
                value={newAuthor}
                onChangeText={setNewAuthor}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickAuthorsRow}>
                {authors.map((a) => (
                  <Pressable
                    key={a._id}
                    style={styles.authorChip}
                    onPress={() => setNewAuthor(a.name)}
                  >
                    <Text style={styles.authorChipText}>+ {a.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>স্থান / জেলা</Text>
              <TextInput
                style={styles.input}
                placeholder="যেমন: ঢাকা, সিলেট, বা মসজিদ"
                placeholderTextColor={Colors.textMuted}
                value={newLocation}
                onChangeText={setNewLocation}
              />
            </View>

            {/* Audio Upload vs Video Input */}
            {newMediaType === "audio" ? (
              <View style={styles.uploadSection}>
                <Text style={styles.label}>মোবাইল থেকে অডিও ফাইল</Text>
                {pickedFile ? (
                  <View style={styles.pickedFileBox}>
                    <Feather name="music" size={20} color={Colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pickedFileName} numberOfLines={1}>
                        {pickedFile.name}
                      </Text>
                      {pickedFile.size ? (
                        <Text style={styles.pickedFileSize}>
                          {(pickedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </Text>
                      ) : null}
                    </View>
                    <Pressable onPress={() => setPickedFile(null)}>
                      <Feather name="x-circle" size={20} color={Colors.danger} />
                    </Pressable>
                  </View>
                ) : (
                  <Pressable style={styles.pickFileBtn} onPress={handlePickAudioFile}>
                    <Feather name="upload-cloud" size={24} color={Colors.primary} />
                    <Text style={styles.pickFileBtnText}>অডিও ফাইল নির্বাচন করুন (.mp3, .m4a, .aac)</Text>
                  </Pressable>
                )}

                <Text style={[styles.label, { marginTop: 12 }]}>বা সরাসরি অডিও URL (ঐচ্ছিক)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/audio.mp3"
                  placeholderTextColor={Colors.textMuted}
                  value={newAudioUrl}
                  onChangeText={setNewAudioUrl}
                />
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  ইউটিউব ভিডিও লিংক <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://www.youtube.com/watch?v=..."
                  placeholderTextColor={Colors.textMuted}
                  value={newYoutubeUrl}
                  onChangeText={setNewYoutubeUrl}
                />
              </View>
            )}

            {/* Submit Button */}
            <Pressable
              style={[styles.saveBoyanBtn, submittingNewBoyan && styles.btnDisabled]}
              onPress={handleCreateBoyan}
              disabled={submittingNewBoyan}
            >
              {submittingNewBoyan ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <>
                  <Feather name="check" size={20} color={Colors.white} />
                  <Text style={styles.saveBoyanBtnText}>সংরক্ষণ ও পাবলিশ করুন</Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      )}

      {/* =========================================================================
          TAB 4: LIVE HISTORY (লাইভ হিস্ট্রি)
         ========================================================================= */}
      {activeTab === "history" && (
        <View style={styles.tabContent}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>পূর্বের লাইভ ব্রডকাস্ট রেকর্ডসমূহ</Text>
            <Text style={styles.historySub}>
              সার্ভারে মোট {liveHistoryList.length}টি লাইভ রেকর্ড সংরক্ষিত আছে
            </Text>
          </View>

          {loadingHistory ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>হিস্ট্রি লোড হচ্ছে...</Text>
            </View>
          ) : (
            <FlatList
              data={liveHistoryList}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.listContent}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              ListEmptyComponent={
                <View style={styles.emptyList}>
                  <Feather name="clock" size={40} color={Colors.textMuted} />
                  <Text style={styles.emptyListTitle}>কোনো লাইভ হিস্ট্রি নেই</Text>
                  <Text style={styles.emptyListSub}>লাইভ শুরু করলে এখানে রেকর্ড সংরক্ষিত হবে।</Text>
                </View>
              }
              renderItem={({ item }) => {
                const dateFormatted = item.startedAt
                  ? new Date(item.startedAt).toLocaleString("bn-BD")
                  : "তারিখ উল্লেখ নেই";
                const mins = item.duration ? Math.floor(item.duration / 60) : 0;
                const secs = item.duration ? item.duration % 60 : 0;

                return (
                  <View style={styles.historyCard}>
                    <View style={styles.historyCardTop}>
                      <View style={styles.liveBadge}>
                        <View style={styles.redDotSmall} />
                        <Text style={styles.liveBadgeText}>
                          {item.isLive ? "চলমান লাইভ" : "সমাপ্ত লাইভ"}
                        </Text>
                      </View>
                      <Text style={styles.historyDate}>{dateFormatted}</Text>
                    </View>

                    <Text style={styles.historyItemTitle}>{item.title}</Text>
                    <Text style={styles.historyItemAuthor}>
                      বক্তা: {item.author || "মুফতি জাফর আহমেদ"} • স্থান: {item.location || "ঢাকা"}
                    </Text>

                    <View style={styles.historyStatsRow}>
                      <View style={styles.statChip}>
                        <Feather name="clock" size={12} color={Colors.primary} />
                        <Text style={styles.statChipText}>
                          স্থায়িত্ব: {mins} মি. {secs} সে.
                        </Text>
                      </View>
                      <View style={styles.statChip}>
                        <Feather name="users" size={12} color={Colors.primary} />
                        <Text style={styles.statChipText}>শ্রোতা: {item.listenerCount || 0}</Text>
                      </View>
                    </View>

                    <View style={styles.historyActionsRow}>
                      <Pressable
                        style={styles.deleteHistoryBtn}
                        onPress={() => handleDeleteHistory(item)}
                      >
                        <Feather name="trash-2" size={13} color={Colors.dangerDark} />
                        <Text style={styles.deleteHistoryText}>হিস্ট্রি মুছুন</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      )}

      {/* =========================================================================
          EDIT BOYAN MODAL
         ========================================================================= */}
      <Modal visible={!!editingBoyan} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>বয়ানের তথ্য সম্পাদনা</Text>
              <Pressable onPress={() => setEditingBoyan(null)}>
                <Feather name="x" size={22} color={Colors.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>শিরোনাম</Text>
                <TextInput
                  style={styles.input}
                  value={editTitle}
                  onChangeText={setEditTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>ক্যাটাগরি</Text>
                <TextInput
                  style={styles.input}
                  value={editCategory}
                  onChangeText={setEditCategory}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>বক্তা / বয়ানকারী</Text>
                <TextInput
                  style={styles.input}
                  value={editAuthor}
                  onChangeText={setEditAuthor}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>স্থান</Text>
                <TextInput
                  style={styles.input}
                  value={editLocation}
                  onChangeText={setEditLocation}
                />
              </View>

              {editMediaType === "video" ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>ইউটিউব লিংক</Text>
                  <TextInput
                    style={styles.input}
                    value={editYoutubeUrl}
                    onChangeText={setEditYoutubeUrl}
                  />
                </View>
              ) : (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>অডিও URL</Text>
                  <TextInput
                    style={styles.input}
                    value={editAudioUrl}
                    onChangeText={setEditAudioUrl}
                  />
                </View>
              )}

              <View style={styles.modalBtnRow}>
                <Pressable
                  style={styles.modalCancelBtn}
                  onPress={() => setEditingBoyan(null)}
                >
                  <Text style={styles.modalCancelText}>বাতিল</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalSaveBtn, savingEdit && styles.btnDisabled]}
                  onPress={handleSaveEdit}
                  disabled={savingEdit}
                >
                  {savingEdit ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Text style={styles.modalSaveText}>আপডেট করুন</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingBottom: 50,
  },
  tabContent: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 60,
  },

  // User bar
  userBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
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
  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.primary,
  },
  micBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  micBadgeOk: {
    backgroundColor: "#DCFCE7",
  },
  micBadgeWarn: {
    backgroundColor: "#FEE2E2",
  },
  micTextOk: {
    fontSize: 10,
    color: "#166534",
    fontWeight: "600",
  },
  micTextWarn: {
    fontSize: 10,
    color: Colors.dangerDark,
    fontWeight: "700",
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dangerLight,
    justifyContent: "center",
    alignItems: "center",
  },

  // Permission Banner
  permBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#FDE68A",
  },
  permBannerTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#92400E",
  },
  permBannerDesc: {
    fontSize: 11,
    color: "#B45309",
    marginTop: 2,
  },
  permGrantBtn: {
    backgroundColor: "#B45309",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  permGrantBtnText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabBtnActive: {
    borderBottomColor: Colors.primary,
  },
  tabIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tabBtnText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  tabBtnTextActive: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  tabBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
  liveIndicatorDotActive: {
    backgroundColor: "#EF4444",
  },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
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

  // Source Mode Toggle
  sourceToggle: {
    flexDirection: "row",
    backgroundColor: Colors.borderLight,
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  sourceToggleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sourceToggleBtnActive: {
    backgroundColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sourceToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  sourceToggleTextActive: {
    color: Colors.white,
    fontWeight: "bold",
  },

  // Schedules Section
  scheduleSection: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
  },
  sectionSubtext: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  scheduleHScroll: {
    flexDirection: "row",
    marginBottom: 12,
  },
  scheduleCard: {
    width: 220,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  scheduleCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: "#F0FDF4",
  },
  scheduleCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dateBadgeToday: {
    backgroundColor: "#DCFCE7",
  },
  dateBadgeUpcoming: {
    backgroundColor: Colors.borderLight,
  },
  dateBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: Colors.textSecondary,
  },
  dateBadgeTodayText: {
    color: "#166534",
  },
  selectedIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  schedCardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 6,
    lineHeight: 18,
  },
  schedCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  schedCardLoc: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  schedCardTime: {
    fontSize: 11,
    color: Colors.textMuted,
    flex: 1,
  },
  emptyScheduleBox: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: 10,
  },
  emptyScheduleText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
    marginBottom: 10,
  },
  switchCustomSmallBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  switchCustomSmallText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.primary,
  },
  selectedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0FDF4",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    marginTop: 6,
  },
  selectedBannerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  selectedBannerTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#166534",
  },
  selectedBannerSub: {
    fontSize: 11,
    color: "#15803D",
    marginTop: 1,
  },
  clearSchedBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  clearSchedBtnText: {
    fontSize: 11,
    color: "#166534",
    fontWeight: "600",
  },

  // Form
  formContainer: {
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 6,
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
    minHeight: 70,
    textAlignVertical: "top",
  },
  chipsRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
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
  quickAuthorsRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  authorChip: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6,
  },
  authorChipText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
  },
  setupCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    padding: 14,
    marginVertical: 14,
  },
  setupRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.dangerLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    color: Colors.dangerDark,
    fontSize: 13,
  },

  // Search Bar
  searchBarContainer: {
    flexDirection: "row",
    padding: 14,
    gap: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 10,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.text,
  },
  searchBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    justifyContent: "center",
    borderRadius: 10,
  },
  searchBtnText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: "bold",
  },

  // Filter Bar
  filterBar: {
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  filterPillTextActive: {
    color: Colors.white,
  },
  redDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
  },

  // Boyan Card
  boyanCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  boyanCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveBadgeText: {
    fontSize: 11,
    color: "#DC2626",
    fontWeight: "700",
  },
  videoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  videoBadgeText: {
    fontSize: 11,
    color: "#DC2626",
    fontWeight: "600",
  },
  audioBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  audioBadgeText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: "600",
  },
  categoryPill: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  viewsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewsText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  boyanTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  playPreviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  playPreviewBtnPlaying: {
    backgroundColor: Colors.primary,
  },
  playPreviewText: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.primary,
  },
  playPreviewTextPlaying: {
    color: Colors.white,
  },
  ytIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ytIndicatorText: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "500",
  },
  actionRightButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  editActionText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
  },
  deleteActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.dangerLight,
  },
  deleteActionText: {
    fontSize: 12,
    color: Colors.dangerDark,
    fontWeight: "600",
  },
  emptyList: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyListTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: 10,
  },
  emptyListSub: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },

  // Media Type Row (Add tab)
  mediaTypeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  mediaTypeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.borderLight,
  },
  mediaTypeBtnActive: {
    backgroundColor: Colors.primary,
  },
  mediaTypeText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  mediaTypeTextActive: {
    color: Colors.white,
    fontWeight: "bold",
  },
  uploadSection: {
    marginBottom: 16,
  },
  pickFileBtn: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.primary,
    borderRadius: 14,
    backgroundColor: Colors.primaryLight,
    padding: 18,
    alignItems: "center",
    gap: 8,
  },
  pickFileBtnText: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "center",
  },
  pickedFileBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#86EFAC",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  pickedFileName: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#166534",
  },
  pickedFileSize: {
    fontSize: 11,
    color: "#15803D",
    marginTop: 2,
  },
  saveBoyanBtn: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  saveBoyanBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },

  // History Tab
  historyHeader: {
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.text,
  },
  historySub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  historyCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  historyCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  historyDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  historyItemTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  historyItemAuthor: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  historyStatsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statChipText: {
    fontSize: 11,
    color: Colors.primaryHover,
    fontWeight: "600",
  },
  historyActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 8,
  },
  deleteHistoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.dangerLight,
  },
  deleteHistoryText: {
    fontSize: 11,
    color: Colors.dangerDark,
    fontWeight: "600",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    maxHeight: "85%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: Colors.text,
  },
  modalScroll: {
    padding: 16,
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.borderLight,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.white,
  },
});
