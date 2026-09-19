export const getStrokeDashesFromInput = (input: string): number[] | undefined => {
  const parts = input.split(/[\s,;]+/).filter((part) => part !== '');
  const dashes = parts.map(Number);

  if (dashes.length > 0 && dashes.every((length) => Number.isFinite(length) && length >= 0) && dashes.some((length) => length > 0)) {
    return dashes.map((length) => Math.round(length * 100) / 100);
  }
};
