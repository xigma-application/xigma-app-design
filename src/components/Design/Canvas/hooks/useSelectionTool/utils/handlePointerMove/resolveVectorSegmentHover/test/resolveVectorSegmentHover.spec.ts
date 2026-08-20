import { RefObject } from 'react';

// store
import { addNode, setSelection, setVectorEditingNodeId } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';

// utils
import { resolveVectorSegmentHover } from '../resolveVectorSegmentHover';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, buttons = 0): PointerEvent =>
  new PointerEvent('pointermove', { buttons, clientX: x, clientY: y });

const createHoveredVectorSegmentIdRef = (): RefObject<string | null> => ({ current: null });
const createHoveredVectorEdgeInsertPointRef = (): RefObject<TPoint | null> => ({ current: null });

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

describe('resolveVectorSegmentHover', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeId(null));
  });

  it('should do nothing when no node is currently in Vector Edit Mode', () => {
    // mock
    const canvas = createCanvas();
    const hoveredVectorSegmentIdRef = createHoveredVectorSegmentIdRef();
    const hoveredVectorEdgeInsertPointRef = createHoveredVectorEdgeInsertPointRef();
    const setClassName = vi.fn();

    // before
    resolveVectorSegmentHover(canvas, pointerEvent(50, 0), hoveredVectorSegmentIdRef, hoveredVectorEdgeInsertPointRef, setClassName);

    // result
    expect(hoveredVectorSegmentIdRef.current).toBeNull();
    expect(hoveredVectorEdgeInsertPointRef.current).toBeNull();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should set the hovered segment id and insert-point, and switch the cursor to pen-extend, when the pointer rests over the interior of a segment', () => {
    // mock
    const nodeId = addVectorNode();
    store.dispatch(setVectorEditingNodeId(nodeId));
    const canvas = createCanvas();
    const hoveredVectorSegmentIdRef = createHoveredVectorSegmentIdRef();
    const hoveredVectorEdgeInsertPointRef = createHoveredVectorEdgeInsertPointRef();
    const setClassName = vi.fn();

    // before — the insert-point is always the segment's own fixed midpoint, here (50,0)
    resolveVectorSegmentHover(canvas, pointerEvent(50, 0), hoveredVectorSegmentIdRef, hoveredVectorEdgeInsertPointRef, setClassName);

    // result
    expect(hoveredVectorSegmentIdRef.current).toBe('s1');
    expect(hoveredVectorEdgeInsertPointRef.current).toEqual({ x: 50, y: 0 });
    expect(setClassName).toHaveBeenCalledWith('pen-extend');
  });

  it('should clear the hovered segment id, the insert-point, and the cursor once the pointer moves away from every segment', () => {
    // mock
    const nodeId = addVectorNode();
    store.dispatch(setVectorEditingNodeId(nodeId));
    const canvas = createCanvas();
    const hoveredVectorSegmentIdRef = createHoveredVectorSegmentIdRef();
    const hoveredVectorEdgeInsertPointRef = createHoveredVectorEdgeInsertPointRef();
    const setClassName = vi.fn();

    // before
    resolveVectorSegmentHover(canvas, pointerEvent(50, 0), hoveredVectorSegmentIdRef, hoveredVectorEdgeInsertPointRef, setClassName);
    resolveVectorSegmentHover(canvas, pointerEvent(500, 500), hoveredVectorSegmentIdRef, hoveredVectorEdgeInsertPointRef, setClassName);

    // result
    expect(hoveredVectorSegmentIdRef.current).toBeNull();
    expect(hoveredVectorEdgeInsertPointRef.current).toBeNull();
    expect(setClassName).toHaveBeenLastCalledWith(null);
  });

  it('should still update the hovered segment id (for the blue highlight) but leave the insert-point/cursor alone while a mouse button is held, e.g. mid-drag', () => {
    // mock — the insert-point dot and pen-extend cursor are hover-only affordances; a button held means
    // some other drag owns the cursor right now (e.g. 'move'), which this must not clobber
    const nodeId = addVectorNode();
    store.dispatch(setVectorEditingNodeId(nodeId));
    const canvas = createCanvas();
    const hoveredVectorSegmentIdRef = createHoveredVectorSegmentIdRef();
    const hoveredVectorEdgeInsertPointRef = createHoveredVectorEdgeInsertPointRef();
    const setClassName = vi.fn();

    // before
    resolveVectorSegmentHover(canvas, pointerEvent(50, 0, 1), hoveredVectorSegmentIdRef, hoveredVectorEdgeInsertPointRef, setClassName);

    // result
    expect(hoveredVectorSegmentIdRef.current).toBe('s1');
    expect(hoveredVectorEdgeInsertPointRef.current).toBeNull();
    expect(setClassName).not.toHaveBeenCalled();
  });
});
