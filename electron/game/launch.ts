import { BrowserWindow } from "electron";
import { checkGameInstallation } from "./check";
import { join, dirname } from "path";
import { exec } from "child_process";
import fs from "fs";

export function launchGame(
  baseDir: string,
  username: string,
  win: BrowserWindow,
  releaseType = "latest"
) {
  const { client, server, jre } = checkGameInstallation(baseDir, releaseType);
  if (!client || !server || !jre) throw new Error("Game not installed");

  const userDir = join(baseDir, "UserData");
  if (!fs.existsSync(userDir)) fs.mkdirSync(userDir);

  const args = [
    "--app-dir",
    join(dirname(client), ".."),
    "--user-dir",
    userDir,
    "--java-exec",
    jre,
    "--auth-mode offline",
    "--uuid 00000000-0000-0000-0000-000000000000",
    "--name",
    username,
  ];

  exec(`"${client}" ${args.join(" ")}`, (error, stdout) => {
    if (error) {
      console.error(`Error launching game: ${error.message}`);
      return;
    }
    console.log(`Game launched successfully: ${stdout}`);
    win.webContents.send("launched");
  });
}
