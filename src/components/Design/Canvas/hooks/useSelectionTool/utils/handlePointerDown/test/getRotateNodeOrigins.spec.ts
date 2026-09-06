// types
import { NodeType } from 'types/design/enums';
import { TFrameNode, TLineNode, TVectorNode } from 'types/design/types';

// utils
import { getRotateNodeOrigins } from '../getRotateNodeOrigins';

const frame: TFrameNode = {
  childIds: [],
  clipContent: true,
  fill: '#ff0000',
  height: 100,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 30,
  type: NodeType.frame,
  width: 100,
  x: 0,
  y: 0,
};

const line: TLineNode = {
  id: 'line-1',
  name: 'Line',
  parentId: null,
  stroke: '#000000',
  type: NodeType.line,
  x1: 10,
  x2: 20,
  y1: 30,
  y2: 40,
};

const vector: TVectorNode = {
  defaultFill: [{ color: '#000000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 15,
  segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 10, y: 0 } },
};

describe('getRotateNodeOrigins', () => {
  it('should capture a box node’s height/rotation/width/x/y', () => {
    // result
    expect(getRotateNodeOrigins([frame])).toEqual({
      'frame-1': { height: 100, rotation: 30, width: 100, x: 0, y: 0 },
    });
  });

  it('should capture a line node’s endpoints', () => {
    // result
    expect(getRotateNodeOrigins([line])).toEqual({
      'line-1': { x1: 10, x2: 20, y1: 30, y2: 40 },
    });
  });

  it('should capture a vector node’s rotation, segments and vertices', () => {
    // result
    expect(getRotateNodeOrigins([vector])).toEqual({
      'vector-1': { rotation: 15, segments: vector.segments, vertices: vector.vertices },
    });
  });

  it('should capture origins for a mixed set of nodes, keyed by id', () => {
    // result
    const origins = getRotateNodeOrigins([frame, line, vector]);

    expect(Object.keys(origins)).toEqual(['frame-1', 'line-1', 'vector-1']);
  });
});
