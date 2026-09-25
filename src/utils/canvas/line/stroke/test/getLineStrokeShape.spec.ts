// types
import { StrokeAlign, StrokeProfile } from 'types/design/enums';

// utils
import { getLineStrokeShape } from '../getLineStrokeShape';
import { makeLine } from './fixtures';

const getYs = (line: ReturnType<typeof makeLine>): number[] => (getLineStrokeShape(line)?.polygons.flat() ?? []).map((point) => point.y);

describe('getLineStrokeShape', () => {
  it('should draw a plain stroke as the regular outline, moved to the side for an inside stroke', () => {
    // mock
    const inside = makeLine({ strokeAlign: StrokeAlign.inside });

    // result
    expect(getLineStrokeShape(makeLine())?.fillRule).toBe('evenOdd');
    expect(Math.min(...getYs(inside))).toBeCloseTo(-4, 5);
    expect(Math.max(...getYs(inside))).toBeCloseTo(0, 5);
  });

  it('should move a width profile to the side for an outside stroke too', () => {
    // mock
    const outside = makeLine({ strokeAlign: StrokeAlign.outside, strokeProfile: StrokeProfile.taper });

    // result
    expect(Math.min(...getYs(outside))).toBeGreaterThanOrEqual(-1e-9);
  });

  it('should reuse the shape for the same line and draw nothing for a zero-length one', () => {
    // mock
    const line = makeLine();

    // result
    expect(getLineStrokeShape(line)).toBe(getLineStrokeShape(line));
    expect(getLineStrokeShape(makeLine({ width: 0 }))).toBeNull();
  });
});
