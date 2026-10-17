import express from "express";
import * as settingsController from "../controllers/settingsController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/", settingsController.getSettings);
router.put("/", protect, settingsController.updateSettings);

export default router;
