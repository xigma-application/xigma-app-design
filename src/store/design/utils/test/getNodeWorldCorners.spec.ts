// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TRectangleNode } from 'types/design/types';

// utils
import { getNodeWorldCorners } from '../getNodeWorldCorners';

const rect = (overrides: Partial<TRectangleNode>): TRectangleNode => ({
  fill: '#fff',
  height: 10,
  id: 'r',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 10,
  x: 0,
  y: 0,
  ...overrides,
});

describe('getNodeWorldCorners', () => {
  it('should return the four plain corners of an unrotated box node', () => {
    // result
    expect(getNodeWorldCorners(rect({ height: 20, width: 10, x: 0, y: 0 }))).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 20 },
      { x: 0, y: 20 },
    ]);
  });

  it('should rotate the corners around the node’s own center', () => {
    // mock — a 10x10 square at the origin rotated 90° around its own center (5,5)
    const corners = getNodeWorldCorners(rect({ height: 10, rotation: 90, width: 10, x: 0, y: 0 }));

    // result — a 90° rotation of a square around its own center maps corners onto each other
    expect(corners[0].x).toBeCloseTo(10, 5);
    expect(corners[0].y).toBeCloseTo(0, 5);
  });

  it('should return the line’s own endpoint box, ignoring rotation entirely', () => {
    // mock
    const line: TLineNode = { id: 'l', name: 'Line', parentId: null, stroke: '#fff', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 10 };

    // result — lines have no rotation field to speak of; corners come straight from their AABB
    expect(getNodeWorldCorners(line)).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
    ]);
  });
});
