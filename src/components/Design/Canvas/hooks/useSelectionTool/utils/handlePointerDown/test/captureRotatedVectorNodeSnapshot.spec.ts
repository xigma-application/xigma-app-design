// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { captureRotatedVectorNodeSnapshot } from '../captureRotatedVectorNodeSnapshot';
import { captureVectorNodeRotateSnapshot } from 'utils/canvas/drawVectorNode/captureVectorNodeRotateSnapshot';
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

describe('captureRotatedVectorNodeSnapshot', () => {
  it('should capture a snapshot for a single selected vector node', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const node = buildVectorNode();

    // before
    captureRotatedVectorNodeSnapshot([node], canvasRefs);

    // result
    expect(canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current?.get('vector-1')).toEqual(
      captureVectorNodeRotateSnapshot(node),
    );
  });

  it('should leave the snapshot ref untouched when the single selected node isn’t a vector', () => {
    // mock
    const canvasRefs = createCanvasRefs();

    // before
    captureRotatedVectorNodeSnapshot([frameNode], canvasRefs);

    // result
    expect(canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current).toBeNull();
  });

  it('should leave the snapshot ref untouched for a multi-node selection, even if every node is a vector — group rotate bakes rotation into vertices, which this fast path doesn’t replicate', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const nodeA = buildVectorNode({ id: 'vector-1' });
    const nodeB = buildVectorNode({ id: 'vector-2' });

    // before
    captureRotatedVectorNodeSnapshot([nodeA, nodeB], canvasRefs);

    // result
    expect(canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current).toBeNull();
  });

  it('should leave the snapshot ref untouched for a vector node with a variable width profile', () => {
    // mock
    const canvasRefs = createCanvasRefs();
    const node = buildVectorNode({ widthProfile: { points: { p1: { id: 'p1', leftOffset: 10, position: 0.5, rightOffset: 10 } } } });

    // before
    captureRotatedVectorNodeSnapshot([node], canvasRefs);

    // result
    expect(canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current).toBeNull();
  });

  it('should leave the snapshot ref untouched when nothing is selected', () => {
    // mock
    const canvasRefs = createCanvasRefs();

    // before
    captureRotatedVectorNodeSnapshot([], canvasRefs);

    // result
    expect(canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current).toBeNull();
  });
});
