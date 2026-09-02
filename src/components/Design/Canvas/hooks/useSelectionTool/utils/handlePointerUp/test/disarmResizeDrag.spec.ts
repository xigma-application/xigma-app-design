import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TResizeDragState } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

// utils
import { captureResizedVectorNodeSnapshots } from '../../handlePointerDown/captureResizedVectorNodeSnapshots';
import { continueResizeDrag } from '../../handlePointerMove/continueResizeDrag/continueResizeDrag';
import { createCanvasRefs } from 'components/Design/Canvas/hooks/useCanvasRefs/createCanvasRefs';
import { disarmResizeDrag } from '../disarmResizeDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createResizeDragRef = (resizeDragState: TResizeDragState | null = null): RefObject<TResizeDragState | null> => ({
  current: resizeDragState,
});

describe('disarmResizeDrag', () => {
  it('should do nothing when no resize drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    disarmResizeDrag(canvas, pointerEvent(), vi.fn(), createResizeDragRef(), createCanvasRefs());

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should clear the resize-drag ref and release pointer capture', () => {
    // mock
    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds: { height: 10, width: 10, x: 0, y: 0 },
      candidateShapes: [],
      handle: 'se',
      nodeOrigins: {},
    });

    // before
    disarmResizeDrag(canvas, pointerEvent(2), vi.fn(), resizeDragRef, createCanvasRefs());

    // result
    expect(resizeDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
  });

  it('should commit every resize-snapshotted vector node’s final geometry, computed from its frozen origin and the snapshot’s final scale/anchor', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds: { height: 10, width: 10, x: 0, y: 0 },
      candidateShapes: [],
      handle: 'se',
      nodeOrigins: {
        'vector-1': {
          rotation: 0,
          segments: {},
          vertices: { v1: { x: 0, y: 0 }, v2: { x: 10, y: 0 } },
        },
      },
    });

    canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current = new Map([
      [
        'vector-1',
        {
          anchorX: 0,
          anchorY: 0,
          facesByPaint: [],
          flattenedSegments: [],
          pivot: { x: 0, y: 0 },
          rotation: 0,
          scaleX: 2,
          scaleY: 1,
          scaledCenter: { x: 0, y: 0 },
          strokeColor: '#000000',
          strokeWidth: 1,
        },
      ],
    ]);

    const dispatch = vi.fn();

    // before
    disarmResizeDrag(canvas, pointerEvent(), dispatch, resizeDragRef, canvasRefs);

    // result
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current).toBeNull();
    expect(canvasRefs.transform.resizedNodeIdsRef.current).toBeNull();
  });

  it('should skip a snapshotted node whose origin was never captured, without dispatching or throwing', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const resizeDragRef = createResizeDragRef({
      aspectRatio: 1,
      bounds: { height: 10, width: 10, x: 0, y: 0 },
      candidateShapes: [],
      handle: 'se',
      nodeOrigins: {},
    });

    canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current = new Map([
      [
        'vector-1',
        {
          anchorX: 0,
          anchorY: 0,
          facesByPaint: [],
          flattenedSegments: [],
          pivot: { x: 0, y: 0 },
          rotation: 0,
          scaleX: 2,
          scaleY: 1,
          scaledCenter: { x: 0, y: 0 },
          strokeColor: '#000000',
          strokeWidth: 1,
        },
      ],
    ]);

    const dispatch = vi.fn();

    // before
    disarmResizeDrag(canvas, pointerEvent(), dispatch, resizeDragRef, canvasRefs);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(canvasRefs.vectorSnapshots.resizedVectorNodeSnapshotsRef.current).toBeNull();
  });

  describe('rotated single vector node, snapshot path vs. direct dispatch', () => {
    const addVectorNode = (x: number, y: number, width: number, height: number, rotation: number): string => {
      store.dispatch(
        addNode({
          fillColor: '#ff0000',
          filledFaceKeys: [],
          name: 'Vector',
          parentId: null,
          rotation,
          segments: {},
          strokeColor: '#000000',
          strokeWidth: 1,
          type: NodeType.vector,
          vertexHandleModes: {},
          vertices: {
            v1: { id: 'v1', x, y },
            v2: { id: 'v2', x: x + width, y },
            v3: { id: 'v3', x: x + width, y: y + height },
            v4: { id: 'v4', x, y: y + height },
          },
        }),
      );

      const { rootOrder } = selectActivePage(store.getState());

      return rootOrder[rootOrder.length - 1];
    };

    const createCanvasForDrag = (): HTMLCanvasElement => {
      const canvas = document.createElement('canvas');

      vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
      canvas.releasePointerCapture = vi.fn();
      canvas.setPointerCapture = vi.fn();

      return canvas;
    };

    beforeEach(() => {
      store.dispatch(setSelection([]));
    });

    it('should commit the exact same final geometry as the plain dispatch-per-frame path, for a single rotated vector node resize', () => {
      // mock — the "e"-handle scenario already proven correct (anchor stays fixed in world space) by
      // the direct-dispatch tests in continueResizeDrag.spec.ts; here it's resized twice — once with
      // no snapshot (dispatching every pointermove, the pre-existing behavior) and once through the
      // snapshot fast path (dispatching only once, on commit) — the two must land on identical geometry
      const idDirect = addVectorNode(0, 0, 100, 50, 90);
      const idSnapshotted = addVectorNode(0, 0, 100, 50, 90);
      const bounds = { height: 50, width: 100, x: 0, y: 0 };
      const nodeOriginFor = (id: string): TResizeDragState['nodeOrigins'] => ({
        [id]: {
          rotation: 90,
          segments: {},
          vertices: { v1: { x: 0, y: 0 }, v2: { x: 100, y: 0 }, v3: { x: 100, y: 50 }, v4: { x: 0, y: 50 } },
        },
      });

      // before — direct path: no snapshot ref populated, every pointermove dispatches
      const directCanvas = createCanvasForDrag();
      const directDragRef: RefObject<TResizeDragState | null> = {
        current: { aspectRatio: 1, bounds, candidateShapes: [], handle: 'e', nodeOrigins: nodeOriginFor(idDirect) },
      };

      continueResizeDrag(
        directCanvas,
        new PointerEvent('pointermove', { clientX: 200, clientY: 500 }),
        store.dispatch,
        directDragRef,
        createCanvasRefs(),
      );

      // before — snapshot path: capture at arm time, update per pointermove (no dispatch), commit once
      const snapshotCanvas = createCanvasForDrag();
      const snapshotCanvasRefs = createCanvasRefs();
      const snapshotDragRef: RefObject<TResizeDragState | null> = {
        current: { aspectRatio: 1, bounds, candidateShapes: [], handle: 'e', nodeOrigins: nodeOriginFor(idSnapshotted) },
      };

      captureResizedVectorNodeSnapshots(
        [store.getState().design.pages[store.getState().design.activePageId].nodes[idSnapshotted] as TVectorNode],
        snapshotCanvasRefs,
      );
      continueResizeDrag(
        snapshotCanvas,
        new PointerEvent('pointermove', { clientX: 200, clientY: 500 }),
        store.dispatch,
        snapshotDragRef,
        snapshotCanvasRefs,
      );
      disarmResizeDrag(snapshotCanvas, new PointerEvent('pointerup'), store.dispatch, snapshotDragRef, snapshotCanvasRefs);

      // result — both nodes end up with the same rotation, segments and vertices
      const directNode = store.getState().design.pages[store.getState().design.activePageId].nodes[idDirect] as TVectorNode;
      const snapshottedNode = store.getState().design.pages[store.getState().design.activePageId].nodes[idSnapshotted] as TVectorNode;

      expect(snapshottedNode.rotation).toBe(directNode.rotation);
      expect(snapshottedNode.segments).toEqual(directNode.segments);
      Object.keys(directNode.vertices).forEach((vertexId) => {
        expect(snapshottedNode.vertices[vertexId].x).toBeCloseTo(directNode.vertices[vertexId].x);
        expect(snapshottedNode.vertices[vertexId].y).toBeCloseTo(directNode.vertices[vertexId].y);
      });
    });
  });
});
