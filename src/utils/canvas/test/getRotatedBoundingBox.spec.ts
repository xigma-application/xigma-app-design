// utils
import { getRotatedBoundingBox } from '../getRotatedBoundingBox';

describe('getRotatedBoundingBox', () => {
  it('should return the same rect when there is no rotation', () => {
    // result
    expect(getRotatedBoundingBox({ height: 50, width: 100, x: 10, y: 20 }, 0)).toEqual({ height: 50, width: 100, x: 10, y: 20 });
  });

  it('should return the axis-aligned box that encloses every rotated corner', () => {
    // mock — a 100x100 box rotated 45deg around its own center (50, 50); its corners swing out to
    // roughly ±(50*sqrt(2)) from the center, giving a ~141.42x141.42 enclosing box
    const boundingBox = getRotatedBoundingBox({ height: 100, width: 100, x: 0, y: 0 }, 45);

    expect(boundingBox.width).toBeCloseTo(141.42, 1);
    expect(boundingBox.height).toBeCloseTo(141.42, 1);
    expect(boundingBox.x).toBeCloseTo(-20.71, 1);
    expect(boundingBox.y).toBeCloseTo(-20.71, 1);
  });

  it('should swap width and height for a 90deg rotation of a non-square rect', () => {
    // result
    const boundingBox = getRotatedBoundingBox({ height: 50, width: 100, x: 0, y: 0 }, 90);

    expect(boundingBox.width).toBeCloseTo(50);
    expect(boundingBox.height).toBeCloseTo(100);
  });
});
