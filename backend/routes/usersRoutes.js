import express from "express";
import { protect } from "../middleware/auth.js";
import { adminOnly, muftiOnly } from "../middleware/adminAuth.js";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
} from "../controllers/userController.js";

const router = express.Router();

router.use(protect,adminOnly); // Apply protect and adminOnly middleware to all routes

router.get("/stats", getUserStats);
router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
