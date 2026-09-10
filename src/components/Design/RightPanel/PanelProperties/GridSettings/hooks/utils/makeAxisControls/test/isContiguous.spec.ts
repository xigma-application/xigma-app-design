// utils
import { isContiguous } from '../isContiguous';

describe('isContiguous', () => {
  it('should accept a single index', () => {
    expect(isContiguous([2])).toBe(true);
  });

  it('should accept a run of consecutive indices', () => {
    expect(isContiguous([1, 2, 3])).toBe(true);
  });

  it('should reject indices with a gap', () => {
    expect(isContiguous([0, 2])).toBe(false);
  });
});
