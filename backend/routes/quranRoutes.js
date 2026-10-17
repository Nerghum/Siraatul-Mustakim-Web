import express from "express";
import * as quranController from "../controllers/quranController.js";
import { protect } from "../middleware/auth.js";
import { createAudioUploader } from "../utils/uploadStorage.js";

const router = express.Router();

// public routes
router.get("/", quranController.getQuran);
router.get("/languages", quranController.getLanguages);
router.get("/search", quranController.search);
router.get("/surah/:surahId/verse/:verseId", quranController.getVerse);
router.get("/surah/:surahId", quranController.getSurah);
router.get("/audio/:reciter/:file", quranController.streamAudio);

// admin routes
const surahAudioUploader = createAudioUploader("data/quran/surah");
const handleMulterError = (err, req, res, next) => {
  if (err && err.name === "MulterError") {
    return res.status(400).json({
      error: `File upload error: ${err.message}. Expected field name: 'audio'`,
    });
  }
  next(err);
};

router.post("/admin/surah", protect,  quranController.addSurah);

router.put("/admin/surah/:surahId", protect,  quranController.updateSurah);
router.put(
  "/admin/surah/:surahId/verse/:verseId",
  protect,

  quranController.updateVerse
);
router.delete("/admin/surah/:surahId", protect,  quranController.deleteSurah);
router.delete(
  "/admin/surah/:surahId/verse/:verseId",
  protect,
  
  quranController.deleteVerse
);

router.post(
  "/admin/surah/:surahId/verse",
  protect,
  quranController.addVerse
);

router.post(
  "/admin/surah/:surahId/audio",
  protect,
  surahAudioUploader,
  handleMulterError,
  quranController.uploadAudio
);

router.post("/admin/sync-quran", protect, quranController.syncQuran);

export default router;
