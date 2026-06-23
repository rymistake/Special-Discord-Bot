export function parseDuration(input: string) {
  const match = input.trim().toLowerCase().match(/^(\d+)(m|h|d)$/);

  if (!match) {
    throw new Error("Invalid duration. Use formats like `30m`, `2h`, or `7d`.");
  }

  const amount = Number(match[1]);
  const unit = match[2];

  if (amount <= 0) {
    throw new Error("Duration must be greater than 0.");
  }

  const multipliers = {
    m: 60_000,
    h: 60 * 60_000,
    d: 24 * 60 * 60_000,
  };

  return amount * multipliers[unit as "m" | "h" | "d"];
}

export function formatDuration(ms: number) {
  const minutes = Math.floor(ms / 60_000);

  if (minutes < 60) return `${minutes} minute(s)`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour(s)`;

  const days = Math.floor(hours / 24);
  return `${days} day(s)`;
}