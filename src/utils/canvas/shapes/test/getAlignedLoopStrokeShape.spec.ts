// types
import { NodeType, StrokeAlign, StrokeMode } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TPolygonNode } from 'types/design/types';

// utils
import { getAlignedLoopStrokeShape } from '../getAlignedLoopStrokeShape';

const square: TPoint[] = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
];

const polygon = (overrides: Partial<TPolygonNode> = {}): TPolygonNode => ({
  fills: [],
  flipX: false,
  flipY: false,
  height: 100,
  id: 'p',
  name: 'Polygon',
  parentId: null,
  rotation: 0,
  sides: 4,
  strokeWidth: 10,
  type: NodeType.polygon,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

const getMinX = (polygons: TPoint[][]): number => Math.min(...polygons.flat().map(({ x }) => x));

describe('getAlignedLoopStrokeShape', () => {
  it('should draw a plain stroke inside the loop by default', () => {
    // before
    const shape = getAlignedLoopStrokeShape(polygon(), square, false);

    // result
    expect(shape.fillRule).toBe('evenOdd');
    expect(getMinX(shape.polygons)).toBeCloseTo(0);
  });

  it('should draw a plain stroke outside the loop', () => {
    // before
    const shape = getAlignedLoopStrokeShape(polygon({ strokeAlign: StrokeAlign.outside }), square, false);

    // result
    expect(getMinX(shape.polygons)).toBeCloseTo(-10);
  });

  it('should draw the stroke mode around the aligned midline', () => {
    // before
    const shape = getAlignedLoopStrokeShape(polygon({ strokeMode: StrokeMode.dynamic }), square, false);

    // result
    expect(shape.polygons.length).toBeGreaterThan(0);
  });

  it('should collapse onto the loop without a stroke width', () => {
    // before
    const shape = getAlignedLoopStrokeShape(polygon({ strokeWidth: undefined }), square, false);

    // result
    expect(shape.polygons).toEqual([square, square]);
  });
});
