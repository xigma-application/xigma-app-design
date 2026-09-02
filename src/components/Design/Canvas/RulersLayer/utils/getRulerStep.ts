// others
import { RULER_NICE_STEP_MULTIPLIERS, RULER_TICK_TARGET_SPACING_PX } from '../constants';

export const getRulerStep = (zoom: number): number => {
  const targetWorld = RULER_TICK_TARGET_SPACING_PX / zoom;
  const magnitude = 10 ** Math.floor(Math.log10(targetWorld));
  const normalized = targetWorld / magnitude;
  const multiplier = RULER_NICE_STEP_MULTIPLIERS.find((value) => normalized <= value) ?? 10;

  return multiplier * magnitude;
};
