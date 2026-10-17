import Quran from "../models/Quran.js";
import status from "http-status";

const getBaseUrl = () =>
  process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

/**
 * Resolve a relative audio path to a full URL.
 * If already absolute (starts with http), return as-is.
 */
const resolveAudioUrl = (url) => {
  if (!url || url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${getBaseUrl()}/files/${url.replace(/^\//, "")}`;
};

/**
 * Attach full audio URLs to a surah document (mutates in-place).
 * New schema: single audio object with url + duration.
 */
const hydrateSurahAudio = (surah) => {
  if (!surah) return surah;
  const obj = surah.toObject ? surah.toObject() : surah;

  // Surah-level audio (single object)
  if (obj.audio && obj.audio.url) {
    obj.audio = {
      ...obj.audio,
      url: resolveAudioUrl(obj.audio.url),
    };
  }

  return obj;
};

const buildSearchRegexes = (text) => {
  const clean = String(text).trim();
  const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");

  const flexiblePattern = escaped
    .replace(/aa/gi, "a")
    .replace(/ee/gi, "i")
    .replace(/oo/gi, "u")
    .replace(/a/gi, "a+")
    .replace(/[ei]/gi, "[ei]+")
    .replace(/[ou]/gi, "[ou]+");
  const flexRegex = new RegExp(flexiblePattern, "i");

  return { regex, flexRegex, num: parseInt(clean, 10) };
};

/**
 * Get all Surahs with optional filtering
 */
const getQuranRoot = async (query = {}) => {
  try {
    const filter = {};

    if (query.search && String(query.search).trim()) {
      const { regex, flexRegex, num } = buildSearchRegexes(query.search);
      filter.$or = [
        { name_en: regex },
        { name_en: flexRegex },
        { name_bn: regex },
        { name_ar: regex },
        { listing_name_bn: regex },
        { meaning_en: regex },
        { meaning_bn: regex },
        { slug: regex },
        ...(!Number.isNaN(num) ? [{ id: num }] : []),
      ];
    }

    if (query.type && query.type !== "__all__") {
      filter.type = { $regex: new RegExp(`^${query.type}$`, "i") };
    }

    if (query.para && query.para !== "__all__") {
      const p = parseInt(query.para, 10);
      if (!Number.isNaN(p)) {
        filter.para = p;
      }
    }

    // Pagination
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 114;
    const skip = (page - 1) * limit;

    let queryBuilder = Quran.find(filter);
    if (query.includeVerses !== "true" && query.includeVerses !== true) {
      queryBuilder = queryBuilder.select("-verses");
    }
    const data = await queryBuilder
      .sort({ id: 1 })
      .skip(skip)
      .limit(limit);
    const total = await Quran.countDocuments(filter);

    // Hydrate audio URLs in the list results
    const hydrated = data.map((s) => {
      const obj = s.toObject();
      if (obj.audio && obj.audio.url) {
        obj.audio = {
          ...obj.audio,
          url: resolveAudioUrl(obj.audio.url),
        };
      }
      return obj;
    });

    return {
      data: hydrated,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    const err = new Error(error.message || "Failed to load Quran data");
    err.status = status.INTERNAL_SERVER_ERROR;
    throw err;
  }
};

/**
 * Get available languages in Quran data
 */
const getLanguages = async () => {
  try {
    // Check if any Quran data exists with Bengali fields
    const hasData = await Quran.countDocuments();
    
    if (hasData === 0) {
      return { languages: [] };
    }

    return {
      languages: ["bn"],
      description: "Bengali meaning and pronunciation",
    };
  } catch (error) {
    const err = new Error(error.message || "Failed to load languages");
    err.status = status.INTERNAL_SERVER_ERROR;
    throw err;
  }
};

/**
 * Search Quran by Surah name, verses, meanings
 * Supports full-text search and range queries
 */
const searchQuran = async (query) => {
  try {
    const { q, surahId, verseStart, verseEnd } = query;

    if (!q && !surahId) {
      const err = new Error("Please provide search query (q) or surahId");
      err.status = status.BAD_REQUEST;
      throw err;
    }

    let filter = {};

    if (q) {
      const { regex, flexRegex, num } = buildSearchRegexes(q);

      filter.$or = [
        { name_en: regex },
        { name_en: flexRegex },
        { name_bn: regex },
        { name_ar: regex },
        { "verses.bn_meaning": regex },
        { "verses.text_ar": regex },
        ...(!Number.isNaN(num) ? [{ id: num }] : []),
      ];
    }

    if (surahId) {
      filter.id = parseInt(surahId, 10);
    }

    const data = await Quran.find(filter).sort({ id: 1 }).limit(50);

    const results = data.map((surahDoc) => {
      const surah = surahDoc.toObject();
      if (q) {
        const { regex, flexRegex, num } = buildSearchRegexes(q);

        const surahNameMatches =
          regex.test(surah.name_en) ||
          flexRegex.test(surah.name_en) ||
          regex.test(surah.name_bn) ||
          regex.test(surah.name_ar) ||
          surah.id === num;

        if (!surahNameMatches && surah.verses && surah.verses.length) {
          surah.verses = surah.verses.filter(
            (v) => regex.test(v.bn_meaning) || regex.test(v.text_ar)
          );
        }
      }

      if (verseStart || verseEnd) {
        const vStart = verseStart ? parseInt(verseStart, 10) : 1;
        const vEnd = verseEnd ? parseInt(verseEnd, 10) : null;
        if (surah.verses) {
          surah.verses = surah.verses.filter((v) => {
            if (vEnd) {
              return v.id >= vStart && v.id <= vEnd;
            }
            return v.id >= vStart;
          });
        }
      }

      return hydrateSurahAudio(surah);
    });

    return {
      data: results,
      count: results.length,
    };
  } catch (error) {
    const err = new Error(error.message || "Search failed");
    err.status = error.status || status.INTERNAL_SERVER_ERROR;
    throw err;
  }
};

/**
 * Get single Surah with all verses
 */
const getSurahDetail = async (surahId, query) => {
  try {
    const isNum = !isNaN(Number(surahId)) && String(surahId).trim() !== "";
    const filter = isNum
      ? { id: parseInt(surahId, 10) }
      : { $or: [{ slug: String(surahId).trim() }, { id: parseInt(surahId, 10) || 0 }] };

    const surah = await Quran.findOne(filter);

    if (!surah) {
      const err = new Error("Surah not found");
      err.status = status.NOT_FOUND;
      throw err;
    }

    return hydrateSurahAudio(surah);
  } catch (error) {
    const err = new Error(error.message || "Failed to load Surah");
    err.status = error.status || status.INTERNAL_SERVER_ERROR;
    throw err;
  }
};

/**
 * Get single verse from a Surah
 */
const getVerseDetail = async (surahId, verseId, query) => {
  try {
    const surahIdInt = parseInt(surahId);
    const verseIdInt = parseInt(verseId);

    if (isNaN(surahIdInt) || surahIdInt < 1 || surahIdInt > 114) {
      const err = new Error("Invalid Surah ID (must be 1-114)");
      err.status = status.BAD_REQUEST;
      throw err;
    }

    if (isNaN(verseIdInt) || verseIdInt < 1) {
      const err = new Error("Invalid Verse ID");
      err.status = status.BAD_REQUEST;
      throw err;
    }

    const surah = await Quran.findOne({ id: surahIdInt });

    if (!surah) {
      const err = new Error("Surah not found");
      err.status = status.NOT_FOUND;
      throw err;
    }

    const verse = surah.verses.find((v) => v.id === verseIdInt);

    if (!verse) {
      const err = new Error("Verse not found");
      err.status = status.NOT_FOUND;
      throw err;
    }

    return {
      surah: {
        id: surah.id,
        name_ar: surah.name_ar,
        name_bn: surah.name_bn,
        name_en: surah.name_en,
        audio: surah.audio,
      },
      verse: verse.toObject(),
    };
  } catch (error) {
    const err = new Error(error.message || "Failed to load verse");
    err.status = error.status || status.INTERNAL_SERVER_ERROR;
    throw err;
  }
};

// ============= ADMIN OPERATIONS =============

/**
 * Create a new Surah
 */
const createSurah = async (surahData) => {
  try {
    const quran = new Quran(surahData);
    const savedSurah = await quran.save();
    return hydrateSurahAudio(savedSurah);
  } catch (error) {
    const err = new Error(error.message || "Failed to create Surah");
    err.status = status.INTERNAL_SERVER_ERROR;
    throw err;
  }
};

/**
 * Update Surah metadata
 */
const updateSurah = async (surahId, updates) => {
  try {
    const id = parseInt(surahId);

    if (isNaN(id) || id < 1 || id > 114) {
      const err = new Error("Invalid Surah ID (must be 1-114)");
      err.status = status.BAD_REQUEST;
      throw err;
    }

    // Allowed fields to update
    const allowedUpdates = [
      "name_ar",
      "name_bn",
      "name_en",
      "type",
      "slug",
      "meaning_en",
      "meaning_bn",
      "listing_name_bn",
      "para",
    ];
    const updateFields = {};

    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        updateFields[field] = updates[field];
      }
    });
    const updatedSurah = await Quran.findOneAndUpdate(
      { id },
      { ...updateFields, updated_at: new Date() },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedSurah) {
      const err = new Error("Surah not found");
      err.status = status.NOT_FOUND;
      throw err;
    }

    return hydrateSurahAudio(updatedSurah);
  } catch (error) {
    const err = new Error(error.message || "Failed to update Surah");
    err.status = error.status || status.INTERNAL_SERVER_ERROR;
    throw err;
  }
};

/**
 * Update a single verse
 */
const updateVerse = async (surahId, verseId, updates) => {
  try {
    const surahIdInt = parseInt(surahId);
    const verseIdInt = parseInt(verseId);

    if (isNaN(surahIdInt) || surahIdInt < 1 || surahIdInt > 114) {
      const err = new Error("Invalid Surah ID");
      err.status = status.BAD_REQUEST;
      throw err;
    }

    if (isNaN(verseIdInt) || verseIdInt < 1) {
      const err = new Error("Invalid Verse ID");
      err.status = status.BAD_REQUEST;
      throw err;
    }

    // Allowed fields to update — includes audioStart for timestamp-based audio and tafsir/footnotes
    const allowedUpdates = [
      "text_ar",
      "bn_meaning",
      "bn_pronunciation",
      "audioStart",
      "tafsir",
      "translation_footnotes",
      "tafsir_footnotes",
      "audio_url",
    ];
    const updateFields = {};

    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        updateFields[field] = updates[field];
      }
    });

    // Validate audioStart if provided
    if (updateFields.audioStart !== undefined) {
      if (typeof updateFields.audioStart !== "number" || updateFields.audioStart < 0) {
        const err = new Error("audioStart must be a non-negative number");
        err.status = status.BAD_REQUEST;
        throw err;
      }
    }

    const updatedSurah = await Quran.findOneAndUpdate(
      { id: surahIdInt, "verses.id": verseIdInt },
      {
        $set: {
          ...Object.keys(updateFields).reduce((acc, key) => {
            acc[`verses.$.${key}`] = updateFields[key];
            return acc;
          }, {}),
          updated_at: new Date(),
        },
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedSurah) {
      const err = new Error("Verse not found");
      err.status = status.NOT_FOUND;
      throw err;
    }

    const hydrated = hydrateSurahAudio(updatedSurah);
    return hydrated.verses.find((v) => v.id === verseIdInt);
  } catch (error) {
    const err = new Error(error.message || "Failed to update verse");
    err.status = error.status || status.INTERNAL_SERVER_ERROR;
    throw err;
  }
};

/**
 * Delete a Surah and all its verses
 */
const deleteSurah = async (surahId) => {
  try {
    const id = parseInt(surahId);

    if (isNaN(id) || id < 1 || id > 114) {
      const err = new Error("Invalid Surah ID");
      err.status = status.BAD_REQUEST;
      throw err;
    }

    const deletedSurah = await Quran.findOneAndDelete({ id });

    if (!deletedSurah) {
      const err = new Error("Surah not found");
      err.status = status.NOT_FOUND;
      throw err;
    }

    return hydrateSurahAudio(deletedSurah);
  } catch (error) {
    const err = new Error(error.message || "Failed to delete Surah");
    err.status = error.status || status.INTERNAL_SERVER_ERROR;
    throw err;
  }
};

/**
 * Delete a single verse from a Surah
 */
const deleteVerse = async (surahId, verseId) => {
  try {
    const surahIdInt = parseInt(surahId);
    const verseIdInt = parseInt(verseId);

    if (isNaN(surahIdInt) || surahIdInt < 1 || surahIdInt > 114) {
      const err = new Error("Invalid Surah ID");
      err.status = status.BAD_REQUEST;
      throw err;
    }

    if (isNaN(verseIdInt) || verseIdInt < 1) {
      const err = new Error("Invalid Verse ID");
      err.status = status.BAD_REQUEST;
      throw err;
    }

    const updatedSurah = await Quran.findOneAndUpdate(
      { id: surahIdInt },
      {
        $pull: { verses: { id: verseIdInt } },
        updated_at: new Date(),
      },
      { returnDocument: 'after' }
    );

    if (!updatedSurah) {
      const err = new Error("Surah not found");
      err.status = status.NOT_FOUND;
      throw err;
    }

    return hydrateSurahAudio(updatedSurah);
  } catch (error) {
    const err = new Error(error.message || "Failed to delete verse");
    err.status = error.status || status.INTERNAL_SERVER_ERROR;
    throw err;
  }
};

const addVerse = async (surahId, verseData) => {
  try {
    const id = parseInt(surahId);

    if (isNaN(id) || id < 1 || id > 114) {
      const err = new Error("Invalid Surah ID");
      err.status = status.BAD_REQUEST;
      throw err;
    }

    const surah = await Quran.findOne({ id });
    if (!surah) {
      const err = new Error("Surah not found");
      err.status = status.NOT_FOUND;
      throw err;
    }

    const existingIndex = surah.verses.findIndex((v) => v.id === verseData.id);
    if (existingIndex >= 0) {
      const err = new Error(`Verse ${verseData.id} already exists in this surah`);
      err.status = status.CONFLICT;
      throw err;
    }

    // Validate audioStart if provided
    if (verseData.audioStart !== undefined) {
      if (typeof verseData.audioStart !== "number" || verseData.audioStart < 0) {
        const err = new Error("audioStart must be a non-negative number");
        err.status = status.BAD_REQUEST;
        throw err;
      }

      // Validate against surah duration
      if (surah.audio && surah.audio.duration && verseData.audioStart > surah.audio.duration) {
        const err = new Error(`audioStart (${verseData.audioStart}s) exceeds Surah duration (${surah.audio.duration}s)`);
        err.status = status.BAD_REQUEST;
        throw err;
      }
    }

    surah.verses.push(verseData);
    surah.total_verses = surah.verses.length;
    surah.updated_at = new Date();
    await surah.save();

    return hydrateSurahAudio(surah);
  } catch (error) {
    const err = new Error(error.message || "Failed to add verse");
    err.status = error.status || status.INTERNAL_SERVER_ERROR;
    throw err;
  }
};

/**
 * Update Surah audio (single audio file with duration)
 */
const addSurahAudio = async (surahId, audioData) => {
  try {
    const id = parseInt(surahId);

    if (isNaN(id) || id < 1 || id > 114) {
      const err = new Error("Invalid Surah ID");
      err.status = status.BAD_REQUEST;
      throw err;
    }

    // Set single audio object on the surah
    const updatedSurah = await Quran.findOneAndUpdate(
      { id },
      {
        $set: { audio: audioData, updated_at: new Date() },
      },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedSurah) {
      const err = new Error("Surah not found");
      err.status = status.NOT_FOUND;
      throw err;
    }

    return hydrateSurahAudio(updatedSurah);
  } catch (error) {
    const err = new Error(error.message || "Failed to add audio");
    err.status = error.status || status.INTERNAL_SERVER_ERROR;
    throw err;
  }
};

export {
  getQuranRoot,
  getLanguages,
  searchQuran,
  getSurahDetail,
  getVerseDetail,
  createSurah,
  updateSurah,
  updateVerse,
  deleteSurah,
  deleteVerse,
  addVerse,
  addSurahAudio,
};
