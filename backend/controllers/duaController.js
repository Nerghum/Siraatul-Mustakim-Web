import status from "http-status";
import * as duaService from "../services/duaService.js";

const getChapters = async (req, res) => {
  try {
    const includeItems = req.query.includeItems === "true";
    const chapters = await duaService.getChapters(req.query.q, { includeItems });
    res.status(status.OK).json({ chapters });
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message || "Failed to load dua chapters" });
  }
};

const getChapter = async (req, res) => {
  try {
    const chapter = await duaService.getChapterById(req.params.chapterId);
    if (!chapter) {
      res.status(status.NOT_FOUND).json({ error: "Chapter not found" });
      return;
    }
    res.status(status.OK).json({ chapter });
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message || "Failed to load dua chapter" });
  }
};

const getItems = async (req, res) => {
  try {
    const items = await duaService.getItems(req.query);
    res.status(status.OK).json({ items });
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message || "Failed to load duas" });
  }
};

const getChapterItems = async (req, res) => {
  try {
    const chapter = await duaService.getChapterById(req.params.chapterId);
    if (!chapter) {
      res.status(status.NOT_FOUND).json({ error: "Chapter not found" });
      return;
    }

    const items = await duaService.getItems({
      ...req.query,
      chapterId: req.params.chapterId,
    });

    res.status(status.OK).json({ chapter, items });
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message || "Failed to load chapter duas" });
  }
};

const getItem = async (req, res) => {
  try {
    const item = await duaService.getItemById(req.params.id);
    if (!item) {
      res.status(status.NOT_FOUND).json({ error: "Dua not found" });
      return;
    }

    const chapter = await duaService.getChapterById(item.chapterId);
    res.status(status.OK).json({ item, chapter });
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message || "Failed to load dua" });
  }
};

const getFeatured = async (_req, res) => {
  try {
    const item = await duaService.getFeaturedItem();
    if (!item) {
      res.status(status.NOT_FOUND).json({ error: "Featured dua not found" });
      return;
    }

    res.status(status.OK).json({ item });
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message || "Failed to load featured dua" });
  }
};

const createChapter = async (req, res) => {
  try {
    const chapter = await duaService.createChapter(req.body);
    res.status(status.CREATED).json({ chapter });
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message || "Failed to create chapter" });
  }
};

const updateChapter = async (req, res) => {
  try {
    const chapter = await duaService.updateChapter(
      req.params.chapterId,
      req.body
    );
    if (!chapter) {
      res.status(status.NOT_FOUND).json({ error: "Chapter not found" });
      return;
    }
    res.status(status.OK).json({ chapter });
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message || "Failed to update chapter" });
  }
};

const deleteChapter = async (req, res) => {
  try {
    const chapter = await duaService.deleteChapter(req.params.chapterId);
    if (!chapter) {
      res.status(status.NOT_FOUND).json({ error: "Chapter not found" });
      return;
    }
    res.status(status.OK).json({ message: "Chapter deleted successfully" });
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message || "Failed to delete chapter" });
  }
};

const createDua = async (req, res) => {
  try {
    const item = await duaService.createDua(req.body);
    res.status(status.CREATED).json({ item });
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message || "Failed to create dua" });
  }
};

const updateDua = async (req, res) => {
  try {
    const item = await duaService.updateDua(req.params.id, req.body);
    if (!item) {
      res.status(status.NOT_FOUND).json({ error: "Dua not found" });
      return;
    }
    res.status(status.OK).json({ item });
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message || "Failed to update dua" });
  }
};

const deleteDua = async (req, res) => {
  try {
    const item = await duaService.deleteDua(req.params.id);
    if (!item) {
      res.status(status.NOT_FOUND).json({ error: "Dua not found" });
      return;
    }
    res.status(status.OK).json({ message: "Dua deleted successfully" });
  } catch (error) {
    res
      .status(error.status || status.INTERNAL_SERVER_ERROR)
      .json({ error: error.message || "Failed to delete dua" });
  }
};

export {
  getChapters,
  getChapter,
  getItems,
  getChapterItems,
  getItem,
  getFeatured,
  createChapter,
  updateChapter,
  deleteChapter,
  createDua,
  updateDua,
  deleteDua,
};
