// utils
import { clamp } from 'utils/math/clamp';

export const getPositionFromClientX = (clientX: number, bar: HTMLDivElement): number => {
  const rect = bar.getBoundingClientRect();

  return clamp((clientX - rect.left) / rect.width, 0, 1);
};
