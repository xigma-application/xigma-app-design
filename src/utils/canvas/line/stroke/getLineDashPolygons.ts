// others
import { STROKE_DASH_MAX_COUNT } from 'constant/strokeDash';

// types
import { StrokeDashCap } from 'types/design/enums';
import { TLineFrame } from '../types';
import { TPoint } from 'types/canvas';

// utils
import { getLineDashPolygon } from './getLineDashPolygon';

export const getLineDashPolygons = (frame: TLineFrame, pattern: number[], cap: StrokeDashCap): TPoint[][] | null => {
  const patternLength = pattern.reduce((total, length) => total + length, 0);

  if ((frame.length / patternLength) * (pattern.length / 2) <= STROKE_DASH_MAX_COUNT) {
    const polygons: TPoint[][] = [];
    let position = 0;
    let index = 0;

    while (position < frame.length) {
      const length = pattern[index % pattern.length];

      if (index % 2 === 0 && length > 0) {
        polygons.push(getLineDashPolygon(frame, position, Math.min(position + length, frame.length), cap));
      }

      position += length;
      index += 1;
    }

    return polygons;
  }

  return null;
};
