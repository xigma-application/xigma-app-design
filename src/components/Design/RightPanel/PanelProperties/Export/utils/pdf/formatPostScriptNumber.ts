export const formatPostScriptNumber = (value: number): string => {
  if (!Number.isFinite(value)) {
    return '0';
  }

  return String(Math.round(value * 1e6) / 1e6);
};
