export function parsePagination(query, { maxTake = 200, defaultTake = 50 } = {}) {
  const skip = Math.max(0, Number.parseInt(query.skip ?? "0", 10) || 0);
  const takeRaw = Number.parseInt(query.take ?? String(defaultTake), 10) || defaultTake;
  const take = Math.max(1, Math.min(maxTake, takeRaw));
  return { skip, take };
}