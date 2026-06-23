export function minutes(value: number) {
  return value * 60 * 1000;
}

export function hours(value: number) {
  return value * 60 * 60 * 1000;
}

export function days(value: number) {
  return value * 24 * 60 * 60 * 1000;
}

export function isExpired(date: Date) {
  return Date.now() > date.getTime();
}

export function discordTimestamp(date: Date, style: "t" | "T" | "d" | "D" | "f" | "F" | "R" = "F") {
  return `<t:${Math.floor(date.getTime() / 1000)}:${style}>`;
}