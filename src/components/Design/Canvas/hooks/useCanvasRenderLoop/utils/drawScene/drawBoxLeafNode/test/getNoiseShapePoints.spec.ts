// types
import { NodeType } from 'types/design/enums';
import { TRectangleNode } from 'types/design/types';

// utils
import { getNoiseShapePoints } from '../getNoiseShapePoints';

const node: TRectangleNode = {
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
};

const getExtents = (node: TRectangleNode): number[] => {
  const points = getNoiseShapePoints(node);
  const xs = points.map(({ x }) => x);
  const ys = points.map(({ y }) => y);

  return [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
};

describe('getNoiseShapePoints', () => {
  it('should return the four corners of the node bounds with a small padding, in world space', () => {
    // result
    expect(getNoiseShapePoints(node)).toHaveLength(4);
    expect(getExtents(node)).toEqual([8, 112, 18, 62]);
  });

  it('should grow by the stroke width so an outside stroke is covered too', () => {
    // result
    expect(getExtents({ ...node, strokeWidth: 10 })).toEqual([-2, 122, 8, 72]);
  });

  it('should rotate the bounds around the node center', () => {
    // action — a 90 degree rotation swaps the extents around the center (60, 40)
    const [minX, maxX, minY, maxY] = getExtents({ ...node, rotation: 90 });

    // result
    expect(minX).toBeCloseTo(38, 5);
    expect(maxX).toBeCloseTo(82, 5);
    expect(minY).toBeCloseTo(-12, 5);
    expect(maxY).toBeCloseTo(92, 5);
  });
});
