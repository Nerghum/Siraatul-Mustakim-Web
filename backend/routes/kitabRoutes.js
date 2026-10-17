import express from "express";
import * as kitabController from "../controllers/kitabController.js";
import { protect } from "../middleware/auth.js";
import { createMixedFieldUploader } from "../utils/uploadStorage.js";

const router = express.Router();

const uploadKitabFiles = createMixedFieldUploader([
  {
    name: "coverImages",
    maxCount: 10,
    relativeDir: "data/kitab/images",
    kind: "image",
  },
  {
    name: "pdf",
    maxCount: 1,
    relativeDir: "data/kitab/pdf",
    kind: "pdf",
  },
]);

router.get("/", kitabController.getAllKitabs);
router.get("/:id", kitabController.getKitabById);
router.post(
  "/create",
  protect,
  kitabController.runUpload(uploadKitabFiles),
  kitabController.createKitab,
);
router.patch(
  "/:id",
  protect,
  kitabController.runUpload(uploadKitabFiles),
  kitabController.updateKitab,
);
router.delete("/:id", protect, kitabController.deleteKitab);

export default router;
