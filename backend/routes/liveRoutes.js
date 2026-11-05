import express from "express";
import * as liveController from "../controllers/liveController.js";
import { protect } from "../middleware/auth.js";
import { createAudioUploader } from "../utils/uploadStorage.js";

const router = express.Router();

const audioUploader = createAudioUploader("data/boyan/audio", {
  fieldName: "audio",
});

router.get("/current", liveController.getCurrentLive);
router.get("/history", liveController.getLiveHistory);
router.get("/stream/:id", liveController.streamLiveAudio);
router.get("/:id", liveController.getLiveById);
router.get("/:id/listeners", liveController.getListenerCount);

router.post("/start", protect, liveController.startLive);
router.post(
  "/stop",
  protect,
  (req, res, next) => {
    if (req.is("multipart/form-data")) {
      audioUploader(req, res, (err) => {
        if (err) {
          console.warn("[liveRoutes] audio upload warning during stop:", err.message);
        }
        next();
      });
    } else {
      next();
    }
  },
  liveController.stopLive
);

export default router;
