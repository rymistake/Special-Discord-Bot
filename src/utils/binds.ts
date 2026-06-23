export function normalizePrefix(prefix: string | null) {
  if (!prefix) {
    return null;
  }

  const cleaned = prefix.trim();

  return cleaned.length ? cleaned : null;
}

export function buildNickname(
  robloxUsername: string,
  prefix: string | null,
  nicknameMode: "prefix" | "suffix" | "none"
) {
  if (!prefix || nicknameMode === "none") {
    return robloxUsername;
  }

  if (nicknameMode === "suffix") {
    return `${robloxUsername} | ${prefix}`;
  }

  return `${prefix} | ${robloxUsername}`;
}