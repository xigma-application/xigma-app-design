// utils
import { isAxisAlignedRotation } from '../isAxisAlignedRotation';

describe('isAxisAlignedRotation', () => {
  it('should accept 0, 90, 180 and 270 degrees', () => {
    expect(isAxisAlignedRotation(0)).toBe(true);
    expect(isAxisAlignedRotation(90)).toBe(true);
    expect(isAxisAlignedRotation(180)).toBe(true);
    expect(isAxisAlignedRotation(270)).toBe(true);
  });

  it('should accept 360, which normalises back to 0', () => {
    expect(isAxisAlignedRotation(360)).toBe(true);
  });

  it('should accept a negative multiple of 90', () => {
    expect(isAxisAlignedRotation(-90)).toBe(true);
  });

  it('should reject any other angle', () => {
    expect(isAxisAlignedRotation(45)).toBe(false);
    expect(isAxisAlignedRotation(1)).toBe(false);
  });

  it('should reject a non-finite rotation', () => {
    expect(isAxisAlignedRotation(NaN)).toBe(false);
    expect(isAxisAlignedRotation(Infinity)).toBe(false);
  });
});
