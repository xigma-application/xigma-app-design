import { RefObject } from 'react';

// store
import { addNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';
import { TVectorSegmentBendDragState } from 'types/design/selectionTool/types';

// utils
import { continueVectorSegmentBendDrag } from '../continueVectorSegmentBendDrag';
import { createCanvasRefs } from '../../../../../useCanvasRefs/createCanvasRefs';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createVectorSegmentBendDragRef = (
  value: TVectorSegmentBendDragState | null = null,
): RefObject<TVectorSegmentBendDragState | null> => ({ current: value });

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: { s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null } },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: { v1: { id: 'v1', x: 0, y: 0 }, v2: { id: 'v2', x: 100, y: 0 } },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

// a vertex shared by two segments — v1 to v2 (angle 0°, "right") and v1 to v3 (angle 90°, "down") — so a
// pending ambiguous bend can be resolved by comparing the first drag direction against each candidate
const addBranchingVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      filledFaceKeys: [],
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

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('continueVectorSegmentBendDrag', () => {
  it('should do nothing when no bend drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const setClassName = vi.fn();

    // before
    continueVectorSegmentBendDrag(canvas, pointerEvent(30, 60), dispatch, canvasRefs, createVectorSegmentBendDragRef(), setClassName);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should do nothing while a committed drag stays below the minimum drag distance', () => {
    // mock
    const nodeId = addVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const setClassName = vi.fn();
    const dragRef = createVectorSegmentBendDragRef({
      dragStart: { x: 0, y: 0 },
      nodeId,
      originalTangentEnd: null,
      originalTangentStart: null,
      segmentId: 's1',
      status: 'committed',
      tangentEnd: { x: -30, y: 0 },
      tangentStart: { x: 30, y: 0 },
    });

    // before — a 1px nudge, under MIN_DRAG_DISTANCE_PX
    continueVectorSegmentBendDrag(canvas, pointerEvent(1, 0), dispatch, canvasRefs, dragRef, setClassName);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should update both tangents by the same 4/3-scaled offset once past the minimum drag distance, and switch the cursor to bend', () => {
    // mock
    const nodeId = addVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = store.dispatch;
    const setClassName = vi.fn();
    const dragRef = createVectorSegmentBendDragRef({
      dragStart: { x: 0, y: 0 },
      nodeId,
      originalTangentEnd: null,
      originalTangentStart: null,
      segmentId: 's1',
      status: 'committed',
      tangentEnd: { x: -30, y: 0 },
      tangentStart: { x: 30, y: 0 },
    });

    // before — dragged to (30,60): dx=30, dy=60, scaled by 4/3 -> offset (40,80)
    continueVectorSegmentBendDrag(canvas, pointerEvent(30, 60), dispatch, canvasRefs, dragRef, setClassName);

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;

    expect(node.segments.s1.tangentStart).toEqual({ x: 70, y: 80 });
    expect(node.segments.s1.tangentEnd).toEqual({ x: 10, y: 80 });
    expect(setClassName).toHaveBeenCalledWith('bend');
  });

  it('should do nothing when the vector-editing node can no longer be found', () => {
    // mock — e.g. the node got deleted mid-drag
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const setClassName = vi.fn();
    const dragRef = createVectorSegmentBendDragRef({
      dragStart: { x: 0, y: 0 },
      nodeId: 'missing-node',
      originalTangentEnd: null,
      originalTangentStart: null,
      segmentId: 's1',
      status: 'committed',
      tangentEnd: { x: -30, y: 0 },
      tangentStart: { x: 30, y: 0 },
    });

    // before
    continueVectorSegmentBendDrag(canvas, pointerEvent(30, 60), dispatch, canvasRefs, dragRef, setClassName);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should do nothing while a pending ambiguous drag stays below the minimum drag distance', () => {
    // mock
    const nodeId = addBranchingVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = vi.fn();
    const setClassName = vi.fn();
    const dragRef = createVectorSegmentBendDragRef({
      candidates: [
        { angle: 0, segmentId: 's1' },
        { angle: 90, segmentId: 's2' },
      ],
      dragStart: { x: 0, y: 0 },
      nodeId,
      status: 'pending',
    });

    // before — a 1px nudge, under MIN_DRAG_DISTANCE_PX
    continueVectorSegmentBendDrag(canvas, pointerEvent(0, 1), dispatch, canvasRefs, dragRef, setClassName);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
    expect(dragRef.current).toEqual(expect.objectContaining({ status: 'pending' }));
  });

  it('should resolve a pending ambiguous drag to the candidate matching the first drag direction, and start bending it', () => {
    // mock
    const nodeId = addBranchingVectorNode();
    const canvas = createCanvas();
    const canvasRefs = createCanvasRefs();
    const dispatch = store.dispatch;
    const setClassName = vi.fn();
    const dragRef = createVectorSegmentBendDragRef({
      candidates: [
        { angle: 0, segmentId: 's1' },
        { angle: 90, segmentId: 's2' },
      ],
      dragStart: { x: 0, y: 0 },
      nodeId,
      status: 'pending',
    });

    // before — dragged straight down (0, 60): matches s2's 90° candidate, not s1's first-created 0°
    continueVectorSegmentBendDrag(canvas, pointerEvent(0, 60), dispatch, canvasRefs, dragRef, setClassName);

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;

    expect(dragRef.current).toEqual(expect.objectContaining({ segmentId: 's2', status: 'committed' }));
    expect(node.segments.s2.tangentStart).toEqual({ x: 0, y: 110 });
    expect(node.segments.s2.tangentEnd).toEqual({ x: 0, y: 50 });
    expect(node.segments.s1.tangentStart).toBeNull();
    expect(node.vertexHandleModes).toEqual({ v1: 'symmetric', v3: 'symmetric' });
    expect(canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current).toEqual(['s2']);
    expect(setClassName).toHaveBeenCalledWith('bend');
  });
});
