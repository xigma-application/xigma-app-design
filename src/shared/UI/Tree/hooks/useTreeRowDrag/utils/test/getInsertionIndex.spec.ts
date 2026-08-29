// utils
import { getInsertionIndex } from '../getInsertionIndex';

describe('getInsertionIndex', () => {
  it('should map a pointer position to the nearest row boundary', () => {
    // action & result
    expect(getInsertionIndex(0, 0, 0, 32, 4)).toBe(0);
    expect(getInsertionIndex(16, 0, 0, 32, 4)).toBe(1);
    expect(getInsertionIndex(80, 0, 0, 32, 4)).toBe(3);
  });

  it('should account for the container top offset', () => {
    // action & result
    expect(getInsertionIndex(116, 100, 0, 32, 4)).toBe(1);
  });

  it('should account for the container scroll offset', () => {
    // action & result
    expect(getInsertionIndex(16, 0, 64, 32, 6)).toBe(3);
  });

  it('should clamp below zero to zero', () => {
    // action & result
    expect(getInsertionIndex(-1000, 0, 0, 32, 4)).toBe(0);
  });

  it('should clamp above count to count, allowing an insert at the very end', () => {
    // action & result
    expect(getInsertionIndex(1000, 0, 0, 32, 4)).toBe(4);
  });
});
