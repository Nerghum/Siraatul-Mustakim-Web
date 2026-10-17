import path from "path";
import fs from "fs";
import AudioFile from "../models/AudioFile.js";

const UPLOADS_DIR = "uploads/audio/files";

const ensureAudioDir = () => {
  const abs = path.join(process.cwd(), UPLOADS_DIR);
  fs.mkdirSync(abs, { recursive: true });
  return abs;
};

const publicUrlForFile = (filename) => {
  return `/uploads/audio/files/${filename}`;
};

const uploadAudio = async (file, title, uploadedBy) => {
  if (!file) {
    throw new Error("No file provided");
  }

  const audioFile = await AudioFile.create({
    title: title || path.basename(file.filename, path.extname(file.filename)),
    filename: file.filename,
    fileUrl: publicUrlForFile(file.filename),
    fileSize: file.size || 0,
    mimeType: file.mimetype || "",
    uploadedBy,
  });

  let duration = 0;
  try {
    const { parseFile } = await import("music-metadata");
    const metadata = await parseFile(file.path);
    if (metadata.format.duration) {
      duration = Math.round(metadata.format.duration);
      audioFile.duration = duration;
      await audioFile.save();
    }
  } catch (e) {
    // Duration extraction is best-effort
  }

  return {
    audioId: audioFile._id,
    filename: audioFile.filename,
    fileUrl: audioFile.fileUrl,
    duration: audioFile.duration,
    fileSize: audioFile.fileSize,
    mimeType: audioFile.mimeType,
    createdAt: audioFile.createdAt,
  };
};

const getAudioFiles = async () => {
  return AudioFile.find().sort({ createdAt: -1 }).populate("uploadedBy", "phone");
};

export { uploadAudio, getAudioFiles };
