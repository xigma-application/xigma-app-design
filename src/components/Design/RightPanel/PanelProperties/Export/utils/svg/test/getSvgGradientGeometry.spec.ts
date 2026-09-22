// types
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getSvgGradientGeometry } from '../getSvgGradientGeometry';

const pageBounds = { height: 100, width: 100, x: 0, y: 0 };
const fillBounds = { height: 100, width: 100, x: 0, y: 0 };

const paint = (overrides: Partial<TGradientPaint> = {}): TGradientPaint => ({
  end: { x: 0.2, y: 0 },
  opacity: 100,
  start: { x: 0, y: 0 },
  stops: [],
  type: 'gradient-linear',
  ...overrides,
});

describe('getSvgGradientGeometry', () => {
  it('should convert normalized start/end into world points via fillBounds, translated by the page origin (no y flip)', () => {
    // action — start/end are 0..1 fractions of fillBounds, not already-absolute points
    const geometry = getSvgGradientGeometry(paint(), fillBounds, pageBounds);

    // result — SVG's own coordinate system already matches design space, so no y flip happens
    expect(geometry.start).toEqual({ x: 0, y: 0 });
    expect(geometry.end).toEqual({ x: 20, y: 0 });
    expect(geometry.primaryRadius).toBe(20);
    expect(geometry.direction.x).toBeCloseTo(1);
    expect(geometry.direction.y).toBeCloseTo(0);
    expect(geometry.perpendicular.x).toBeCloseTo(0);
    expect(geometry.perpendicular.y).toBeCloseTo(1);
  });

  it('should default the direction to a unit x vector when start and end coincide', () => {
    // action
    const geometry = getSvgGradientGeometry(paint({ end: { x: 0, y: 0 } }), fillBounds, pageBounds);

    // result
    expect(geometry.primaryRadius).toBe(0);
    expect(geometry.direction).toEqual({ x: 1, y: 0 });
    expect(geometry.perpendicular.x).toBeCloseTo(0);
    expect(geometry.perpendicular.y).toBe(1);
  });

  it('should place the gradient axis inside the shape even when the shape sits far from the page origin', () => {
    // before
    const shapeFillBounds = { height: 30, width: 40, x: 1132, y: 434 };
    const shapePageBounds = { height: 30, width: 40, x: 1132, y: 434 };
    const defaultGradient = paint({ end: { x: 1, y: 0.5 }, start: { x: 0, y: 0.5 } });

    // action
    const geometry = getSvgGradientGeometry(defaultGradient, shapeFillBounds, shapePageBounds);

    // result — the axis spans the full 40-wide shape, not a ~1-unit segment thousands of units away
    expect(geometry.start).toEqual({ x: 0, y: 15 });
    expect(geometry.end).toEqual({ x: 40, y: 15 });
    expect(geometry.primaryRadius).toBe(40);
  });
});
