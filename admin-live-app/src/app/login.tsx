import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { BACKEND_URL } from "../constants/api";
import { Colors } from "../constants/theme";
import { loginWithEmail } from "../services/auth";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleLogin = async () => {
    const cleanId = email.trim();
    if (!cleanId || !password) {
      setError("দয়া করে ইমেইল/ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await loginWithEmail(cleanId, password);
      router.replace("/dashboard");
    } catch (err: any) {
      console.error("Login failed:", err);
      let message = "লগইন ব্যর্থ হয়েছে। সঠিক ইমেইল/ইউজারনেম ও পাসওয়ার্ড দিন।";
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response?.data?.error) {
        message = err.response.data.error;
      } else if (!err.response) {
        message = "সার্ভারে সংযোগ স্থাপন করা সম্ভব হয়নি। ইন্টারনেট সংযোগ পরীক্ষা করুন।";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordFocus = () => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scroll,
            isKeyboardVisible && styles.scrollKeyboardOpen,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <View style={[styles.header, isKeyboardVisible && styles.headerKeyboardOpen]}>
            <View
              style={[
                styles.iconCircle,
                isKeyboardVisible && styles.iconCircleCompact,
              ]}
            >
              <Feather
                name="radio"
                size={isKeyboardVisible ? 24 : 40}
                color={Colors.white}
              />
            </View>
            <Text
              style={[
                styles.title,
                isKeyboardVisible && styles.titleCompact,
              ]}
            >
              সিরাতুল মুস্তাকিম
            </Text>
            {!isKeyboardVisible && (
              <Text style={styles.subtitle}>লাইভ বয়ান ব্রডকাস্টার অ্যাডমিন</Text>
            )}
          </View>

          {/* Login Card */}
          <View style={[styles.card, isKeyboardVisible && styles.cardCompact]}>
            <Text style={styles.cardTitle}>অ্যাডমিন লগইন</Text>
            <Text style={styles.cardDesc}>
              লাইভ ব্রডকাস্ট শুরু করার জন্য অ্যাডমিন একাউন্টে প্রবেশ করুন
            </Text>

            {error && (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={18} color={Colors.dangerDark} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Email / Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ইমেইল বা ইউজারনেম</Text>
              <View style={styles.inputWrap}>
                <Feather
                  name="user"
                  size={20}
                  color={Colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="admin@siraatulmustaqim.com বা ashik"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError(null);
                  }}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>পাসওয়ার্ড</Text>
              <View style={styles.inputWrap}>
                <Feather
                  name="lock"
                  size={20}
                  color={Colors.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) setError(null);
                  }}
                  onFocus={handlePasswordFocus}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  hitSlop={8}
                >
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={Colors.textMuted}
                  />
                </Pressable>
              </View>
            </View>

            {/* Login Button */}
            <Pressable
              style={[styles.loginBtn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.loginBtnText}>প্রবেশ করুন</Text>
                  <Feather name="arrow-right" size={20} color={Colors.white} />
                </>
              )}
            </Pressable>

            {/* Live Server Indicator */}
            <View style={styles.serverStatusRow}>
              <View style={styles.serverDot} />
              <Text style={styles.serverStatusText}>
                লাইভ সার্ভার: {BACKEND_URL.replace(/^https?:\/\//, "")}
              </Text>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    paddingBottom: 40,
  },
  scrollKeyboardOpen: {
    justifyContent: "flex-start",
    paddingTop: Platform.OS === "android" ? 16 : 24,
    paddingBottom: 280, // generous bottom padding so inputs never hide behind keyboard
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  headerKeyboardOpen: {
    marginBottom: 12,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  iconCircleCompact: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 4,
  },
  titleCompact: {
    fontSize: 20,
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardCompact: {
    padding: 18,
    paddingTop: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dangerLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: Colors.dangerDark,
    fontSize: 13,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: Colors.text,
  },
  eyeBtn: {
    padding: 8,
  },
  loginBtn: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  serverStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 6,
  },
  serverDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  serverStatusText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: Platform.OS === "android" ? "monospace" : "Courier",
  },
});
