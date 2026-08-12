// types
import { NodeType } from 'types/design/enums';
import { TLineNode, TRectangleNode } from 'types/design/types';

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
});
