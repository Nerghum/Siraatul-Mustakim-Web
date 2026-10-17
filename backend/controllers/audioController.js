import status from "http-status";
import * as audioService from "../services/audioService.js";

function runUpload(uploadMw) {
  return (req, res, next) => {
    uploadMw(req, res, (err) => {
      if (err) {
        return res.status(status.BAD_REQUEST).json({ error: err.message });
      }
      next();
    });
  };
}

const uploadAudio = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(status.BAD_REQUEST).json({ error: "Audio file is required" });
    }

    const title = req.body?.title || "";
    const result = await audioService.uploadAudio(file, title, req.user.id);

    res.status(status.CREATED).json({ success: true, data: result });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getAudioFiles = async (_req, res) => {
  try {
    const files = await audioService.getAudioFiles();
    res.status(status.OK).json({ success: true, data: files });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export { uploadAudio, getAudioFiles, runUpload };
