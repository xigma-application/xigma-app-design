import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TRotateDragState } from 'types/design/selectionTool/types';

// utils
import { continueRotateDrag } from '../continueRotateDrag';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createRotateDragRef = (rotateDragState: TRotateDragState | null = null): RefObject<TRotateDragState | null> => ({
  current: rotateDragState,
});

const addFrameNode = (x: number, y: number, width: number, height: number, rotation = 0, parentId: string | null = null): string => {
  store.dispatch(addNode({ fill: '#ff0000', height, name: 'Frame', parentId, rotation, type: NodeType.frame, width, x, y }));

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

const addLineNode = (x1: number, y1: number, x2: number, y2: number, parentId: string | null = null): string => {
  store.dispatch(addNode({ name: 'Line', parentId, stroke: '#000000', type: NodeType.line, x1, x2, y1, y2 }));

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('continueRotateDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no rotate drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueRotateDrag(canvas, pointerEvent(10, 10), store.dispatch, createRotateDragRef(), createCanvasRefs());

    // result
    expect(store.getState().design.nodes).toEqual({});
  });

  it('should spin a single node in place around its own center, position unchanged', () => {
    // mock — pivot equals the node's own center (50, 50); pointer starts due east (angle 0)
    const idA = addFrameNode(0, 0, 100, 100);
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef({
      cursorAngle: 0,
      nodeOrigins: { [idA]: { height: 100, rotation: 0, width: 100, x: 0, y: 0 } },
      pivot: { x: 50, y: 50 },
      startAngle: 0,
    });

    // before — pointer moves due south of the pivot (angle 90), a 90deg delta
    continueRotateDrag(canvas, pointerEvent(50, 150), store.dispatch, rotateDragRef, createCanvasRefs());

    // result — position collapses back to the same x/y, only rotation changes
    expect(store.getState().design.nodes[idA]).toMatchObject({ height: 100, rotation: 90, width: 100, x: 0, y: 0 });
  });

  it('should accumulate on top of a node that already had a non-zero rotation', () => {
    // mock
    const idA = addFrameNode(0, 0, 100, 100, 30);
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef({
      cursorAngle: 0,
      nodeOrigins: { [idA]: { height: 100, rotation: 30, width: 100, x: 0, y: 0 } },
      pivot: { x: 50, y: 50 },
      startAngle: 0,
    });

    // before
    continueRotateDrag(canvas, pointerEvent(50, 150), store.dispatch, rotateDragRef, createCanvasRefs());

    // result
    expect(store.getState().design.nodes[idA]).toMatchObject({ rotation: 120 });
  });

  it('should orbit each member of a group around the shared pivot, spinning each individually', () => {
    // mock — A's center (50, 50) sits directly west of the shared pivot (150, 50); B's center
    // (250, 50) sits directly east of it
    const idA = addFrameNode(0, 0, 100, 100, 0, 'parent-1');
    const idB = addFrameNode(200, 0, 100, 100, 0, 'parent-1');
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef({
      cursorAngle: 0,
      nodeOrigins: {
        [idA]: { height: 100, rotation: 0, width: 100, x: 0, y: 0 },
        [idB]: { height: 100, rotation: 0, width: 100, x: 200, y: 0 },
      },
      pivot: { x: 150, y: 50 },
      startAngle: 0,
    });

    // before — a 90deg delta (pointer moves from due east to due south of the pivot)
    continueRotateDrag(canvas, pointerEvent(150, 150), store.dispatch, rotateDragRef, createCanvasRefs());

    // result — A swings from west to north of the pivot, B swings from east to south; both spin
    // by the same 90deg
    expect(store.getState().design.nodes[idA]).toMatchObject({ rotation: 90, x: 100, y: -100 });
    expect(store.getState().design.nodes[idB]).toMatchObject({ rotation: 90, x: 100, y: 100 });
  });

  it('should rotate a line by its endpoints instead of an x/y/rotation triple', () => {
    // mock — a vertical line whose own center (100, 50) is the pivot
    const idLine = addLineNode(100, 0, 100, 100, 'parent-1');
    const canvas = createCanvas();
    const rotateDragRef = createRotateDragRef({
      cursorAngle: 0,
      nodeOrigins: { [idLine]: { x1: 100, x2: 100, y1: 0, y2: 100 } },
      pivot: { x: 100, y: 50 },
      startAngle: 0,
    });

    // before — a 90deg delta turns the vertical line horizontal
    continueRotateDrag(canvas, pointerEvent(100, 150), store.dispatch, rotateDragRef, createCanvasRefs());

    // result
    const line = store.getState().design.nodes[idLine] as { x1: number; x2: number; y1: number; y2: number };

    expect(line.x1).toBeCloseTo(150);
    expect(line.y1).toBeCloseTo(50);
    expect(line.x2).toBeCloseTo(50);
    expect(line.y2).toBeCloseTo(50);
  });

  describe('vector node rotate snapshots', () => {
    const buildSnapshot = () => ({
      deltaDegrees: 0,
      facesByColor: [],
      pivot: { x: 50, y: 50 },
      strokeColor: '#000000',
      strokeVertices: [],
    });

    it('should update a snapshotted vector node’s delta and mark it as rotated, without touching the store at all', () => {
      // mock
      const idA = addFrameNode(0, 0, 100, 100);
      const canvas = createCanvas();
      const rotateDragRef = createRotateDragRef({
        cursorAngle: 0,
        nodeOrigins: { [idA]: { rotation: 0, segments: {}, vertices: {} } },
        pivot: { x: 50, y: 50 },
        startAngle: 0,
      });
      const canvasRefs = createCanvasRefs();
      const snapshot = buildSnapshot();

      canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current = new Map([[idA, snapshot]]);

      const nodeBefore = store.getState().design.nodes[idA];

      // before — a 90deg delta
      continueRotateDrag(canvas, pointerEvent(50, 150), store.dispatch, rotateDragRef, canvasRefs);

      // result — the store node is untouched, but the snapshot itself now reflects the live drag
      expect(store.getState().design.nodes[idA]).toBe(nodeBefore);
      expect(snapshot.deltaDegrees).toBeCloseTo(90);
      expect(canvasRefs.transform.rotatedNodeIdsRef.current).toEqual(new Set([idA]));
    });

    it('should not replace an already-initialized rotated-node-ids set on a subsequent pointermove', () => {
      // mock
      const idA = addFrameNode(0, 0, 100, 100);
      const canvas = createCanvas();
      const rotateDragRef = createRotateDragRef({
        cursorAngle: 0,
        nodeOrigins: { [idA]: { rotation: 0, segments: {}, vertices: {} } },
        pivot: { x: 50, y: 50 },
        startAngle: 0,
      });
      const canvasRefs = createCanvasRefs();

      canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current = new Map([[idA, buildSnapshot()]]);

      const existingSet = new Set(['some-other-id']);

      canvasRefs.transform.rotatedNodeIdsRef.current = existingSet;

      // before
      continueRotateDrag(canvas, pointerEvent(50, 150), store.dispatch, rotateDragRef, canvasRefs);

      // result
      expect(canvasRefs.transform.rotatedNodeIdsRef.current).toBe(existingSet);
    });

    it('should still dispatch normally for a non-snapshotted node in the same rotate gesture as a snapshotted one', () => {
      // mock — a mixed selection: one vector node fast-pathed via a snapshot, one plain frame rotated live
      const idVector = addFrameNode(0, 0, 100, 100, 0, 'parent-1');
      const idFrame = addFrameNode(200, 0, 100, 100, 0, 'parent-1');
      const canvas = createCanvas();
      const rotateDragRef = createRotateDragRef({
        cursorAngle: 0,
        nodeOrigins: {
          [idFrame]: { height: 100, rotation: 0, width: 100, x: 200, y: 0 },
          [idVector]: { rotation: 0, segments: {}, vertices: {} },
        },
        pivot: { x: 150, y: 50 },
        startAngle: 0,
      });
      const canvasRefs = createCanvasRefs();

      canvasRefs.vectorSnapshots.rotatedVectorNodeSnapshotsRef.current = new Map([[idVector, buildSnapshot()]]);

      // before — a 90deg delta
      continueRotateDrag(canvas, pointerEvent(150, 150), store.dispatch, rotateDragRef, canvasRefs);

      // result — the frame still rotated live through the store, the vector node's store entry is untouched
      expect(store.getState().design.nodes[idFrame]).toMatchObject({ rotation: 90 });
    });
  });
});
