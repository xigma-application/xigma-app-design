// utils
import { getDropDepth } from '../getDropDepth';

describe('getDropDepth', () => {
  it('should compute depth 0 when the pointer sits at the container edge', () => {
    // action & result
    expect(getDropDepth(0, 0, 16, { max: 2, min: 0 })).toBe(0);
  });

  it('should round the pointer offset to the nearest whole indent level', () => {
    // action & result
    expect(getDropDepth(32, 0, 16, { max: 3, min: 0 })).toBe(2);
    expect(getDropDepth(20, 0, 16, { max: 3, min: 0 })).toBe(1);
  });

  it('should clamp the computed depth to the given range', () => {
    // action & result
    expect(getDropDepth(1000, 0, 16, { max: 2, min: 0 })).toBe(2);
    expect(getDropDepth(-1000, 0, 16, { max: 2, min: 1 })).toBe(1);
  });

  it('should account for the container left offset', () => {
    // action & result
    expect(getDropDepth(116, 100, 16, { max: 2, min: 0 })).toBe(1);
  });
});
