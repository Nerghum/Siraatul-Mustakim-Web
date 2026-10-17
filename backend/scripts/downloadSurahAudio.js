import fs from "fs";
import path from "path";
import https from "https";

const audioDir = path.join(process.cwd(), "data", "quran", "audio", "surah");

function downloadFile(url, dest, redirectsLeft = 3) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
      // Already downloaded
      return resolve(false);
    }

    if (redirectsLeft <= 0) {
      return reject(new Error("Too many redirects"));
    }

    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location) {
        return downloadFile(res.headers.location, dest, redirectsLeft - 1)
          .then(resolve)
          .catch(reject);
      }

      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode}`));
      }

      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close();
        resolve(true);
      });
      fileStream.on("error", (err) => {
        fileStream.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(err);
      });
    }).on("error", (err) => {
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

export async function downloadAllSurahAudio(onProgress) {
  fs.mkdirSync(audioDir, { recursive: true });
  console.log("Starting Surah Audio Download into local storage:", audioDir);

  const total = 114;
  let downloadedCount = 0;
  const batchSize = 4;

  for (let i = 1; i <= total; i += batchSize) {
    const batch = [];
    for (let j = i; j < i + batchSize && j <= total; j++) {
      batch.push(j);
    }

    await Promise.all(
      batch.map(async (surahNum) => {
        const dest = path.join(audioDir, `${surahNum}.mp3`);
        const url = `https://download.quranicaudio.com/qdc/mishari_al_afasy/murattal/${surahNum}.mp3`;
        try {
          const wasDownloaded = await downloadFile(url, dest);
          downloadedCount++;
          if (wasDownloaded) {
            console.log(`[${downloadedCount}/${total}] Downloaded Surah ${surahNum}.mp3`);
          } else {
            console.log(`[${downloadedCount}/${total}] Surah ${surahNum}.mp3 already cached.`);
          }
          if (onProgress) onProgress(downloadedCount, total);
        } catch (err) {
          console.error(`Error downloading Surah ${surahNum}:`, err.message);
        }
      })
    );
  }

  console.log("\nAll Surah audio downloaded to storage successfully!");
}

if (process.argv[1]?.endsWith("downloadSurahAudio.js")) {
  downloadAllSurahAudio()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Audio download error:", err);
      process.exit(1);
    });
}
