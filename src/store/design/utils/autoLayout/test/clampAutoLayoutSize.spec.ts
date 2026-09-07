// utils
import { clampAutoLayoutSize } from '../clampAutoLayoutSize';

describe('clampAutoLayoutSize', () => {
  it('should leave the value untouched when neither min nor max is set', () => {
    expect(clampAutoLayoutSize(50, undefined, undefined)).toBe(50);
  });

  it('should clamp up to min when the value is below it', () => {
    expect(clampAutoLayoutSize(10, 20, undefined)).toBe(20);
  });

  it('should leave the value untouched when it is above min with no max set', () => {
    expect(clampAutoLayoutSize(30, 20, undefined)).toBe(30);
  });

  it('should clamp down to max when the value is above it', () => {
    expect(clampAutoLayoutSize(500, undefined, 200)).toBe(200);
  });

  it('should leave the value untouched when it is within both bounds', () => {
    expect(clampAutoLayoutSize(150, 100, 200)).toBe(150);
  });

  it('should clamp to min when the value is below both bounds', () => {
    expect(clampAutoLayoutSize(50, 100, 200)).toBe(100);
  });

  it('should clamp to max when the value is above both bounds', () => {
    expect(clampAutoLayoutSize(500, 100, 200)).toBe(200);
  });

  it('should let min win over a corrupt max-below-min state', () => {
    expect(clampAutoLayoutSize(150, 200, 100)).toBe(200);
  });
});
