export const getSpacingBlurValue = (raw: string): number | null => {
  const value = Number(raw.trim());
  return raw.trim() !== '' && Number.isFinite(value) ? value : null;
};
