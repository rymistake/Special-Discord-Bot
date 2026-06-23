export function isValidDiscordId(id: string) {
  return /^\d{17,20}$/.test(id);
}

export function isValidRobloxId(id: number) {
  return Number.isInteger(id) && id > 0;
}

export function isValidRobloxGroupId(id: number) {
  return Number.isInteger(id) && id > 0;
}

export function isValidRankValue(rank: number) {
  return Number.isInteger(rank) && rank >= 0 && rank <= 255;
}

export function isValidPurgeAmount(amount: number) {
  return Number.isInteger(amount) && amount >= 1 && amount <= 100;
}