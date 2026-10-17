import express from "express";
import * as adController from "../controllers/adController.js";
import { protect } from "../middleware/auth.js";
import { createImageUploader } from "../utils/uploadStorage.js";

const router = express.Router();

const uploadAdImage = createImageUploader("data/img/ads", {
  fieldName: "image",
  maxCount: 1,
});

// Public routes for fetching ads and tracking clicks
router.get("/", adController.getAllAds);
router.get("/:id", adController.getAdById);
router.post("/:id/click", adController.trackAdClick);

// Admin management routes
router.post(
  "/create",
  adController.runUpload(uploadAdImage),
  adController.createAd
);
router.patch(
  "/:id",
  adController.runUpload(uploadAdImage),
  adController.updateAd
);
router.delete("/:id", adController.deleteAd);

export default router;
