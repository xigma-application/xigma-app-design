// utils
import { getBoundingBox } from '../getBoundingBox';

describe('getBoundingBox', () => {
  it('should compute the min/max extents across every point', () => {
    const box = getBoundingBox([
      { x: 0, y: 5 },
      { x: 10, y: -5 },
      { x: 5, y: 20 },
    ]);

    expect(box).toEqual({ maxX: 10, maxY: 20, minX: 0, minY: -5 });
  });

  it('should collapse to a single point for one input point', () => {
    expect(getBoundingBox([{ x: 3, y: 4 }])).toEqual({ maxX: 3, maxY: 4, minX: 3, minY: 4 });
  });
});
