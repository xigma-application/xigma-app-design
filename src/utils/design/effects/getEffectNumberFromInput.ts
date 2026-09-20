// utils
import { clamp } from 'utils/math/clamp';

export const getEffectNumberFromInput = (input: string, min = -Infinity, max = Infinity): number | undefined => {
  const raw = input.trim().replace(/[%°]$/, '').trim();
  const value = Number(raw);

  if (raw !== '' && Number.isFinite(value)) {
    return Math.round(clamp(value, min, max) * 100) / 100;
  }
};
