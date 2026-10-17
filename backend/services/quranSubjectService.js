import status from "http-status";
import QuranSubject from "../models/QuranSubject.js";

const createSubject = async (data) => {
  try {
    if (!data.id) {
      const last = await QuranSubject.findOne().sort({ id: -1 });
      data.id = last ? last.id + 1 : 1;
    }
    if (!data.surah_id) {
      const lastSurah = await QuranSubject.findOne().sort({ surah_id: -1 });
      data.surah_id = lastSurah ? lastSurah.surah_id + 1 : 1;
    }
    const subject = new QuranSubject(data);
    return await subject.save();
  } catch (error) {
    const err = new Error(error.message || "Failed to create subject");
    err.status = status.INTERNAL_SERVER_ERROR;
    throw err;
  }
};

const updateSubject = async (id, updates) => {
  try {
    const updated = await QuranSubject.findOneAndUpdate({ id }, updates, { returnDocument: 'after', runValidators: true });
    if (!updated) {
      const err = new Error("Subject not found");
      err.status = status.NOT_FOUND;
      throw err;
    }
    return updated;
  } catch (error) {
    const err = new Error(error.message || "Failed to update subject");
    err.status = error.status || status.INTERNAL_SERVER_ERROR;
    throw err;
  }
};

const deleteSubject = async (id) => {
  try {
    const deleted = await QuranSubject.findOneAndDelete({ id });
    if (!deleted) {
      const err = new Error("Subject not found");
      err.status = status.NOT_FOUND;
      throw err;
    }
    return deleted;
  } catch (error) {
    const err = new Error(error.message || "Failed to delete subject");
    err.status = error.status || status.INTERNAL_SERVER_ERROR;
    throw err;
  }
};

const getSubject = async (id) => {
  try {
    const subject = await QuranSubject.findOne({ id });
    if (!subject) {
      const err = new Error("Subject not found");
      err.status = status.NOT_FOUND;
      throw err;
    }
    return subject;
  } catch (error) {
    const err = new Error(error.message || "Failed to load subject");
    err.status = error.status || status.INTERNAL_SERVER_ERROR;
    throw err;
  }
};

const searchSubjects = async (query) => {
  try {
    const { q, categoryId, surahId, page = 1, limit = 20 } = query;
    const filter = {};
    if (q) filter.$text = { $search: q };
    if (categoryId) filter.category_id = parseInt(categoryId);
    if (surahId) filter.surah_id = parseInt(surahId);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const data = await QuranSubject.find(filter).sort({ id: 1 }).skip(skip).limit(parseInt(limit));
    const total = await QuranSubject.countDocuments(filter);
    return { data, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) } };
  } catch (error) {
    const err = new Error(error.message || "Search failed");
    err.status = error.status || status.INTERNAL_SERVER_ERROR;
    throw err;
  }
};

const listAllSubjects = async (filterQuery = {}) => {
  try {
    const filter = {};
    if (filterQuery.categoryId) filter.category_id = parseInt(filterQuery.categoryId);
    if (filterQuery.surahId) filter.surah_id = parseInt(filterQuery.surahId);
    const data = await QuranSubject.find(filter).sort({ id: 1 });
    return { data };
  } catch (error) {
    const err = new Error(error.message || "List failed");
    err.status = error.status || status.INTERNAL_SERVER_ERROR;
    throw err;
  }
};

export { createSubject, updateSubject, deleteSubject, getSubject, searchSubjects, listAllSubjects };

