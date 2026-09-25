// types
import { StrokeDashCap } from 'types/design/enums';

// utils
import { getLineDashPolygon } from '../getLineDashPolygon';
import { getLineFrame } from '../getLineFrame';
import { makeLine } from './fixtures';

const frame = getLineFrame(makeLine());

describe('getLineDashPolygon', () => {
  it('should draw a flat dash as a band between its ends', () => {
    // result
    expect(getLineDashPolygon(frame, 10, 20, StrokeDashCap.none)).toEqual([
      { x: 10, y: -2 },
      { x: 20, y: -2 },
      { x: 20, y: 2 },
      { x: 10, y: 2 },
    ]);
  });

  it('should stretch a square dash by half the stroke width at both ends', () => {
    // result
    expect(getLineDashPolygon(frame, 10, 20, StrokeDashCap.square)).toEqual([
      { x: 8, y: -2 },
      { x: 22, y: -2 },
      { x: 22, y: 2 },
      { x: 8, y: 2 },
    ]);
  });

  it('should round a round dash off with a half circle at both ends', () => {
    // before
    const polygon = getLineDashPolygon(frame, 10, 20, StrokeDashCap.round);

    // result
    expect(polygon).toHaveLength(18);
    expect(Math.max(...polygon.map((point) => point.x))).toBeCloseTo(22, 5);
    expect(Math.min(...polygon.map((point) => point.x))).toBeCloseTo(8, 5);
  });
});
