import { initSSLPayment, validatePayment } from "../services/payments/ssl.service.js";
import Payments from "../models/Payments.js";
import { updateDonationCollected } from "../services/donation.service.js";

export const createSSLSession = async (req, res) => {
  try {
    const result = await initSSLPayment({
      ...req.body,
    });

    return res.status(200).json({
      status: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Missing required fields")) {
      return res.status(400).json({
        status: false,
        message: error.message,
      });
    }
    console.error("createSSLSession error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "SSLCommerz session creation failed",
    });
  }
};

const processSuccessfulTransaction = async (val_id, tran_id) => {
  try {
    const validationData = await validatePayment(val_id);

    if (validationData.status === "VALID" || validationData.status === "VALIDATED") {
      const updatedPayment = await Payments.findOneAndUpdate(
        { tran_id: String(tran_id) },
        {
          status: "success",
          rawExecute: validationData,
        },
        { new: true }
      );

      if (updatedPayment && updatedPayment.status === "success") {
        updateDonationCollected(updatedPayment).catch((err) => {
          console.error(
            `[DonationUpdate] Uncaught error for payment ${updatedPayment.tran_id}:`,
            err
          );
        });
      }
      return true;
    }
  } catch (err) {
    console.error("Error validating SSL transaction:", err);
  }
  return false;
};

export const sslSuccessCallback = async (req, res) => {
  try {
    const { tran_id, val_id } = req.body;
    const frontendBase = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
    const tranQuery = tran_id ? `?tran_id=${encodeURIComponent(tran_id)}` : "";
    const successUrl = `${frontendBase}/payment/success${tranQuery}`;
    const failUrl = `${frontendBase}/payment/fail${tranQuery}`;

    if (!val_id) {
      return res.redirect(failUrl);
    }

    const isValid = await processSuccessfulTransaction(val_id, tran_id);

    if (isValid) {
      return res.redirect(successUrl);
    } else {
      await Payments.findOneAndUpdate(
        { tran_id: String(tran_id) },
        { status: "failed" }
      );
      return res.redirect(failUrl);
    }
  } catch (error) {
    console.error("sslSuccessCallback error:", error);
    const frontendBase = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
    return res.redirect(`${frontendBase}/payment/fail`);
  }
};

export const sslFailCallback = async (req, res) => {
  try {
    const { tran_id } = req.body || req.query || {};
    const frontendBase = process.env.FRONTEND_BASE_URL || "http://localhost:3000";

    if (tran_id) {
      await Payments.findOneAndUpdate(
        { tran_id: String(tran_id) },
        { status: "failed" }
      );
    }

    const tranQuery = tran_id ? `?tran_id=${encodeURIComponent(tran_id)}` : "";
    const failUrl = `${frontendBase}/payment/fail${tranQuery}`;
    return res.redirect(failUrl);
  } catch (error) {
    console.error("sslFailCallback error:", error);
    const frontendBase = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
    return res.redirect(`${frontendBase}/payment/fail`);
  }
};

export const sslCancelCallback = async (req, res) => {
  try {
    const { tran_id } = req.body || req.query || {};
    const frontendBase = process.env.FRONTEND_BASE_URL || "http://localhost:3000";

    if (tran_id) {
      await Payments.findOneAndUpdate(
        { tran_id: String(tran_id) },
        { status: "cancelled" }
      );
    }

    const tranQuery = tran_id ? `?tran_id=${encodeURIComponent(tran_id)}` : "";
    const cancelUrl = `${frontendBase}/payment/cancel${tranQuery}`;
    return res.redirect(cancelUrl);
  } catch (error) {
    console.error("sslCancelCallback error:", error);
    const frontendBase = process.env.FRONTEND_BASE_URL || "http://localhost:3000";
    return res.redirect(`${frontendBase}/payment/cancel`);
  }
};

export const sslIpnCallback = async (req, res) => {
  try {
    const { val_id, tran_id, status } = req.body;

    if (status === "VALID" && val_id) {
      const payment = await Payments.findOne({ tran_id: String(tran_id) });
      if (payment && payment.status !== "success") {
        await processSuccessfulTransaction(val_id, tran_id);
      }
    }

    return res.status(200).send("IPN Received");
  } catch (error) {
    console.error("sslIpnCallback error:", error);
    return res.status(500).send("IPN Error");
  }
};

export const verifySSLPayment = async (req, res) => {
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
        paymentMethod: payment.provider || "sslcommerz",
        category: payment.category,
        fund: payment.fund,
        frequency: payment.frequency,
        orderId: payment.rawCreate?.merchantInvoiceNumber || tran_id,
        createdAt: payment.createdAt,
        paymentStatus: payment.status,
      },
    });
  } catch (error) {
    console.error("verifySSLPayment error:", error);
    return res
      .status(500)
      .json({ status: false, message: "Payment verification failed" });
  }
};
