// types
import { NodeType } from 'types/design/enums';
import { TPolygonNode } from 'types/design/types';

// utils
import { getPolygonShape } from '../getPolygonShape';

const node: TPolygonNode = {
  fills: [],
  flipX: false,
  flipY: false,
  height: 100,
  id: 'e',
  name: 'Polygon',
  parentId: null,
  rotation: 0,
  sides: 5,
  type: NodeType.polygon,
  width: 100,
  x: 10,
  y: 20,
};

describe('getPolygonShape', () => {
  it('should wrap the drawn polygon outline with its bounds', () => {
    // before
    const shape = getPolygonShape(node);

    // result
    expect(shape.polygons).toHaveLength(1);
    expect(shape.bounds.x).toBeGreaterThanOrEqual(10);
    expect(shape.bounds.y).toBeCloseTo(20);
  });

  it('should reuse the shape for the same node', () => {
    // result
    expect(getPolygonShape(node)).toBe(getPolygonShape(node));
  });
});
