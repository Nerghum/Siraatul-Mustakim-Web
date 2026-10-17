import express from "express";
import * as liveController from "../controllers/liveController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/current", liveController.getCurrentLive);
router.get("/history", liveController.getLiveHistory);
router.get("/:id", liveController.getLiveById);
router.get("/:id/listeners", liveController.getListenerCount);

router.post("/start", protect, liveController.startLive);
router.post("/stop", protect, liveController.stopLive);

export default router;
