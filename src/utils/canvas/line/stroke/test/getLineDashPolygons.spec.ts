// types
import { StrokeDashCap } from 'types/design/enums';

// utils
import { getLineDashPolygons } from '../getLineDashPolygons';
import { getLineFrame } from '../getLineFrame';
import { makeLine } from './fixtures';

describe('getLineDashPolygons', () => {
  it('should lay the dashes from the start of the line and cut the last one at its end', () => {
    // before
    const polygons = getLineDashPolygons(getLineFrame(makeLine({ width: 25 })), [10, 5], StrokeDashCap.none) ?? [];

    // result
    expect(polygons.map((polygon) => [polygon[0].x, polygon[1].x])).toEqual([
      [0, 10],
      [15, 25],
    ]);
  });

  it('should skip zero-length dashes', () => {
    // result
    expect(getLineDashPolygons(getLineFrame(makeLine({ width: 10 })), [0, 5], StrokeDashCap.none)).toEqual([]);
  });

  it('should give up on a pattern that would need too many dashes', () => {
    // result
    expect(getLineDashPolygons(getLineFrame(makeLine({ width: 100000 })), [1, 1], StrokeDashCap.none)).toBeNull();
  });
});
