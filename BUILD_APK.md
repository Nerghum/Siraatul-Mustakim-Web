# 📱 Android APK Build & Export Guide

This document describes how to generate the release APK for **সিরাতুল মুস্তাকিম** and copy it directly to your Desktop from the macOS terminal.

---

## ⚡ Quick 1-Line Command (Run from Root Directory)

Open your terminal in the project root directory and run:

```bash
cd "app/android" && export JAVA_HOME="/opt/homebrew/opt/openjdk@17" && export PATH="$JAVA_HOME/bin:$PATH" && ./gradlew assembleRelease && cp app/build/outputs/apk/release/app-release.apk ~/Desktop/siratul-mustakim.apk && ls -lh ~/Desktop/siratul-mustakim.apk
```

> **Result:** The release APK will be compiled and copied to:
> `~/Desktop/siratul-mustakim.apk`

---

## 🛠️ Step-by-Step Instructions

If you prefer to run each step individually:

### 1. Set Java 17 Environment (Required on macOS)
```bash
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="$JAVA_HOME/bin:$PATH"
```

### 2. Navigate to the Android Build Directory
```bash
cd "/Users/ashik/Desktop/Client work/siratul mustakim/app/android"
```

### 3. Build the Release APK
```bash
./gradlew assembleRelease
```
*(Clean build if needed: `./gradlew clean assembleRelease`)*

### 4. Copy to Desktop
```bash
cp app/build/outputs/apk/release/app-release.apk ~/Desktop/siratul-mustakim.apk
```

---

## 📦 Using npm Script

You can also run directly from the `app` directory:

```bash
cd app
npm run build:apk
```

---

## 📍 Output File Paths

| File | Location |
| :--- | :--- |
| **Desktop Export** | `~/Desktop/siratul-mustakim.apk` |
| **Gradle Output** | `app/android/app/build/outputs/apk/release/app-release.apk` |

---

## 💡 Notes & Troubleshooting

- **Java Version:** Gradle in React Native 0.81 / Expo requires Java 17. The commands above use the Homebrew OpenJDK 17 path: `/opt/homebrew/opt/openjdk@17`.
- **Version Bumping:** To increment the version or build number before building, update `version` and `android.versionCode` in `app/app.json`.
- **Environment Variables:** The build automatically embeds `app/.env` (`EXPO_PUBLIC_API_BASE_URL`).
