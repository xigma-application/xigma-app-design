// types
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getGradientEllipsePoint } from '../getGradientEllipsePoint';

const BOUNDS = { height: 100, width: 100, x: 0, y: 0 };

const PAINT: TGradientPaint = {
  end: { x: 0.5, y: 1 },
  opacity: 100,
  start: { x: 0.5, y: 0.5 },
  stops: [],
  type: 'gradient-angular',
};

describe('getGradientEllipsePoint', () => {
  it('should map a normalized angular position to a world point, unrotated', () => {
    // before
    const point = getGradientEllipsePoint(BOUNDS, 0, PAINT, 0);

    // result — position 0 sits at the primary axis endpoint (0.5, 1) normalized -> (50, 100) world
    expect(point.x).toBeCloseTo(50, 5);
    expect(point.y).toBeCloseTo(100, 5);
  });

  it('should rotate the resulting point around the bounds center', () => {
    // before — rotating the whole gradient by 90deg (rotatePoint takes degrees) around the node center (50,50)
    const point = getGradientEllipsePoint(BOUNDS, 90, PAINT, 0);

    // result — (50,100) rotated 90deg around (50,50) lands at (0,50)
    expect(point.x).toBeCloseTo(0, 5);
    expect(point.y).toBeCloseTo(50, 5);
  });
});
