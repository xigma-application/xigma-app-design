// utils
import { getSvgAngularGradientReach } from '../getSvgAngularGradientReach';

describe('getSvgAngularGradientReach', () => {
  it('should reach at least the farthest fillBounds corner from the gradient start, with a safety margin', () => {
    const geometry = {
      direction: { x: 1, y: 0 },
      end: { x: 10, y: 0 },
      perpendicular: { x: 0, y: 1 },
      primaryRadius: 10,
      start: { x: 0, y: 0 },
    };
    const fillBounds = { height: 20, width: 20, x: 0, y: 0 };
    const pageBounds = { height: 100, width: 100, x: 0, y: 0 };

    // farthest corner (20,20) is at distance sqrt(20^2+20^2) ≈ 28.28 from the start
    expect(getSvgAngularGradientReach(geometry, fillBounds, pageBounds)).toBeGreaterThan(Math.hypot(20, 20));
  });

  it('should translate fillBounds corners into the same page-local space as the gradient start', () => {
    const geometry = {
      direction: { x: 1, y: 0 },
      end: { x: 10, y: 0 },
      perpendicular: { x: 0, y: 1 },
      primaryRadius: 10,
      start: { x: 5, y: 5 },
    };
    const fillBounds = { height: 10, width: 10, x: 15, y: 15 };
    const pageBounds = { height: 100, width: 100, x: 10, y: 10 };

    // fillBounds corners translated by -pageBounds land at (5,5)..(15,15); farthest from start (5,5) is (15,15), distance sqrt(200)
    expect(getSvgAngularGradientReach(geometry, fillBounds, pageBounds)).toBeGreaterThan(Math.sqrt(200));
  });
});
