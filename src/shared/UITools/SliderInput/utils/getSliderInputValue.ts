export const getSliderInputValue = (input: string, min: number, max: number): number | undefined => {
  const raw = input.trim();
  const value = Number(raw);

  if (raw !== '' && Number.isFinite(value)) {
    return Math.round(Math.min(Math.max(value, min), max) * 100) / 100;
  }
};
