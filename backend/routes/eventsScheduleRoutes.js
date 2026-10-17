import express from "express";
import * as eventsScheduleController from "../controllers/eventsScheduleController.js";
import { protect } from "../middleware/auth.js";
import { createImageUploader } from "../utils/uploadStorage.js";

const router = express.Router();

const uploadEventImage = createImageUploader("data/img", {
  fieldName: "image",
  maxCount: 1,
});

router.get("/", eventsScheduleController.getAlleventsSchedules);
router.get("/:id", eventsScheduleController.geteventsScheduleById);
router.post(
  "/create",
  protect,
  eventsScheduleController.runUpload(uploadEventImage),
  eventsScheduleController.createeventsSchedule,
);
router.patch(
  "/:id",
  protect,
  eventsScheduleController.runUpload(uploadEventImage),
  eventsScheduleController.updateeventsSchedule,
);
router.delete("/:id", protect, eventsScheduleController.deleteeventsScheduleById);

export default router;
