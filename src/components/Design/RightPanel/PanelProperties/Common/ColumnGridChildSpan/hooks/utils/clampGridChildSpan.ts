export const clampGridChildSpan = (raw: string, max: number): number | null => {
  const parsed = parseInt(raw, 10);

  if (Number.isNaN(parsed) || parsed < 1 || parsed > max) {
    return null;
  }

  return parsed;
};
