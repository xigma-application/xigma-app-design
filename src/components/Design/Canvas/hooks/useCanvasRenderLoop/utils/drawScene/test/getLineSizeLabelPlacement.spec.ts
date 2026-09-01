// utils
import { getLineSizeLabelPlacement } from '../getLineSizeLabelPlacement';

describe('getLineSizeLabelPlacement', () => {
  it('should anchor at the midpoint, read horizontally, and offset downward for a flat, left-to-right line', () => {
    // before
    const { anchor, angleDeg, offsetDirection } = getLineSizeLabelPlacement(0, 0, 100, 0);

    // result
    expect(anchor.x).toBeCloseTo(50);
    expect(anchor.y).toBeCloseTo(0);
    expect(angleDeg).toBeCloseTo(0);
    expect(offsetDirection.x).toBeCloseTo(0);
    expect(offsetDirection.y).toBeCloseTo(1);
  });

  it('should anchor at the midpoint and stay horizontal even when drawn right-to-left (180deg wraps to 0)', () => {
    // before — the same physical line, endpoints swapped
    const { anchor, angleDeg } = getLineSizeLabelPlacement(100, 0, 0, 0);

    // result
    expect(anchor.x).toBeCloseTo(50);
    expect(angleDeg).toBeCloseTo(0);
  });

  it('should tilt to match a diagonal line', () => {
    // before
    const { angleDeg } = getLineSizeLabelPlacement(0, 0, 100, 100);

    // result
    expect(angleDeg).toBeCloseTo(45);
  });

  it('should read top-to-bottom for a perfectly vertical line', () => {
    // before
    const { angleDeg } = getLineSizeLabelPlacement(0, 0, 0, 100);

    // result
    expect(angleDeg).toBeCloseTo(90);
  });

  it('should flip both the angle and the badge to the other side of the line just past 90deg, instead of rendering upside down', () => {
    // before — 91deg raw (barely past vertical) must land near -89deg, not 91deg, and the badge
    // must hop to the opposite side of the line at that same crossing
    const justBefore = getLineSizeLabelPlacement(0, 0, Math.cos((89 * Math.PI) / 180), Math.sin((89 * Math.PI) / 180));
    const justAfter = getLineSizeLabelPlacement(0, 0, Math.cos((91 * Math.PI) / 180), Math.sin((91 * Math.PI) / 180));

    // result
    expect(justAfter.angleDeg).toBeCloseTo(-89);
    expect(Math.sign(justAfter.offsetDirection.x)).toBe(-Math.sign(justBefore.offsetDirection.x));
  });

  it('should flip to the other equivalent angle just past -90deg too', () => {
    // before
    const dx = Math.cos((-91 * Math.PI) / 180);
    const dy = Math.sin((-91 * Math.PI) / 180);
    const { angleDeg } = getLineSizeLabelPlacement(0, 0, dx, dy);

    // result
    expect(angleDeg).toBeCloseTo(89);
  });

  it('should produce the exact same angle and offset side for a line and its 180deg-rotated equivalent, at every angle', () => {
    // result
    for (let degrees = -179; degrees <= 180; degrees += 11) {
      const radians = (degrees * Math.PI) / 180;
      const a = getLineSizeLabelPlacement(0, 0, Math.cos(radians), Math.sin(radians));
      const oppositeRadians = radians + Math.PI;
      const b = getLineSizeLabelPlacement(0, 0, Math.cos(oppositeRadians), Math.sin(oppositeRadians));

      expect(a.angleDeg).toBeCloseTo(b.angleDeg, 5);
      expect(Math.abs(a.angleDeg)).toBeLessThanOrEqual(90.0001);
      expect(a.offsetDirection.x).toBeCloseTo(b.offsetDirection.x, 5);
      expect(a.offsetDirection.y).toBeCloseTo(b.offsetDirection.y, 5);
    }
  });
});
