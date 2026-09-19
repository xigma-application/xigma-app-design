// utils
import { clamp } from 'utils/math/clamp';

export const getStrokeDynamicValueFromInput = (input: string, min: number, max = Infinity): number | undefined => {
  const raw = input.replace('%', '').trim();
  const value = Number(raw);

  if (raw !== '' && Number.isFinite(value)) {
    return Math.round(clamp(value, min, max) * 100) / 100;
  }
};
