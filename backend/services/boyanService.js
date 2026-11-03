import Boyan from "../models/Boyan.js";
import BoyanCategory from "../models/BoyanCategory.js";
import BoyanAuthor from "../models/BoyanAuthor.js";

const getBaseUrl = () =>
  process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

const resolveAudioUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${getBaseUrl()}/files/${url.replace(/^\//, "")}`;
};

const hydrateBoyanAudio = (doc) => {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  if (obj.audioUrl) {
    obj.audioUrl = resolveAudioUrl(obj.audioUrl);
  }
  return obj;
};

const getAll = async ({
  q,
  search,
  category,
  author,
  location,
  mediaType,
  dateFrom,
  dateTo,
  page = 1,
  limit = 50,
} = {}) => {
  const query = {};
  const searchTerm = String(q || search || "").trim();
  if (searchTerm) {
    const escaped = searchTerm.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    query.$or = [
      { title: { $regex: escaped, $options: "i" } },
      { author: { $regex: escaped, $options: "i" } },
      { category: { $regex: escaped, $options: "i" } },
      { location: { $regex: escaped, $options: "i" } },
    ];
  }
  if (category) {
    query.category = category;
  }
  if (author) {
    query.author = { $regex: author, $options: "i" };
  }
  if (location && String(location).trim()) {
    query.location = { $regex: String(location).trim(), $options: "i" };
  }
  if (mediaType === "video") {
    query.mediaType = "video";
  } else if (mediaType === "audio") {
    query.mediaType = { $ne: "video" };
  }
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo + "T23:59:59.999Z");
  }
  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Boyan.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Boyan.countDocuments(query),
  ]);
  return {
    items: items.map((doc) => hydrateBoyanAudio(doc)),
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  };
};

const getById = async (id) => {
  const item = await Boyan.findById(id).lean();
  if (!item) return null;
  return hydrateBoyanAudio(item);
};

const create = async (data) => {
  const item = await Boyan.create(data);
  return hydrateBoyanAudio(item);
};

const update = async (id, data) => {
  const item = await Boyan.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!item) return null;
  return hydrateBoyanAudio(item);
};

const remove = async (id) => {
  const item = await Boyan.findByIdAndDelete(id).lean();
  return item;
};

const getCategories = async () => {
  const categories = await BoyanCategory.find().sort({ createdAt: -1 }).lean();
  const counts = await Boyan.aggregate([
    { $match: { category: { $ne: null, $ne: "" } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  const countMap = {};
  counts.forEach((c) => {
    countMap[c._id] = c.count;
  });

  const result = categories.map((c) => ({
    id: c._id.toString(),
    _id: c._id.toString(),
    name: c.name,
    slug: c.slug,
    translationKey: c.name,
    count: countMap[c.slug] || countMap[c.name] || 0,
  }));

  // Backwards compatibility: If any boyans have a category not yet in BoyanCategory, add it
  const existingCategories = await Boyan.distinct("category");
  const coveredSlugs = new Set(categories.map((c) => c.slug.toLowerCase()));
  const coveredNames = new Set(categories.map((c) => c.name.toLowerCase()));

  for (const catName of existingCategories.filter(Boolean)) {
    const lower = catName.toLowerCase();
    if (!coveredSlugs.has(lower) && !coveredNames.has(lower)) {
      result.push({
        id: catName,
        _id: catName,
        name: catName,
        slug: catName,
        translationKey: catName,
        count: countMap[catName] || 0,
      });
    }
  }

  return result;
};

const createCategory = async (data) => {
  const { name, slug } = data;
  if (!name || !slug) throw new Error("Name and slug are required");
  const trimmedName = String(name).trim();
  const trimmedSlug = String(slug).trim().toLowerCase();
  const exists = await BoyanCategory.exists({ slug: trimmedSlug });
  if (exists) throw new Error("Category slug already exists");
  return BoyanCategory.create({ name: trimmedName, slug: trimmedSlug });
};

const updateCategory = async (id, data) => {
  const { name, slug } = data;
  const updates = {};
  if (name !== undefined) updates.name = String(name).trim();
  if (slug !== undefined) updates.slug = String(slug).trim().toLowerCase();
  if (!Object.keys(updates).length) throw new Error("Provide name or slug to update");

  const category = await BoyanCategory.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!category) throw new Error("Category not found");
  return category;
};

const deleteCategory = async (id) => {
  const category = await BoyanCategory.findByIdAndDelete(id);
  if (!category) throw new Error("Category not found");
  return category;
};

const getAuthors = async () => {
  const authors = await BoyanAuthor.find().sort({ createdAt: -1 }).lean();
  const counts = await Boyan.aggregate([
    { $match: { author: { $ne: null, $ne: "" } } },
    { $group: { _id: "$author", count: { $sum: 1 } } },
  ]);

  const countMap = {};
  counts.forEach((c) => {
    countMap[c._id] = c.count;
  });

  const result = authors.map((a) => ({
    id: a._id.toString(),
    _id: a._id.toString(),
    name: a.name,
    slug: a.slug || a.name,
    bio: a.bio || "",
    count: countMap[a.name] || 0,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  }));

  // Backwards compatibility: If any boyans have an author not yet in BoyanAuthor, add it
  const existingAuthors = await Boyan.distinct("author");
  const coveredNames = new Set(authors.map((a) => a.name.toLowerCase()));

  for (const authName of existingAuthors.filter(Boolean)) {
    const lower = authName.toLowerCase();
    if (!coveredNames.has(lower)) {
      result.push({
        id: authName,
        _id: authName,
        name: authName,
        slug: authName,
        bio: "",
        count: countMap[authName] || 0,
      });
    }
  }

  return result;
};

const createAuthor = async (data) => {
  const { name, slug, bio } = data;
  if (!name) throw new Error("Speaker/Author name is required");
  const trimmedName = String(name).trim();
  const trimmedSlug = (slug ? String(slug) : trimmedName)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  const exists = await BoyanAuthor.findOne({
    $or: [{ name: trimmedName }, { slug: trimmedSlug }],
  });
  if (exists) {
    throw new Error("Speaker/Author already exists");
  }

  return BoyanAuthor.create({
    name: trimmedName,
    slug: trimmedSlug,
    bio: bio ? String(bio).trim() : "",
  });
};

const updateAuthor = async (id, data) => {
  const { name, slug, bio } = data;
  const updates = {};
  if (name !== undefined) updates.name = String(name).trim();
  if (slug !== undefined) updates.slug = String(slug).trim().toLowerCase();
  if (bio !== undefined) updates.bio = String(bio).trim();

  if (!Object.keys(updates).length) throw new Error("Provide data to update");

  const existingAuthor = await BoyanAuthor.findById(id);
  if (!existingAuthor) throw new Error("Speaker/Author not found");

  const oldName = existingAuthor.name;
  const updatedAuthor = await BoyanAuthor.findByIdAndUpdate(
    id,
    { $set: updates },
    { returnDocument: "after", runValidators: true }
  );

  // If author name was changed, sync to boyans that had the old author name
  if (updates.name && updates.name !== oldName) {
    await Boyan.updateMany(
      { author: oldName },
      { $set: { author: updates.name } }
    );
  }

  return updatedAuthor;
};

const deleteAuthor = async (id) => {
  const author = await BoyanAuthor.findByIdAndDelete(id);
  if (!author) throw new Error("Speaker/Author not found");
  return author;
};

const getLocations = async () => {
  const locations = await Boyan.distinct("location");
  return locations.filter(Boolean).sort();
};

export {
  getAll,
  getById,
  create,
  update,
  remove,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAuthors,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getLocations,
};
