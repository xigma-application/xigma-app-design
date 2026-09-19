const TAPER_END_WIDTH_MULTIPLIER = 0.5;
const TAPER_DROP = 1 - TAPER_END_WIDTH_MULTIPLIER;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const smoothstep = (value: number): number => {
  const clamped = clamp01(value);
  return clamped * clamped * (3 - 2 * clamped);
};

export const getTaperWidthMultiplier = (loopPosition: number, flipped: boolean): number => {
  const position = flipped ? 1 - loopPosition : loopPosition;
  return 1 - smoothstep(position) * TAPER_DROP;
};
