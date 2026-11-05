import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Colors } from "../constants/theme";

export default function RootLayout() {
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
            title: "লাইভ বয়ান কন্ট্রোল",
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
