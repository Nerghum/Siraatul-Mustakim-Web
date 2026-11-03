import mongoose from "mongoose";
import Dua from "../models/Dua.js";
import DuaChapter from "../models/DuaChapter.js";

const parseIdsParam = (idsParam) => {
  if (!idsParam) return [];
  if (Array.isArray(idsParam)) {
    return idsParam
      .flatMap((value) => String(value).split(","))
      .map((value) => value.trim())
      .filter(Boolean);
  }

  return String(idsParam)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
};

const getChapters = async (q, { includeItems = false } = {}) => {
  let query = {};
  if (q && String(q).trim()) {
    const escaped = String(q).trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const safeRegex = new RegExp(escaped, "i");

    // Also find any chapters that contain matching duas
    let matchingChapterIds = [];
    try {
      const matchingDuas = await Dua.find({
        $or: [
          { title: safeRegex },
          { arabic: safeRegex },
          { translation: safeRegex },
          { pronunciation: safeRegex },
          { tafsir: safeRegex },
          { sourceLabel: safeRegex },
          { sourceLabelBangla: safeRegex },
          { sourceLabelArabic: safeRegex },
          { ayahLabel: safeRegex },
        ],
      }).select("chapterId").lean();
      matchingChapterIds = [...new Set(matchingDuas.map((d) => d.chapterId))];
    } catch (e) {
      // ignore
    }

    query.$or = [
      { title: safeRegex },
      { chapterId: safeRegex },
      ...(matchingChapterIds.length > 0 ? [{ chapterId: { $in: matchingChapterIds } }] : []),
    ];
  }
  const [chapters, counts] = await Promise.all([
    DuaChapter.find(query).sort({ serial: 1 }).lean(),
    Dua.aggregate([
      { $group: { _id: "$chapterId", count: { $sum: 1 } } },
    ]),
  ]);

  const countMap = {};
  counts.forEach((c) => {
    countMap[c._id] = c.count;
  });

  let itemsMap = {};
  if (includeItems) {
    const allItems = await Dua.find({}).sort({ serial: 1 }).lean();
    allItems.forEach((item) => {
      if (!itemsMap[item.chapterId]) itemsMap[item.chapterId] = [];
      itemsMap[item.chapterId].push({
        ...item,
        id: item.duaId,
      });
    });
  }

  return chapters.map((c) => ({
    ...c,
    id: c.chapterId,
    count: countMap[c.chapterId] || 0,
    items: includeItems ? itemsMap[c.chapterId] || [] : undefined,
  }));
};

const getChapterById = async (chapterId) => {
  const chapter = await DuaChapter.findOne({ chapterId }).lean();
  return chapter ? { ...chapter, id: chapter.chapterId } : null;
};

const getItems = async ({ chapterId, ids, q, search } = {}) => {
  const idList = parseIdsParam(ids);
  const searchTerm = String(q || search || "").trim();

  let query = {};

  if (chapterId) {
    query.chapterId = chapterId;
  }

  if (idList.length) {
    query.duaId = { $in: idList };
  }

  if (searchTerm) {
    const escaped = searchTerm.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const safeRegex = new RegExp(escaped, "i");
    query.$or = [
      { title: safeRegex },
      { sourceLabel: safeRegex },
      { sourceLabelBangla: safeRegex },
      { sourceLabelArabic: safeRegex },
      { ayahLabel: safeRegex },
      { pronunciation: safeRegex },
      { translation: safeRegex },
      { arabic: safeRegex },
      { tafsir: safeRegex },
    ];
  }

  const items = await Dua.find(query).sort({ serial: 1 }).lean();
  return items.map((item) => ({ ...item, id: item.duaId }));
};

const getItemById = async (id) => {
  let item = await Dua.findOne({ duaId: id }).lean();
  if (!item && mongoose.isValidObjectId(id)) {
    item = await Dua.findById(id).lean();
  }
  return item ? { ...item, id: item.duaId } : null;
};

const getFeaturedItem = async () => {
  // Try to find a specific one or just the first one
  let item = await Dua.findOne({ duaId: "salah-between-3" }).lean();
  if (!item) {
    item = await Dua.findOne().sort({ createdAt: -1 }).lean();
  }
  return item ? { ...item, id: item.duaId } : null;
};

const createChapter = async (data) => {
  const lastChapter = await DuaChapter.findOne().sort({ serial: -1 }).lean();
  const nextSerial = (lastChapter?.serial || 0) + 1;
  return await DuaChapter.create({ ...data, serial: nextSerial });
};

const updateChapter = async (id, data) => {
  return await DuaChapter.findOneAndUpdate({ chapterId: id }, data, {
    new: true,
  });
};

const deleteChapter = async (id) => {
  return await DuaChapter.findOneAndDelete({ chapterId: id });
};

const createDua = async (data) => {
  const generatedId = data.sourceLabel
    ? data.sourceLabel
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
    : "";
  const duaId = data.duaId || generatedId || `dua-${Date.now()}`;
  const lastDua = await Dua.findOne({ chapterId: data.chapterId })
    .sort({ serial: -1 })
    .lean();
  const nextSerial = (lastDua?.serial || 0) + 1;
  return await Dua.create({ ...data, duaId, serial: nextSerial });
};

const updateDua = async (id, data) => {
  const query = {
    $or: [{ duaId: id }, ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : [])],
  };
  return await Dua.findOneAndUpdate(query, data, { new: true });
};

const deleteDua = async (id) => {
  const query = {
    $or: [{ duaId: id }, ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : [])],
  };
  return await Dua.findOneAndDelete(query);
};

export {
  getChapters,
  getChapterById,
  getItems,
  getItemById,
  getFeaturedItem,
  createChapter,
  updateChapter,
  deleteChapter,
  createDua,
  updateDua,
  deleteDua,
};
