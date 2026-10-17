import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    tran_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "BDT",
    },
    cus_name: {
      type: String,
      default: "",
      trim: true,
    },
    cus_phone: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    cus_email: {
      type: String,
      default: "",
      trim: true,
    },
    provider: {
      type: String,
      default: "bkash",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    gateway: {
      type: String,
      default: "bkash",
    },
    category: {
      type: String,
      default: "general", // "general", "zakat", etc.
    },
    fund: {
      type: String,
      default: "app", // "app", "madrasa", etc.
    },
    frequency: {
      type: String,
      enum: ["oneTime", "monthly"],
      default: "oneTime",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    notes: {
      type: String,
      default: "",
    },
    rawCreate: {
      type: mongoose.Schema.Types.Mixed,
    },
    rawExecute: {
      type: mongoose.Schema.Types.Mixed,
    },
    isDonationUpdated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Payments", paymentSchema);
