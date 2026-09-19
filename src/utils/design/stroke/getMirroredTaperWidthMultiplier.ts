const MIRRORED_TAPER_TRANSITION_SPAN = 0.25;
const MIRRORED_TAPER_END_WIDTH_MULTIPLIER = 0.6;
const MIRRORED_TAPER_RISE = 1 - MIRRORED_TAPER_END_WIDTH_MULTIPLIER;

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

const smoothstep = (value: number): number => {
  const clamped = clamp01(value);
  return clamped * clamped * (3 - 2 * clamped);
};

export const getMirroredTaperWidthMultiplier = (position: number): number => {
  const distanceFromSeam = Math.min(position, 1 - position);
  const t = distanceFromSeam / MIRRORED_TAPER_TRANSITION_SPAN;

  return MIRRORED_TAPER_END_WIDTH_MULTIPLIER + smoothstep(t) * MIRRORED_TAPER_RISE;
};
