import Malfuzat from "../models/Malfuzat.js";

const getBaseUrl = () =>
  process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

const resolveAudioUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${getBaseUrl()}/files/${url.replace(/^\//, "")}`;
};

const hydrateMalfuzatAudio = (doc) => {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  if (obj.mode === "audio" && obj.audioUrl) {
    obj.audioUrl = resolveAudioUrl(obj.audioUrl);
  }
  return obj;
};

const getAll = async ({ q, category, mode, page = 1, limit = 50 } = {}) => {
  const query = {};
  if (q && String(q).trim()) {
    const normalizedQuery = String(q).trim();
    query.$or = [
      { title: { $regex: normalizedQuery, $options: "i" } },
      { author: { $regex: normalizedQuery, $options: "i" } },
      { category: { $regex: normalizedQuery, $options: "i" } },
    ];
  }
  if (category) {
    query.category = category;
  }
  if (mode) {
    query.mode = mode;
  }
  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Malfuzat.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Malfuzat.countDocuments(query),
  ]);
  return {
    items: items.map((doc) => hydrateMalfuzatAudio(doc)),
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  };
};

const getById = async (id) => {
  const item = await Malfuzat.findById(id).lean();
  if (!item) return null;
  return hydrateMalfuzatAudio(item);
};

const create = async (data) => {
  const item = await Malfuzat.create(data);
  return hydrateMalfuzatAudio(item);
};

const update = async (id, data) => {
  const item = await Malfuzat.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!item) return null;
  return hydrateMalfuzatAudio(item);
};

const remove = async (id) => {
  const item = await Malfuzat.findByIdAndDelete(id).lean();
  return item;
};

const getCategories = async () => {
  const categories = await Malfuzat.distinct("category");
  return categories.filter(Boolean).sort();
};

const getLatestAudio = async (limit = 10) => {
  const items = await Malfuzat.find({ mode: "audio" })
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean();
  return items.map((doc) => hydrateMalfuzatAudio(doc));
};

export { getAll, getById, create, update, remove, getCategories, getLatestAudio };
