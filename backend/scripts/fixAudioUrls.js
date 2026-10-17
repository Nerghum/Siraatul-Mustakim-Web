/**
 * Migration script: Normalize all audio URLs in MongoDB to relative paths.
 * 
 * The database now stores only the relative path (e.g., "quran/surah/file.mp3").
 * The service layer prepends BASE_URL/files/ when serving.
 * 
 * This script converts:
 *   - "undefined/files/quran/surah/..." → "quran/surah/..."
 *   - "https://siraatul-backend.hcsb.org.bd/files/quran/surah/..." → "quran/surah/..."
 *   - "/files/quran/surah/..." → "quran/surah/..."
 * 
 * Usage: node scripts/fixAudioUrls.js
 */

import "dotenv/config";
import mongoose from "mongoose";
import Quran from "../models/Quran.js";

/**
 * Extract the relative path from any audio URL format.
 * Returns null if the URL is already relative (no conversion needed).
 */
function toRelativePath(url) {
  if (!url) return null;

  // Already relative (e.g., "quran/surah/file.mp3")
  if (!url.startsWith("http") && !url.startsWith("/")) {
    return null; // no change needed
  }

  // "undefined/files/..." — broken URL from missing BASE_URL
  if (url.startsWith("undefined/files/")) {
    return url.replace("undefined/files/", "");
  }

  // "http://.../files/..." — full URL with base
  const filesMatch = url.match(/\/files\/(.+)$/);
  if (filesMatch) {
    return filesMatch[1];
  }

  // "/files/..." — absolute path
  if (url.startsWith("/files/")) {
    return url.replace(/^\/files\//, "");
  }

  return null; // unknown format, skip
}

async function fixAudioUrls() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find all surahs that have audio URLs in any format
    const surahs = await Quran.find({
      $or: [
        { "audio_urls.url": { $exists: true, $ne: "" } },
        { "verses.audio_sources.url": { $exists: true, $ne: "" } },
      ],
    });

    console.log(`Found ${surahs.length} surah(s) with audio URLs`);

    let totalFixed = 0;

    for (const surah of surahs) {
      let modified = false;

      // Fix surah-level audio_urls
      if (surah.audio_urls && surah.audio_urls.length > 0) {
        for (const audio of surah.audio_urls) {
          const relative = toRelativePath(audio.url);
          if (relative !== null) {
            console.log(`  [surah ${surah.id}] Fixed: ${audio.url} → ${relative}`);
            audio.url = relative;
            modified = true;
            totalFixed++;
          }
        }
      }

      // Fix verse-level audio_sources
      if (surah.verses && surah.verses.length > 0) {
        for (const verse of surah.verses) {
          if (verse.audio_sources && verse.audio_sources.length > 0) {
            for (const source of verse.audio_sources) {
              const relative = toRelativePath(source.url);
              if (relative !== null) {
                console.log(`  [surah ${surah.id}, verse ${verse.id}] Fixed: ${source.url} → ${relative}`);
                source.url = relative;
                modified = true;
                totalFixed++;
              }
            }
          }
        }
      }

      if (modified) {
        await surah.save();
        console.log(`  ✓ Saved surah ${surah.id}`);
      }
    }

    console.log(`\nDone. Fixed ${totalFixed} audio URL(s) to relative paths.`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

fixAudioUrls();
