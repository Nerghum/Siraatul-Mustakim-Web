import express from "express";
import * as duaController from "../controllers/duaController.js";

const router = express.Router();

router.get("/chapters", duaController.getChapters);
router.post("/chapters", duaController.createChapter);
router.get("/chapters/:chapterId", duaController.getChapter);
router.put("/chapters/:chapterId", duaController.updateChapter);
router.delete("/chapters/:chapterId", duaController.deleteChapter);
router.get("/chapters/:chapterId/items", duaController.getChapterItems);
router.get("/featured", duaController.getFeatured);
router.get("/items", duaController.getItems);
router.post("/items", duaController.createDua);
router.get("/items/:id", duaController.getItem);
router.put("/items/:id", duaController.updateDua);
router.delete("/items/:id", duaController.deleteDua);

export default router;
