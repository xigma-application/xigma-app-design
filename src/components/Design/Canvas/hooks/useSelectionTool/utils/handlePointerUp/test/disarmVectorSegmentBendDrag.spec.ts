import { RefObject } from 'react';

// store
import { addNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';
import { TVectorSegmentBendDragState } from 'types/design/selectionTool/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { disarmVectorSegmentBendDrag } from '../disarmVectorSegmentBendDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

const createVectorSegmentBendDragRef = (
  value: TVectorSegmentBendDragState | null = null,
): RefObject<TVectorSegmentBendDragState | null> => ({ current: value });

const addBranchingVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v1', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 }, v3: { id: 'v3', x: 0, y: 90 } },
    }),
  );

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('disarmVectorSegmentBendDrag', () => {
  it('should do nothing when no bend drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const setClassName = vi.fn();

    // before
    disarmVectorSegmentBendDrag(canvas, pointerEvent(), dispatch, canvasRefs, createVectorSegmentBendDragRef(), setClassName);

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should clear the bend-drag ref, release pointer capture, and reset the cursor, leaving whatever bend was already dispatched in place', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const vectorSegmentBendDragRef = createVectorSegmentBendDragRef({
      dragStart: { x: 0, y: 0 },
      nodeId: 'path-1',
      originalTangentEnd: null,
      originalTangentStart: null,
      segmentId: 's1',
      status: 'committed',
      tangentEnd: { x: -30, y: 0 },
      tangentStart: { x: 30, y: 0 },
    });
    const setClassName = vi.fn();

    // before
    disarmVectorSegmentBendDrag(canvas, pointerEvent(2), dispatch, canvasRefs, vectorSegmentBendDragRef, setClassName);

    // result
    expect(vectorSegmentBendDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should commit the first candidate for a pending ambiguous drag released without ever moving', () => {
    // mock — e.g. a plain Ctrl+click near a shared vertex with no drag at all
    const nodeId = addBranchingVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = store.dispatch;
    const setClassName = vi.fn();
    const vectorSegmentBendDragRef = createVectorSegmentBendDragRef({
      candidates: [
        { angle: 0, segmentId: 's1' },
        { angle: 90, segmentId: 's2' },
      ],
      dragStart: { x: 0, y: 0 },
      nodeId,
      status: 'pending',
    });

    // before
    disarmVectorSegmentBendDrag(canvas, pointerEvent(2), dispatch, canvasRefs, vectorSegmentBendDragRef, setClassName);

    // result
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(node.segments.s1.tangentStart).not.toBeNull();
    expect(canvasRefs.selectedVectorSegmentIdsRef.current).toEqual(['s1']);
    expect(vectorSegmentBendDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should just clear the ref for a pending drag whose node can no longer be found', () => {
    // mock — e.g. the node got deleted mid-gesture
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const setClassName = vi.fn();
    const vectorSegmentBendDragRef = createVectorSegmentBendDragRef({
      candidates: [{ angle: 0, segmentId: 's1' }],
      dragStart: { x: 0, y: 0 },
      nodeId: 'missing-node',
      status: 'pending',
    });

    // before
    disarmVectorSegmentBendDrag(canvas, pointerEvent(2), dispatch, canvasRefs, vectorSegmentBendDragRef, setClassName);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(vectorSegmentBendDragRef.current).toBeNull();
    expect(canvas.releasePointerCapture).toHaveBeenCalledWith(2);
    expect(setClassName).toHaveBeenCalledWith(null);
  });
});
