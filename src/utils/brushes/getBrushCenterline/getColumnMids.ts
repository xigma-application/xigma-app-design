// types
import { TBrushAlpha } from '../types';

// others
import { OPAQUE } from './constants';

export const getColumnMids = (alpha: TBrushAlpha): (number | null)[] =>
  Array.from({ length: alpha.width }, (_, x) => {
    let top = -1;
    let bottom = -1;

    for (let y = 0; y < alpha.height; y += 1) {
      if (alpha.data[y * alpha.width + x] > OPAQUE) {
        top = top === -1 ? y : top;
        bottom = y;
      }
    }

    return top === -1 ? null : (top + bottom) / 2;
  });
