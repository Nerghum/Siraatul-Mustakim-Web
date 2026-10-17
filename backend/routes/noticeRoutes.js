import express from "express";
import * as noticeController from "../controllers/noticeController.js";
import { protect } from "../middleware/auth.js";
import { createImageUploader } from "../utils/uploadStorage.js";

const router = express.Router();

const uploadNoticeImage = createImageUploader("data/img", {
  fieldName: "image",
  maxCount: 1,
});

router.get("/", noticeController.getAllNotices);
router.get("/search", noticeController.searchNotices);
router.get("/:id", noticeController.getNoticeById);
router.post(
  "/create",
  
  noticeController.runUpload(uploadNoticeImage),
  noticeController.createNotice,
);
router.patch(
  "/:id",
  protect,
  noticeController.runUpload(uploadNoticeImage),
  noticeController.updateNotice,
);
router.delete("/:id", protect, noticeController.deleteNotice);

export default router;