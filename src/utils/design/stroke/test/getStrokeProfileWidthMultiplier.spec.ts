// types
import { StrokeProfile } from 'types/design/enums';

// utils
import { getStrokeProfileWidthMultiplier } from '../getStrokeProfileWidthMultiplier';

describe('getStrokeProfileWidthMultiplier', () => {
  it('should return full width for the Uniform profile regardless of position', () => {
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.uniform, 0, false)).toBe(1);
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.uniform, 0.5, false)).toBe(1);
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.uniform, 0.999, false)).toBe(1);
  });

  it('should taper the Wedge profile linearly from full width to zero', () => {
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.wedge, 0, false)).toBe(1);
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.wedge, 0.5, false)).toBeCloseTo(0.5);
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.wedge, 1, false)).toBe(0);
  });

  it('should flip the Wedge profile so the thick end moves to the other side of the seam', () => {
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.wedge, 0, true)).toBe(0);
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.wedge, 1, true)).toBe(1);
  });

  it('should ease the Taper profile from full width to zero', () => {
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.taper, 0, false)).toBe(1);
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.taper, 1, false)).toBe(0);
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.taper, 0.5, false)).toBeCloseTo(0.5);
  });

  it('should keep the Quarter taper profile full for the first three quarters, then taper', () => {
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.quarterTaper, 0, false)).toBe(1);
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.quarterTaper, 0.5, false)).toBe(1);
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.quarterTaper, 0.75, false)).toBe(1);
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.quarterTaper, 1, false)).toBe(0);
  });

  it('should peak the Eye profile at the middle and taper to zero at both ends', () => {
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.eye, 0, false)).toBe(0);
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.eye, 0.5, false)).toBe(1);
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.eye, 1, false)).toBe(0);
  });

  it('should keep the Mirrored taper profile flat in the middle and taper only near both ends', () => {
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.mirroredTaper, 0, false)).toBe(0);
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.mirroredTaper, 0.25, false)).toBe(1);
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.mirroredTaper, 0.5, false)).toBe(1);
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.mirroredTaper, 0.75, false)).toBe(1);
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.mirroredTaper, 1, false)).toBe(0);
  });

  it('should not change the symmetric Eye and Mirrored taper profiles when flipped', () => {
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.eye, 0.25, true)).toBe(
      getStrokeProfileWidthMultiplier(StrokeProfile.eye, 0.25, false),
    );
    expect(getStrokeProfileWidthMultiplier(StrokeProfile.mirroredTaper, 0.25, true)).toBe(
      getStrokeProfileWidthMultiplier(StrokeProfile.mirroredTaper, 0.25, false),
    );
  });
});
