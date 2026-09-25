// utils
import { getEllipseArcCornerIndices } from '../getEllipseArcCornerIndices';

describe('getEllipseArcCornerIndices', () => {
  it('should mark the centre and both arc ends of a pie', () => {
    // result
    expect(getEllipseArcCornerIndices(10, false)).toEqual([0, 1, 9]);
  });

  it('should mark both ends of the outer and inner arcs of a ring segment', () => {
    // result
    expect(getEllipseArcCornerIndices(10, true)).toEqual([0, 4, 5, 9]);
  });
});
