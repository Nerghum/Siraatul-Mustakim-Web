import SSLCommerzPayment from "sslcommerz-lts";
import Payments from "../../models/Payments.js";
import User from "../../models/User.js";
import PaymentGatewaySettings from "../../models/PaymentGatewaySettings.js";
import { findUserByPhone } from "../authService.js";

export const getEffectiveSSLConfig = async () => {
  let settings = await PaymentGatewaySettings.findOne({});
  const dbSSL = settings?.sslcommerz || {};

  const store_id = dbSSL.storeId || process.env.SSLCOMMERZ_STORE_ID || "";
  const store_passwd =
    dbSSL.storePassword || process.env.SSLCOMMERZ_STORE_PASSWD || "";
  // In SSLCommerz, is_live is false for sandbox, true for live
  const is_live = dbSSL.isSandbox !== undefined ? !dbSSL.isSandbox : false;

  return {
    store_id,
    store_passwd,
    is_live,
    isEnabled: dbSSL.isEnabled !== undefined ? dbSSL.isEnabled : false,
    isSandbox: !is_live,
  };
};

const generateCustomTranId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const initSSLPayment = async ({
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

  const { store_id, store_passwd, is_live } = await getEffectiveSSLConfig();
  if (!store_id || !store_passwd) {
    throw new Error(
      "SSLCommerz credentials not configured. Please set Store ID and Store Password in Admin -> Donations -> Gateway Settings."
    );
  }

  const customTranId = generateCustomTranId();
  const apiUrl = process.env.BASE_URL || "http://localhost:5001";

  const data = {
    total_amount: amount,
    currency: currency,
    tran_id: customTranId,
    success_url: `${apiUrl}/api/payments/ssl/success?tran_id=${customTranId}`,
    fail_url: `${apiUrl}/api/payments/ssl/fail?tran_id=${customTranId}`,
    cancel_url: `${apiUrl}/api/payments/ssl/cancel?tran_id=${customTranId}`,
    ipn_url: `${apiUrl}/api/payments/ssl/ipn`,
    shipping_method: "No",
    product_name: "Donation",
    product_category: category || "general",
    product_profile: "non-physical-goods",
    cus_name: cus_name || "দানকারী",
    cus_email: cus_email || "donor@siraatulmustaqim.com",
    cus_add1: "Dhaka",
    cus_add2: "Dhaka",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: cus_phone,
    cus_fax: "01711111111",
    ship_name: cus_name || "দানকারী",
    ship_add1: "Dhaka",
    ship_add2: "Dhaka",
    ship_city: "Dhaka",
    ship_state: "Dhaka",
    ship_postcode: 1000,
    ship_country: "Bangladesh",
  };

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  const apiResponse = await sslcz.init(data);

  if (!apiResponse?.GatewayPageURL) {
    throw new Error(
      "Failed to generate SSLCommerz Gateway URL: " +
        (apiResponse?.failedreason || "Unknown error from SSLCommerz")
    );
  }

  let matchedUserId = null;
  let finalCusName = cus_name || "দানকারী";
  let finalCusEmail = cus_email || "donor@siraatulmustaqim.com";

  try {
    const matchedUser = await findUserByPhone(cus_phone);
    if (matchedUser) {
      matchedUserId = matchedUser._id;
      if (cus_name === "দানকারী" && matchedUser.name) finalCusName = matchedUser.name;
      if (cus_email === "donor@siraatulmustaqim.com" && matchedUser.email) finalCusEmail = matchedUser.email;
    }
  } catch (err) {
    console.warn("Could not match user by phone in SSL payment:", err);
  }

  const payment = await Payments.create({
    gateway: gateway || "ssl",
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
    provider: "sslcommerz",
    status: "pending",
    rawCreate: apiResponse,
  });

  return {
    redirectURL: apiResponse.GatewayPageURL,
    tran_id: payment.tran_id,
  };
};

export const validatePayment = async (val_id) => {
  if (!val_id) {
    throw new Error("Missing val_id for validation");
  }
  const { store_id, store_passwd, is_live } = await getEffectiveSSLConfig();
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  const data = await sslcz.validate({ val_id });
  return data;
};

export const refundPayment = async (
  refund_amount,
  refund_remarks,
  bank_tran_id,
  refl_id
) => {
  const { store_id, store_passwd, is_live } = await getEffectiveSSLConfig();
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  const data = {
    refund_amount,
    refund_remarks,
    bank_tran_id,
    refl_id,
  };
  const response = await sslcz.refund(data);
  return response;
};
