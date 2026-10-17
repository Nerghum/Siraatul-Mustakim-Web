import express from "express";
import * as audioController from "../controllers/audioController.js";
import { protect } from "../middleware/auth.js";
import { createAudioUploader } from "../utils/uploadStorage.js";

const router = express.Router();

const uploadAudioFile = createAudioUploader("uploads/audio/files", {
  fieldName: "file",
});

router.get("/", protect, audioController.getAudioFiles);
router.post(
  "/upload",
  protect,
  audioController.runUpload(uploadAudioFile),
  audioController.uploadAudio
);

export default router;
