import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import status from "http-status";
import { parseFile } from "music-metadata";
import * as quranService from "../services/quranService.js";

const getQuran = async (req, res) => {
  try {
    const data = await quranService.getQuranRoot(req.query);
    res.status(status.OK).json(data);
  } catch (error) {
    res.status(error.status || status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getLanguages = async (req, res) => {
  try {
    const data = await quranService.getLanguages();
    res.status(status.OK).json(data);
  } catch (error) {
    res.status(error.status || status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const search = async (req, res) => {
  try {
    const data = await quranService.searchQuran(req.query);
    res.status(status.OK).json(data);
  } catch (error) {
    res.status(error.status || status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getSurah = async (req, res) => {
  const { surahId } = req.params;
  try {
    const data = await quranService.getSurahDetail(surahId, req.query);
    res.status(status.OK).json(data);
  } catch (error) {
    res.status(error.status || status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getVerse = async (req, res) => {
  const { surahId, verseId } = req.params;
  try {
    const data = await quranService.getVerseDetail(surahId, verseId, req.query);
    res.status(status.OK).json(data);
  } catch (error) {
    res.status(error.status || status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const normalizeVerseIds = (verses = []) => {
  let maxVerseId = 0;

  return verses.map((verse) => {
    const parsedVerseId = Number(verse.id);
    const verseId =
      Number.isInteger(parsedVerseId) && parsedVerseId > 0
        ? parsedVerseId
        : maxVerseId + 1;

    maxVerseId = Math.max(maxVerseId, verseId);

    return {
      ...verse,
      id: verseId,
    };
  });
};

const addSurah = async (req, res) => {
  try {
    const { id, name_ar, name_bn, name_en, type, total_verses, verses } = req.body;


    if (!id || !name_ar || !name_bn || !name_en || !type || !total_verses) {
      return res.status(status.BAD_REQUEST).json({
        error: "Missing required fields: id, name_ar, name_bn, name_en, type, total_verses",
      });
    }

    if (id < 1 || id > 114) {
      return res.status(status.BAD_REQUEST).json({ error: "Surah ID must be between 1 and 114" });
    }

    
    const existingSurah = await quranService.getSurahDetail(id);
    if (existingSurah) {
      return res.status(status.CONFLICT).json({ error: "Surah already exists" });
    }

    const normalizedVerses = normalizeVerseIds(verses);
 
    const newSurah = await quranService.createSurah({
      id,
      name_ar,
      name_bn,
      name_en,
      type,
      total_verses,
      verses: normalizedVerses,
    });

    res.status(status.CREATED).json({ data: newSurah, message: "Surah created successfully" });
  } catch (error) {
    res.status(error.status || status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const updateSurah = async (req, res) => {
  try {
    const { surahId } = req.params;
    const updates = req.body;

  
    if (updates.id && updates.id !== parseInt(surahId)) {
      return res.status(status.BAD_REQUEST).json({ error: "Cannot change Surah ID" });
    }
    const updatedSurah = await quranService.updateSurah(surahId, updates);
    if (!updatedSurah) {
      return res.status(status.NOT_FOUND).json({ error: "Surah not found" });
    }
    res.status(status.OK).json({ data: updatedSurah, message: "Surah updated successfully" });
  } catch (error) {
    res.status(error.status || status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const updateVerse = async (req, res) => {
  try {
    const { surahId, verseId } = req.params;
    const updates = req.body;
    if (updates.id && updates.id !== parseInt(verseId)) {
      return res.status(status.BAD_REQUEST).json({ error: "Cannot change Verse ID" });
    }
    const updatedVerse = await quranService.updateVerse(surahId, verseId, updates);
    if (!updatedVerse) {
      return res.status(status.NOT_FOUND).json({ error: "Verse not found" });
    }
    res.status(status.OK).json({ data: updatedVerse, message: "Verse updated successfully" });
  } catch (error) {
    res.status(error.status || status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};
const deleteSurah = async (req, res) => {
  try {
    const { surahId } = req.params;

    const deletedSurah = await quranService.deleteSurah(surahId);

    if (!deletedSurah) {
      return res.status(status.NOT_FOUND).json({ error: "Surah not found" });
    }

    res.status(status.OK).json({ data: deletedSurah, message: "Surah deleted successfully" });
  } catch (error) {
    res.status(error.status || status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const deleteVerse = async (req, res) => {
  try {
    const { surahId, verseId } = req.params;

    const updatedSurah = await quranService.deleteVerse(surahId, verseId);

    if (!updatedSurah) {
      return res.status(status.NOT_FOUND).json({ error: "Verse not found" });
    }

    res.status(status.OK).json({ data: updatedSurah, message: "Verse deleted successfully" });
  } catch (error) {
    res.status(error.status || status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const addVerse = async (req, res) => {
  try {
    const { surahId } = req.params;
    const { id, text_ar, bn_meaning, bn_pronunciation, audioStart } = req.body;

    if (!id || !text_ar || !bn_meaning) {
      return res.status(status.BAD_REQUEST).json({
        error: "Missing required fields: id, text_ar, bn_meaning",
      });
    }

    const updatedSurah = await quranService.addVerse(surahId, {
      id,
      text_ar,
      bn_meaning,
      bn_pronunciation: bn_pronunciation || "",
      audioStart: typeof audioStart === "number" ? audioStart : 0,
    });

    res.status(status.CREATED).json({ data: updatedSurah, message: "Verse added successfully" });
  } catch (error) {
    res.status(error.status || status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getAudioDurationSeconds = async (filePath) => {
  try {
    const metadata = await parseFile(filePath);
    const duration = metadata?.format?.duration;

    return typeof duration === "number" && Number.isFinite(duration)
      ? Number(duration.toFixed(3))
      : null;
  } catch (_error) {
    return null;
  }
};

const uploadAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(status.BAD_REQUEST).json({ 
        error: "No audio file provided. Make sure to send file with field name 'audio'" 
      });
    }

    const { surahId } = req.params;

    if (!req.file.filename || !req.file.path) {
      return res.status(status.INTERNAL_SERVER_ERROR).json({ 
        error: "File upload failed: unable to process file" 
      });
    }

    // Store only the relative path (e.g., quran/surah/file.mp3)
    const audioUrl = req.file.path.split("data/").pop().replace(/\\/g, "/");
    const durationSeconds = await getAudioDurationSeconds(req.file.path);

    const result = await quranService.addSurahAudio(surahId, {
      url: audioUrl,
      duration: durationSeconds,
    });

    res.status(status.OK).json({ data: result });
  } catch (error) {
    res.status(error.status || status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const streamAudio = async (req, res) => {
  try {
    const { reciter, file } = req.params;
    if (!reciter || !file) {
      return res.status(status.BAD_REQUEST).json({ error: "Missing reciter or file parameter" });
    }

    const cleanReciter = path.basename(reciter);
    const cleanFile = path.basename(file);
    const backendAudioDir = path.join(process.cwd(), "backend", "data", "quran", "audio", cleanReciter);
    const defaultAudioDir = path.join(process.cwd(), "data", "quran", "audio", cleanReciter);
    const storageDir = fs.existsSync(path.join(process.cwd(), "backend", "data"))
      ? backendAudioDir
      : defaultAudioDir;
    const localFilePath = path.join(storageDir, cleanFile);

    if (fs.existsSync(localFilePath)) {
      return res.sendFile(localFilePath);
    }

    fs.mkdirSync(storageDir, { recursive: true });

    let remoteUrl = "";
    if (cleanReciter === "surah") {
      const surahNum = parseInt(cleanFile.replace(".mp3", ""), 10);
      remoteUrl = `https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/${surahNum}.mp3`;
    } else {
      remoteUrl = `https://everyayah.com/data/${cleanReciter}/${cleanFile}`;
    }

    const fetchRemoteAudio = (targetUrl, redirectsLeft = 3) => {
      if (redirectsLeft <= 0) {
        return res.status(status.BAD_GATEWAY).json({ error: "Too many redirects fetching audio" });
      }
      const client = targetUrl.startsWith("https") ? https : http;
      client.get(targetUrl, (remoteRes) => {
        if ([301, 302, 307, 308].includes(remoteRes.statusCode) && remoteRes.headers.location) {
          return fetchRemoteAudio(remoteRes.headers.location, redirectsLeft - 1);
        }

        if (remoteRes.statusCode !== 200) {
          return res.status(remoteRes.statusCode).json({ error: "Audio not found on remote server" });
        }

        res.setHeader("Content-Type", remoteRes.headers["content-type"] || "audio/mpeg");
        res.setHeader("Accept-Ranges", "bytes");

        const fileStream = fs.createWriteStream(localFilePath);
        remoteRes.pipe(fileStream);
        remoteRes.pipe(res);
      }).on("error", (err) => {
        res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.message });
      });
    };

    fetchRemoteAudio(remoteUrl);
  } catch (err) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};

const syncQuran = async (req, res) => {
  try {
    const { importCompleteQuran } = await import("../scripts/importCompleteQuran.js");
    const count = await importCompleteQuran();
    res.status(status.OK).json({ success: true, count, message: `Successfully synced ${count} surahs into database.` });
  } catch (err) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: err.message });
  }
};

export {
  getQuran,
  getLanguages,
  search,
  getSurah,
  getVerse,
  addSurah,
  addVerse,
  updateSurah,
  updateVerse,
  deleteSurah,
  deleteVerse,
  uploadAudio,
  streamAudio,
  syncQuran,
};
