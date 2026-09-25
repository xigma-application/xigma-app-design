// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode } from 'types/design/types';

// utils
import { getPolygonStrokeShapes } from '../getPolygonStrokeShapes';

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
  type: NodeType.polygon,
  width: 100,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getPolygonStrokeShapes', () => {
  it('should draw one band along the polygon outline', () => {
    // before
    const shapes = getPolygonStrokeShapes(polygon({ strokeWidth: 4 }));

    // result
    expect(shapes).toHaveLength(1);
    expect(shapes?.[0].fillRule).toBe('evenOdd');
  });

  it('should draw nothing without a stroke width', () => {
    // result
    expect(getPolygonStrokeShapes(polygon())).toBeNull();
  });

  it('should reuse the shapes for the same node', () => {
    // mock
    const node = polygon({ strokeWidth: 4 });

    // result
    expect(getPolygonStrokeShapes(node)).toBe(getPolygonStrokeShapes(node));
  });
});
