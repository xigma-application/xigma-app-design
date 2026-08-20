import { RefObject } from 'react';

// store
import { addNode, setSelection, setVectorEditingNodeId } from 'store/design/slice';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { resolveVectorSegmentHoverInNode } from '../resolveVectorSegmentHoverInNode';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number, buttons = 0, ctrlKey = false): PointerEvent =>
  new PointerEvent('pointermove', { buttons, clientX: x, clientY: y, ctrlKey });

const createHoveredVectorSegmentIdRef = (): RefObject<string | null> => ({ current: null });
const createHoveredVectorEdgeInsertPointRef = (value: TPoint | null = null): RefObject<TPoint | null> => ({ current: value });

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

describe('resolveVectorSegmentHoverInNode', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeId(null));
  });

  it('should show the fixed midpoint insert-point anywhere along the segment, but only switch the cursor to pen-extend once the pointer is precisely over that point', () => {
    // mock — hovering near x=25 is well off the segment's own midpoint (50,0), but still inside the wide
    // edge-hit tolerance ("ten point ma być widoczny kiedy najeżdżam na segment" — visible anywhere on the
    // segment, but "kursor się tylko zmienia jak najadę na point" — cursor only right on the point itself)
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const canvas = createCanvas();
    const hoveredVectorSegmentIdRef = createHoveredVectorSegmentIdRef();
    const hoveredVectorEdgeInsertPointRef = createHoveredVectorEdgeInsertPointRef();
    const setClassName = vi.fn();

    // before
    resolveVectorSegmentHoverInNode(
      canvas,
      pointerEvent(25, 0),
      store.getState(),
      node,
      hoveredVectorSegmentIdRef,
      hoveredVectorEdgeInsertPointRef,
      setClassName,
    );

    // result — the dot renders at the fixed midpoint even though the cursor is far from it, but the
    // cursor itself stays neutral since the pointer isn't precisely on the point
    expect(hoveredVectorSegmentIdRef.current).toBe('s1');
    expect(hoveredVectorEdgeInsertPointRef.current).toEqual({ x: 50, y: 0 });
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should switch the cursor to pen-extend once the pointer is precisely over the fixed midpoint', () => {
    // mock
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const canvas = createCanvas();
    const hoveredVectorSegmentIdRef = createHoveredVectorSegmentIdRef();
    const hoveredVectorEdgeInsertPointRef = createHoveredVectorEdgeInsertPointRef();
    const setClassName = vi.fn();

    // before — exactly on the segment's own midpoint
    resolveVectorSegmentHoverInNode(
      canvas,
      pointerEvent(50, 0),
      store.getState(),
      node,
      hoveredVectorSegmentIdRef,
      hoveredVectorEdgeInsertPointRef,
      setClassName,
    );

    // result
    expect(hoveredVectorEdgeInsertPointRef.current).toEqual({ x: 50, y: 0 });
    expect(setClassName).toHaveBeenCalledWith('pen-extend');
  });

  it('should keep the insert-point pinned to the segment’s own midpoint even as the pointer moves to a different position along the same segment', () => {
    // mock
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const canvas = createCanvas();
    const hoveredVectorSegmentIdRef = createHoveredVectorSegmentIdRef();
    const hoveredVectorEdgeInsertPointRef = createHoveredVectorEdgeInsertPointRef();
    const setClassName = vi.fn();

    // before — near v1's own end of the segment, still well inside the edge-hit tolerance
    resolveVectorSegmentHoverInNode(
      canvas,
      pointerEvent(80, 0),
      store.getState(),
      node,
      hoveredVectorSegmentIdRef,
      hoveredVectorEdgeInsertPointRef,
      setClassName,
    );

    // result — still the fixed midpoint, not (80,0)
    expect(hoveredVectorEdgeInsertPointRef.current).toEqual({ x: 50, y: 0 });
  });

  it('should clear the hovered segment id, the insert-point, and the cursor when the pointer misses every segment', () => {
    // mock
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const canvas = createCanvas();
    const hoveredVectorSegmentIdRef = createHoveredVectorSegmentIdRef();
    const hoveredVectorEdgeInsertPointRef = createHoveredVectorEdgeInsertPointRef();
    const setClassName = vi.fn();

    // before
    resolveVectorSegmentHoverInNode(
      canvas,
      pointerEvent(500, 500),
      store.getState(),
      node,
      hoveredVectorSegmentIdRef,
      hoveredVectorEdgeInsertPointRef,
      setClassName,
    );

    // result
    expect(hoveredVectorSegmentIdRef.current).toBeNull();
    expect(hoveredVectorEdgeInsertPointRef.current).toBeNull();
    expect(setClassName).toHaveBeenCalledWith(null);
  });

  it('should still update the hovered segment id but hide the insert-point dot and leave the cursor alone while a mouse button is held', () => {
    // mock — the insert-point dot is a hover-only affordance; a button held means a drag is (or might be)
    // in progress, e.g. moving the very segment the dot sat on — without this, the dot is left rendering
    // at its last hover position while the segment moves out from under it (bug report: "jak ruszymy
    // segment to ten point zostaje w starej pozycji" — moving the segment leaves the point at its old
    // spot). Pre-seeding the ref with a stale point here catches a regression back to "just don't touch
    // it," which happened to also read as null in a fresh ref and could look like this test still passed.
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const canvas = createCanvas();
    const hoveredVectorSegmentIdRef = createHoveredVectorSegmentIdRef();
    const hoveredVectorEdgeInsertPointRef = createHoveredVectorEdgeInsertPointRef({ x: 50, y: 0 });
    const setClassName = vi.fn();

    // before
    resolveVectorSegmentHoverInNode(
      canvas,
      pointerEvent(50, 0, 1),
      store.getState(),
      node,
      hoveredVectorSegmentIdRef,
      hoveredVectorEdgeInsertPointRef,
      setClassName,
    );

    // result
    expect(hoveredVectorSegmentIdRef.current).toBe('s1');
    expect(hoveredVectorEdgeInsertPointRef.current).toBeNull();
    expect(setClassName).not.toHaveBeenCalled();
  });

  it('should switch the cursor to bend and hide the insert-point dot when Ctrl is held over a segment, instead of the pen-extend/split affordance', () => {
    // mock — holding Ctrl means the user wants to bend the segment (armVectorBendSegmentOnPointerDown.ts),
    // a completely different gesture than the plain-click split — the insert-point dot must not show
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const canvas = createCanvas();
    const hoveredVectorSegmentIdRef = createHoveredVectorSegmentIdRef();
    const hoveredVectorEdgeInsertPointRef = createHoveredVectorEdgeInsertPointRef({ x: 50, y: 0 });
    const setClassName = vi.fn();

    // before — Ctrl held, hovering the segment's own interior (not necessarily the fixed midpoint)
    resolveVectorSegmentHoverInNode(
      canvas,
      pointerEvent(25, 0, 0, true),
      store.getState(),
      node,
      hoveredVectorSegmentIdRef,
      hoveredVectorEdgeInsertPointRef,
      setClassName,
    );

    // result
    expect(hoveredVectorSegmentIdRef.current).toBe('s1');
    expect(hoveredVectorEdgeInsertPointRef.current).toBeNull();
    expect(setClassName).toHaveBeenCalledWith('bend');
  });

  it('should switch the cursor to segment (not bend) when Ctrl is held directly over an existing vertex — that gesture pulls a fresh tangent handle, not bends the segment', () => {
    // mock — v1 sits at (0,0); getVectorEdgeAtPoint deliberately excludes the near-vertex zone (its own
    // `nearEndpoint` check), so without this the segment-hover resolver would fall through to `hit ===
    // null` and clear the cursor instead of switching it
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const canvas = createCanvas();
    const hoveredVectorSegmentIdRef = createHoveredVectorSegmentIdRef();
    const hoveredVectorEdgeInsertPointRef = createHoveredVectorEdgeInsertPointRef();
    const setClassName = vi.fn();

    // before — Ctrl held, hovering v1 itself
    resolveVectorSegmentHoverInNode(
      canvas,
      pointerEvent(0, 0, 0, true),
      store.getState(),
      node,
      hoveredVectorSegmentIdRef,
      hoveredVectorEdgeInsertPointRef,
      setClassName,
    );

    // result
    expect(setClassName).toHaveBeenCalledWith('segment');
  });

  it('should clear the cursor when Ctrl is held but the pointer misses every segment', () => {
    // mock
    const nodeId = addVectorNode();

    store.dispatch(setVectorEditingNodeId(nodeId));

    const node = store.getState().design.nodes[nodeId] as TVectorNode;
    const canvas = createCanvas();
    const hoveredVectorSegmentIdRef = createHoveredVectorSegmentIdRef();
    const hoveredVectorEdgeInsertPointRef = createHoveredVectorEdgeInsertPointRef();
    const setClassName = vi.fn();

    // before
    resolveVectorSegmentHoverInNode(
      canvas,
      pointerEvent(500, 500, 0, true),
      store.getState(),
      node,
      hoveredVectorSegmentIdRef,
      hoveredVectorEdgeInsertPointRef,
      setClassName,
    );

    // result
    expect(hoveredVectorSegmentIdRef.current).toBeNull();
    expect(hoveredVectorEdgeInsertPointRef.current).toBeNull();
    expect(setClassName).toHaveBeenCalledWith(null);
  });
});
