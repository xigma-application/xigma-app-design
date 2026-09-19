// utils
import { getDashedRingPolygons } from '../getDashedRingPolygons';
import { getUniformRingPolygons } from '../getUniformRingPolygons';
import { rect } from './nodeFixture';

describe('getDashedRingPolygons', () => {
  it('should cut the ring into one polygon per dash', () => {
    // action
    const polygons = getDashedRingPolygons(rect(), [10, 10]);

    // result
    expect(polygons.length).toBeGreaterThan(2);
  });

  it('should keep the plain ring when the pattern cannot be cut', () => {
    // before
    const node = rect();

    // result
    expect(getDashedRingPolygons(node, null)).toEqual(getUniformRingPolygons(node));
  });
});
