// utils
import { crisp } from '../crisp';

describe('crisp', () => {
  it('should round to the nearest integer and add half a pixel for a crisp 1px stroke', () => {
    // result
    expect(crisp(10)).toBe(10.5);
    expect(crisp(10.4)).toBe(10.5);
    expect(crisp(10.6)).toBe(11.5);
  });
});
