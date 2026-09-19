// others
import { SMOOTH_RADIUS } from './constants';

export const smoothValues = (values: number[]): number[] =>
  values.map((_, index) => {
    const from = Math.max(0, index - SMOOTH_RADIUS);
    const to = Math.min(values.length - 1, index + SMOOTH_RADIUS);
    let sum = 0;

    for (let cursor = from; cursor <= to; cursor += 1) {
      sum += values[cursor];
    }

    return sum / (to - from + 1);
  });
