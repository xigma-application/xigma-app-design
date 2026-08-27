// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from '../../../deriveVectorFaces/deriveVectorFaces';
import { getOriginalFillPolygons } from '../getOriginalFillPolygons';
import { getVectorFillLoopKey } from '../../../getVectorFillLoopKey';

const buildSquareNode = (filledFaceKeys: string[]): TVectorNode => ({
  fillColor: null,
  filledFaceKeys,
  id: 'node-1',
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
  vertices: {
    a: { id: 'a', x: 0, y: 0 },
    b: { id: 'b', x: 10, y: 0 },
    c: { id: 'c', x: 10, y: 10 },
    d: { id: 'd', x: 0, y: 10 },
  },
});

// The square's own single, real loop key — computed the same way the app does, rather than
// hand-guessed, since the stored format bundles boundary metadata into each piece key.
const squareLoopKey = getVectorFillLoopKey(deriveVectorFaces(buildSquareNode([]))[0].pieceKeys);

describe('getOriginalFillPolygons', () => {
  it('should resolve every filled face key to its boundary points', () => {
    // mock
    const node = buildSquareNode([squareLoopKey]);

    // result
    expect(getOriginalFillPolygons(node)).toHaveLength(1);
  });

  it('should drop a key that no longer resolves to a closed loop', () => {
    // mock — references a segment id that does not exist
    const node = buildSquareNode(['does-not-exist']);

    // result
    expect(getOriginalFillPolygons(node)).toEqual([]);
  });

  it('should return an empty array for an unfilled node', () => {
    // mock
    const node = buildSquareNode([]);

    // result
    expect(getOriginalFillPolygons(node)).toEqual([]);
  });
});
