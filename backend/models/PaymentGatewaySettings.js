import mongoose from "mongoose";

const paymentGatewaySettingsSchema = new mongoose.Schema(
  {
    bkash: {
      isEnabled: {
        type: Boolean,
        default: false,
      },
      isSandbox: {
        type: Boolean,
        default: true,
      },
      appKey: {
        type: String,
        default: "",
      },
      appSecret: {
        type: String,
        default: "",
      },
      username: {
        type: String,
        default: "",
      },
      password: {
        type: String,
        default: "",
      },
      merchantNumber: {
        type: String,
        default: "",
      },
    },
    sslcommerz: {
      isEnabled: {
        type: Boolean,
        default: false,
      },
      isSandbox: {
        type: Boolean,
        default: true,
      },
      storeId: {
        type: String,
        default: "",
      },
      storePassword: {
        type: String,
        default: "",
      },
    },
  },
  { timestamps: true }
);

const PaymentGatewaySettings = mongoose.model(
  "PaymentGatewaySettings",
  paymentGatewaySettingsSchema
);

export default PaymentGatewaySettings;
