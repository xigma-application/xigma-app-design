// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode } from 'types/design/types';

// utils
import { getEllipseShape } from '../getEllipseShape';

const node: TEllipseNode = {
  arcEndAngle: 180,
  fills: [],
  height: 100,
  id: 'e',
  name: 'Ellipse',
  parentId: null,
  rotation: 0,
  type: NodeType.ellipse,
  width: 100,
  x: 10,
  y: 20,
};

describe('getEllipseShape', () => {
  it('should wrap the drawn ellipse outline with its bounds', () => {
    // before
    const shape = getEllipseShape(node);

    // result
    expect(shape.polygons).toHaveLength(1);
    expect(shape.bounds.x).toBeCloseTo(10);
    expect(shape.bounds.y).toBeCloseTo(20);
  });

  it('should reuse the shape for the same node', () => {
    // result
    expect(getEllipseShape(node)).toBe(getEllipseShape(node));
  });
});
