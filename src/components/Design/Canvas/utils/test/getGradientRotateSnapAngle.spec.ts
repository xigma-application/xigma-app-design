// utils
import { getGradientRotateSnapAngle } from '../getGradientRotateSnapAngle';

describe('getGradientRotateSnapAngle', () => {
  it('should snap an angle exactly at 0deg', () => {
    expect(getGradientRotateSnapAngle(0)).toEqual({ angle: 0, snappedDegrees: 0 });
  });

  it('should snap an angle within tolerance of 90deg', () => {
    const result = getGradientRotateSnapAngle((91 * Math.PI) / 180);

    expect(result?.snappedDegrees).toBe(90);
    expect(result?.angle).toBeCloseTo(Math.PI / 2, 5);
  });

  it('should snap an angle within tolerance of 180deg', () => {
    const result = getGradientRotateSnapAngle((178 * Math.PI) / 180);

    expect(result?.snappedDegrees).toBe(180);
  });

  it('should snap a negative angle within tolerance of -90deg', () => {
    const result = getGradientRotateSnapAngle((-88 * Math.PI) / 180);

    expect(result?.snappedDegrees).toBe(-90);
  });

  it('should return null when the angle is well outside the snap tolerance', () => {
    expect(getGradientRotateSnapAngle((45 * Math.PI) / 180)).toBeNull();
  });

  it('should return null just past the tolerance edge', () => {
    expect(getGradientRotateSnapAngle((3.5 * Math.PI) / 180)).toBeNull();
  });
});
