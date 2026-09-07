export const clampAutoLayoutSize = (value: number, min: number | undefined, max: number | undefined): number => {
  const effectiveMax = max !== undefined && min !== undefined ? Math.max(max, min) : max;
  const withMin = min !== undefined ? Math.max(value, min) : value;

  return effectiveMax !== undefined ? Math.min(withMin, effectiveMax) : withMin;
};
