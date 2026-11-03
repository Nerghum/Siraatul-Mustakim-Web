import express from "express";
import * as viewController from "../controllers/viewController.js";

const router = express.Router();

// Public routes for views
router.post("/", viewController.incrementView);
router.get("/", viewController.getViewCount);
router.post("/batch", viewController.getBatchViews);

export default router;
