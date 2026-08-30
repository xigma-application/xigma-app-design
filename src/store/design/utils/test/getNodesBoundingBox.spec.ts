// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { getNodesBoundingBox } from '../getNodesBoundingBox';

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

describe('getNodesBoundingBox', () => {
  it('should union the axis-aligned bounds of plain box nodes', () => {
    // action
    const bounds = getNodesBoundingBox([rect({ id: 'a', x: 0, y: 0 }), rect({ id: 'b', x: 40, y: 20, width: 10, height: 10 })]);

    // result
    expect(bounds).toEqual({ x: 0, y: 0, width: 50, height: 30 });
  });

  it('should account for a rotated node by using its rotated bounding box', () => {
    // action
    const bounds = getNodesBoundingBox([rect({ id: 'a', x: 0, y: 0, width: 10, height: 10, rotation: 45 })]);

    // result
    expect(bounds.width).toBeCloseTo(Math.SQRT2 * 10, 5);
    expect(bounds.height).toBeCloseTo(Math.SQRT2 * 10, 5);
    expect(bounds.x).toBeCloseTo(5 - (Math.SQRT2 * 10) / 2, 5);
  });

  it('should use endpoint extents for a line node', () => {
    // mock
    const line: TLineNode = {
      id: 'l',
      name: 'Line',
      parentId: null,
      stroke: '#000',
      type: NodeType.line,
      x1: 30,
      x2: 10,
      y1: 5,
      y2: 25,
    };

    // action
    const bounds = getNodesBoundingBox([line]);

    // result
    expect(bounds).toEqual({ x: 10, y: 5, width: 20, height: 20 });
  });

  it('should use the vector network extents for a vector node', () => {
    // mock
    const vector: TVectorNode = {
      fillColor: null,
      filledFaceKeys: [],
      id: 'v',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 12, y: 8 } },
    };

    // action
    const bounds = getNodesBoundingBox([vector]);

    // result
    expect(bounds).toEqual({ x: 0, y: 0, width: 12, height: 8 });
  });
});
