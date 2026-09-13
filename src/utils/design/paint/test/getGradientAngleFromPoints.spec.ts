// utils
import { getGradientAngleFromPoints } from '../getGradientAngleFromPoints';

describe('getGradientAngleFromPoints', () => {
  it('should return 0 for a left-to-right gradient axis', () => {
    expect(getGradientAngleFromPoints({ x: 0, y: 0.5 }, { x: 1, y: 0.5 })).toBe(0);
  });

  it('should return 90 for a top-to-bottom gradient axis', () => {
    expect(getGradientAngleFromPoints({ x: 0.5, y: 0 }, { x: 0.5, y: 1 })).toBe(90);
  });

  it('should return -90 for a bottom-to-top gradient axis', () => {
    expect(getGradientAngleFromPoints({ x: 0.5, y: 1 }, { x: 0.5, y: 0 })).toBe(-90);
  });

  it('should return 180 for a right-to-left gradient axis', () => {
    expect(getGradientAngleFromPoints({ x: 1, y: 0.5 }, { x: 0, y: 0.5 })).toBe(180);
  });
});
