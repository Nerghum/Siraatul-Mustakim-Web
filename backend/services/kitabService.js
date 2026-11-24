import fs from "fs/promises";
import path from "path";
import Kitab from "../models/Kitab.js";
import {
  absolutePathUnderDataFromPublicUrl,
  publicUrlFromRelativeDataPath,
  relativeDataPathFromPublicUrl,
  slugFromTitle,
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

function parseChapters(raw) {
  if (!raw) return [];
  let arr = raw;
  if (typeof raw === "string") {
    try {
      arr = JSON.parse(raw);
    } catch {
      arr = [];
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr.map((ch, idx) => ({
    title: String(ch.title || `অধ্যায় ${idx + 1}`).trim(),
    order: typeof ch.order === "number" ? ch.order : idx + 1,
    content: typeof ch.content === "string" ? ch.content : "",
  }));
}

const createKitab = async (body, files) => {
  const { title, author } = body;
  if (!title?.trim() || !author?.trim()) {
    throw new Error("title and author are required");
  }
  const { coverImages, pdf } = urlsFromMulterFiles(files);
  const content = normalizedContent(body);
  const chapters = parseChapters(body.chapters);

  let bookType = "pdf";
  if (body.bookType === "text" || body.bookType === "pdf") {
    bookType = body.bookType;
  } else if (!pdf && !body.pdf && (content || chapters.length)) {
    bookType = "text";
  }

  if (bookType === "pdf" && !pdf && !body.pdf) {
    throw new Error("A PDF file is required for PDF books");
  }
  if (bookType === "text" && !content && chapters.length === 0) {
    throw new Error("Content or at least one chapter is required for text books");
  }

  let status = "published";
  if (body.status !== undefined && body.status !== null && String(body.status).trim() !== "") {
    status = normalizeStatus(body.status);
  }

  const category = body.category ? String(body.category).trim() : "";
  const finalPdf = pdf || (typeof body.pdf === "string" ? body.pdf.trim() : "");

  return Kitab.create({
    title: String(title).trim(),
    author: String(author).trim(),
    slug: slugFromTitle(title),
    category,
    bookType,
    chapters,
    coverImages,
    pdf: finalPdf,
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

  const term = String(rawQuery.search || rawQuery.q || "").trim();
  if (term) {
    const safeRegex = new RegExp(term.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "i");
    filter.$or = [
      { title: safeRegex },
      { author: safeRegex },
      { category: safeRegex },
      { content: safeRegex },
      { slug: safeRegex },
      { "chapters.title": safeRegex },
      { "chapters.content": safeRegex },
    ];
  }

  if (rawQuery.category && String(rawQuery.category).trim()) {
    const catSafe = new RegExp(String(rawQuery.category).trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "i");
    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { category: catSafe }];
      delete filter.$or;
    } else {
      filter.category = catSafe;
    }
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
    updates.slug = slugFromTitle(updates.title);
  }
  if (body.author !== undefined && body.author !== null && String(body.author).trim() !== "") {
    updates.author = String(body.author).trim();
  }
  if (body.category !== undefined && body.category !== null) {
    updates.category = String(body.category).trim();
  }
  if (
    body.status !== undefined &&
    body.status !== null &&
    String(body.status).trim() !== ""
  ) {
    updates.status = normalizeStatus(body.status);
  }
  if (body.bookType !== undefined && body.bookType !== null) {
    const bt = String(body.bookType).trim().toLowerCase();
    if (bt === "pdf" || bt === "text") {
      updates.bookType = bt;
    }
  }
  if (body.content !== undefined && body.content !== null) {
    updates.content = String(body.content).trim();
  }
  if (body.chapters !== undefined && body.chapters !== null) {
    updates.chapters = parseChapters(body.chapters);
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

  const currentBookType = kitab.bookType || (kitab.pdf ? "pdf" : "text");
  if (currentBookType === "pdf" && !String(kitab.pdf || "").trim()) {
    throw new Error("PDF file is required for PDF books");
  }
  if (
    currentBookType === "text" &&
    !String(kitab.content || "").trim() &&
    (!kitab.chapters || kitab.chapters.length === 0)
  ) {
    throw new Error("Content or at least one chapter is required for text books");
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

