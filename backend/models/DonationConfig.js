import mongoose from "mongoose";

const donationConfigSchema = new mongoose.Schema(
  {
    funds: [
      {
        id: String,
        title: String,
        subtitle: String,
        collected: Number,
      },
    ],
    quickAmounts: [Number],
    paymentMethods: [
      {
        id: String,
        label: String,
        active: Boolean,
      },
    ],
  },
  { timestamps: true }
);

const DonationConfig = mongoose.model("DonationConfig", donationConfigSchema, "donations");

export default DonationConfig;
