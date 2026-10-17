import express from "express";
import * as malfuzatController from "../controllers/malfuzatController.js";
import { protect } from "../middleware/auth.js";
import { createAudioUploader } from "../utils/uploadStorage.js";

const router = express.Router();

const audioUploader = createAudioUploader("data/malfuzat/audio", {
  fieldName: "audio",
});

const handleMulterError = (err, req, res, next) => {
  if (err && err.name === "MulterError") {
    return res.status(400).json({
      error: `File upload error: ${err.message}. Expected field name: 'audio'`,
    });
  }
  next(err);
};

router.get("/", malfuzatController.getAllMalfuzats);
router.get("/categories", malfuzatController.getCategories);
router.get("/latest-audio", malfuzatController.getLatestAudio);
router.get("/:id", malfuzatController.getMalfuzatById);
router.post(
  "/create",
  protect,
  (req, res, next) => {
    if (req.is("multipart/form-data")) {
      audioUploader(req, res, (err) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        next();
      });
    } else {
      next();
    }
  },
  malfuzatController.createMalfuzat
);
router.put(
  "/:id",
  protect,
  (req, res, next) => {
    if (req.is("multipart/form-data")) {
      audioUploader(req, res, (err) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        next();
      });
    } else {
      next();
    }
  },
  malfuzatController.updateMalfuzat
);
router.delete("/:id", protect, malfuzatController.deleteMalfuzat);

export default router;
