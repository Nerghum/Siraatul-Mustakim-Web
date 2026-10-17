import {
  createBkashPaymentSession,
  processBkashCallback,
  getEffectiveBkashConfig,
} from "../services/payments/bkash.js";
import {
  initSSLPayment,
  getEffectiveSSLConfig,
} from "../services/payments/ssl.service.js";
import Payments from "../models/Payments.js";
import User from "../models/User.js";
import DonationConfig from "../models/DonationConfig.js";
import PaymentGatewaySettings from "../models/PaymentGatewaySettings.js";
import { findUserByPhone, phoneVariants } from "../services/authService.js";

// ==========================================
// DONATION CONFIG (Funds, Quick amounts, etc.)
// ==========================================

export const getDonationConfig = async (req, res) => {
  try {
    let config = await DonationConfig.findOne({});
    if (!config) {
      config = await DonationConfig.create({
        funds: [
          {
            id: "general",
            title: "সাধারণ তহবিল",
            subtitle: "মসজিদ, মাদ্রাসা ও অন্যান্য দ্বীনি কাজে ব্যয় করা হবে",
            collected: 0,
          },
          {
            id: "zakat",
            title: "যাকাত তহবিল",
            subtitle: "শুধুমাত্র যাকাত আদায়ের উপযুক্ত খাতে ব্যয় করা হবে",
            collected: 0,
          },
        ],
        quickAmounts: [100, 500, 1000, 5000, 10000],
        paymentMethods: [
          { id: "bkash", label: "বিকাশ", active: true },
          { id: "ssl", label: "কার্ড / অন্যান্য", active: true },
        ],
      });
    }
    return res.status(200).json({ status: true, data: config });
  } catch (error) {
    console.error("getDonationConfig error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to fetch donation config" });
  }
};

export const updateDonationConfig = async (req, res) => {
  try {
    const { funds, quickAmounts, paymentMethods } = req.body;
    let config = await DonationConfig.findOne({});
    if (!config) {
      config = new DonationConfig({});
    }

    if (Array.isArray(funds)) config.funds = funds;
    if (Array.isArray(quickAmounts)) config.quickAmounts = quickAmounts;
    if (Array.isArray(paymentMethods)) config.paymentMethods = paymentMethods;

    await config.save();
    return res.status(200).json({
      status: true,
      data: config,
      message: "Donation configurations updated successfully",
    });
  } catch (error) {
    console.error("updateDonationConfig error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to update donation config" });
  }
};

// ==========================================
// PAYMENT GATEWAY SETTINGS (bKash & SSLCommerz)
// ==========================================

export const getGatewaySettings = async (req, res) => {
  try {
    let settings = await PaymentGatewaySettings.findOne({});
    if (!settings) {
      settings = await PaymentGatewaySettings.create({});
    }

    // Mask sensitive keys for security
    const mask = (str) =>
      str && str.length > 4
        ? `${str.slice(0, 2)}••••••••${str.slice(-2)}`
        : str ? "••••••••" : "";

    const responseData = {
      bkash: {
        isEnabled: settings.bkash?.isEnabled || false,
        isSandbox: settings.bkash?.isSandbox !== false,
        appKey: mask(settings.bkash?.appKey),
        appSecret: mask(settings.bkash?.appSecret),
        username: settings.bkash?.username || "",
        password: mask(settings.bkash?.password),
        merchantNumber: settings.bkash?.merchantNumber || "",
        hasAppKey: Boolean(settings.bkash?.appKey),
        hasAppSecret: Boolean(settings.bkash?.appSecret),
        hasPassword: Boolean(settings.bkash?.password),
      },
      sslcommerz: {
        isEnabled: settings.sslcommerz?.isEnabled || false,
        isSandbox: settings.sslcommerz?.isSandbox !== false,
        storeId: settings.sslcommerz?.storeId || "",
        storePassword: mask(settings.sslcommerz?.storePassword),
        hasStorePassword: Boolean(settings.sslcommerz?.storePassword),
      },
    };

    return res.status(200).json({ status: true, data: responseData });
  } catch (error) {
    console.error("getGatewaySettings error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to fetch gateway settings" });
  }
};

export const updateGatewaySettings = async (req, res) => {
  try {
    const { bkash, sslcommerz } = req.body;
    let settings = await PaymentGatewaySettings.findOne({});
    if (!settings) {
      settings = new PaymentGatewaySettings({});
    }

    if (bkash) {
      if (bkash.isEnabled !== undefined) settings.bkash.isEnabled = Boolean(bkash.isEnabled);
      if (bkash.isSandbox !== undefined) settings.bkash.isSandbox = Boolean(bkash.isSandbox);
      if (bkash.username !== undefined) settings.bkash.username = bkash.username.trim();
      if (bkash.merchantNumber !== undefined) settings.bkash.merchantNumber = bkash.merchantNumber.trim();

      // Only update secrets if non-empty and not masked
      if (bkash.appKey && !bkash.appKey.includes("••••")) {
        settings.bkash.appKey = bkash.appKey.trim();
      }
      if (bkash.appSecret && !bkash.appSecret.includes("••••")) {
        settings.bkash.appSecret = bkash.appSecret.trim();
      }
      if (bkash.password && !bkash.password.includes("••••")) {
        settings.bkash.password = bkash.password.trim();
      }
    }

    if (sslcommerz) {
      if (sslcommerz.isEnabled !== undefined)
        settings.sslcommerz.isEnabled = Boolean(sslcommerz.isEnabled);
      if (sslcommerz.isSandbox !== undefined)
        settings.sslcommerz.isSandbox = Boolean(sslcommerz.isSandbox);
      if (sslcommerz.storeId !== undefined)
        settings.sslcommerz.storeId = sslcommerz.storeId.trim();

      if (sslcommerz.storePassword && !sslcommerz.storePassword.includes("••••")) {
        settings.sslcommerz.storePassword = sslcommerz.storePassword.trim();
      }
    }

    await settings.save();
    return res.status(200).json({
      status: true,
      message: "Payment gateway credentials saved successfully",
    });
  } catch (error) {
    console.error("updateGatewaySettings error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to update gateway settings" });
  }
};

export const getPublicGateways = async (req, res) => {
  try {
    const bkashConfig = await getEffectiveBkashConfig();
    const sslConfig = await getEffectiveSSLConfig();

    return res.status(200).json({
      status: true,
      data: {
        bkash: {
          enabled: bkashConfig.isEnabled || Boolean(bkashConfig.appKey),
          isSandbox: bkashConfig.isSandbox,
          merchantNumber: bkashConfig.merchantNumber || "",
        },
        sslcommerz: {
          enabled: sslConfig.isEnabled || Boolean(sslConfig.store_id),
          isSandbox: sslConfig.isSandbox,
        },
      },
    });
  } catch (error) {
    console.error("getPublicGateways error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to fetch public gateways" });
  }
};

// ==========================================
// UNIFIED INITIATE DONATION
// ==========================================

export const initiateDonation = async (req, res) => {
  try {
    const {
      amount,
      cus_phone,
      cus_name,
      cus_email,
      category = "general",
      fund = "app",
      frequency = "oneTime",
      paymentMethod = "bkash",
    } = req.body;

    if (!amount || !cus_phone) {
      return res.status(400).json({
        status: false,
        message: "অনুগ্রহ করে অনুদানের পরিমাণ এবং মোবাইল নম্বর প্রদান করুন",
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        status: false,
        message: "সঠিক অনুদানের পরিমাণ প্রদান করুন",
      });
    }

    if (paymentMethod === "bkash") {
      const result = await createBkashPaymentSession({
        gateway: "bkash",
        category,
        fund,
        frequency,
        amount: numericAmount,
        cus_name: cus_name || "দানকারী",
        cus_phone,
        cus_email,
        callbackURL: req.body.callbackURL || process.env.BKASH_CALLBACK_URL,
      });

      if (result.status === "failed") {
        return res.status(400).json({ status: false, message: result.message });
      }

      return res.status(200).json({
        status: true,
        data: result,
      });
    } else {
      // sslcommerz or card
      const result = await initSSLPayment({
        gateway: paymentMethod,
        category,
        fund,
        frequency,
        amount: numericAmount,
        cus_name: cus_name || "দানকারী",
        cus_phone,
        cus_email,
      });

      return res.status(200).json({
        status: true,
        data: result,
      });
    }
  } catch (error) {
    console.error("initiateDonation error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "পেমেন্ট সেশন তৈরি করতে সমস্যা হয়েছে",
    });
  }
};

// ==========================================
// BKASH HANDLERS
// ==========================================

export const createBkashSession = async (req, res) => {
  try {
    const result = await createBkashPaymentSession({
      ...req.body,
      callbackURL: req.body.callbackURL || process.env.BKASH_CALLBACK_URL,
    });
    return res.status(200).json({
      status: true,
      data: result,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("Missing required fields")
    ) {
      return res.status(400).json({
        status: false,
        message: error.message,
      });
    }
    console.error("createBkashSession error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "bKash session creation failed",
    });
  }
};

export const bkashCallback = async (req, res) => {
  try {
    const { paymentID, paymentId } = req.query || {};
    const effectivePaymentId = paymentID || paymentId;
    const { status, tran_id } = await processBkashCallback({
      paymentId: effectivePaymentId,
    });
    const frontendBase = process.env.FRONTEND_BASE_URL || "http://localhost:3000";

    const finalTranId = tran_id || "";
    const tranQuery = finalTranId
      ? `?tran_id=${encodeURIComponent(finalTranId)}`
      : "";

    let redirectUrl = `${frontendBase}/payment/fail${tranQuery}`;
    if (status === "success") {
      redirectUrl = `${frontendBase}/payment/success${tranQuery}`;
    } else if (status === "cancelled") {
      redirectUrl = `${frontendBase}/payment/cancel${tranQuery}`;
    }
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("bkashCallback error:", error);
    const frontendBase = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
    return res.redirect(`${frontendBase}/payment/fail`);
  }
};

export const verifyBkashPayment = async (req, res) => {
  try {
    const { tran_id } = req.query;
    if (!tran_id) {
      return res
        .status(400)
        .json({ status: false, message: "Transaction ID is required" });
    }
    const payment = await Payments.findOne({ tran_id });
    if (!payment) {
      return res
        .status(404)
        .json({ status: false, message: "Payment not found" });
    }

    return res.status(200).json({
      status: true,
      data: {
        tran_id: payment.tran_id,
        amount: payment.amount,
        currency: payment.currency,
        cus_name: payment.cus_name,
        cus_phone: payment.cus_phone,
        cus_email: payment.cus_email,
        paymentMethod: payment.provider || "bkash",
        category: payment.category,
        fund: payment.fund,
        frequency: payment.frequency,
        orderId: payment.rawCreate?.merchantInvoiceNumber || "",
        createdAt: payment.createdAt,
        paymentStatus: payment.status,
      },
    });
  } catch (error) {
    console.error("verifyBkashPayment error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Payment verification failed" });
  }
};

// ==========================================
// STATS & DASHBOARD
// ==========================================

export const getPaymentStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Summary aggregations
    const [
      totalSuccessAgg,
      totalDonorsAgg,
      todaySuccessAgg,
      monthSuccessAgg,
      pendingCount,
      failedCount,
    ] = await Promise.all([
      Payments.aggregate([
        { $match: { status: "success" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Payments.distinct("cus_phone", { status: "success" }),
      Payments.aggregate([
        { $match: { status: "success", createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Payments.aggregate([
        { $match: { status: "success", createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      Payments.countDocuments({ status: "pending" }),
      Payments.countDocuments({ status: { $in: ["failed", "cancelled"] } }),
    ]);

    const totalCollected = totalSuccessAgg[0]?.total || 0;
    const totalDonations = totalSuccessAgg[0]?.count || 0;
    const totalDonors = totalDonorsAgg.length;
    const todayCollected = todaySuccessAgg[0]?.total || 0;
    const thisMonthCollected = monthSuccessAgg[0]?.total || 0;

    // Daily Stats Grouped by Category (for Area Chart)
    const dailyStats = await Payments.aggregate([
      { $match: { status: "success" } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            category: "$category",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          categories: {
            $push: {
              category: "$_id.category",
              total: "$total",
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);

    const formattedDaily = dailyStats.map((day) => {
      const result = { date: day._id };
      day.categories.forEach((cat) => {
        result[cat.category || "general"] = cat.total;
      });
      return result;
    });

    // Monthly Stats (for Bar Chart)
    const monthlyStats = await Payments.aggregate([
      { $match: { status: "success" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    const formattedMonthly = monthlyStats.map((month) => ({
      month: month._id,
      total: month.total,
      count: month.count,
    }));

    // Method breakdown
    const methodStats = await Payments.aggregate([
      { $match: { status: "success" } },
      {
        $group: {
          _id: "$provider",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Sector breakdown
    const sectorStats = await Payments.aggregate([
      { $match: { status: "success" } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Recent 5 donations
    const recentDonations = await Payments.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return res.status(200).json({
      status: true,
      data: {
        summary: {
          totalCollected,
          totalDonations,
          totalDonors,
          todayCollected,
          thisMonthCollected,
          pendingCount,
          failedCount,
        },
        daily: formattedDaily,
        monthly: formattedMonthly,
        methods: methodStats,
        sectors: sectorStats,
        recentDonations,
      },
    });
  } catch (error) {
    console.error("getPaymentStats error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch payment statistics",
    });
  }
};

// ==========================================
// DONATION TRANSACTIONS HISTORY
// ==========================================

export const getDonationHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const gateway = req.query.gateway;
    const category = req.query.category;
    const q = req.query.q;

    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (gateway && gateway !== "all") {
      query.provider = gateway;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (q) {
      query.$or = [
        { tran_id: { $regex: q, $options: "i" } },
        { cus_phone: { $regex: q, $options: "i" } },
        { cus_name: { $regex: q, $options: "i" } },
        { cus_email: { $regex: q, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payments.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payments.countDocuments(query),
    ]);

    return res.status(200).json({
      status: true,
      data: payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getDonationHistory error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch donation history",
    });
  }
};

// ==========================================
// DONORS LIST (Aggregated by donor phone)
// ==========================================

export const getDonorsList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const q = req.query.q;

    const pipeline = [
      {
        $group: {
          _id: "$cus_phone",
          donorName: { $last: "$cus_name" },
          donorEmail: { $last: "$cus_email" },
          totalDonated: {
            $sum: {
              $cond: [{ $eq: ["$status", "success"] }, "$amount", 0],
            },
          },
          donationCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "success"] }, 1, 0],
            },
          },
          totalAttempts: { $sum: 1 },
          lastDonationDate: { $max: "$createdAt" },
          lastStatus: { $last: "$status" },
        },
      },
      {
        $project: {
          _id: 1,
          phone: "$_id",
          name: { $ifNull: ["$donorName", "Unknown Donor"] },
          email: "$donorEmail",
          totalDonated: 1,
          donationCount: 1,
          totalAttempts: 1,
          lastDonationDate: 1,
          lastStatus: 1,
        },
      },
    ];

    if (q) {
      pipeline.push({
        $match: {
          $or: [
            { phone: { $regex: q, $options: "i" } },
            { name: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push({ $sort: { totalDonated: -1, lastDonationDate: -1 } });

    // Count total matched donors
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Payments.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Apply pagination
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    const donors = await Payments.aggregate(pipeline);

    return res.status(200).json({
      status: true,
      data: donors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getDonorsList error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch donors list",
    });
  }
};

// ==========================================
// SINGLE DONATION DETAIL & STATUS UPDATE
// ==========================================

export const getSingleDonation = async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payments.findById(id).lean();
    if (!payment) {
      return res.status(404).json({ status: false, message: "Donation not found" });
    }
    return res.status(200).json({ status: true, data: payment });
  } catch (error) {
    console.error("getSingleDonation error:", error);
    return res.status(500).json({ status: false, message: "Failed to fetch donation details" });
  }
};

export const updateDonationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const payment = await Payments.findById(id);
    if (!payment) {
      return res.status(404).json({ status: false, message: "Donation not found" });
    }

    if (status) payment.status = status;
    if (notes !== undefined) payment.notes = notes;

    await payment.save();

    return res.status(200).json({
      status: true,
      data: payment,
      message: "Donation status updated successfully",
    });
  } catch (error) {
    console.error("updateDonationStatus error:", error);
    return res.status(500).json({ status: false, message: "Failed to update donation status" });
  }
};

// ==========================================
// USER DONATIONS & AUTOFILL (Match by phone)
// ==========================================

export const getUserDonations = async (req, res) => {
  try {
    const { phone } = req.params;
    if (!phone) {
      return res.status(400).json({ status: false, message: "Phone number is required" });
    }

    const cleanPhone = String(phone).trim();
    const variants = phoneVariants(cleanPhone);
    const user = await findUserByPhone(cleanPhone);

    const queryConditions = [
      { cus_phone: { $in: variants } },
    ];
    if (user?._id) {
      queryConditions.push({ user: user._id });
    }

    const donations = await Payments.find({ $or: queryConditions })
      .sort({ createdAt: -1 })
      .lean();

    const successfulDonations = donations.filter((d) => d.status === "success");
    const totalDonated = successfulDonations.reduce((sum, d) => sum + (d.amount || 0), 0);
    const donationCount = successfulDonations.length;

    const lastDonation = donations.length > 0 ? donations[0] : null;

    return res.status(200).json({
      status: true,
      data: {
        user: user
          ? {
              _id: user._id,
              name: user.name || "",
              phone: user.phone || cleanPhone,
              email: user.email || "",
              role: user.role,
            }
          : null,
        totalDonated,
        donationCount,
        lastDonation: lastDonation
          ? {
              amount: lastDonation.amount,
              category: lastDonation.category,
              fund: lastDonation.fund,
              frequency: lastDonation.frequency,
              gateway: lastDonation.gateway || lastDonation.provider,
              createdAt: lastDonation.createdAt,
              cus_name: lastDonation.cus_name,
              cus_email: lastDonation.cus_email,
            }
          : null,
        donations: donations.slice(0, 10), // latest 10
      },
    });
  } catch (error) {
    console.error("getUserDonations error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch user donations",
    });
  }
};

