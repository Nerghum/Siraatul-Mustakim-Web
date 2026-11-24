import express from "express";
import * as notificationController from "../controllers/notificationController.js";

const router = express.Router();

router.post("/register-token", notificationController.registerPushToken);
router.post("/unregister-token", notificationController.unregisterPushToken);
router.get("/", notificationController.getAllNotifications);
router.post("/test", notificationController.sendTestPush);

export default router;
