import fs from "fs";
import path from "path";
import { createHash, randomUUID } from "crypto";
import multer from "multer";

export const FILES_PUBLIC_PREFIX = "/files";

const IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const AUDIO_MIMES = new Set([
    "audio/mp3",
  "audio/mpeg",
  "audio/mp4",
  "audio/wav",
  "audio/ogg",
  "audio/webm",
  "audio/aac",
]);

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_PDF_BYTES = 50 * 1024 * 1024;
const MAX_AUDIO_BYTES = 200 * 1024 * 1024; 

export function ensureDir(absolutePath) {
  fs.mkdirSync(absolutePath, { recursive: true });
}

function extFromOriginal(originalname) {
  const ext = path.extname(originalname || "").toLowerCase();
  if (ext && ext.length <= 8) return ext;
  return "";
}

function uniqueSuffix() {
  return `${Date.now()}-${randomUUID().slice(0, 8)}`;
}

export function slugFromTitle(title) {
  if (title == null || typeof title !== "string") return "";
  const trimmed = title.trim();
  if (!trimmed) return "";
  let ascii = trimmed
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  if (ascii) return ascii;
  return `t-${createHash("sha256").update(trimmed, "utf8").digest("hex").slice(0, 12)}`;
}

function titleFromReq(req, titleField) {
  const key = titleField ?? "title";
  const raw = req.body?.[key];
  if (raw == null) return "";
  return String(raw);
}

export function filenameFromRequest(req, file, options = {}) {
  const slug = slugFromTitle(titleFromReq(req, options.titleField));
  const ext = extFromOriginal(file.originalname);
  const suffix = uniqueSuffix();
  if (slug) return `${slug}-${suffix}${ext}`;
  return `${suffix}${ext}`;
}

export function uniqueFilename(originalname) {
  const ext = extFromOriginal(originalname);
  return `${uniqueSuffix()}${ext}`;
}

export function publicUrlFromRelativeDataPath(relativePath) {
  const normalized = String(relativePath)
    .replace(/^\/+/, "")
    .split("/")
    .filter((s) => s && s !== ".")
    .join("/");
  if (!normalized) return null;
  return `${FILES_PUBLIC_PREFIX}/${normalized}`;
}

function absFromRelativeDir(relativeDirFromProjectRoot) {
  return path.join(process.cwd(), relativeDirFromProjectRoot);
}

function diskStorage(relativeDirFromProjectRoot, storageOptions = {}) {
  const titleField = storageOptions.titleField ?? "title";
  return multer.diskStorage({
    destination(_req, _file, cb) {
      const abs = absFromRelativeDir(relativeDirFromProjectRoot);
      ensureDir(abs);
      cb(null, abs);
    },
    filename(req, file, cb) {
      cb(null, filenameFromRequest(req, file, { titleField }));
    },
  });
}

function imageFileFilter(_req, file, cb) {
  if (IMAGE_MIMES.has(file.mimetype)) cb(null, true);
  else cb(new Error("Only image files are allowed"), false);
}

function pdfFileFilter(_req, file, cb) {
  if (file.mimetype === "application/pdf") cb(null, true);
  else cb(new Error("Only PDF files are allowed"), false);
}

function audioFileFilter(_req, file, cb) {
  if (AUDIO_MIMES.has(file.mimetype)) cb(null, true);
  else cb(new Error("Only audio files are allowed"), false);
}

export function createAudioUploader(relativeDirFromProjectRoot, options = {}) {
  const fieldName = options.fieldName ?? "audio";
  const maxFileSize = options.maxFileSize ?? MAX_AUDIO_BYTES;
  const titleField = options.titleField ?? "title";
  return multer({
    storage: diskStorage(relativeDirFromProjectRoot, { titleField }),
    fileFilter: audioFileFilter,
    limits: { fileSize: maxFileSize },
  }).single(fieldName);
}

export function createImageUploader(relativeDirFromProjectRoot, options = {}) {
  const fieldName = options.fieldName ?? "images";
  const maxCount = options.maxCount ?? 10;
  const maxFileSize = options.maxFileSize ?? MAX_IMAGE_BYTES;
  const titleField = options.titleField ?? "title";
  return multer({
    storage: diskStorage(relativeDirFromProjectRoot, { titleField }),
    fileFilter: imageFileFilter,
    limits: { fileSize: maxFileSize },
  }).array(fieldName, maxCount);
}

export function createPdfUploader(relativeDirFromProjectRoot, options = {}) {
  const fieldName = options.fieldName ?? "pdf";
  const maxFileSize = options.maxFileSize ?? MAX_PDF_BYTES;
  const titleField = options.titleField ?? "title";
  return multer({
    storage: diskStorage(relativeDirFromProjectRoot, { titleField }),
    fileFilter: pdfFileFilter,
    limits: { fileSize: maxFileSize },
  }).single(fieldName);
}

export function createMixedFieldUploader(fieldDefs, uploaderOptions = {}) {
  const map = new Map(fieldDefs.map((d) => [d.name, d]));
  const titleField = uploaderOptions.titleField ?? "title";
  const storage = multer.diskStorage({
    destination(_req, file, cb) {
      const def = map.get(file.fieldname);
      if (!def) {
        cb(new Error("Unexpected field"), null);
        return;
      }
      const abs = absFromRelativeDir(def.relativeDir);
      ensureDir(abs);
      cb(null, abs);
    },
    filename(req, file, cb) {
      cb(null, filenameFromRequest(req, file, { titleField }));
    },
  });

  const fileFilter = (_req, file, cb) => {
    const def = map.get(file.fieldname);
    if (!def) {
      cb(new Error("Unexpected field"), false);
      return;
    }
    if (def.kind === "image") imageFileFilter(_req, file, cb);
    else if (def.kind === "pdf") pdfFileFilter(_req, file, cb);
    else cb(new Error("Unknown field kind"), false);
  };

  const maxFileSize = Math.max(
    ...fieldDefs.map((d) =>
      d.kind === "pdf" ? (d.maxFileSize ?? MAX_PDF_BYTES) : (d.maxFileSize ?? MAX_IMAGE_BYTES),
    ),
  );

  const fields = fieldDefs.map((d) => ({ name: d.name, maxCount: d.maxCount }));
  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxFileSize },
  }).fields(fields);
}

export function relativeDataPathFromPublicUrl(storedUrl) {
  if (!storedUrl || typeof storedUrl !== "string") return null;
  const prefix = `${FILES_PUBLIC_PREFIX}/`;
  if (!storedUrl.startsWith(prefix)) return null;
  let rel = storedUrl.slice(prefix.length);
  if (rel.includes("..") || path.isAbsolute(rel)) return null;
  rel = path.normalize(rel).replace(/^(\.\.(\/|\\|$))+/, "");
  if (rel.startsWith("..")) return null;
  return rel.split(path.sep).join("/");
}

export function absolutePathUnderDataFromPublicUrl(storedUrl) {
  const rel = relativeDataPathFromPublicUrl(storedUrl);
  if (!rel) return null;
  const dataRoot = path.resolve(process.cwd(), "data");
  const abs = path.resolve(dataRoot, rel);
  if (!abs.startsWith(dataRoot + path.sep) && abs !== dataRoot) return null;
  return abs;
}
