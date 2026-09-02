// types
import { NodeType } from 'types/design/enums';
import { TPaint } from 'types/design/paint/types';
import { TVectorPaintTouchedLoopKeys } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { deriveVectorFaces } from 'utils/canvas/vectorNetwork/deriveVectorFaces/deriveVectorFaces';
import { getVectorFillLoopKey } from 'utils/canvas/vectorNetwork/getVectorFillLoopKey';
import { paintNodeAlongPath } from '../paintNodeAlongPath';

const solid = (color: string): TPaint[] => [{ color, opacity: 100, type: 'solid' }];

// a square (a-b-c-d) split by the a-c diagonal into two triangular faces: the upper-right (a,b,c) and
// the lower-left (a,c,d) — enough to prove a single stroke can paint more than one face
const buildSplitSquareVectorNode = (filledFaceKeys: string[] = [], fillByKey: Record<string, TPaint[]> = {}): TVectorNode => ({
  defaultFill: null,
  fillByKey,
  filledFaceKeys,
  id: 'node-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    diag: { endId: 'c', id: 'diag', startId: 'a', tangentEnd: null, tangentStart: null },
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
    b: { id: 'b', x: 100, y: 0 },
    c: { id: 'c', x: 100, y: 100 },
    d: { id: 'd', x: 0, y: 100 },
  },
});

// a square (a-b-c-d) plus a separate horizontal line crossing its left and right edges, both living in
// the same node — the crossing only exists virtually (render-time planarization) until it gets baked
const buildSquareWithVirtualCrossingVectorNode = (): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'node-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {
    line1: { endId: 'p2', id: 'line1', startId: 'p1', tangentEnd: null, tangentStart: null },
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
    b: { id: 'b', x: 100, y: 0 },
    c: { id: 'c', x: 100, y: 100 },
    d: { id: 'd', x: 0, y: 100 },
    p1: { id: 'p1', x: -20, y: 50 },
    p2: { id: 'p2', x: 120, y: 50 },
  },
});

describe('paintNodeAlongPath behaviors', () => {
  it('should paint every still-untouched face the path crosses and return every crossed face key', () => {
    // mock
    const dispatch = vi.fn();
    const node = buildSplitSquareVectorNode();
    const touchedLoopKeys: TVectorPaintTouchedLoopKeys = {};

    // before
    const faceKeys = paintNodeAlongPath(dispatch, node, [{ x: 70, y: 30 }], '#00ff00', false, touchedLoopKeys);

    // result
    expect(faceKeys).toHaveLength(1);
    expect(dispatch).toHaveBeenCalledTimes(1);

    const changes = dispatch.mock.calls[0][0].payload.changes as Partial<TVectorNode>;

    expect(changes.filledFaceKeys).toHaveLength(1);
    expect(Object.values(changes.fillByKey!)).toEqual([solid('#00ff00')]);
    expect(touchedLoopKeys['node-1'].size).toBe(1);
  });

  it('should skip a face already touched earlier in the same stroke', () => {
    // mock
    const dispatch = vi.fn();
    const node = buildSplitSquareVectorNode();
    const touchedLoopKeys: TVectorPaintTouchedLoopKeys = {};

    // before
    paintNodeAlongPath(dispatch, node, [{ x: 70, y: 30 }], '#00ff00', false, touchedLoopKeys);
    dispatch.mockClear();
    paintNodeAlongPath(dispatch, node, [{ x: 75, y: 25 }], '#00ff00', false, touchedLoopKeys);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(touchedLoopKeys['node-1'].size).toBe(1);
  });

  it('should remove an already-filled face instead of adding it when remove mode is on', () => {
    // mock
    const dispatch = vi.fn();
    const upperRightFace = deriveVectorFaces(buildSplitSquareVectorNode()).find((face) =>
      face.pieceKeys.some((key) => key.startsWith('s1[')),
    )!;
    const upperRightKey = getVectorFillLoopKey(upperRightFace.pieceKeys);
    const node = buildSplitSquareVectorNode([upperRightKey], { [upperRightKey]: solid('#ff0000') });
    const touchedLoopKeys: TVectorPaintTouchedLoopKeys = {};

    // before
    paintNodeAlongPath(dispatch, node, [{ x: 70, y: 30 }], '#00ff00', true, touchedLoopKeys);

    // result
    const changes = dispatch.mock.calls[0][0].payload.changes as Partial<TVectorNode>;

    expect(changes.filledFaceKeys).toEqual([]);
  });

  it('should bake a virtual crossing the newly-touched face depends on into real, persisted segments/vertices', () => {
    // mock
    const dispatch = vi.fn();
    const node = buildSquareWithVirtualCrossingVectorNode();
    const touchedLoopKeys: TVectorPaintTouchedLoopKeys = {};

    // before
    const faceKeys = paintNodeAlongPath(dispatch, node, [{ x: 50, y: 25 }], '#00ff00', false, touchedLoopKeys);

    // result
    expect(faceKeys).toHaveLength(1);

    const changes = dispatch.mock.calls[0][0].payload.changes as Partial<TVectorNode>;

    expect(changes.segments).toBeDefined();
    expect(changes.vertices).toBeDefined();
  });
});
