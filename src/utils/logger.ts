export class Logger {
  static info(message: string, ...data: unknown[]) {
    console.log(`[INFO] ${message}`, ...data);
  }

  static warn(message: string, ...data: unknown[]) {
    console.warn(`[WARN] ${message}`, ...data);
  }

  static error(message: string, error?: unknown) {
    console.error(`[ERROR] ${message}`, error ?? "");
  }

  static debug(message: string, ...data: unknown[]) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[DEBUG] ${message}`, ...data);
    }
  }
}