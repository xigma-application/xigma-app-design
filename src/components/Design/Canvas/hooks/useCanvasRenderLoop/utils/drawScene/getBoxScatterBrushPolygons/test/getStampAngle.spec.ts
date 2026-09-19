// utils
import { getStampAngle } from '../getStampAngle';

describe('getStampAngle', () => {
  it('should follow the path direction plus the Rotation in radians', () => {
    // result
    expect(getStampAngle({ x: 1, y: 0 }, 90, 0, () => 0.5)).toBeCloseTo(Math.PI / 2);
    expect(getStampAngle({ x: 0, y: 1 }, 0, 0, () => 0.5)).toBeCloseTo(Math.PI / 2);
  });

  it('should add up to the Angular jitter either way', () => {
    // result
    expect(getStampAngle({ x: 1, y: 0 }, 0, 180, () => 1)).toBeCloseTo(Math.PI);
    expect(getStampAngle({ x: 1, y: 0 }, 0, 180, () => 0)).toBeCloseTo(-Math.PI);
  });
});
