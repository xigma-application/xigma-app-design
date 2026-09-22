// types
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getPdfGradientGeometry } from '../getPdfGradientGeometry';

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

describe('getPdfGradientGeometry', () => {
  it('should convert normalized start/end into world points via fillBounds, then flip into page space', () => {
    // action — start/end are 0..1 fractions of fillBounds, not already-absolute points
    const geometry = getPdfGradientGeometry(paint(), fillBounds, pageBounds);

    // result — a horizontal design-space axis stays horizontal in page space (only y is flipped)
    expect(geometry.startPage).toEqual({ x: 0, y: 100 });
    expect(geometry.endPage).toEqual({ x: 20, y: 100 });
    expect(geometry.primaryRadius).toBe(20);
    expect(geometry.direction.x).toBeCloseTo(1);
    expect(geometry.direction.y).toBeCloseTo(0);
    expect(geometry.perpendicular.x).toBeCloseTo(0);
    expect(geometry.perpendicular.y).toBeCloseTo(1);
  });

  it('should default the direction to a unit x vector when start and end coincide', () => {
    // action
    const geometry = getPdfGradientGeometry(paint({ end: { x: 0, y: 0 } }), fillBounds, pageBounds);

    // result
    expect(geometry.primaryRadius).toBe(0);
    expect(geometry.direction).toEqual({ x: 1, y: 0 });
    expect(geometry.perpendicular.x).toBeCloseTo(0);
    expect(geometry.perpendicular.y).toBe(1);
  });

  // Regression test for a real bug: a shape far from the page origin (e.g. inside a frame, or not the
  // export root) has a fillBounds.x/y far from pageBounds.x/y. Treating paint.start/end as already
  // absolute (skipping the fillBounds normalization) collapsed the gradient axis to a near-zero-length
  // segment thousands of units off-page, which Extend then clamped to one flat color everywhere.
  it('should place the gradient axis inside the shape even when the shape sits far from the page origin', () => {
    // before
    const shapeFillBounds = { height: 30, width: 40, x: 1132, y: 434 };
    const shapePageBounds = { height: 30, width: 40, x: 1132, y: 434 };
    const defaultGradient = paint({ end: { x: 1, y: 0.5 }, start: { x: 0, y: 0.5 } });

    // action
    const geometry = getPdfGradientGeometry(defaultGradient, shapeFillBounds, shapePageBounds);

    // result — the axis spans the full 40-wide shape, not a ~1-unit segment thousands of units away
    expect(geometry.startPage).toEqual({ x: 0, y: 15 });
    expect(geometry.endPage).toEqual({ x: 40, y: 15 });
    expect(geometry.primaryRadius).toBe(40);
  });
});
