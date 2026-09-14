// types
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getGradientStopDirections } from '../getGradientStopDirections';

const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

describe('getGradientStopDirections', () => {
  it('should point every stop away from the line, in the same direction, for a linear gradient', () => {
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
    const awayFromLineDirection = { x: 0, y: -1 };

    // action
    const directions = getGradientStopDirections(BOUNDS, 0, paint, awayFromLineDirection);

    // result
    expect(directions).toEqual([awayFromLineDirection, awayFromLineDirection]);
  });

  it('should point each stop along the ellipse’s own normal at its position, for an angular gradient', () => {
    // before — center (50,50), primary axis endpoint straight down at (50,100): position 0 points
    // straight down (away from center), position 0.25 (the perpendicular radius-handle point) points
    // straight left
    const paint: TGradientPaint = {
      end: { x: 0.5, y: 1 },
      opacity: 100,
      start: { x: 0.5, y: 0.5 },
      stops: [
        { color: '#ffffff', opacity: 100, position: 0 },
        { color: '#000000', opacity: 100, position: 0.25 },
      ],
      type: 'gradient-angular',
    };

    // action
    const directions = getGradientStopDirections(BOUNDS, 0, paint, { x: 0, y: -1 });

    // result
    expect(directions[0].x).toBeCloseTo(0, 5);
    expect(directions[0].y).toBeCloseTo(1, 5);
    expect(directions[1].x).toBeCloseTo(-1, 5);
    expect(directions[1].y).toBeCloseTo(0, 5);
  });
});
