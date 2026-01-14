import { BrowserWindow } from "electron";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import stream from "stream";
import extract from "extract-zip";

const pipeline = promisify(stream.pipeline);

const API_URL = import.meta.env.VITE_DOWNLOADS_API_URL;

async function getLatestUrl() {
  const response = await fetch(API_URL);
  const data = await response.json();
  if (process.platform === "win32" && data.releases.windows) {
    return data.releases.windows.latest.file.url;
  } else if (process.platform === "linux" && data.releases.linux) {
    return data.releases.linux.latest.file.url;
  }

  throw new Error("No latest version found");
}

export async function downloadGame(gameDir: string, win: BrowserWindow) {
  const zipPath = path.join(gameDir, "temp_game.zip");

  try {
    const url = await getLatestUrl();

    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Failed to download: ${response.statusText}`);
    if (!response.body) throw new Error("No response body");

    const contentLength = response.headers.get("content-length");
    const totalLength = contentLength ? parseInt(contentLength, 10) : 0;
    let downloadedLength = 0;

    const progressStream = new stream.PassThrough();
    progressStream.on("data", (chunk) => {
      downloadedLength += chunk.length;
      if (totalLength > 0) {
        // Download phase: 0% - 50%
        const percentage = (downloadedLength / totalLength) * 50;
        win.webContents.send("install-progress", Math.round(percentage));
      }
    });

    await pipeline(
      // @ts-ignore
      stream.Readable.fromWeb(response.body),
      progressStream,
      fs.createWriteStream(zipPath)
    );

    let extractedEntries = 0;
    await extract(zipPath, {
      dir: gameDir,
      onEntry: (_, zipfile) => {
        extractedEntries++;
        const totalEntries = zipfile.entryCount;
        // Extraction phase: 50% - 100%
        const percentage = 50 + (extractedEntries / totalEntries) * 50;
        win.webContents.send("install-progress", Math.round(percentage));
      },
    });

    win.webContents.send("install-progress", 100);
    win.webContents.send("install-finished");

  } catch (error) {
    console.error("Installation failed:", error);
    win.webContents.send(
      "install-error",
      error instanceof Error ? error.message : "Unknown error"
    );
  } finally {
    if (fs.existsSync(zipPath)) {
      await fs.promises.unlink(zipPath);
    }
  }
}
