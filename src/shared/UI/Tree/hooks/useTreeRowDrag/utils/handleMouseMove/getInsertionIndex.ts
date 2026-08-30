// utils
import { clamp } from 'utils/math/clamp';

export const getInsertionIndex = (pointerY: number, containerTop: number, scrollTop: number, rowHeight: number, count: number): number => {
  const rawIndex = Math.round((pointerY - containerTop + scrollTop) / rowHeight);

  return clamp(rawIndex, 0, count);
};
