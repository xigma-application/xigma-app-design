// utils
import { clamp } from 'utils/math/clamp';

export const getEffectNumberFromInput = (input: string, min = -Infinity): number | undefined => {
  const raw = input.trim();
  const value = Number(raw);

  if (raw !== '' && Number.isFinite(value)) {
    return Math.round(clamp(value, min, Infinity) * 100) / 100;
  }
};
