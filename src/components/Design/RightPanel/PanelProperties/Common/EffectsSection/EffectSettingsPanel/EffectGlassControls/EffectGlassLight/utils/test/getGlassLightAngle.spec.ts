// utils
import { getGlassLightAngle } from '../getGlassLightAngle';

describe('getGlassLightAngle', () => {
  it('should measure the angle from straight up, clockwise, in whole degrees', () => {
    // result
    expect(getGlassLightAngle(0, -10)).toBe(0);
    expect(getGlassLightAngle(10, 0)).toBe(90);
    expect(getGlassLightAngle(0, 10)).toBe(180);
    expect(getGlassLightAngle(-10, 0)).toBe(-90);
    expect(getGlassLightAngle(-8.5, -5.3)).toBe(-58);
  });
});
