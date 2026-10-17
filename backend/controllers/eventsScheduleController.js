import path from "path";
import status from "http-status";
import * as eventsScheduleService from "../services/eventsScheduleService.js";
import { publicUrlFromRelativeDataPath } from "../utils/uploadStorage.js";

export function runUpload(uploadMw) {
  return (req, res, next) => {
    uploadMw(req, res, (err) => {
      if (err) {
        return res.status(status.BAD_REQUEST).json({ error: err.message });
      }
      next();
    });
  };
}

function uploadedImageUrl(req) {
  const file =
    req.file ||
    (Array.isArray(req.files) ? req.files[0] : null) ||
    (Array.isArray(req.files?.image) ? req.files.image[0] : null);
  if (!file?.path) return null;
  const absoluteDataRoot = path.resolve(process.cwd(), "data");
  const absoluteFilePath = path.resolve(file.path);
  const relativePath = path.relative(absoluteDataRoot, absoluteFilePath);
  if (!relativePath || relativePath.startsWith("..")) return null;
  return publicUrlFromRelativeDataPath(relativePath.split(path.sep).join("/"));
}

const createeventsSchedule = async (req, res) => {
  const uploadedUrl = uploadedImageUrl(req);
  if (uploadedUrl) {
    req.body.image = uploadedUrl;
  }
  if (typeof req.body.contacts === "string") {
    try {
      req.body.contacts = JSON.parse(req.body.contacts);
    } catch {
      req.body.contacts = [];
    }
  }

  const { districtName, date, time, location, path: p, googleMapsUrl } =
    req.body;

  if (
    !districtName ||
    !date ||
    !time ||
    !location ||
    !p ||
    !googleMapsUrl
  ) {
    return res.status(status.BAD_REQUEST).json({
      error:
        "All fields are required: districtName, date, time, location, path, googleMapsUrl",
    });
  }

  try {
    const eventsSchedule = await eventsScheduleService.createeventsSchedule(req.body);
    res.status(status.CREATED).json(eventsSchedule);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const geteventsScheduleById = async (req, res) => {
  const { id } = req.params;

  try {
    const eventsSchedule = await eventsScheduleService.geteventsScheduleById(id);
    res.status(status.OK).json(eventsSchedule);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getAlleventsSchedules = async (_req, res) => {
  try {
    const eventsSchedules = await eventsScheduleService.getAlleventsSchedules();
    res.status(status.OK).json(eventsSchedules);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const updateeventsSchedule = async (req, res) => {
  const { id } = req.params;
  const uploadedUrl = uploadedImageUrl(req);
  if (uploadedUrl) {
    req.body.image = uploadedUrl;
  }
  if (typeof req.body.contacts === "string") {
    try {
      req.body.contacts = JSON.parse(req.body.contacts);
    } catch {
      // ignore
    }
  }

  const { districtName, date, time, location, path: p, googleMapsUrl, title, timeText, contacts } =
    req.body;

  if (
    districtName === undefined &&
    date === undefined &&
    time === undefined &&
    location === undefined &&
    p === undefined &&
    googleMapsUrl === undefined &&
    title === undefined &&
    timeText === undefined &&
    contacts === undefined &&
    req.body.image === undefined &&
    req.body.type === undefined
  ) {
    return res.status(status.BAD_REQUEST).json({
      error: "Provide at least one field to update",
    });
  }

  try {
    const eventsSchedule = await eventsScheduleService.updateeventsSchedule(
      id,
      req.body
    );
    res.status(status.OK).json(eventsSchedule);
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const deleteeventsScheduleById = async (req, res) => {
  const { id } = req.params;

  try {
    await eventsScheduleService.deleteeventsScheduleById(id);
    res.status(status.OK).json({ message: "events schedule deleted" });
  } catch (error) {
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

export {
  createeventsSchedule,
  geteventsScheduleById,
  getAlleventsSchedules,
  updateeventsSchedule,
  deleteeventsScheduleById,
};
