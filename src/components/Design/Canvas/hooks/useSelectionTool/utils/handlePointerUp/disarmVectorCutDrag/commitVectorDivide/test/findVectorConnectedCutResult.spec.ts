// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { findVectorConnectedCutResult } from '../findVectorConnectedCutResult';

const buildTriangleNode = (): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'triangle',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
    s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
    s3: { endId: 'a', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x: 0, y: 0 }, b: { id: 'b', x: 100, y: 0 }, c: { id: 'c', x: 50, y: 100 } },
});

const buildSquareNode = (x: number): TVectorNode => ({
  defaultFill: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
  filledFaceKeys: [],
  id: 'square',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    s1: { endId: 'b', id: 's1', startId: 'a', tangentEnd: null, tangentStart: null },
    s2: { endId: 'c', id: 's2', startId: 'b', tangentEnd: null, tangentStart: null },
    s3: { endId: 'd', id: 's3', startId: 'c', tangentEnd: null, tangentStart: null },
    s4: { endId: 'a', id: 's4', startId: 'd', tangentEnd: null, tangentStart: null },
  },
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: { a: { id: 'a', x, y: 0 }, b: { id: 'b', x: x + 100, y: 0 }, c: { id: 'c', x: x + 100, y: 100 }, d: { id: 'd', x, y: 100 } },
});

describe('findVectorConnectedCutResult', () => {
  it('should materialize a genuine cut when the line crosses only one edge and the network stays connected', () => {
    // mock — a short vertical line crossing only edge a-b of the triangle
    const node = buildTriangleNode();

    // before
    const result = findVectorConnectedCutResult(node, { x: 50, y: -10 }, { x: 50, y: 10 });

    // result — edge a-b was genuinely severed into two disconnected points, not one shared vertex
    expect(result?.node).toBe(node);
    expect(Object.keys(result!.segments)).toHaveLength(4);
    expect(Object.keys(result!.vertices)).toHaveLength(5);
  });

  it('should return null when the cut line misses the node entirely', () => {
    // mock
    const node = buildSquareNode(1000);

    // before
    const result = findVectorConnectedCutResult(node, { x: -20, y: 50 }, { x: 120, y: 50 });

    // result
    expect(result).toBeNull();
  });
});
