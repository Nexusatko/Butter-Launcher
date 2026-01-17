import { BrowserWindow } from "electron";
import { checkGameInstallation } from "./check";
import { join, dirname } from "path";
import { spawn } from "child_process";
import fs from "fs";
import { genUUID } from "./uuid";
import { installGame } from "./install";

const ensureExecutable = (filePath: string) => {
  if (process.platform === "win32") return;
  try {
    const st = fs.statSync(filePath);
    // If user execute bit isn't set, try to fix it.
    if ((st.mode & 0o100) === 0) {
      fs.chmodSync(filePath, 0o755);
    }
  } catch {
    // ignore
  }
};

export const launchGame = async (
  baseDir: string,
  version: GameVersion,
  username: string,
  win: BrowserWindow,
  retryCount: number = 0,
  customUUID: string | null = null
) => {
  if (retryCount > 1) {
    const msg = "Failed to launch game (max retries reached)";
    console.error(msg);
    win.webContents.send("launch-error", msg);
    return;
  }

  let { client, server, jre } = checkGameInstallation(baseDir, version);
  if (!client || !server || !jre) {
    console.log("Game not installed, missing:", { client, server, jre });
    const installResult = await installGame(baseDir, version, win);
    if (!installResult) {
      console.error("Game installation failed, retrying...");
      launchGame(baseDir, version, username, win, retryCount + 1, customUUID);
    } else {
      launchGame(baseDir, version, username, win, retryCount, customUUID);
    }
    return;
  }

  const userDir = join(baseDir, "UserData");
  if (!fs.existsSync(userDir)) fs.mkdirSync(userDir);

  const normalizeUuid = (raw: string): string | null => {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    const compact = trimmed.replace(/-/g, "");
    if (/^[0-9a-fA-F]{32}$/.test(compact)) {
      const lower = compact.toLowerCase();
      return `${lower.slice(0, 8)}-${lower.slice(8, 12)}-${lower.slice(12, 16)}-${lower.slice(16, 20)}-${lower.slice(20)}`;
    }

    if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(trimmed)) {
      return trimmed.toLowerCase();
    }

    return null;
  };

  const uuidToUse = customUUID ? normalizeUuid(customUUID) : null;

  const args = [
    "--app-dir",
    join(dirname(client), ".."),
    "--user-dir",
    userDir,
    "--java-exec",
    jre,
    "--auth-mode",
    "offline",
    "--uuid",
    uuidToUse ?? genUUID(username),
    "--name",
    username,
  ];

  const spawnClient = (attempt: number) => {
    try {
      const child = spawn(client, args, {
        windowsHide: true,
        shell: false,
        cwd: dirname(client),
      });

      child.on("spawn", () => {
        win.webContents.send("launched");
      });

      child.on("error", (error: NodeJS.ErrnoException) => {
        // Common on Linux when the downloaded binary loses the executable bit.
        if (error?.code === "EACCES" && attempt === 0) {
          console.warn("Launch EACCES: attempting to chmod +x and retry", client);
          ensureExecutable(client);
          spawnClient(1);
          return;
        }

        console.error(`Error launching game: ${error.message}`);
        win.webContents.send("launch-error", error.message);
      });

      child.on("close", (code, signal) => {
        if (code && code !== 0) {
          console.error(
            `Game exited with code ${code}${signal ? ` (signal ${signal})` : ""}`,
          );
        }
        win.webContents.send("launch-finished", { code, signal });
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error(`Error launching game: ${msg}`);
      win.webContents.send("launch-error", msg);
    }
  };

  // Best-effort: ensure executable bit before the first spawn.
  ensureExecutable(client);
  spawnClient(0);
};
