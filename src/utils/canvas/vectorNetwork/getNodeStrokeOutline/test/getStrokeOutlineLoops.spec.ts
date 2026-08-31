// types
import { NodeType } from 'types/design/enums';
import { TEllipseNode, TLineNode, TRectangleNode, TVectorNode } from 'types/design/types';

// utils
import { getStrokeOutlineLoops } from '../getStrokeOutlineLoops';

const RECTANGLE: TRectangleNode = {
  fill: '#ffffff',
  height: 20,
  id: 'rect-1',
  name: 'Rectangle',
  parentId: null,
  rotation: 0,
  type: NodeType.rectangle,
  width: 20,
  x: 0,
  y: 0,
};

const ELLIPSE: TEllipseNode = { ...RECTANGLE, id: 'ellipse-1', name: 'Ellipse', type: NodeType.ellipse };

const LINE: TLineNode = {
  id: 'line-1',
  name: 'Line',
  parentId: null,
  stroke: '#000000',
  type: NodeType.line,
  x1: 0,
  x2: 100,
  y1: 0,
  y2: 0,
};

const VECTOR: TVectorNode = {
  fillColor: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: { s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeWidth: 4,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 } },
};

describe('getStrokeOutlineLoops', () => {
  it('should route a rectangle to the rounded-rect helper (outer + inner loop)', () => {
    // result
    expect(getStrokeOutlineLoops(RECTANGLE, 2)?.inner).not.toBeNull();
  });

  it('should route an ellipse to the ellipse helper (outer + inner loop)', () => {
    // result
    expect(getStrokeOutlineLoops(ELLIPSE, 2)?.inner).not.toBeNull();
  });

  it('should route a line to the segment-band helper (hole-less band)', () => {
    // result
    expect(getStrokeOutlineLoops(LINE, 2)?.inner).toBeNull();
    expect(getStrokeOutlineLoops(LINE, 2)?.outer).toHaveLength(4);
  });

  it('should route a vector to the simple-chain helper', () => {
    // result
    expect(getStrokeOutlineLoops(VECTOR, 2)?.outer.length).toBeGreaterThan(0);
  });
});
