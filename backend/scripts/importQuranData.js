#!/usr/bin/env node

import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Quran from "../models/Quran.js";
import connectDB from "../config/db.js";

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error(
    "Usage: node scripts/importQuranData.js <json-file-path> [--clear-existing]"
  );
  console.error("\nExample: node scripts/importQuranData.js ./quran-data.json");
  console.error(
    "\nOptions:\n  --clear-existing  Delete all existing Quran data before importing"
  );
  process.exit(1);
}

const jsonFilePath = args[0];
const clearExisting = args.includes("--clear-existing");

if (!fs.existsSync(jsonFilePath)) {
  console.error(`Error: File not found: ${jsonFilePath}`);
  process.exit(1);
}

/**
 * Validate Surah data structure
 */
function validateSurahData(surah) {
  const requiredFields = ["id", "name_ar", "name_bn", "name_en", "type", "total_verses"];

  for (const field of requiredFields) {
    if (!surah[field]) {
      throw new Error(`Missing required field: ${field} in Surah ${surah.id || "unknown"}`);
    }
  }

  if (surah.id < 1 || surah.id > 114) {
    throw new Error(`Invalid Surah ID: ${surah.id}. Must be between 1 and 114`);
  }

  

  if (Array.isArray(surah.verses)) {
    surah.verses.forEach((verse, idx) => {
      if (!verse.id || !verse.text_ar || !verse.bn_meaning) {
        throw new Error(
          `Verse ${idx} in Surah ${surah.id} missing required fields: id, text_ar, bn_meaning`
        );
      }
    });
  }
}

/**
 * Import Quran data
 */
async function importQuranData() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await connectDB();
    console.log("✅ Connected to MongoDB\n");

    // Read JSON file
    console.log(`📖 Reading data from ${jsonFilePath}...`);
    const fileContent = fs.readFileSync(jsonFilePath, "utf-8");
    let quranData;

    try {
      quranData = JSON.parse(fileContent);
    } catch (parseError) {
      throw new Error(`Invalid JSON format: ${parseError.message}`);
    }

    // Ensure it's an array
    if (!Array.isArray(quranData)) {
      if (typeof quranData === "object" && quranData.surahs) {
        quranData = quranData.surahs;
      } else if (typeof quranData === "object" && quranData.data) {
        quranData = quranData.data;
      } else {
        throw new Error(
          "JSON must be an array of Surahs or an object with 'surahs' or 'data' property"
        );
      }
    }

    console.log(`📚 Found ${quranData.length} Surahs in the file\n`);

    // Validate all Surahs before importing
    console.log("🔍 Validating data structure...");
    quranData.forEach((surah) => {
      validateSurahData(surah);
    });
    console.log("✅ All data is valid\n");

    // Clear existing data if requested
    if (clearExisting) {
      console.log("🗑️  Clearing existing Quran data...");
      await Quran.deleteMany({});
      console.log("✅ Existing data cleared\n");
    } else {
      // Check for duplicates
      console.log("🔍 Checking for duplicate Surahs...");
      const duplicates = [];

      for (const surah of quranData) {
        const existing = await Quran.findOne({ id: surah.id });
        if (existing) {
          duplicates.push(surah.id);
        }
      }

      if (duplicates.length > 0) {
        console.warn(
          `⚠️  Warning: Surahs ${duplicates.join(", ")} already exist in the database`
        );
        console.warn("   Use --clear-existing flag to replace existing data\n");

        // Filter out duplicates
        quranData = quranData.filter((s) => !duplicates.includes(s.id));
        console.log(`   Proceeding with ${quranData.length} new Surahs\n`);
      }
    }

    // Insert data
    console.log("💾 Importing Surahs...");
    const insertedSurahs = await Quran.insertMany(quranData, { ordered: false });
    console.log(`✅ Inserted ${insertedSurahs.length} Surahs\n`);

    // Create text indexes
    console.log("📑 Creating search indexes...");
    await Quran.collection.createIndex({ name_ar: "text", name_bn: "text", name_en: "text" });
    await Quran.collection.createIndex({ "verses.text_ar": "text" });
    await Quran.collection.createIndex({ "verses.bn_meaning": "text" });
    console.log("✅ Search indexes created\n");

    // Summary
    const totalCount = await Quran.countDocuments();
    console.log("╔════════════════════════════════════════╗");
    console.log("║   ✅ IMPORT SUCCESSFUL                  ║");
    console.log("╠════════════════════════════════════════╣");
    console.log(`║ Total Surahs in Database: ${String(totalCount).padEnd(24)}║`);
    console.log(`║ Imported This Session: ${String(insertedSurahs.length).padEnd(27)}║`);
    console.log("╚════════════════════════════════════════╝\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Import failed:", error.message);
    console.error("\nPlease check your JSON file format and try again.");
    console.error("Expected format:");
    console.error(
      JSON.stringify(
        [
          {
            id: 1,
            name_ar: "الفاتحة",
            name_bn: "আল-ফাতিহা",
            name_en: "Al-Fatihah",
            type: "meccan",
            total_verses: 7,
            verses: [
              {
                id: 1,
                text_ar: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                bn_meaning: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
                bn_pronunciation: "",
              },
            ],
          },
        ],
        null,
        2
      )
    );

    process.exit(1);
  }
}

importQuranData();
