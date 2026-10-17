import mongoose from "mongoose";

const eventsScheduleSchema = new mongoose.Schema(
  {
    districtName: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    path: {
      type: String,
      required: true,
      trim: true,
    },
    googleMapsUrl: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: "",
    },
    timeText: {
      type: String,
      trim: true,
      default: "",
    },
    contacts: {
      type: [
        {
          name: { type: String, trim: true, default: "" },
          phone: { type: String, trim: true, default: "" },
        },
      ],
      default: [],
    },
    type: {
      type: String,
      enum: ["amber", "green"],
      default: "green",
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("eventsSchedule", eventsScheduleSchema);
