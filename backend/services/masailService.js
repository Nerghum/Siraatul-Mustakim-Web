import Masail from "../models/Masail.js";
import MasailCategory from "../models/MasailCategory.js";
import User from "../models/User.js";

const nextMasailSl = async () => {
  const last = await Masail.findOne()
    .sort({ sl: -1 })
    .select("sl")
    .lean();
  return last?.sl != null ? last.sl + 1 : 1;
};

const nextPreviewSl = (previews) => {
  if (!previews?.length) return 1;
  return Math.max(...previews.map((p) => p.sl ?? 0)) + 1;
};

const createMasail = async (data) => {
  const { title, description, category, sl: slInput, createdBy, author } = data;

  if (!title || !description) {
    throw new Error("Title and description are required");
  }

  const sl =
    slInput != null && Number.isFinite(Number(slInput))
      ? Number(slInput)
      : await nextMasailSl();

  if (slInput != null) {
    const exists = await Masail.exists({ sl });
    if (exists) throw new Error("Masail serial (sl) already exists");
  }

  const masail = await Masail.create({
    title: String(title).trim(),
    description: String(description).trim(),
    category: category ? String(category).trim() : undefined,
    sl,
    createdBy: createdBy || undefined,
    author: author ? String(author).trim() : undefined,
    previews: [],
  });

  return masail;
};

const addPreview = async (masailId, data) => {
  const { text = "" } = data;
  const masail = await Masail.findById(masailId);
  if (!masail) throw new Error("Masail not found");

  const sl = nextPreviewSl(masail.previews);
  masail.previews.push({ sl, text: String(text).trim() });
  await masail.save();

  return masail;
};

const getAllMasails = async (query = {}) => {
  const filter = {};
  const searchTerm = String(query.search || query.q || "").trim();
  if (searchTerm) {
    const escaped = searchTerm.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const safeRegex = new RegExp(escaped, "i");

    let matchedUserIds = [];
    try {
      const matchedUsers = await User.find({ name: safeRegex }).select("_id").lean();
      matchedUserIds = matchedUsers.map((u) => u._id);
    } catch (e) {
      // ignore
    }

    const orConditions = [
      { title: safeRegex },
      { description: safeRegex },
      { category: safeRegex },
      { author: safeRegex },
      { "previews.text": safeRegex },
    ];
    if (matchedUserIds.length > 0) {
      orConditions.push({ createdBy: { $in: matchedUserIds } });
    }
    filter.$or = orConditions;
  }

  if (query.category && String(query.category).trim()) {
    const catSafe = new RegExp(String(query.category).trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "i");
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { category: catSafe }];
      delete filter.$or;
    } else {
      filter.category = catSafe;
    }
  }

  return Masail.find(filter).populate("createdBy", "name email role").sort({ sl: 1 });
};

const getCategories = async () => {
  const categories = await MasailCategory.find().lean();
  const counts = await Masail.aggregate([
    { $match: { category: { $ne: null, $ne: "" } } },
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);
  
  const countMap = {};
  counts.forEach(c => { countMap[c._id] = c.count; });
  
  return categories.map(c => ({
    id: c._id.toString(),
    _id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    translationKey: c.slug,
    count: countMap[c.slug] || countMap[c.name] || countMap[c._id.toString()] || 0
  }));
};

const createCategory = async (data) => {
  const { name, slug } = data;
  if (!name || !slug) throw new Error("Name and slug are required");
  const exists = await MasailCategory.exists({ slug });
  if (exists) throw new Error("Category slug already exists");
  return MasailCategory.create({ name, slug });
};

const updateCategory = async (id, data) => {
  const { name, slug } = data;
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (slug !== undefined) updates.slug = slug;
  if (!Object.keys(updates).length) throw new Error("Provide name or slug to update");
  
  const category = await MasailCategory.findByIdAndUpdate(
    id,
    { $set: updates },
    { returnDocument: "after", runValidators: true }
  );
  if (!category) throw new Error("Category not found");
  return category;
};

const deleteCategory = async (id) => {
  const category = await MasailCategory.findByIdAndDelete(id);
  if (!category) throw new Error("Category not found");
  return category;
};

const getMasailById = async (id) => {
  const masail = await Masail.findById(id).populate("createdBy", "name email role");
  if (!masail) throw new Error("Masail not found");
  return masail;
};

const deleteMasailById = async (id) => {
  const masail = await Masail.findByIdAndDelete(id);
  if (!masail) throw new Error("Masail not found");
  return masail;
};

const updateMasail = async (id, data) => {
  const { title, description, category, author } = data;
  const updates = {};
  if (title !== undefined) updates.title = String(title).trim();
  if (description !== undefined) updates.description = String(description).trim();
  if (category !== undefined) updates.category = category ? String(category).trim() : "";
  if (author !== undefined) updates.author = String(author).trim();
  if (!Object.keys(updates).length) {
    throw new Error("Provide title and/or description to update");
  }

  const masail = await Masail.findByIdAndUpdate(
    id,
    { $set: updates },
    { returnDocument: "after", runValidators: true },
  ).populate("createdBy", "name email role");
  if (!masail) throw new Error("Masail not found");
  return masail;
};

export {
  createMasail,
  addPreview,
  getAllMasails,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getMasailById,
  deleteMasailById,
  updateMasail,
};
