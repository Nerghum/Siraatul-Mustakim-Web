import status from "http-status";
import mongoose from "mongoose";
import * as kitabService from "../services/kitabService.js";

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

const getAllKitabs = async (req, res) => {
  try {
    const kitabs = await kitabService.getAllKitabs(req.query);
    res.status(status.OK).json(kitabs);
  } catch (error) {
    if (error.message === "status must be draft or published") {
      return res.status(status.BAD_REQUEST).json({ error: error.message });
    }
    res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
};

const getKitabById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(status.BAD_REQUEST).json({ error: "Invalid id" });
  }
  try {
    const kitab = await kitabService.getKitabById(id);
    res.status(status.OK).json(kitab);
  } catch (error) {
    const code =
      error.message === "Kitab not found"
        ? status.NOT_FOUND
        : status.INTERNAL_SERVER_ERROR;
    res.status(code).json({ error: error.message });
  }
};

const createKitab = async (req, res) => {
  try {
    const kitab = await kitabService.createKitab(req.body, req.files);
    res.status(status.CREATED).json(kitab);
  } catch (error) {
    res.status(status.BAD_REQUEST).json({ error: error.message });
  }
};

const deleteKitab = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(status.BAD_REQUEST).json({ error: "Invalid id" });
  }
  try {
    await kitabService.deleteKitabById(id);
    res.status(status.OK).json({ message: "Kitab deleted" });
  } catch (error) {
    const code =
      error.message === "Kitab not found"
        ? status.NOT_FOUND
        : status.INTERNAL_SERVER_ERROR;
    res.status(code).json({ error: error.message });
  }
};

const updateKitab = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(status.BAD_REQUEST).json({ error: "Invalid id" });
  }
  try {
    const kitab = await kitabService.updateKitab(id, req.body, req.files);
    res.status(status.OK).json(kitab);
  } catch (error) {
    if (error.message === "Kitab not found") {
      return res.status(status.NOT_FOUND).json({ error: error.message });
    }
    res.status(status.BAD_REQUEST).json({ error: error.message });
  }
};

export {
  getAllKitabs,
  getKitabById,
  createKitab,
  deleteKitab,
  updateKitab,
  runUpload,
};
