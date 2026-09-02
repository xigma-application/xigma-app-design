// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { captureResizedVectorNodeSnapshots } from '../captureResizedVectorNodeSnapshots';
import { captureVectorNodeResizeSnapshot } from 'utils/canvas/drawVectorNode/captureVectorNodeResizeSnapshot';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const buildVectorNode = (overrides: Partial<TVectorNode> = {}): TVectorNode => ({
  defaultFill: null,
  filledFaceKeys: [],
  id: 'vector-1',
  name: 'Vector',
  parentId: null,
  rotation: 0,
  segments: {},
  strokeColor: '#000000',
  strokeWidth: 1,
  type: NodeType.vector,
  vertexHandleModes: {},
  vertices: {},
  ...overrides,
});

const frameNode: TSceneNode = {
  fill: '#ff0000',
  height: 10,
  id: 'frame-1',
  name: 'Frame',
  parentId: null,
  rotation: 0,
  type: NodeType.frame,
  width: 10,
  x: 0,
  y: 0,
} as TSceneNode;

describe('captureResizedVectorNodeSnapshots', () => {
  it('should leave the snapshot ref untouched when no vector node is among the selected nodes', () => {
    // mock
    const canvasRefs = createCanvasRefs();

    // before
    captureResizedVectorNodeSnapshots([frameNode], canvasRefs);

    // result
    expect(canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current).toBeNull();
  });

  it('should capture a snapshot for a single, unrotated selected vector node', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const node = buildVectorNode();

    // before
    captureResizedVectorNodeSnapshots([node], canvasRefs);

    // result
    expect(canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current?.get('vector-1')).toEqual(
      captureVectorNodeResizeSnapshot(node, 0),
    );
  });

  it('should capture a single selected vector node that carries a live rotation, passing its rotation through for the anchor-correction fast path', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const node = buildVectorNode({ rotation: 45 });

    // before
    captureResizedVectorNodeSnapshots([node], canvasRefs);

    // result
    expect(canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current?.get('vector-1')).toEqual(
      captureVectorNodeResizeSnapshot(node, 45),
    );
  });

  it('should capture a rotated vector node as part of a multi-node selection with rotation zeroed, since group resize never applies the rotation anchor correction', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const rotatedNode = buildVectorNode({ id: 'vector-1', rotation: 45 });
    const otherNode = buildVectorNode({ id: 'vector-2' });

    // before
    captureResizedVectorNodeSnapshots([rotatedNode, otherNode], canvasRefs);

    // result
    expect(canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current?.get('vector-1')?.rotation).toBe(0);
    expect(canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current?.has('vector-2')).toBe(true);
  });

  it('should skip a vector node with a variable width profile — its stroke isn’t a uniform thickness the fast path can re-tessellate', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const node = buildVectorNode({ widthProfile: { points: { p1: { id: 'p1', leftOffset: 10, position: 0.5, rightOffset: 10 } } } });

    // before
    captureResizedVectorNodeSnapshots([node], canvasRefs);

    // result
    expect(canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current).toBeNull();
  });

  it('should skip a non-vector node in a mixed selection, capturing only the vector one', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const vectorNode = buildVectorNode();

    // before
    captureResizedVectorNodeSnapshots([frameNode, vectorNode], canvasRefs);

    // result
    expect(canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current?.size).toBe(1);
    expect(canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current?.has('vector-1')).toBe(true);
  });
});
