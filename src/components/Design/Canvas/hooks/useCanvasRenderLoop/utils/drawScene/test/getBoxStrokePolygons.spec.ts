// types
import { NodeType, StrokeAlign } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

import { TStrokeSideWidths } from 'utils/design/stroke/types';

// utils
import { getBoxStrokePolygons } from '../getBoxStrokePolygons';

const rect = (overrides: Partial<TRectangleNode> = {}): TRectangleNode => ({
  fills: [],
  height: 40,
  id: 'r1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 100,
  x: 10,
  y: 20,
  ...overrides,
});

const bounds = (points: { x: number; y: number }[]): { height: number; width: number; x: number; y: number } => {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);

  return { height: Math.max(...ys) - Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), x: Math.min(...xs), y: Math.min(...ys) };
};

const uniform = (width: number): TStrokeSideWidths => ({ bottom: width, left: width, right: width, top: width });

describe('getBoxStrokePolygons', () => {
  it('should return an outer and an inner polygon for the ring', () => {
    expect(getBoxStrokePolygons(rect(), uniform(2), StrokeAlign.inside)).toHaveLength(2);
  });

  it('should put an inside stroke entirely within the node bounds', () => {
    const [outer, inner] = getBoxStrokePolygons(rect(), uniform(2), StrokeAlign.inside);

    expect(bounds(outer)).toEqual({ height: 40, width: 100, x: 10, y: 20 });
    expect(bounds(inner)).toEqual({ height: 36, width: 96, x: 12, y: 22 });
  });

  it('should put an outside stroke entirely outside the node bounds', () => {
    const [outer, inner] = getBoxStrokePolygons(rect(), uniform(2), StrokeAlign.outside);

    expect(bounds(outer)).toEqual({ height: 44, width: 104, x: 8, y: 18 });
    expect(bounds(inner)).toEqual({ height: 40, width: 100, x: 10, y: 20 });
  });

  it('should straddle the node bounds for a center stroke', () => {
    const [outer, inner] = getBoxStrokePolygons(rect(), uniform(2), StrokeAlign.center);

    expect(bounds(outer)).toEqual({ height: 42, width: 102, x: 9, y: 19 });
    expect(bounds(inner)).toEqual({ height: 38, width: 98, x: 11, y: 21 });
  });

  it('should default to an inside stroke when no alignment is set', () => {
    expect(getBoxStrokePolygons(rect(), uniform(2), undefined)).toEqual(getBoxStrokePolygons(rect(), uniform(2), StrokeAlign.inside));
  });

  it('should collapse the inner polygon instead of inverting it when the stroke is thicker than the node', () => {
    const [, inner] = getBoxStrokePolygons(rect({ height: 6, width: 6 }), uniform(10), StrokeAlign.inside);

    expect(bounds(inner)).toMatchObject({ height: 0, width: 0 });
  });

  it('should keep the outer polygon rounded further out than the inner one for a rounded node', () => {
    const [outer, inner] = getBoxStrokePolygons(rect({ cornerRadius: 10 }), uniform(4), StrokeAlign.outside);

    expect(outer.length).toBe(inner.length);
    expect(bounds(outer).width).toBeCloseTo(108, 5);
  });

  it('should rotate both polygons around the node center', () => {
    const [outer] = getBoxStrokePolygons(rect({ rotation: 90 }), uniform(2), StrokeAlign.inside);

    expect(bounds(outer).width).toBeCloseTo(40, 5);
    expect(bounds(outer).height).toBeCloseTo(100, 5);
  });

  it('should draw only a strip on the top edge when just the top has weight', () => {
    const [outer, inner] = getBoxStrokePolygons(rect(), { bottom: 0, left: 0, right: 0, top: 4 }, StrokeAlign.inside);

    expect(bounds(outer)).toEqual({ height: 40, width: 100, x: 10, y: 20 });
    expect(bounds(inner)).toEqual({ height: 36, width: 100, x: 10, y: 24 });
  });

  it('should grow the outer polygon only on the sides that have an outside stroke', () => {
    const [outer, inner] = getBoxStrokePolygons(rect(), { bottom: 0, left: 5, right: 0, top: 0 }, StrokeAlign.outside);

    expect(bounds(outer)).toEqual({ height: 40, width: 105, x: 5, y: 20 });
    expect(bounds(inner)).toEqual({ height: 40, width: 100, x: 10, y: 20 });
  });
});
