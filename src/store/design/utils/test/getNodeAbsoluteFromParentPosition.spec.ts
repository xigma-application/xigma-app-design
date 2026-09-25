// utils
import { getNodeAbsoluteFromParentPosition } from '../getNodeAbsoluteFromParentPosition';

describe('getNodeAbsoluteFromParentPosition', () => {
  it('should offset a local point by the parent origin when the parent is not rotated', () => {
    // result
    expect(getNodeAbsoluteFromParentPosition({ x: 5, y: 10 }, { height: 100, rotation: 0, width: 100, x: 20, y: 30 })).toEqual({
      x: 25,
      y: 40,
    });
  });

  it('should rotate the offset point around the parent center', () => {
    // before
    const point = getNodeAbsoluteFromParentPosition({ x: 0, y: 0 }, { height: 100, rotation: 90, width: 100, x: 0, y: 0 });

    // result
    expect(point.x).toBeCloseTo(100);
    expect(point.y).toBeCloseTo(0);
  });
});
