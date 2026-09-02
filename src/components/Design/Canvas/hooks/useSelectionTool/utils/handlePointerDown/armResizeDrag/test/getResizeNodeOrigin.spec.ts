// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TLineNode, TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { getResizeNodeOrigin } from '../getResizeNodeOrigin';

describe('getResizeNodeOrigin', () => {
  it('should capture x1/y1/x2/y2 for a line node', () => {
    // mock
    const line: TLineNode = { id: 'l', name: 'Line', parentId: null, stroke: '#000', type: NodeType.line, x1: 0, x2: 10, y1: 5, y2: 15 };

    // action & result
    expect(getResizeNodeOrigin(line)).toEqual({ x1: 0, x2: 10, y1: 5, y2: 15 });
  });

  it('should capture vertices/segments/rotation for a vector node', () => {
    // mock
    const vector: TVectorNode = {
      defaultFill: null,
      filledFaceKeys: [],
      id: 'v',
      name: 'Vector',
      parentId: null,
      rotation: 15,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 10, y: 0 } },
    };

    // action & result
    expect(getResizeNodeOrigin(vector)).toEqual({
      rotation: 15,
      segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
      vertices: { a: { x: 0, y: 0 }, b: { x: 10, y: 0 } },
    });
  });

  it('should capture box/rotation and null flip for a non-flippable box node', () => {
    // mock
    const rect: TRectangleNode = {
      fill: '#fff',
      height: 10,
      id: 'r',
      name: 'Rectangle',
      parentId: null,
      rotation: 20,
      type: NodeType.rectangle,
      width: 10,
      x: 5,
      y: 5,
    };

    // action & result
    expect(getResizeNodeOrigin(rect)).toEqual({ flip: null, height: 10, rotation: 20, width: 10, x: 5, y: 5 });
  });

  it('should default flip to false/false for a flippable node with no flipX/flipY set', () => {
    // mock
    const ellipse: TEllipseNode = {
      fill: '#fff',
      height: 10,
      id: 'e',
      name: 'Ellipse',
      parentId: null,
      rotation: 0,
      type: NodeType.ellipse,
      width: 10,
      x: 0,
      y: 0,
    };

    // action & result
    expect(getResizeNodeOrigin(ellipse)).toMatchObject({ flip: { x: false, y: false } });
  });

  it('should carry the current flipX/flipY for a flippable node', () => {
    // mock
    const ellipse: TEllipseNode = {
      fill: '#fff',
      flipX: true,
      flipY: false,
      height: 10,
      id: 'e',
      name: 'Ellipse',
      parentId: null,
      rotation: 0,
      type: NodeType.ellipse,
      width: 10,
      x: 0,
      y: 0,
    };

    // action & result
    expect(getResizeNodeOrigin(ellipse)).toMatchObject({ flip: { x: true, y: false } });
  });
});
