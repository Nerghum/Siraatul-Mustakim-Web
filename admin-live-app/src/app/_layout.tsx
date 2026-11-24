import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Colors } from "../constants/theme";
import { requestAllAppPermissions } from "../services/permissions";

export default function RootLayout() {
  useEffect(() => {
    // Prompt all required permissions (Microphone, Notifications) on install / initial startup
    requestAllAppPermissions().catch((err) => {
      console.warn("Initial permissions request failed:", err);
    });
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: "bold",
          },
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen
          name="dashboard"
          options={{
            title: "বয়ানের অ্যাডমিন প্যানেল",
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="live/[id]"
          options={{
            title: "লাইভ স্টুডিও",
            headerBackVisible: false,
            headerStyle: { backgroundColor: "#111827" },
            headerTintColor: "#FFFFFF",
          }}
        />
        <Stack.Screen
          name="summary/[id]"
          options={{
            title: "লাইভ বিবরণ",
            headerBackVisible: false,
          }}
        />
      </Stack>
    </>
  );
}
