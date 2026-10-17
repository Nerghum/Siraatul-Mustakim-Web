import express from "express";
import * as faqController from "../controllers/faqController.js";
import { protect } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// Static routes first (before /:id)
router.get("/filters", faqController.getFaqFilters);
router.get("/mufti-users", protect, async (req, res) => {
  try {
    const users = await User.find({ role: "mufti" })
      .select("name email phone role")
      .lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/create", faqController.createFaq);
router.get("/", faqController.getAllFaqs);

// Dynamic routes after static
router.get("/:id", faqController.getFaqById);
router.post("/:id/answer", protect, faqController.addAnswer);
router.delete("/:id", protect, faqController.deleteFaq);

export default router;
