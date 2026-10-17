import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    isQuestionsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Settings = mongoose.models.Settings || mongoose.model("Settings", settingsSchema);

export default Settings;
