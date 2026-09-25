// utils
import { getSharedValue } from '../getSharedValue';

describe('getSharedValue', () => {
  it('should return the value shared by every item', () => {
    // result
    expect(getSharedValue([3, 3])).toBe(3);
  });

  it('should return undefined for mixed values', () => {
    // result
    expect(getSharedValue([3, 4])).toBeUndefined();
  });
});
