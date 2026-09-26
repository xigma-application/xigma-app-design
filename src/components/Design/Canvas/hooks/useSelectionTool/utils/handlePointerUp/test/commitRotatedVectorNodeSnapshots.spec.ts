// store
import { addNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TRectangleNode } from 'types/design/types';
import { TRotateDragState } from 'types/design/selectionTool/types';

// utils
import { commitRotatedVectorNodeSnapshots } from '../commitRotatedVectorNodeSnapshots';

const addImageRectangle = (crop: { height: number; rotation: number; width: number; x: number; y: number }): string => {
  store.dispatch(
    addNode({
      fills: [{ crop, opacity: 100, ref: 'asset-1', rotation: 0, scaleMode: 'fill', type: 'image' }],
      height: 20,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: 20,
      x: 40,
      y: 40,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const buildCanvasRefs = (): TCanvasRefs =>
  ({ vectorSnapshots: { rotatedVectorNodeSnapshotsRef: { current: null } } }) as unknown as TCanvasRefs;

const buildRotateDragState = (nodeOrigins: TRotateDragState['nodeOrigins'], pivot = { x: 50, y: 50 }): TRotateDragState => ({
  cursorAngle: 0,
  nodeOrigins,
  pivot,
  startAngle: 0,
});

describe('commitRotatedVectorNodeSnapshots', () => {
  it('should do nothing when there is no snapshot map at all', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = buildCanvasRefs();
    const dragState = buildRotateDragState({});

    // before
    commitRotatedVectorNodeSnapshots(dispatch, dragState, canvasRefs);

    // result
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('should rotate an image fill’s crop rect around the same pivot as the node, instead of leaving it behind', () => {
    // mock — a 20x20 crop rect exactly matching the node's own bounds, pivoting 90° around the
    // node's own center (50,50): the crop must land back on the node, rotated the same 90°
    const id = addImageRectangle({ height: 20, rotation: 0, width: 20, x: 40, y: 40 });
    const canvasRefs = buildCanvasRefs();
    const dragState = buildRotateDragState({ [id]: { height: 20, rotation: 0, width: 20, x: 40, y: 40 } });

    canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current = new Map([
      [id, { deltaDegrees: 90, facesByPaint: [], pivot: { x: 50, y: 50 }, strokeVertices: [], strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' as const }] }],
    ]);

    // before
    commitRotatedVectorNodeSnapshots(store.dispatch, dragState, canvasRefs);

    // result
    const node = selectActivePage(store.getState()).nodes[id] as TRectangleNode;

    expect(node.rotation).toBe(90);

    const crop = node.fills[0].type === 'image' ? node.fills[0].crop : undefined;

    expect(crop?.rotation).toBe(90);
    expect(crop?.x).toBeCloseTo(40);
    expect(crop?.y).toBeCloseTo(40);
  });

  it('should not touch fills when the node has no image crop to carry along', () => {
    // mock
    store.dispatch(
      addNode({
        fills: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
        height: 20,
        name: 'Rectangle',
        parentId: null,
        rotation: 0,
        type: NodeType.rectangle,
        width: 20,
        x: 40,
        y: 40,
      }),
    );

    const { rootOrder } = selectActivePage(store.getState());
    const id = rootOrder[rootOrder.length - 1];
    const canvasRefs = buildCanvasRefs();
    const dragState = buildRotateDragState({ [id]: { height: 20, rotation: 0, width: 20, x: 40, y: 40 } });

    canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current = new Map([
      [id, { deltaDegrees: 90, facesByPaint: [], pivot: { x: 50, y: 50 }, strokeVertices: [], strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' as const }] }],
    ]);

    // before
    commitRotatedVectorNodeSnapshots(store.dispatch, dragState, canvasRefs);

    // result
    const node = selectActivePage(store.getState()).nodes[id] as TRectangleNode;

    expect(node.fills[0]).toMatchObject({ color: '#ff0000', type: 'solid' });
  });

  it('should skip a snapshotted node whose origin was never captured, without dispatching or throwing', () => {
    // mock
    const dispatch = vi.fn();
    const canvasRefs = buildCanvasRefs();
    const dragState = buildRotateDragState({});

    canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current = new Map([
      ['missing-id', { deltaDegrees: 45, facesByPaint: [], pivot: { x: 0, y: 0 }, strokeVertices: [], strokes: [{ color: '#00ff00', opacity: 100, type: 'solid' as const }] }],
    ]);

    // before
    expect(() => commitRotatedVectorNodeSnapshots(dispatch, dragState, canvasRefs)).not.toThrow();

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current).toBeNull();
  });
});
