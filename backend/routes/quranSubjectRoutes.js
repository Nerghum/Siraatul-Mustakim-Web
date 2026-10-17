import express from "express";
import * as subjectController from "../controllers/quranSubjectController.js";
import { protect } from "../middleware/auth.js";


const router = express.Router();
router.post("/create", protect,  subjectController.create);
router.get("/search", subjectController.search);
router.get("/all", subjectController.listAll);
router.get("/by-category/:categoryId", subjectController.listByCategory);
router.get("/single-subject/:id", subjectController.single);
router.put("/edit/:id", protect,  subjectController.edit);
router.delete("/delete/:id", protect,  subjectController.remove);

export default router;
