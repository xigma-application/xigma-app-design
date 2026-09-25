// types
import { StrokeProfile } from 'types/design/enums';

// utils
import { getLineFrame } from '../getLineFrame';
import { getLineProfilePolygon } from '../getLineProfilePolygon';
import { makeLine } from './fixtures';

describe('getLineProfilePolygon', () => {
  it('should narrow a wedge profile to a point at one end of the line', () => {
    // before
    const polygon = getLineProfilePolygon(getLineFrame(makeLine()), StrokeProfile.wedge, false);
    const widths = polygon.slice(0, 65).map((point) => Math.abs(point.y));

    // result
    expect(polygon).toHaveLength(130);
    expect(Math.max(...widths)).toBeCloseTo(2, 5);
    expect(Math.min(...widths)).toBeCloseTo(0, 5);
  });
});
