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

describe('getNoiseShapePoints', () => {
  it('should return the node corners in world space', () => {
    // action
    const points = getNoiseShapePoints(node);
    const xs = points.map(({ x }) => x);
    const ys = points.map(({ y }) => y);

    // result
    expect([Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]).toEqual([10, 110, 20, 60]);
  });

  it('should rotate the shape around the node center', () => {
    // action — a 90 degree rotation swaps the extents around the center (60, 40)
    const points = getNoiseShapePoints({ ...node, rotation: 90 });
    const xs = points.map(({ x }) => x);
    const ys = points.map(({ y }) => y);

    // result
    expect(Math.min(...xs)).toBeCloseTo(40, 5);
    expect(Math.max(...xs)).toBeCloseTo(80, 5);
    expect(Math.min(...ys)).toBeCloseTo(-10, 5);
    expect(Math.max(...ys)).toBeCloseTo(90, 5);
  });

  it('should round the corners with the node corner radius', () => {
    // action
    const points = getNoiseShapePoints({ ...node, cornerRadius: 10 });

    // result
    expect(points.some(({ x, y }) => x === 10 && y === 20)).toBe(false);
    expect(points.length).toBeGreaterThan(4);
  });
});
