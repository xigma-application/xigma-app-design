import { RefObject } from 'react';

// store
import { addNode, setPenActiveVertexId, setSelection, setVectorEditingNodeIds, updateNode } from 'store/design/slice';
import { selectActivePage } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { THoverRefs, TPenRefs, TVectorEditRefs } from 'types/design/canvas/types';
import { TPenDragOrigin, TPendingOutgoingTangent } from '../../../types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { handlePointerMove } from '../handlePointerMove';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y, pointerId: 1 });

const createDragOriginRef = (value: TPenDragOrigin | null = null): RefObject<TPenDragOrigin | null> => ({ current: value });
const createDragStartRef = (value: TPoint | null = null): RefObject<TPoint | null> => ({ current: value });
const createPendingOutgoingTangentRef = (): RefObject<TPendingOutgoingTangent | null> => ({ current: null });
const createPenPreviewRef = (): TPenRefs['penPreviewRef'] => ({ current: null });
const createPenNewVertexPreviewRef = (): TPenRefs['penNewVertexPreviewRef'] => ({ current: null });
const createPenDraggedHandlePositionRef = (): TPenRefs['penDraggedHandlePositionRef'] => ({ current: null });
const createPenDraggedHandleIsSnappedRef = (): TPenRefs['penDraggedHandleIsSnappedRef'] => ({ current: false });
const createHoveredSegmentIdRef = (): THoverRefs['hoveredSegmentIdRef'] => ({ current: null });
const createPenHoveredDragArmableVertexRef = (): TPenRefs['penHoveredDragArmableVertexRef'] => ({ current: false });
const createVectorAlignmentGuideRef = (): TVectorEditRefs['vectorAlignmentGuideRef'] => ({ current: null });

const addVectorNodeWithSegment = (): string => {
  store.dispatch(
    addNode({
      defaultFill: null,
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

describe('handlePointerMove', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
    store.dispatch(setVectorEditingNodeIds([]));
    store.dispatch(setPenActiveVertexId(null));
  });

  it('should drag the outgoing tangent handle when a drag is already armed, tracking the live cursor position for the drag preview, keeping the plain pen cursor', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();
    const canvas = createCanvas();
    const penPreviewRef = createPenPreviewRef();
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const penDraggedHandlePositionRef = createPenDraggedHandlePositionRef();
    const setClassName = vi.fn();

    // before
    handlePointerMove(
      canvas,
      pointerEvent(20, 5),
      store.dispatch,
      store,
      createDragOriginRef({ nodeId, segmentId: 's1', vertexId: 'v1' }),
      createDragStartRef({ x: 0, y: 0 }),
      createPendingOutgoingTangentRef(),
      penPreviewRef,
      penNewVertexPreviewRef,
      penDraggedHandlePositionRef,
      createPenDraggedHandleIsSnappedRef(),
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),

      setClassName,
    );

    // result
    const node = store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode;

    expect(node.segments.s1.tangentEnd).toEqual({ x: -20, y: -5 });
    expect(penDraggedHandlePositionRef.current).toEqual({ x: 20, y: 5 });
    expect(setClassName).toHaveBeenCalledWith('pen');
  });

  it('should snap the dragged handle onto the exact axis and flag it once armed within the angle-snap tolerance', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();
    const canvas = createCanvas();
    const penPreviewRef = createPenPreviewRef();
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const penDraggedHandlePositionRef = createPenDraggedHandlePositionRef();
    const penDraggedHandleIsSnappedRef = createPenDraggedHandleIsSnappedRef();
    const setClassName = vi.fn();

    // before — a couple of px off horizontal, within the angle-snap tolerance
    handlePointerMove(
      canvas,
      pointerEvent(20, 1),
      store.dispatch,
      store,
      createDragOriginRef({ nodeId, segmentId: 's1', vertexId: 'v1' }),
      createDragStartRef({ x: 0, y: 0 }),
      createPendingOutgoingTangentRef(),
      penPreviewRef,
      penNewVertexPreviewRef,
      penDraggedHandlePositionRef,
      penDraggedHandleIsSnappedRef,
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),

      setClassName,
    );

    // result
    expect(penDraggedHandlePositionRef.current).toEqual({ x: 20, y: 0 });
    expect(penDraggedHandleIsSnappedRef.current).toBe(true);
  });

  it('should clear the drag-preview handle position and its snapped flag once no drag is armed', () => {
    // mock
    const canvas = createCanvas();
    const penPreviewRef = createPenPreviewRef();
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const penDraggedHandlePositionRef = createPenDraggedHandlePositionRef();
    const penDraggedHandleIsSnappedRef = createPenDraggedHandleIsSnappedRef();
    const setClassName = vi.fn();

    penDraggedHandlePositionRef.current = { x: 20, y: 5 };
    penDraggedHandleIsSnappedRef.current = true;

    // before
    handlePointerMove(
      canvas,
      pointerEvent(10, 10),
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      penPreviewRef,
      penNewVertexPreviewRef,
      penDraggedHandlePositionRef,
      penDraggedHandleIsSnappedRef,
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),

      setClassName,
    );

    // result
    expect(penDraggedHandlePositionRef.current).toBeNull();
    expect(penDraggedHandleIsSnappedRef.current).toBe(false);
  });

  it('should clear the pen preview, and preview the next vertex at the pointer, when no node is currently in Vector Edit Mode', () => {
    // mock
    const canvas = createCanvas();
    const penPreviewRef = createPenPreviewRef();
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const setClassName = vi.fn();

    penPreviewRef.current = { from: { x: 0, y: 0 }, isSnapped: false, tangentFromOffset: null, to: { x: 1, y: 1 } };

    // before
    handlePointerMove(
      canvas,
      pointerEvent(10, 10),
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      penPreviewRef,
      penNewVertexPreviewRef,
      createPenDraggedHandlePositionRef(),
      createPenDraggedHandleIsSnappedRef(),
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),

      setClassName,
    );

    // result
    expect(penPreviewRef.current).toBeNull();
    expect(penNewVertexPreviewRef.current).toEqual({ x: 10, y: 10 });
    expect(setClassName).toHaveBeenCalledWith('pen');
  });

  it('should clear the pen preview and preview a fresh next vertex at the pointer when a node is being edited but no vertex is currently active — e.g. right after closing a loop or after Escape stopped extending a connected point', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(setPenActiveVertexId(null));

    const canvas = createCanvas();
    const penPreviewRef = createPenPreviewRef();
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const setClassName = vi.fn();

    penPreviewRef.current = { from: { x: 0, y: 0 }, isSnapped: false, tangentFromOffset: null, to: { x: 1, y: 1 } };

    // before
    handlePointerMove(
      canvas,
      pointerEvent(300, 300),
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      penPreviewRef,
      penNewVertexPreviewRef,
      createPenDraggedHandlePositionRef(),
      createPenDraggedHandleIsSnappedRef(),
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),

      setClassName,
    );

    // result
    expect(penPreviewRef.current).toBeNull();
    expect(penNewVertexPreviewRef.current).toEqual({ x: 300, y: 300 });
    expect(setClassName).toHaveBeenCalledWith('pen');
  });

  it('should snap the next-vertex preview onto an existing vertex and switch to the pen-snap cursor when hovering near it with no vertex currently active', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(setPenActiveVertexId(null));

    const canvas = createCanvas();
    const penPreviewRef = createPenPreviewRef();
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const setClassName = vi.fn();

    // before — hover a couple of px away from v1 (0,0)
    handlePointerMove(
      canvas,
      pointerEvent(2, 1),
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      penPreviewRef,
      penNewVertexPreviewRef,
      createPenDraggedHandlePositionRef(),
      createPenDraggedHandleIsSnappedRef(),
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),

      setClassName,
    );

    // result
    expect(penNewVertexPreviewRef.current).toEqual({ id: 'v1', x: 0, y: 0 });
    expect(setClassName).toHaveBeenCalledWith('pen-snap');
  });

  it('should attract the next-vertex preview onto a hovered segment, report it as hovered, and switch to the pen-extend cursor', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(setPenActiveVertexId(null));

    const canvas = createCanvas();
    const penPreviewRef = createPenPreviewRef();
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const setClassName = vi.fn();

    // before — hover near the far end of s1 (v1 0,0 -> v2 100,0), well outside the midpoint's snap radius
    handlePointerMove(
      canvas,
      pointerEvent(90, 2),
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      penPreviewRef,
      penNewVertexPreviewRef,
      createPenDraggedHandlePositionRef(),
      createPenDraggedHandleIsSnappedRef(),
      hoveredSegmentIdRef,
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),

      setClassName,
    );

    // result
    expect(penNewVertexPreviewRef.current).toEqual({ x: 90, y: 0 });
    expect(hoveredSegmentIdRef.current).toBe('s1');
    expect(setClassName).toHaveBeenCalledWith('pen-extend');
  });

  it('should lock the next-vertex preview onto the exact midpoint and switch to the pen-snap cursor when hovering close enough to it', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(setPenActiveVertexId(null));

    const canvas = createCanvas();
    const penPreviewRef = createPenPreviewRef();
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const setClassName = vi.fn();

    // before — hover a couple of px off s1's midpoint (v1 0,0 -> v2 100,0 -> midpoint 50,0)
    handlePointerMove(
      canvas,
      pointerEvent(50, 2),
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      penPreviewRef,
      penNewVertexPreviewRef,
      createPenDraggedHandlePositionRef(),
      createPenDraggedHandleIsSnappedRef(),
      hoveredSegmentIdRef,
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),

      setClassName,
    );

    // result
    expect(penNewVertexPreviewRef.current).toEqual({ x: 50, y: 0 });
    expect(hoveredSegmentIdRef.current).toBe('s1');
    expect(setClassName).toHaveBeenCalledWith('pen-snap');
  });

  it('should update the pen preview toward the pointer, keeping the plain pen cursor, when a node is being edited and no vertex is nearby', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(setPenActiveVertexId('v1'));

    const canvas = createCanvas();
    const penPreviewRef = createPenPreviewRef();
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const setClassName = vi.fn();

    penNewVertexPreviewRef.current = { x: 999, y: 999 };

    // before
    handlePointerMove(
      canvas,
      pointerEvent(500, 500),
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      penPreviewRef,
      penNewVertexPreviewRef,
      createPenDraggedHandlePositionRef(),
      createPenDraggedHandleIsSnappedRef(),
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),

      setClassName,
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ to: { x: 500, y: 500 } });
    expect(penNewVertexPreviewRef.current).toBeNull();
    expect(setClassName).toHaveBeenCalledWith('pen');
  });

  it('should switch to the pen-snap cursor when the rubber-band preview snaps onto another vertex while extending', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(setPenActiveVertexId('v1'));

    const canvas = createCanvas();
    const penPreviewRef = createPenPreviewRef();
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const setClassName = vi.fn();

    // before — hover right on v2 (100,0), well within the snap radius
    handlePointerMove(
      canvas,
      pointerEvent(100, 0),
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      penPreviewRef,
      penNewVertexPreviewRef,
      createPenDraggedHandlePositionRef(),
      createPenDraggedHandleIsSnappedRef(),
      createHoveredSegmentIdRef(),
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),

      setClassName,
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ to: { id: 'v2', x: 100, y: 0 } });
    expect(setClassName).toHaveBeenCalledWith('pen-snap');
  });

  it('should attract the rubber-band preview onto a hovered segment, report it as hovered, and switch to the pen-extend cursor while extending', () => {
    // mock — s1 runs v1(0,0) -> v2(100,0); extending from a separate, unconnected v3(50,100)
    const nodeId = addVectorNodeWithSegment();

    store.dispatch(
      updateNode({
        changes: {
          vertices: {
            ...(store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode).vertices,
            v3: { id: 'v3', x: 50, y: 100 },
          },
        },
        id: nodeId,
      }),
    );
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(setPenActiveVertexId('v3'));

    const canvas = createCanvas();
    const penPreviewRef = createPenPreviewRef();
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const setClassName = vi.fn();

    // before — hover near the far end of s1, well outside the midpoint's snap radius
    handlePointerMove(
      canvas,
      pointerEvent(90, 2),
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      penPreviewRef,
      penNewVertexPreviewRef,
      createPenDraggedHandlePositionRef(),
      createPenDraggedHandleIsSnappedRef(),
      hoveredSegmentIdRef,
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),

      setClassName,
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ to: { x: 90, y: 0 } });
    expect(hoveredSegmentIdRef.current).toBe('s1');
    expect(setClassName).toHaveBeenCalledWith('pen-extend');
  });

  it('should lock the rubber-band preview onto the exact midpoint and switch to the pen-snap cursor while extending', () => {
    // mock — s1 runs v1(0,0) -> v2(100,0); extending from a separate, unconnected v3(50,100)
    const nodeId = addVectorNodeWithSegment();

    store.dispatch(
      updateNode({
        changes: {
          vertices: {
            ...(store.getState().design.pages[store.getState().design.activePageId].nodes[nodeId] as TVectorNode).vertices,
            v3: { id: 'v3', x: 50, y: 100 },
          },
        },
        id: nodeId,
      }),
    );
    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(setPenActiveVertexId('v3'));

    const canvas = createCanvas();
    const penPreviewRef = createPenPreviewRef();
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const hoveredSegmentIdRef = createHoveredSegmentIdRef();
    const setClassName = vi.fn();

    // before — hover a couple of px off s1's midpoint (50,0)
    handlePointerMove(
      canvas,
      pointerEvent(50, 2),
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      penPreviewRef,
      penNewVertexPreviewRef,
      createPenDraggedHandlePositionRef(),
      createPenDraggedHandleIsSnappedRef(),
      hoveredSegmentIdRef,
      createPenHoveredDragArmableVertexRef(),
      createVectorAlignmentGuideRef(),

      setClassName,
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ to: { x: 50, y: 0 } });
    expect(hoveredSegmentIdRef.current).toBe('s1');
    expect(setClassName).toHaveBeenCalledWith('pen-snap');
  });

  it('should flag the hover as drag-armable and switch to the pen-snap cursor when hovering back on the active vertex itself', () => {
    // mock
    const nodeId = addVectorNodeWithSegment();

    store.dispatch(setVectorEditingNodeIds([nodeId]));
    store.dispatch(setPenActiveVertexId('v1'));

    const canvas = createCanvas();
    const penPreviewRef = createPenPreviewRef();
    const penNewVertexPreviewRef = createPenNewVertexPreviewRef();
    const penHoveredDragArmableVertexRef = createPenHoveredDragArmableVertexRef();
    const setClassName = vi.fn();

    // before — hover right back on v1 (0,0), the vertex currently being extended from
    handlePointerMove(
      canvas,
      pointerEvent(0, 0),
      store.dispatch,
      store,
      createDragOriginRef(),
      createDragStartRef(),
      createPendingOutgoingTangentRef(),
      penPreviewRef,
      penNewVertexPreviewRef,
      createPenDraggedHandlePositionRef(),
      createPenDraggedHandleIsSnappedRef(),
      createHoveredSegmentIdRef(),
      penHoveredDragArmableVertexRef,
      createVectorAlignmentGuideRef(),

      setClassName,
    );

    // result
    expect(penPreviewRef.current).toMatchObject({ to: { id: 'v1', x: 0, y: 0 } });
    expect(penHoveredDragArmableVertexRef.current).toBe(true);
    expect(setClassName).toHaveBeenCalledWith('pen-snap');
  });
});
