import fs from "fs/promises";
import path from "path";
import Kitab from "../models/Kitab.js";
import {
  absolutePathUnderDataFromPublicUrl,
  publicUrlFromRelativeDataPath,
  relativeDataPathFromPublicUrl,
} from "../utils/uploadStorage.js";

const REL_IMG = "kitab/images";
const REL_PDF = "kitab/pdf";

function isKitabStoredPath(url) {
  const rel = relativeDataPathFromPublicUrl(url);
  if (!rel) return false;
  return rel.startsWith(`${REL_IMG}/`) || rel.startsWith(`${REL_PDF}/`);
}

async function unlinkPublicUrl(url) {
  if (!url || typeof url !== "string" || !String(url).trim()) return;
  if (!isKitabStoredPath(url)) return;
  const abs = absolutePathUnderDataFromPublicUrl(url);
  if (!abs) return;
  const kitabRoot = path.resolve(process.cwd(), "data", "kitab");
  if (!abs.startsWith(kitabRoot + path.sep)) return;
  try {
    await fs.unlink(abs);
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

function urlsFromMulterFiles(files) {
  const coverFiles = files?.coverImages;
  const list = Array.isArray(coverFiles) ? coverFiles : coverFiles ? [coverFiles] : [];
  const coverImages = list.map((f) =>
    publicUrlFromRelativeDataPath(`${REL_IMG}/${f.filename}`),
  );
  const pdfArr = files?.pdf;
  const pdfFile = Array.isArray(pdfArr) ? pdfArr[0] : pdfArr;
  const pdf = pdfFile
    ? publicUrlFromRelativeDataPath(`${REL_PDF}/${pdfFile.filename}`)
    : "";
  return { coverImages, pdf };
}

function normalizeStatus(raw) {
  if (raw === undefined || raw === null) return undefined;
  const s = String(raw).trim().toLowerCase();
  if (s === "published" || s === "draft") return s;
  throw new Error("status must be published or draft");
}

function normalizedContent(body) {
  if (body.content === undefined || body.content === null) return "";
  return String(body.content).trim();
}

const createKitab = async (body, files) => {
  const { title, author } = body;
  if (!title?.trim() || !author?.trim()) {
    throw new Error("title and author are required");
  }
  const { coverImages, pdf } = urlsFromMulterFiles(files);
  const content = normalizedContent(body);
  if (!coverImages.length) {
    throw new Error("at least one cover image is required");
  }
  if (!pdf && !content) {
    throw new Error("either a pdf file or content text is required");
  }
  let status = "published";
  if (body.status !== undefined && body.status !== null && String(body.status).trim() !== "") {
    status = normalizeStatus(body.status);
  }
  return Kitab.create({
    title: String(title).trim(),
    author: String(author).trim(),
   slug: String(title).trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, ""),
    coverImages,
    pdf: pdf || "",
    content,
    status,
  });
};

function parseKitabListQuery(rawQuery = {}) {
  const filter = {};
  const statusRaw = rawQuery.status;
  if (statusRaw !== undefined && statusRaw !== null && String(statusRaw).trim() !== "") {
    const s = String(statusRaw).trim().toLowerCase();
    if (s !== "draft" && s !== "published") {
      throw new Error("status must be draft or published");
    }
    filter.status = s;
  }
  return filter;
}

const getAllKitabs = async (rawQuery = {}) => {
  const filter = parseKitabListQuery(rawQuery);
  return Kitab.find(filter).sort({ createdAt: -1 });
};

const getKitabById = async (id) => {
  const kitab = await Kitab.findById(id);
  if (!kitab) throw new Error("Kitab not found");
  return kitab;
};

const deleteKitabById = async (id) => {
  const kitab = await Kitab.findById(id);
  if (!kitab) throw new Error("Kitab not found");
  const covers = Array.isArray(kitab.coverImages) ? kitab.coverImages : [];
  await Promise.all([
    ...covers.map((u) => unlinkPublicUrl(u)),
    unlinkPublicUrl(kitab.pdf),
  ]);
  await kitab.deleteOne();
  return kitab;
};

const updateKitab = async (id, body, files) => {
  const kitab = await Kitab.findById(id);
  if (!kitab) throw new Error("Kitab not found");

  const updates = {};
  if (body.title !== undefined && body.title !== null && String(body.title).trim() !== "") {
    updates.title = String(body.title).trim();
  }
  if (body.author !== undefined && body.author !== null && String(body.author).trim() !== "") {
    updates.author = String(body.author).trim();
  }
  if (
    body.status !== undefined &&
    body.status !== null &&
    String(body.status).trim() !== ""
  ) {
    updates.status = normalizeStatus(body.status);
  }
  if (body.content !== undefined && body.content !== null) {
    updates.content = String(body.content).trim();
  }

  const newFiles = urlsFromMulterFiles(files);
  if (newFiles.coverImages.length) {
    await Promise.all(kitab.coverImages.map((u) => unlinkPublicUrl(u)));
    updates.coverImages = newFiles.coverImages;
  }
  if (newFiles.pdf) {
    await unlinkPublicUrl(kitab.pdf);
    updates.pdf = newFiles.pdf;
  }

  if (!Object.keys(updates).length) {
    throw new Error("nothing to update");
  }

  Object.assign(kitab, updates);
  if (!String(kitab.pdf || "").trim() && !String(kitab.content || "").trim()) {
    throw new Error("kitab must have either a pdf or content");
  }
  await kitab.save();
  return kitab;
};

export {
  createKitab,
  getAllKitabs,
  getKitabById,
  deleteKitabById,
  updateKitab,
};
