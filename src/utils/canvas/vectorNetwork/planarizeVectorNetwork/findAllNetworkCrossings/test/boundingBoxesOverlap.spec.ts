// utils
import { boundingBoxesOverlap } from '../boundingBoxesOverlap';

describe('boundingBoxesOverlap', () => {
  it('should be true when two boxes genuinely overlap', () => {
    const a = { maxX: 10, maxY: 10, minX: 0, minY: 0 };
    const b = { maxX: 15, maxY: 15, minX: 5, minY: 5 };

    expect(boundingBoxesOverlap(a, b)).toBe(true);
  });

  it('should be true when two boxes merely touch at an edge', () => {
    const a = { maxX: 10, maxY: 10, minX: 0, minY: 0 };
    const b = { maxX: 20, maxY: 10, minX: 10, minY: 0 };

    expect(boundingBoxesOverlap(a, b)).toBe(true);
  });

  it('should be false when two boxes have a real gap', () => {
    const a = { maxX: 10, maxY: 10, minX: 0, minY: 0 };
    const b = { maxX: 30, maxY: 10, minX: 20, minY: 0 };

    expect(boundingBoxesOverlap(a, b)).toBe(false);
  });
});
