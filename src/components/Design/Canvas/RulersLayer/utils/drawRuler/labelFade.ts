const FADE_START_STEPS = 1.5;
const FADE_END_STEPS = 0.375;

export const labelFade = (distancePx: number, stepPx: number): number | null => {
  const fadeEnd = stepPx * FADE_END_STEPS;
  const fadeStart = stepPx * FADE_START_STEPS;

  if (distancePx <= fadeEnd) {
    return null;
  }

  return distancePx >= fadeStart ? 1 : (distancePx - fadeEnd) / (fadeStart - fadeEnd);
};
