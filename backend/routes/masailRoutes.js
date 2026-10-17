import express from "express";
import * as masailController from "../controllers/masailController.js";
import { protect } from "../middleware/auth.js";
import { staffOnly } from "../middleware/adminAuth.js";

const router = express.Router();

// Public routes
router.get("/", masailController.getAllMasails);
router.get("/categories", masailController.getCategories);
router.get("/:id", masailController.getMasailById);

// Protected routes - staff only (admin, moderator, mufti)
router.post("/categories/create", protect, staffOnly, masailController.createCategory);
router.delete("/categories/:id", protect, staffOnly, masailController.deleteCategory);
router.patch("/categories/:id", protect, staffOnly, masailController.updateCategory);

router.post("/create", protect, staffOnly, masailController.createMasail);
router.delete("/:id", protect, staffOnly, masailController.deleteMasail);
router.patch("/:id", protect, staffOnly, masailController.updateMasail);

export default router;
