// others
import { STROKE_DASH_MAX_COUNT } from 'constant/strokeDash';

// types
import { StrokeDashCap } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TStrokeRing } from 'components/Design/Canvas/hooks/useCanvasRenderLoop/utils/drawScene/types';

// utils
import { getOpenPathDashPolygon } from './getOpenPathDashPolygon';

export const getOpenPathDashPolygons = (ring: TStrokeRing, pattern: number[], cap: StrokeDashCap, halfWidth: number): TPoint[][] | null => {
  const patternLength = pattern.reduce((total, length) => total + length, 0);

  if ((ring.perimeter / patternLength) * (pattern.length / 2) <= STROKE_DASH_MAX_COUNT) {
    const polygons: TPoint[][] = [];
    let position = 0;
    let index = 0;

    while (position < ring.perimeter) {
      const length = pattern[index % pattern.length];

      if (index % 2 === 0 && length > 0) {
        polygons.push(getOpenPathDashPolygon(ring, position, Math.min(position + length, ring.perimeter), cap, halfWidth));
      }

      position += length;
      index += 1;
    }

    return polygons;
  }

  return null;
};
