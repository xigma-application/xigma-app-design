// types
import { TGradientPaint } from 'types/design/paint/types';

// utils
import { getPdfGradientGeometry } from '../getPdfGradientGeometry';

const bounds = { height: 100, width: 100, x: 0, y: 0 };

const paint = (overrides: Partial<TGradientPaint> = {}): TGradientPaint => ({
  end: { x: 20, y: 0 },
  opacity: 100,
  start: { x: 0, y: 0 },
  stops: [],
  type: 'gradient-linear',
  ...overrides,
});

describe('getPdfGradientGeometry', () => {
  it('should compute direction, perpendicular and primary radius from start/end flipped into page space', () => {
    // action
    const geometry = getPdfGradientGeometry(paint(), bounds);

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
    const geometry = getPdfGradientGeometry(paint({ end: { x: 0, y: 0 } }), bounds);

    // result
    expect(geometry.primaryRadius).toBe(0);
    expect(geometry.direction).toEqual({ x: 1, y: 0 });
    expect(geometry.perpendicular.x).toBeCloseTo(0);
    expect(geometry.perpendicular.y).toBe(1);
  });
});
