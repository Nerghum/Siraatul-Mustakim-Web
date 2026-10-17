import path from "path";
import status from "http-status";
import mongoose from "mongoose";
import Notice from "../models/notice.js";
import { publicUrlFromRelativeDataPath } from "../utils/uploadStorage.js";

function runUpload(uploadMw) {
  return (req, res, next) => {
    uploadMw(req, res, (err) => {
      if (err) {
        return res.status(status.BAD_REQUEST).json({ error: err.message });
      }
      next();
    });
  };
}

function normalizeDate(input) {
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function uploadedImageFromRequest(req) {
  if (req.file) return req.file;
  if (Array.isArray(req.files) && req.files.length > 0) return req.files[0];
  if (Array.isArray(req.files?.image) && req.files.image.length > 0) {
    return req.files.image[0];
  }
  return null;
}

function uploadedImageUrl(req) {
  const file = uploadedImageFromRequest(req);
  if (!file?.path) return null;
  const absoluteDataRoot = path.resolve(process.cwd(), "data");
  const absoluteFilePath = path.resolve(file.path);
  const relativePath = path.relative(absoluteDataRoot, absoluteFilePath);
  if (!relativePath || relativePath.startsWith("..")) {
    return null;
  }
  return publicUrlFromRelativeDataPath(relativePath.split(path.sep).join("/"));
}

const getAllNotices = async (_req, res) => {
  try {
    const notices = await Notice.find().sort({ date: -1, createdAt: -1 });
    res.status(status.OK).json(notices);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getNoticeById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(status.BAD_REQUEST).json({ error: "Invalid id" });
  }
  try {
    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(status.NOT_FOUND).json({ error: "Notice not found" });
    }
    res.status(status.OK).json(notice);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const searchNotices = async (req, res) => {
  const q = String(req.query?.q ?? "").trim();
  if (!q) {
    return res.status(status.OK).json([]);
  }
  try {
    const regex = new RegExp(q, "i");
    const notices = await Notice.find({
      $or: [{ title: regex }, { description: regex }],
    }).sort({ createdAt: -1 });
    res.status(status.OK).json(notices);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const createNotice = async (req, res) => {
  const { title, date, description } = req.body;
  if (!title || !description || !date) {
    return res.status(status.BAD_REQUEST).json({
      error: "title, date and description are required",
    });
  }
  const normalizedDate = normalizeDate(date);
  if (!normalizedDate) {
    return res.status(status.BAD_REQUEST).json({ error: "Invalid date" });
  }
  try {
    const image = uploadedImageUrl(req);
    const notice = await Notice.create({
      title,
      date: normalizedDate,
      description,
      ...(image ? { image } : {}),
    });
    res.status(status.CREATED).json(notice);
  } catch (error) {
    res.status(status.BAD_REQUEST).json({ error: error.message });
  }
};

const updateNotice = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(status.BAD_REQUEST).json({ error: "Invalid id" });
  }

  const updates = {};
  if (req.body.title !== undefined) updates.title = req.body.title;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.date !== undefined) {
    const normalizedDate = normalizeDate(req.body.date);
    if (!normalizedDate) {
      return res.status(status.BAD_REQUEST).json({ error: "Invalid date" });
    }
    updates.date = normalizedDate;
  }
  const image = uploadedImageUrl(req);
  if (image) updates.image = image;

  try {
    const notice = await Notice.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!notice) {
      return res.status(status.NOT_FOUND).json({ error: "Notice not found" });
    }
    res.status(status.OK).json(notice);
  } catch (error) {
    res.status(status.BAD_REQUEST).json({ error: error.message });
  }
};

const deleteNotice = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(status.BAD_REQUEST).json({ error: "Invalid id" });
  }
  try {
    const notice = await Notice.findByIdAndDelete(id);
    if (!notice) {
      return res.status(status.NOT_FOUND).json({ error: "Notice not found" });
    }
    res.status(status.OK).json({ message: "Notice deleted" });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export {
  getAllNotices,
  getNoticeById,
  searchNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  runUpload,
};
