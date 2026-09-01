// utils
import { isBoundsFullyInside } from '../isBoundsFullyInside';

describe('isBoundsFullyInside', () => {
  it('should return true when the inner box sits strictly inside the outer one', () => {
    expect(isBoundsFullyInside([2, 2, 8, 8], [0, 0, 10, 10])).toBe(true);
  });

  it('should return true when the boxes are identical (inclusive bounds)', () => {
    expect(isBoundsFullyInside([0, 0, 10, 10], [0, 0, 10, 10])).toBe(true);
  });

  it('should return false when the inner box pokes out on one side', () => {
    expect(isBoundsFullyInside([2, 2, 12, 8], [0, 0, 10, 10])).toBe(false);
  });
});
