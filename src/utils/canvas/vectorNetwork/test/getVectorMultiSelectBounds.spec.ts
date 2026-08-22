// utils
import { getVectorMultiSelectBounds } from '../getVectorMultiSelectBounds';

describe('getVectorMultiSelectBounds', () => {
  it('should return null when there are no points', () => {
    // before
    const bounds = getVectorMultiSelectBounds([]);

    // result
    expect(bounds).toBeNull();
  });

  it('should return the bounding box over the given points', () => {
    // before
    const bounds = getVectorMultiSelectBounds([
      { x: 0, y: 0 },
      { x: 100, y: 40 },
    ]);

    // result
    expect(bounds).toEqual({ height: 40, width: 100, x: 0, y: 0 });
  });

  it('should collapse to a zero-size box for a single point', () => {
    // before
    const bounds = getVectorMultiSelectBounds([{ x: 10, y: -5 }]);

    // result
    expect(bounds).toEqual({ height: 0, width: 0, x: 10, y: -5 });
  });
});
