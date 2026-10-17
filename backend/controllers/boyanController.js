import status from "http-status";
import * as boyanService from "../services/boyanService.js";

const getAllBoyans = async (req, res) => {
  try {
    const data = await boyanService.getAll(req.query);
    res.status(status.OK).json(data);
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const getBoyanById = async (req, res) => {
  try {
    const item = await boyanService.getById(req.params.id);
    if (!item) {
      return res.status(status.NOT_FOUND).json({ error: "Boyan not found" });
    }
    res.status(status.OK).json(item);
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const createBoyan = async (req, res) => {
  try {
    const { title, category } = req.body;
    if (!title || !category) {
      return res
        .status(status.BAD_REQUEST)
        .json({ error: "Title and category are required" });
    }
    const mediaType = req.body.mediaType === "video" ? "video" : "audio";
    const youtubeUrl = (req.body.youtubeUrl || "").trim();

    if (mediaType === "video" && !youtubeUrl) {
      return res
        .status(status.BAD_REQUEST)
        .json({ error: "YouTube link is required for video bayan" });
    }

    const data = {
      title,
      category,
      author: req.body.author || "",
      location: req.body.location || "",
      mediaType,
      youtubeUrl: mediaType === "video" ? youtubeUrl : "",
    };
    if (mediaType === "audio" && req.file) {
      const relativePath = req.file.path.split("data/").pop().replace(/\\/g, "/");
      data.audioUrl = relativePath;
      data.audioFormat = req.file.mimetype.split("/")[1] || "mp3";
    }
    const item = await boyanService.create(data);
    res.status(status.CREATED).json(item);
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const updateBoyan = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await boyanService.getById(id);
    if (!existing) {
      return res.status(status.NOT_FOUND).json({ error: "Boyan not found" });
    }
    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.category !== undefined) updates.category = req.body.category;
    if (req.body.author !== undefined) updates.author = req.body.author;
    if (req.body.location !== undefined) updates.location = req.body.location;
    if (req.body.mediaType !== undefined) updates.mediaType = req.body.mediaType;
    if (req.body.youtubeUrl !== undefined) {
      updates.youtubeUrl = (req.body.youtubeUrl || "").trim();
    }
    if (req.file) {
      const relativePath = req.file.path.split("data/").pop().replace(/\\/g, "/");
      updates.audioUrl = relativePath;
      updates.audioFormat = req.file.mimetype.split("/")[1] || "mp3";
    }
    const item = await boyanService.update(id, updates);
    res.status(status.OK).json(item);
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const deleteBoyan = async (req, res) => {
  try {
    const item = await boyanService.remove(req.params.id);
    if (!item) {
      return res.status(status.NOT_FOUND).json({ error: "Boyan not found" });
    }
    res.status(status.OK).json({ message: "Boyan deleted" });
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const getCategories = async (_req, res) => {
  try {
    const categories = await boyanService.getCategories();
    res.status(status.OK).json(categories);
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const category = await boyanService.createCategory(req.body);
    res.status(status.CREATED).json(category);
  } catch (error) {
    res
      .status(error.status || status.BAD_REQUEST)
      .json({ error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await boyanService.updateCategory(req.params.id, req.body);
    res.status(status.OK).json(category);
  } catch (error) {
    res
      .status(error.status || status.BAD_REQUEST)
      .json({ error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    await boyanService.deleteCategory(req.params.id);
    res.status(status.OK).json({ message: "Category deleted" });
  } catch (error) {
    res
      .status(error.status || status.BAD_REQUEST)
      .json({ error: error.message });
  }
};

const getAuthors = async (_req, res) => {
  try {
    const authors = await boyanService.getAuthors();
    res.status(status.OK).json(authors);
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

const getLocations = async (_req, res) => {
  try {
    const locations = await boyanService.getLocations();
    res.status(status.OK).json(locations);
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }
};

export {
  getAllBoyans,
  getBoyanById,
  createBoyan,
  updateBoyan,
  deleteBoyan,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAuthors,
  getLocations,
};
