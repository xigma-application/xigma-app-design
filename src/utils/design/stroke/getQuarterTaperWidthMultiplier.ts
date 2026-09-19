const QUARTER_TAPER_RISE_SPAN = 0.15;
const QUARTER_TAPER_FLAT_START = 0.75;
const QUARTER_TAPER_END_WIDTH_MULTIPLIER = 0.6;
const QUARTER_TAPER_DROP = 1 - QUARTER_TAPER_END_WIDTH_MULTIPLIER;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const smoothstep = (value: number): number => {
  const clamped = clamp01(value);

  return clamped * clamped * (3 - 2 * clamped);
};

export const getQuarterTaperWidthMultiplier = (loopPosition: number, flipped: boolean): number => {
  const position = flipped ? 1 - loopPosition : loopPosition;

  if (position < QUARTER_TAPER_RISE_SPAN) {
    const t = position / QUARTER_TAPER_RISE_SPAN;
    return QUARTER_TAPER_END_WIDTH_MULTIPLIER + smoothstep(t) * QUARTER_TAPER_DROP;
  }

  if (position >= QUARTER_TAPER_FLAT_START) {
    const t = (position - QUARTER_TAPER_FLAT_START) / (1 - QUARTER_TAPER_FLAT_START);
    return 1 - smoothstep(t) * QUARTER_TAPER_DROP;
  }

  return 1;
};
