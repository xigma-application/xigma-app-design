// utils
import { getGradientCssAngle } from '../getGradientCssAngle';

describe('getGradientCssAngle', () => {
  it('should map our 0deg (left-to-right) to CSS 90deg', () => {
    expect(getGradientCssAngle(0)).toBe(90);
  });

  it('should map our 90deg (top-to-bottom) to CSS 180deg', () => {
    expect(getGradientCssAngle(90)).toBe(180);
  });

  it('should map our 180deg (right-to-left) to CSS 270deg', () => {
    expect(getGradientCssAngle(180)).toBe(270);
  });

  it('should wrap our 270deg (bottom-to-top) around to CSS 0deg', () => {
    expect(getGradientCssAngle(270)).toBe(0);
  });
});
