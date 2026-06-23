export function parseRankValues(input: string | null) {
  if (!input) {
    return [];
  }

  const ranks = input
    .split(",")
    .map(value => value.trim())
    .filter(Boolean)
    .map(value => Number(value));

  const invalid = ranks.find(rank => {
    return Number.isNaN(rank) || rank < 0 || rank > 255;
  });

  if (invalid !== undefined) {
    throw new Error(
      `Invalid rank value "${invalid}". Rank values must be between 0 and 255.`
    );
  }

  return [...new Set(ranks)];
}