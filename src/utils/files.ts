import fs from "fs/promises";
import path from "path";
import os from "os";

export function sanitizeFilename(name: string) {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").slice(0, 100);
}

export function tempFilePath(filename: string) {
  return path.join(os.tmpdir(), sanitizeFilename(filename));
}

export async function deleteFileSafe(filePath: string) {
  try {
    await fs.unlink(filePath);
  } catch {
    // Ignore missing temp files
  }
}