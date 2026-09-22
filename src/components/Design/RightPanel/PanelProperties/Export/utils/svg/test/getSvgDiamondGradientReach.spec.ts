// utils
import { getSvgDiamondGradientReach } from '../getSvgDiamondGradientReach';

describe('getSvgDiamondGradientReach', () => {
  it('should fall back to the fillBounds diagonal when the gradient axis is degenerate (primaryRadius 0)', () => {
    const geometry = {
      direction: { x: 1, y: 0 },
      end: { x: 0, y: 0 },
      perpendicular: { x: 0, y: 1 },
      primaryRadius: 0,
      start: { x: 0, y: 0 },
    };
    const fillBounds = { height: 30, width: 40, x: 0, y: 0 };
    const pageBounds = { height: 100, width: 100, x: 0, y: 0 };

    expect(getSvgDiamondGradientReach(geometry, 1, fillBounds, pageBounds)).toBeCloseTo(Math.hypot(40, 30) * 1.1);
  });

  it('should reach at least 1 (the defined gradient span) even for a shape entirely inside it', () => {
    const geometry = {
      direction: { x: 1, y: 0 },
      end: { x: 10, y: 0 },
      perpendicular: { x: 0, y: 1 },
      primaryRadius: 10,
      start: { x: 0, y: 0 },
    };
    const fillBounds = { height: 2, width: 2, x: -1, y: -1 };
    const pageBounds = { height: 100, width: 100, x: 0, y: 0 };

    expect(getSvgDiamondGradientReach(geometry, 1, fillBounds, pageBounds)).toBeCloseTo(1.1);
  });

  it('should scale beyond 1 when the shape extends past the primary axis span, accounting for radiusRatio', () => {
    const geometry = {
      direction: { x: 1, y: 0 },
      end: { x: 10, y: 0 },
      perpendicular: { x: 0, y: 1 },
      primaryRadius: 10,
      start: { x: 0, y: 0 },
    };
    const fillBounds = { height: 2, width: 40, x: -20, y: -1 };
    const pageBounds = { height: 100, width: 100, x: 0, y: 0 };

    // corner (20,1): a = 20/10 = 2, b = 1/(10*1) = 0.1, |a|+|b| = 2.1
    expect(getSvgDiamondGradientReach(geometry, 1, fillBounds, pageBounds)).toBeCloseTo(2.1 * 1.1);
  });
});
