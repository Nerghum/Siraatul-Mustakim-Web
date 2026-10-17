import express from "express";
import { protectAdmin, adminOnly } from "../middleware/adminAuth.js";
import {
  createBkashSession,
  bkashCallback,
  verifyBkashPayment,
  getDonationConfig,
  updateDonationConfig,
  getPaymentStats,
  getDonationHistory,
  getGatewaySettings,
  updateGatewaySettings,
  getPublicGateways,
  getDonorsList,
  getSingleDonation,
  updateDonationStatus,
  initiateDonation,
  getUserDonations,
} from "../controllers/paymentsController.js";

import {
  createSSLSession,
  sslSuccessCallback,
  sslFailCallback,
  sslCancelCallback,
  sslIpnCallback,
  verifySSLPayment,
} from "../controllers/sslController.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Payment route is working" });
});

// Public endpoints for donor checkout & user autofill
router.get("/donations/config", getDonationConfig);
router.get("/public-gateways", getPublicGateways);
router.post("/initiate", initiateDonation);
router.post("/donate", initiateDonation);
router.get("/user/:phone", getUserDonations);

// Admin dashboard, donor management, and transactions
router.get("/admin/stats", protectAdmin, adminOnly, getPaymentStats);
router.get("/donations/history", protectAdmin, adminOnly, getDonationHistory);
router.get("/admin/donors", protectAdmin, adminOnly, getDonorsList);
router.get("/admin/donations/:id", protectAdmin, adminOnly, getSingleDonation);
router.patch("/admin/donations/:id/status", protectAdmin, adminOnly, updateDonationStatus);

// Admin settings (Sectors config & Gateway credentials)
router.put("/donations/config", protectAdmin, adminOnly, updateDonationConfig);
router.get("/admin/gateways", protectAdmin, adminOnly, getGatewaySettings);
router.put("/admin/gateways", protectAdmin, adminOnly, updateGatewaySettings);

// bKash gateway routes
router.post("/bkash/session", createBkashSession);
router.get("/bkash/callback", bkashCallback);
router.post("/bkash/callback", bkashCallback);
router.get("/bkash/verify", verifyBkashPayment);

// SSLCommerz gateway routes
router.post("/ssl/session", createSSLSession);
router.post("/ssl/success", sslSuccessCallback);
router.post("/ssl/fail", sslFailCallback);
router.post("/ssl/cancel", sslCancelCallback);
router.post("/ssl/ipn", sslIpnCallback);
router.get("/ssl/verify", verifySSLPayment);

export default router;
