import status from "http-status";
import * as malfuzatService from "../services/malfuzatService.js";

const getAllMalfuzats = async (req, res) => {
  try {
    const data = await malfuzatService.getAll(req.query);
    res.status(status.OK).json(data);
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const getMalfuzatById = async (req, res) => {
  try {
    const item = await malfuzatService.getById(req.params.id);
    if (!item) {
      return res.status(status.NOT_FOUND).json({ error: "Malfuzat not found" });
    }
    res.status(status.OK).json(item);
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const createMalfuzat = async (req, res) => {
  try {
    const { title, category, mode } = req.body;
    if (!title || !category || !mode) {
      return res
        .status(status.BAD_REQUEST)
        .json({ error: "Title, category, and mode are required" });
    }
    if (!["text", "audio"].includes(mode)) {
      return res
        .status(status.BAD_REQUEST)
        .json({ error: "Mode must be 'text' or 'audio'" });
    }
    const data = { mode, title, category, author: req.body.author || "" };
    if (mode === "text") {
      data.description = req.body.description || "";
    }
    if (mode === "audio" && req.file) {
      const relativePath = req.file.path.split("data/").pop().replace(/\\/g, "/");
      data.audioUrl = relativePath;
      data.audioFormat = req.file.mimetype.split("/")[1] || "mp3";
      if (req.body.title) {
        data.title = req.body.title;
      }
    }
    const item = await malfuzatService.create(data);
    res.status(status.CREATED).json(item);
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const updateMalfuzat = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await malfuzatService.getById(id);
    if (!existing) {
      return res.status(status.NOT_FOUND).json({ error: "Malfuzat not found" });
    }
    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.category !== undefined) updates.category = req.body.category;
    if (req.body.author !== undefined) updates.author = req.body.author;
    if (req.body.mode !== undefined) updates.mode = req.body.mode;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.file) {
      const relativePath = req.file.path.split("data/").pop().replace(/\\/g, "/");
      updates.audioUrl = relativePath;
      updates.audioFormat = req.file.mimetype.split("/")[1] || "mp3";
    }
    const item = await malfuzatService.update(id, updates);
    res.status(status.OK).json(item);
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const deleteMalfuzat = async (req, res) => {
  try {
    const item = await malfuzatService.remove(req.params.id);
    if (!item) {
      return res.status(status.NOT_FOUND).json({ error: "Malfuzat not found" });
    }
    res.status(status.OK).json({ message: "Malfuzat deleted" });
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const getCategories = async (_req, res) => {
  try {
    const categories = await malfuzatService.getCategories();
    res.status(status.OK).json(categories);
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const getLatestAudio = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const items = await malfuzatService.getLatestAudio(limit);
    res.status(status.OK).json(items);
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

export {
  getAllMalfuzats,
  getMalfuzatById,
  createMalfuzat,
  updateMalfuzat,
  deleteMalfuzat,
  getCategories,
  getLatestAudio,
};
