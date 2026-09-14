// types
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getGradientStopPositions } from '../getGradientStopPositions';

const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('getGradientStopPositions', () => {
  it('should place stops along the start-end line for a linear gradient', () => {
    // before
    const paint: TGradientPaint = {
      end: { x: 1, y: 0.5 },
      opacity: 100,
      start: { x: 0, y: 0.5 },
      stops: [
        { color: '#ffffff', opacity: 100, position: 0 },
        { color: '#000000', opacity: 100, position: 1 },
      ],
      type: 'gradient-linear',
    };

    // action
    const positions = getGradientStopPositions(BOUNDS, 0, paint, { x: 0, y: 50 }, { x: 100, y: 50 }, 1);

    // result
    expect(positions[0].x).toBeCloseTo(0);
    expect(positions[1].x).toBeCloseTo(100);
  });

  it('should place stops along the line for a radial gradient too, same as a linear one', () => {
    // before
    const paint: TGradientPaint = {
      end: { x: 1, y: 0.5 },
      opacity: 100,
      start: { x: 0, y: 0.5 },
      stops: [{ color: '#ffffff', opacity: 100, position: 0.5 }],
      type: 'gradient-radial',
    };

    // action
    const positions = getGradientStopPositions(BOUNDS, 0, paint, { x: 0, y: 50 }, { x: 100, y: 50 }, 1);

    // result
    expect(positions[0].x).toBeCloseTo(50);
  });

  it('should place stops around the ellipse for an angular gradient, ignoring the passed-in end entirely', () => {
    // before
    const paint: TGradientPaint = {
      end: { x: 0.5, y: 1 },
      opacity: 100,
      start: { x: 0.5, y: 0.5 },
      stops: [{ color: '#ffffff', opacity: 100, position: 0 }],
      type: 'gradient-angular',
    };

    // action — the passed-in `end` is far off and unused for angular (only `start`, the world center,
    // feeds its outward offset direction); `start` here is the paint's own center in world space (50,50)
    const positions = getGradientStopPositions(BOUNDS, 0, paint, { x: 50, y: 50 }, { x: 999, y: 999 }, 1);

    // result — position 0 sits at the paint's own primary-axis endpoint (50, 100), nudged 18px further
    // outward (away from the center) so the marker sits beside the ellipse curve, not straddling it
    expect(positions[0].x).toBeCloseTo(50, 5);
    expect(positions[0].y).toBeCloseTo(118, 5);
  });
});
