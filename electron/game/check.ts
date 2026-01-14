import fs from "fs";
import path from "path";

export function checkGameInstallation(baseDir: string, releaseType = "latest") {
  const os = process.platform;

  const clientExec = path.join(baseDir, "game", releaseType, "Client", os === "win32" ? "HytaleClient.exe" : "HytaleClient");
  const serverExec = path.join(baseDir, "game", releaseType, "Server", "HytaleServer.jar");
  const jreExec = path.join(baseDir, "jre", "latest", "bin", os === "win32" ? "java.exe" : "java");

  const client = fs.existsSync(clientExec);
  const server = fs.existsSync(serverExec);
  const jre = fs.existsSync(jreExec);

  return {
    client: client ? clientExec : undefined,
    server: server ? serverExec : undefined,
    jre: jre ? jreExec : undefined,
  };
}
