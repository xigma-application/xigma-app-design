// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { getNodeBounds } from '../getNodeBounds';

describe('getNodeBounds', () => {
  it('should return the box fields directly for a box-shaped node', () => {
    // mock
    const rectangle: TRectangleNode = {
      fill: '#000',
      height: 20,
      id: '1',
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 10,
      x: 5,
      y: 5,
    };

    // result
    expect(getNodeBounds(rectangle)).toEqual({ height: 20, width: 10, x: 5, y: 5 });
  });

  it('should derive the bounding box from a line node drawn top-left to bottom-right', () => {
    // mock
    const line: TLineNode = { id: '1', name: 'Line', parentId: null, stroke: '#000', type: NodeType.line, x1: 0, x2: 10, y1: 0, y2: 20 };

    // result
    expect(getNodeBounds(line)).toEqual({ height: 20, width: 10, x: 0, y: 0 });
  });

  it('should derive the bounding box from a line node drawn in any direction', () => {
    // mock
    const line: TLineNode = { id: '1', name: 'Line', parentId: null, stroke: '#000', type: NodeType.line, x1: 10, x2: 0, y1: 20, y2: 0 };

    // result
    expect(getNodeBounds(line)).toEqual({ height: 20, width: 10, x: 0, y: 0 });
  });

  it('should delegate to getVectorNodeBounds for a vector node', () => {
    // mock
    const vector: TVectorNode = {
      defaultFill: [{ color: '#000', opacity: 100, type: 'solid' }],
      filledFaceKeys: [],
      id: '1',
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 5 } },
    };

    // result
    expect(getNodeBounds(vector)).toEqual({ height: 5, width: 10, x: 0, y: 0 });
  });
});
