import { NextRequest } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const POSSIBLE_AUDIO_DIRS = [
  path.resolve(process.cwd(), "..", "backend", "data", "quran", "audio"),
  path.resolve(process.cwd(), "backend", "data", "quran", "audio"),
  path.resolve(process.cwd(), "data", "quran", "audio"),
  path.resolve(process.cwd(), "..", "data", "quran", "audio"),
];

function findLocalAudioFile(reciter: string, file: string): string | null {
  const cleanReciter = path.basename(reciter);
  const cleanFile = path.basename(file);

  for (const baseDir of POSSIBLE_AUDIO_DIRS) {
    const candidate = path.join(baseDir, cleanReciter, cleanFile);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  if (!slug || slug.length < 2) {
    return new Response("Invalid audio path", { status: 400 });
  }

  const reciter = path.basename(slug[0]);
  const file = path.basename(slug.slice(1).join("/"));

  // 1. Try local downloaded storage first
  const localFile = findLocalAudioFile(reciter, file);
  if (localFile) {
    try {
      const stat = fs.statSync(localFile);
      const totalSize = stat.size;
      const range = request.headers.get("range");

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

        if (start >= totalSize || end >= totalSize) {
          return new Response("Range Not Satisfiable", {
            status: 416,
            headers: { "Content-Range": `bytes */${totalSize}` },
          });
        }

        const chunksize = end - start + 1;
        const fileStream = fs.createReadStream(localFile, { start, end });
        const webStream = Readable.toWeb(fileStream) as ReadableStream;

        return new Response(webStream, {
          status: 206,
          headers: {
            "Content-Range": `bytes ${start}-${end}/${totalSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": String(chunksize),
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      const fileStream = fs.createReadStream(localFile);
      const webStream = Readable.toWeb(fileStream) as ReadableStream;

      return new Response(webStream, {
        status: 200,
        headers: {
          "Accept-Ranges": "bytes",
          "Content-Length": String(totalSize),
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err) {
      console.error("Error reading local audio file:", err);
    }
  }

  // 2. Try proxying to local backend if running
  try {
    const backendUrl = `http://localhost:5001/api/quran/audio/${reciter}/${file}`;
    const rangeHeader = request.headers.get("range");
    const headers: HeadersInit = {};
    if (rangeHeader) headers["range"] = rangeHeader;

    const backendRes = await fetch(backendUrl, { headers, cache: "no-store" });
    if (backendRes.ok || backendRes.status === 206) {
      return new Response(backendRes.body, {
        status: backendRes.status,
        headers: {
          "Content-Type": backendRes.headers.get("content-type") || "audio/mpeg",
          "Content-Range": backendRes.headers.get("content-range") || "",
          "Content-Length": backendRes.headers.get("content-length") || "",
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=31536000, immutable",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  } catch (_err) {
    // Local backend might be offline, continue to CDN fallback
  }

  // 3. Fallback to authoritative online CDN (EveryAyah / QuranicAudio)
  try {
    const remoteUrl =
      reciter === "surah"
        ? `https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/${file}`
        : `https://everyayah.com/data/${reciter}/${file}`;

    const rangeHeader = request.headers.get("range");
    const headers: HeadersInit = {};
    if (rangeHeader) headers["range"] = rangeHeader;

    const remoteRes = await fetch(remoteUrl, { headers });
    if (remoteRes.ok || remoteRes.status === 206) {
      return new Response(remoteRes.body, {
        status: remoteRes.status,
        headers: {
          "Content-Type": remoteRes.headers.get("content-type") || "audio/mpeg",
          "Content-Range": remoteRes.headers.get("content-range") || "",
          "Content-Length": remoteRes.headers.get("content-length") || "",
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=31536000, immutable",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  } catch (err) {
    console.error("Remote audio fallback failed:", err);
  }

  return new Response("Audio not found", { status: 404 });
}
