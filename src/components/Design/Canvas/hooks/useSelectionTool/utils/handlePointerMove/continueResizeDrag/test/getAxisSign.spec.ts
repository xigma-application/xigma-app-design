// utils
import { getAxisSign } from '../getAxisSign';

describe('getAxisSign', () => {
  it('should return -1 for a "max"-side handle axis', () => {
    // result
    expect(getAxisSign('max')).toBe(-1);
  });

  it('should return 1 for a "min"-side handle axis', () => {
    // result
    expect(getAxisSign('min')).toBe(1);
  });

  it('should return 0 for an untouched ("none") axis', () => {
    // result
    expect(getAxisSign('none')).toBe(0);
  });
});
