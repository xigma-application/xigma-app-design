import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TVectorMultiSelectRotateDragState } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

// utils
import { continueVectorMultiSelectRotateDrag } from '../continueVectorMultiSelectRotateDrag';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createVectorMultiSelectRotateDragRef = (
  dragState: TVectorMultiSelectRotateDragState | null = null,
): RefObject<TVectorMultiSelectRotateDragState | null> => ({ current: dragState });

const addVectorNode = (): string => {
  store.dispatch(
    addNode({
      fillColor: null,
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: { x: 5, y: 0 } },
      },
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

describe('continueVectorMultiSelectRotateDrag', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no rotate drag is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    continueVectorMultiSelectRotateDrag(canvas, pointerEvent(10, 10), store.dispatch, createVectorMultiSelectRotateDragRef());

    // result
    expect(store.getState().design.nodes).toEqual({});
  });

  it('should do nothing when the drag points at a node that no longer exists', () => {
    // mock
    const canvas = createCanvas();
    const dragRef = createVectorMultiSelectRotateDragRef({
      bounds: { height: 0, width: 100, x: 0, y: 0 },
      cursorAngle: 0,
      deltaDegrees: 0,
      handleOrigins: {},
      nodeId: 'missing-node',
      pivot: { x: 50, y: 0 },
      rotation: 0,
      startAngle: 0,
      vertexOrigins: { v1: { x: 0, y: 0 } },
    });

    // before
    continueVectorMultiSelectRotateDrag(canvas, pointerEvent(50, 50), store.dispatch, dragRef);

    // result
    expect(store.getState().design.nodes).toEqual({});
  });

  it('should rotate every selected vertex around the pivot and every selected tangent offset around the origin, by the same delta angle', () => {
    // mock — v1(0,0)/v2(100,0) selected, pivot (50,0), armed with the pointer due east (startAngle 0);
    // dragging the pointer due south of the pivot is a 90deg turn
    const nodeId = addVectorNode();
    const canvas = createCanvas();
    const dragRef = createVectorMultiSelectRotateDragRef({
      bounds: { height: 0, width: 100, x: 0, y: 0 },
      cursorAngle: 0,
      deltaDegrees: 0,
      handleOrigins: { 'start:s1': { x: 5, y: 0 } },
      nodeId,
      pivot: { x: 50, y: 0 },
      rotation: 0,
      startAngle: 0,
      vertexOrigins: { v1: { x: 0, y: 0 }, v2: { x: 100, y: 0 } },
    });

    // before
    continueVectorMultiSelectRotateDrag(canvas, pointerEvent(50, 50), store.dispatch, dragRef);

    // result
    const node = store.getState().design.nodes[nodeId];

    expect(node).toMatchObject({
      segments: { s1: { tangentStart: { x: 0, y: 5 } } },
      vertices: { v1: { id: 'v1', x: 50, y: -50 }, v2: { id: 'v2', x: 50, y: 50 } },
    });
    // result — the live delta is written back onto the ref so the render loop can draw the box tilted
    expect(dragRef.current?.deltaDegrees).toBe(90);
  });

  it('should rotate a selected "end" tangent offset around the origin too, not just "start" ones', () => {
    // mock — same 90deg turn as above, but the selected handle is the segment's "end" side this time
    const nodeId = addVectorNode();
    const canvas = createCanvas();
    const dragRef = createVectorMultiSelectRotateDragRef({
      bounds: { height: 0, width: 100, x: 0, y: 0 },
      cursorAngle: 0,
      deltaDegrees: 0,
      handleOrigins: { 'end:s1': { x: -5, y: 0 } },
      nodeId,
      pivot: { x: 50, y: 0 },
      rotation: 0,
      startAngle: 0,
      vertexOrigins: {},
    });

    // before
    continueVectorMultiSelectRotateDrag(canvas, pointerEvent(50, 50), store.dispatch, dragRef);

    // result — toBeCloseTo, not toMatchObject: cos(90deg) via Math.cos isn't exactly 0, so the
    // untouched axis can come out as a floating-point -0 instead of 0
    const node = store.getState().design.nodes[nodeId] as TVectorNode;

    expect(node.segments.s1.tangentEnd?.x).toBeCloseTo(0);
    expect(node.segments.s1.tangentEnd?.y).toBeCloseTo(-5);
  });
});
