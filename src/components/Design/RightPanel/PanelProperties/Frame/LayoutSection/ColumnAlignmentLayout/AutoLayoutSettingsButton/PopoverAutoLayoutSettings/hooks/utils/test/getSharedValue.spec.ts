// utils
import { getSharedValue } from '../getSharedValue';

describe('getSharedValue', () => {
  it('should return the value every item shares', () => {
    // result
    expect(getSharedValue([{ v: 1 }, { v: 1 }], (item) => item.v, 0)).toBe(1);
  });

  it('should return nothing for mixed values and the empty value without items', () => {
    // result
    expect(getSharedValue([{ v: 1 }, { v: 2 }], (item) => item.v, 0)).toBeUndefined();
    expect(getSharedValue([], (item: { v: number }) => item.v, 0)).toBe(0);
  });
});
