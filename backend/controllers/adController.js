import path from "path";
import status from "http-status";
import mongoose from "mongoose";
import Ad from "../models/Ad.js";
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

function parsePlacements(input) {
  if (!input) return ["all"];
  if (Array.isArray(input)) return input.filter(Boolean);
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return input.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [input.trim()];
  }
  return ["all"];
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

export const getAllAds = async (req, res) => {
  try {
    const { placement, admin, q } = req.query;
    const filter = {};

    // In admin mode, list all ads. In public mode, only list active ads
    if (admin !== "true") {
      filter.isActive = true;

      const now = new Date();
      // Optional: check dates if present
      filter.$and = [
        { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
      ];
    }

    if (placement && placement !== "all") {
      filter.$or = [
        { placements: "all" },
        { placements: placement },
      ];
    }

    if (q) {
      const regex = new RegExp(String(q).trim(), "i");
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [{ title: regex }, { description: regex }, { link: regex }],
      });
    }

    const ads = await Ad.find(filter).sort({ priority: -1, createdAt: -1 });
    res.status(status.OK).json(ads);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const getAdById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(status.BAD_REQUEST).json({ error: "Invalid ad id" });
  }
  try {
    const ad = await Ad.findById(id);
    if (!ad) {
      return res.status(status.NOT_FOUND).json({ error: "Ad not found" });
    }
    res.status(status.OK).json(ad);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const createAd = async (req, res) => {
  const { title, description, link, buttonText, placements, isActive, startDate, endDate, priority } = req.body;

  if (!title) {
    return res.status(status.BAD_REQUEST).json({
      error: "Title is required",
    });
  }

  try {
    const image = uploadedImageUrl(req);
    const parsedPlacements = parsePlacements(placements);

    const ad = await Ad.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      link: link ? link.trim() : "",
      buttonText: buttonText ? buttonText.trim() : "যোগাযোগ করুন",
      placements: parsedPlacements.length > 0 ? parsedPlacements : ["all"],
      isActive: isActive === undefined ? true : String(isActive) === "true" || isActive === true,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      priority: priority !== undefined ? Number(priority) || 0 : 0,
      ...(image ? { image } : {}),
    });

    res.status(status.CREATED).json(ad);
  } catch (error) {
    res.status(status.BAD_REQUEST).json({ error: error.message });
  }
};

export const updateAd = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(status.BAD_REQUEST).json({ error: "Invalid ad id" });
  }

  const updates = {};
  if (req.body.title !== undefined) updates.title = req.body.title.trim();
  if (req.body.description !== undefined) updates.description = req.body.description.trim();
  if (req.body.link !== undefined) updates.link = req.body.link.trim();
  if (req.body.buttonText !== undefined) updates.buttonText = req.body.buttonText.trim();
  if (req.body.placements !== undefined) updates.placements = parsePlacements(req.body.placements);
  if (req.body.isActive !== undefined) {
    updates.isActive = String(req.body.isActive) === "true" || req.body.isActive === true;
  }
  if (req.body.startDate !== undefined) {
    updates.startDate = req.body.startDate ? new Date(req.body.startDate) : null;
  }
  if (req.body.endDate !== undefined) {
    updates.endDate = req.body.endDate ? new Date(req.body.endDate) : null;
  }
  if (req.body.priority !== undefined) {
    updates.priority = Number(req.body.priority) || 0;
  }

  const image = uploadedImageUrl(req);
  if (image) updates.image = image;

  try {
    const ad = await Ad.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!ad) {
      return res.status(status.NOT_FOUND).json({ error: "Ad not found" });
    }
    res.status(status.OK).json(ad);
  } catch (error) {
    res.status(status.BAD_REQUEST).json({ error: error.message });
  }
};

export const deleteAd = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(status.BAD_REQUEST).json({ error: "Invalid ad id" });
  }
  try {
    const ad = await Ad.findByIdAndDelete(id);
    if (!ad) {
      return res.status(status.NOT_FOUND).json({ error: "Ad not found" });
    }
    res.status(status.OK).json({ message: "Advertisement deleted successfully" });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export const trackAdClick = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(status.BAD_REQUEST).json({ error: "Invalid ad id" });
  }
  try {
    const ad = await Ad.findByIdAndUpdate(id, { $inc: { clicks: 1 } }, { new: true });
    if (!ad) {
      return res.status(status.NOT_FOUND).json({ error: "Ad not found" });
    }
    res.status(status.OK).json({ success: true, clicks: ad.clicks });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export { runUpload };
