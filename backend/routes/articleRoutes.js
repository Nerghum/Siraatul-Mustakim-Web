import express from "express";
import * as articleController from "../controllers/articleController.js";
import { protect, optionalAuth } from "../middleware/auth.js";
import { createImageUploader } from "../utils/uploadStorage.js";

const router = express.Router();

const imageUploader = createImageUploader("data/articles/images", {
  fieldName: "image",
});

const handleMulterError = (err, req, res, next) => {
  if (err && err.name === "MulterError") {
    return res.status(400).json({
      error: `File upload error: ${err.message}. Expected field name: 'image'`,
    });
  }
  next(err);
};

// getArticles can be accessed by anyone (to get published), or with auth to get own/drafts
router.get("/", optionalAuth, articleController.getArticles);
router.get("/:id", optionalAuth, articleController.getArticleById);

// Create, Update, Delete require authentication (role checks are in controller)
router.post(
  "/create",
  protect,
  (req, res, next) => {
    if (req.is("multipart/form-data")) {
      imageUploader(req, res, (err) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        next();
      });
    } else {
      next();
    }
  },
  articleController.createArticle
);

router.put(
  "/:id",
  protect,
  (req, res, next) => {
    if (req.is("multipart/form-data")) {
      imageUploader(req, res, (err) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        next();
      });
    } else {
      next();
    }
  },
  articleController.updateArticle
);

router.delete("/:id", protect, articleController.deleteArticle);

export default router;
