import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseDir = path.resolve(__dirname, "../data/quran/audio");
const surahsJsonPath = path.resolve(__dirname, "../data/quran/surahs.json");

const RECITERS = [
  "Alafasy_128kbps",
  "Abu_Bakr_Ash-Shaatree_128kbps",
  "Abdurrahmaan_As-Sudais_192kbps",
];

function downloadFile(url, dest, redirectsLeft = 3) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      try {
        const stats = fs.statSync(dest);
        if (stats.size > 2000) {
          return resolve({ skipped: true, size: stats.size });
        }
      } catch {
        // file unreadable, proceed to download
      }
    }

    if (redirectsLeft <= 0) {
      return reject(new Error("Too many redirects"));
    }

    const client = url.startsWith("https") ? https : http;
    const req = client.get(url, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        return downloadFile(res.headers.location, dest, redirectsLeft - 1)
          .then(resolve)
          .catch(reject);
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} from ${url}`));
      }

      const dir = path.dirname(dest);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const tempDest = `${dest}.part`;
      const fileStream = fs.createWriteStream(tempDest);
      res.pipe(fileStream);

      fileStream.on("finish", () => {
        fileStream.close(() => {
          fs.renameSync(tempDest, dest);
          resolve({ skipped: false, size: fs.statSync(dest).size });
        });
      });

      fileStream.on("error", (err) => {
        fileStream.close();
        if (fs.existsSync(tempDest)) fs.unlinkSync(tempDest);
        reject(err);
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.setTimeout(30000, () => {
      req.destroy(new Error("Request timed out"));
    });
  });
}

async function runQueue(tasks, concurrency = 8, onProgress) {
  let index = 0;
  let completed = 0;
  const total = tasks.length;

  async function worker() {
    while (index < tasks.length) {
      const taskIndex = index++;
      const task = tasks[taskIndex];
      try {
        const res = await downloadFile(task.url, task.dest);
        completed++;
        if (onProgress) onProgress(completed, total, task, res);
      } catch (err) {
        completed++;
        console.error(`[Error] Failed ${task.dest}: ${err.message}`);
        if (onProgress) onProgress(completed, total, task, { error: err.message });
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
}

export async function downloadAllQuranAudio() {
  console.log("=== Complete Quran Audio Bulk Downloader ===");
  console.log("Storage Directory:", baseDir);

  const rawSurahs = JSON.parse(fs.readFileSync(surahsJsonPath, "utf8"));
  const tasks = [];

  // 1. Full Surah recitation tracks (Mishari Murattal)
  const surahDir = path.join(baseDir, "surah");
  fs.mkdirSync(surahDir, { recursive: true });
  for (let s = 1; s <= 114; s++) {
    tasks.push({
      type: "surah",
      surah: s,
      dest: path.join(surahDir, `${s}.mp3`),
      url: `https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/${s}.mp3`,
    });
  }

  // 2. Verse audio for all 3 reciters (6,236 ayahs each)
  for (const reciter of RECITERS) {
    const reciterDir = path.join(baseDir, reciter);
    fs.mkdirSync(reciterDir, { recursive: true });

    for (const surah of rawSurahs) {
      const sNum = surah.number;
      const count = surah.ayahCount;
      const sPad = String(sNum).padStart(3, "0");

      for (let a = 1; a <= count; a++) {
        const aPad = String(a).padStart(3, "0");
        const filename = `${sPad}${aPad}.mp3`;
        tasks.push({
          type: "verse",
          reciter,
          surah: sNum,
          ayah: a,
          dest: path.join(reciterDir, filename),
          url: `https://everyayah.com/data/${reciter}/${filename}`,
        });
      }
    }
  }

  const totalFiles = tasks.length;
  console.log(`Total audio files to verify/download: ${totalFiles} across 3 voices + Surah recitations`);

  let lastLogTime = Date.now();
  let downloadedCount = 0;
  let cachedCount = 0;

  await runQueue(tasks, 10, (done, total, task, result) => {
    if (result?.skipped) {
      cachedCount++;
    } else if (!result?.error) {
      downloadedCount++;
    }

    const now = Date.now();
    if (now - lastLogTime >= 3000 || done === total) {
      lastLogTime = now;
      const pct = ((done / total) * 100).toFixed(1);
      console.log(`Progress: ${done}/${total} (${pct}%) | New: ${downloadedCount} | Cached: ${cachedCount}`);
    }
  });

  console.log("\nDownload complete!");
  console.log(`Total processed: ${totalFiles} (Downloaded: ${downloadedCount}, Previously Cached: ${cachedCount})`);
}

if (process.argv[1]?.endsWith("downloadCompleteQuranAudio.js")) {
  downloadAllQuranAudio()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Fatal error:", err);
      process.exit(1);
    });
}
