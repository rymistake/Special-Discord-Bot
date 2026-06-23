import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

export async function loadCommands() {
  const commands: any[] = [];

  const commandsPath = path.join(process.cwd(), "dist", "commands");

  function getCommandFiles(dir: string): string[] {
    if (!fs.existsSync(dir)) {
      throw new Error(`Commands folder not found: ${dir}`);
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        files.push(...getCommandFiles(fullPath));
      } else if (entry.name.endsWith(".js")) {
        files.push(fullPath);
      }
    }

    return files;
  }

  const commandFiles = getCommandFiles(commandsPath);

  for (const filePath of commandFiles) {
    const commandModule = await import(pathToFileURL(filePath).href);
    const command = commandModule.default ?? commandModule;

    if (!command.data || !command.execute) {
      console.warn(`[WARN] Skipped invalid command file: ${filePath}`);
      continue;
    }

    commands.push(command);
  }

  return commands;
}
