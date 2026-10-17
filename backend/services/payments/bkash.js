import axios from "axios";
import Payments from "../../models/Payments.js";
import User from "../../models/User.js";
import PaymentGatewaySettings from "../../models/PaymentGatewaySettings.js";
import { updateDonationCollected } from "../donation.service.js";
import { findUserByPhone } from "../authService.js";

export const getEffectiveBkashConfig = async () => {
  let settings = await PaymentGatewaySettings.findOne({});
  const dbBkash = settings?.bkash || {};

  const isSandbox = dbBkash.isSandbox !== undefined ? dbBkash.isSandbox : true;
  const baseUrl =
    process.env.BKASH_BASE_URL ||
    (isSandbox
      ? "https://tokenized.sandbox.bka.sh/v1.2.0-beta"
      : "https://tokenized.pay.bka.sh/v1.2.0-beta");

  return {
    appKey: dbBkash.appKey || process.env.BKASH_APP_KEY || "",
    appSecret: dbBkash.appSecret || process.env.BKASH_APP_SECRET || "",
    username: dbBkash.username || process.env.BKASH_USERNAME || "",
    password: dbBkash.password || process.env.BKASH_PASSWORD || "",
    baseUrl,
    isEnabled: dbBkash.isEnabled !== undefined ? dbBkash.isEnabled : false,
    isSandbox,
  };
};

const grantToken = async (config) => {
  const { baseUrl, appKey, appSecret, username, password } = config;
  if (!appKey || !appSecret || !username || !password) {
    throw new Error(
      "bKash credentials not configured. Please set App Key, App Secret, Username, and Password in Admin -> Donations -> Gateway Settings."
    );
  }

  const url = `${baseUrl}/tokenized-checkout/auth/grant-token`;
  const res = await axios.post(
    url,
    { app_key: appKey, app_secret: appSecret },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        username,
        password,
      },
      timeout: 30000,
      validateStatus: () => true,
    }
  );
  const data = res.data || {};
  if (res.status >= 400 || !data.id_token) {
    throw new Error(
      `bKash grant-token failed. http=${res.status} message=${data.message || data.statusMessage || JSON.stringify(data)}`
    );
  }

  return data;
};

const generateCustomTranId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const createBkashPaymentSession = async ({
  gateway,
  category,
  fund,
  frequency,
  amount,
  cus_name,
  cus_phone,
  cus_email,
  currency = "BDT",
  callbackURL,
}) => {
  if (!amount || !cus_phone) {
    throw new Error("Missing required fields (amount/cus_phone)");
  }

  const config = await getEffectiveBkashConfig();
  const { id_token: idToken } = await grantToken(config);
  const payerReference = String(cus_phone);
  const createUrl = `${config.baseUrl}/tokenized-checkout/payment/create`;

  const customTranId = generateCustomTranId();

  const effectiveCallbackURL =
    callbackURL ||
    `${process.env.BASE_URL || "http://localhost:5001"}/api/payments/bkash/callback`;

  const createPayload = {
    mode: "0001",
    payerReference,
    callbackURL: effectiveCallbackURL,
    amount: String(amount),
    currency,
    intent: "sale",
    merchantInvoiceNumber: customTranId,
  };

  const createRes = await axios.post(createUrl, createPayload, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      authorization: idToken,
      "x-app-key": config.appKey,
    },
    timeout: 30000,
    validateStatus: () => true,
  });

  const paymentData = createRes.data || {};
  const paymentId = paymentData.paymentId || paymentData.paymentID;
  const bkashURL = paymentData.bkashURL || paymentData.paymentURL;

  if (createRes.status >= 400 || !paymentId || !bkashURL) {
    return {
      status: "failed",
      message: paymentData.statusMessage || paymentData.message || "bKash payment create failed",
    };
  }

  let matchedUserId = null;
  let finalCusName = cus_name || "";
  let finalCusEmail = cus_email || "";

  try {
    const matchedUser = await findUserByPhone(cus_phone);
    if (matchedUser) {
      matchedUserId = matchedUser._id;
      if (!finalCusName && matchedUser.name) finalCusName = matchedUser.name;
      if (!finalCusEmail && matchedUser.email) finalCusEmail = matchedUser.email;
    }
  } catch (err) {
    console.warn("Could not match user by phone:", err);
  }

  const payment = await Payments.create({
    gateway: gateway || "bkash",
    category: category || "general",
    fund: fund || "app",
    frequency: frequency || "oneTime",
    tran_id: customTranId,
    amount: Number(amount),
    currency,
    cus_name: finalCusName,
    cus_phone: String(cus_phone),
    cus_email: finalCusEmail,
    user: matchedUserId,
    provider: "bkash",
    status: "pending",
    rawCreate: paymentData,
  });

  return {
    redirectURL: bkashURL,
    tran_id: payment.tran_id,
  };
};

const executeBkashPayment = async (paymentId) => {
  if (!paymentId) {
    throw new Error("Missing paymentId for execute");
  }
  const config = await getEffectiveBkashConfig();
  const { id_token: idToken } = await grantToken(config);
  const executeUrl = `${config.baseUrl}/tokenized-checkout/payment/execute`;
  const executeRes = await axios.post(
    executeUrl,
    { paymentId },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        authorization: idToken,
        "x-app-key": config.appKey,
      },
      timeout: 30000,
      validateStatus: () => true,
    }
  );

  const executeData = executeRes.data || {};
  let mappedStatus = "pending";

  if (executeRes.status >= 400 || !executeData.transactionStatus) {
    mappedStatus = "cancelled";
  } else {
    const statusRaw = String(executeData.transactionStatus).toLowerCase();
    if (statusRaw === "completed" || statusRaw === "success") {
      mappedStatus = "success";
    } else if (statusRaw === "cancelled" || statusRaw === "canceled") {
      mappedStatus = "cancelled";
    }
  }

  const updateData = {
    status: mappedStatus,
    rawExecute: executeData,
  };

  const updatedPayment = await Payments.findOneAndUpdate(
    {
      $or: [
        { tran_id: String(paymentId) },
        { "rawCreate.paymentID": String(paymentId) },
        { "rawCreate.paymentId": String(paymentId) },
      ],
    },
    updateData,
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

  return {
    status: mappedStatus,
    executeData,
    tran_id: updatedPayment ? updatedPayment.tran_id : paymentId,
  };
};

const processBkashCallback = async ({ paymentId }) => {
  if (!paymentId) {
    throw new Error("Missing paymentId in callback");
  }
  return await executeBkashPayment(paymentId);
};

export { createBkashPaymentSession, processBkashCallback };
