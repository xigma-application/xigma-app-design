// utils
import { translateBy } from '../translateBy';

describe('translateBy', () => {
  it('should offset the point by the given deltas', () => {
    // before
    const result = translateBy({ x: 10, y: 20 }, 5, -3);

    // result
    expect(result).toEqual({ x: 15, y: 17 });
  });

  it('should return the same coordinates for a zero delta', () => {
    // before
    const result = translateBy({ x: 4, y: 8 }, 0, 0);

    // result
    expect(result).toEqual({ x: 4, y: 8 });
  });
});
