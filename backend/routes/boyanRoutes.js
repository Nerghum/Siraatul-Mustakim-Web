import express from "express";
import * as boyanController from "../controllers/boyanController.js";
import { protect } from "../middleware/auth.js";
import { staffOnly } from "../middleware/adminAuth.js";
import { createAudioUploader } from "../utils/uploadStorage.js";

const router = express.Router();

const audioUploader = createAudioUploader("data/boyan/audio", {
  fieldName: "audio",
});

// Category routes
router.get("/categories", boyanController.getCategories);
router.post("/categories/create", protect, staffOnly, boyanController.createCategory);
router.patch("/categories/:id", protect, staffOnly, boyanController.updateCategory);
router.put("/categories/:id", protect, staffOnly, boyanController.updateCategory);
router.delete("/categories/:id", protect, staffOnly, boyanController.deleteCategory);

// Authors & locations
router.get("/authors", boyanController.getAuthors);
router.get("/locations", boyanController.getLocations);

// General listing & detail
router.get("/", boyanController.getAllBoyans);
router.get("/:id", boyanController.getBoyanById);

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
  boyanController.createBoyan
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
  boyanController.updateBoyan
);

router.delete("/:id", protect, boyanController.deleteBoyan);

export default router;
