import "dotenv/config";
import mongoose from "mongoose";
import Boyan from "./models/Boyan.js";

const demoBoyans = [
  {
    title: "ঈমান ও আমল",
    category: "nasihat",
    author: "মাওলানা তারিক জামিল",
    audioUrl: "boyan/audio/demo.mp3",
    audioFormat: "mp3",
    audioDuration: 15,
  },
  {
    title: "পারিবারিক শান্তি",
    category: "family",
    author: "শাইখ আহমাদুল্লাহ",
    audioUrl: "boyan/audio/demo.mp3",
    audioFormat: "mp3",
    audioDuration: 15,
  },
  {
    title: "রমজানের ফজিলত",
    category: "warning",
    author: "মাওলানা মিজানুর রহমান আজহারী",
    audioUrl: "boyan/audio/demo.mp3",
    audioFormat: "mp3",
    audioDuration: 15,
  },
  {
    title: "হজ ও ওমরাহ",
    category: "story",
    author: "শায়খ আবু ত্বহা মুহাম্মদ আদনান",
    audioUrl: "boyan/audio/demo.mp3",
    audioFormat: "mp3",
    audioDuration: 15,
  },
  {
    title: "জান্নাতের বর্ণনা",
    category: "nasihat",
    author: "মাওলানা তারিক জামিল",
    audioUrl: "boyan/audio/demo.mp3",
    audioFormat: "mp3",
    audioDuration: 15,
  },
];

async function seed() {
  try {
    const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/siraatul-mustakim";
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB...");

    await Boyan.deleteMany({});
    console.log("Cleared existing boyans");

    await Boyan.insertMany(demoBoyans);
    console.log(`Inserted ${demoBoyans.length} demo boyans successfully!`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error seeding boyans:", error);
    process.exit(1);
  }
}

seed();
