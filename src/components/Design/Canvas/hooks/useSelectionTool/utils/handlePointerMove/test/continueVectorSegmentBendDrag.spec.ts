import { RefObject } from 'react';

// store
import { addNode } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorNode } from 'types/design/types';
import { TVectorSegmentBendDragState } from 'types/design/selectionTool/types';

// utils
import { continueVectorSegmentBendDrag } from '../continueVectorSegmentBendDrag';

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

  const { rootOrder } = store.getState().design;

  return rootOrder[rootOrder.length - 1];
};

describe('continueVectorSegmentBendDrag', () => {
  it('should do nothing when no bend drag is in progress', () => {
    // mock
    const canvas = createCanvas();
    const dispatch = vi.fn();
    const setClassName = vi.fn();

    // before
    continueVectorSegmentBendDrag(canvas, pointerEvent(30, 60), dispatch, createVectorSegmentBendDragRef(), setClassName);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should do nothing while the drag stays below the minimum drag distance', () => {
    // mock
    const nodeId = addVectorNode();
    const canvas = createCanvas();
    const dispatch = vi.fn();
    const setClassName = vi.fn();
    const dragRef = createVectorSegmentBendDragRef({
      dragStart: { x: 0, y: 0 },
      nodeId,
      originalTangentEnd: null,
      originalTangentStart: null,
      segmentId: 's1',
      tangentEnd: { x: -30, y: 0 },
      tangentStart: { x: 30, y: 0 },
    });

    // before — a 1px nudge, under MIN_DRAG_DISTANCE_PX
    continueVectorSegmentBendDrag(canvas, pointerEvent(1, 0), dispatch, dragRef, setClassName);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should update both tangents by the same 4/3-scaled offset once past the minimum drag distance, and switch the cursor to bend', () => {
    // mock
    const nodeId = addVectorNode();
    const canvas = createCanvas();
    const dispatch = store.dispatch;
    const setClassName = vi.fn();
    const dragRef = createVectorSegmentBendDragRef({
      dragStart: { x: 0, y: 0 },
      nodeId,
      originalTangentEnd: null,
      originalTangentStart: null,
      segmentId: 's1',
      tangentEnd: { x: -30, y: 0 },
      tangentStart: { x: 30, y: 0 },
    });

    // before — dragged to (30,60): dx=30, dy=60, scaled by 4/3 -> offset (40,80)
    continueVectorSegmentBendDrag(canvas, pointerEvent(30, 60), dispatch, dragRef, setClassName);

    // result
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(node.segments.s1.tangentStart).toEqual({ x: 70, y: 80 });
    expect(node.segments.s1.tangentEnd).toEqual({ x: 10, y: 80 });
    expect(setClassName).toHaveBeenCalledWith('bend');
  });

  it('should do nothing when the vector-editing node can no longer be found', () => {
    // mock — e.g. the node got deleted mid-drag
    const canvas = createCanvas();
    const dispatch = vi.fn();
    const setClassName = vi.fn();
    const dragRef = createVectorSegmentBendDragRef({
      dragStart: { x: 0, y: 0 },
      nodeId: 'missing-node',
      originalTangentEnd: null,
      originalTangentStart: null,
      segmentId: 's1',
      tangentEnd: { x: -30, y: 0 },
      tangentStart: { x: 30, y: 0 },
    });

    // before
    continueVectorSegmentBendDrag(canvas, pointerEvent(30, 60), dispatch, dragRef, setClassName);

    // result
    expect(dispatch).not.toHaveBeenCalled();
    expect(setClassName).not.toHaveBeenCalled();
  });
});
