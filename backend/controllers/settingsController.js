import status from "http-status";
import Settings from "../models/Settings.js";

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.status(status.OK).json(settings);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    if (req.body.isQuestionsEnabled !== undefined) {
      settings.isQuestionsEnabled = req.body.isQuestionsEnabled;
    }

    await settings.save();
    res.status(status.OK).json(settings);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export { getSettings, updateSettings };
