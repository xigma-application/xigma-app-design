// utils
import { getGradientWorldPoints } from '../getGradientWorldPoints';

// types
import { TGradientPaint } from 'types/design/paint/types';

const makePaint = (overrides: Partial<TGradientPaint> = {}): TGradientPaint => ({
  end: { x: 1, y: 0.5 },
  opacity: 100,
  start: { x: 0, y: 0.5 },
  stops: [],
  type: 'gradient-linear',
  ...overrides,
});

describe('getGradientWorldPoints', () => {
  it('should map normalized bounds-local points to world space for an unrotated node', () => {
    // before
    const bounds = { height: 200, width: 100, x: 10, y: 20 };

    // action
    const { end, start } = getGradientWorldPoints(bounds, 0, makePaint());

    // result
    expect(start).toEqual({ x: 10, y: 120 });
    expect(end).toEqual({ x: 110, y: 120 });
  });

  it('should rotate the mapped points around the bounds center for a rotated node', () => {
    // before
    const bounds = { height: 100, width: 100, x: 0, y: 0 };

    // action
    const { end, start } = getGradientWorldPoints(bounds, 90, makePaint({ end: { x: 1, y: 0.5 }, start: { x: 0, y: 0.5 } }));

    // result — a horizontal line through the center becomes vertical after a 90° rotation
    expect(start.x).toBeCloseTo(50);
    expect(start.y).toBeCloseTo(0);
    expect(end.x).toBeCloseTo(50);
    expect(end.y).toBeCloseTo(100);
  });
});
