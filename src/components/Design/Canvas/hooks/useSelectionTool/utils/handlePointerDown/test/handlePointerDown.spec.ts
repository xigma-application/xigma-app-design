import { RefObject } from 'react';

// store
import { addNode, setSelection, setVectorEditingNodeIds } from 'store/design/slice';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TPoint } from 'types/canvas';
import {
  TCornerRadiusDragState,
  TEllipseArcDragState,
  TEllipseArcRatioDragState,
  TEllipseArcRotateDragState,
  TPolygonCornerRadiusDragState,
  TStarCornerRadiusDragState,
} from 'types/design/canvas/types';
import {
  TDragState,
  TEndpointDragState,
  TPathOffsetDragState,
  TPolygonVertexCountDragState,
  TResizeDragState,
  TRotateDragState,
  TStarVertexCountDragState,
} from 'types/design/selectionTool/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { handlePointerDown } from '../handlePointerDown';
import { createSelectionToolRefs } from '../../../hooks/useSelectionToolRefs/createSelectionToolRefs';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);
  canvas.setPointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (x: number, y: number, options: Partial<PointerEventInit> = {}): PointerEvent =>
  new PointerEvent('pointerdown', { button: 0, clientX: x, clientY: y, pointerId: 1, ...options });

const createDragStateRef = (): RefObject<TDragState | null> => ({ current: null });
const createEndpointDragRef = (): RefObject<TEndpointDragState | null> => ({ current: null });
const createPathOffsetDragRef = (): RefObject<TPathOffsetDragState | null> => ({ current: null });
const createResizeDragRef = (): RefObject<TResizeDragState | null> => ({ current: null });
const createRotateDragRef = (): RefObject<TRotateDragState | null> => ({ current: null });
const createCornerRadiusDragRef = (): RefObject<TCornerRadiusDragState | null> => ({ current: null });
const createPolygonCornerRadiusDragRef = (): RefObject<TPolygonCornerRadiusDragState | null> => ({ current: null });
const createStarCornerRadiusDragRef = (): RefObject<TStarCornerRadiusDragState | null> => ({ current: null });
const createPolygonVertexCountDragRef = (): RefObject<TPolygonVertexCountDragState | null> => ({ current: null });
const createStarVertexCountDragRef = (): RefObject<TStarVertexCountDragState | null> => ({ current: null });
const createEllipseArcDragRef = (): RefObject<TEllipseArcDragState | null> => ({ current: null });
const createEllipseArcRotateDragRef = (): RefObject<TEllipseArcRotateDragState | null> => ({ current: null });
const createEllipseArcRatioDragRef = (): RefObject<TEllipseArcRatioDragState | null> => ({ current: null });
const createMarqueeStartRef = (): RefObject<TPoint | null> => ({ current: null });

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({
      fill: '#ff0000',
      height: size,
      name: 'Frame',
      parentId: null,
      rotation: 0,
      type: NodeType.frame,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addRectangleNode = (x: number, y: number, size: number, cornerRadius: number): string => {
  store.dispatch(
    addNode({
      cornerRadius,
      fill: '#ff0000',
      height: size,
      name: 'Rectangle',
      parentId: null,
      rotation: 0,
      type: NodeType.rectangle,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addStarNode = (x: number, y: number, size: number, points: number, ratio: number, cornerRadius?: number): string => {
  store.dispatch(
    addNode({
      cornerRadius,
      fill: '#ff0000',
      flipX: false,
      flipY: false,
      height: size,
      name: 'Star',
      parentId: null,
      points,
      ratio,
      rotation: 0,
      type: NodeType.star,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addEllipseNode = (x: number, y: number, size: number, arcStartAngle?: number, arcEndAngle?: number): string => {
  store.dispatch(
    addNode({
      arcEndAngle,
      arcStartAngle,
      fill: '#ff0000',
      height: size,
      name: 'Ellipse',
      parentId: null,
      rotation: 0,
      type: NodeType.ellipse,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addPolygonNode = (x: number, y: number, size: number, sides: number, cornerRadius?: number): string => {
  store.dispatch(
    addNode({
      cornerRadius,
      fill: '#ff0000',
      flipX: false,
      flipY: false,
      height: size,
      name: 'Polygon',
      parentId: null,
      rotation: 0,
      sides,
      type: NodeType.polygon,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addTextNode = (x: number, y: number, size = 500): string => {
  store.dispatch(
    addNode({
      content: 'Hi',
      fill: '#ffffff',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 14,
      height: size,
      name: 'Text',
      parentId: null,
      rotation: 0,
      type: NodeType.text,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addLineNode = (x1: number, y1: number, x2: number, y2: number): string => {
  store.dispatch(addNode({ name: 'Line', parentId: null, stroke: '#000000', type: NodeType.line, x1, x2, y1, y2 }));

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addClosedSquareVectorNode = (x: number, y: number, size: number): string => {
  store.dispatch(
    addNode({
      defaultFill: [{ color: '#ff0000', opacity: 100, type: 'solid' }],
      filledFaceKeys: [],
      name: 'Vector',
      parentId: null,
      rotation: 0,
      segments: {
        s1: { endId: 'v2', id: 's1', startId: 'v1', tangentEnd: null, tangentStart: null },
        s2: { endId: 'v3', id: 's2', startId: 'v2', tangentEnd: null, tangentStart: null },
        s3: { endId: 'v4', id: 's3', startId: 'v3', tangentEnd: null, tangentStart: null },
        s4: { endId: 'v1', id: 's4', startId: 'v4', tangentEnd: null, tangentStart: null },
      },
      strokeColor: '#000000',
      strokeWidth: 1,
      type: NodeType.vector,
      vertexHandleModes: {},
      vertices: {
        v1: { id: 'v1', x, y },
        v2: { id: 'v2', x: x + size, y },
        v3: { id: 'v3', x: x + size, y: y + size },
        v4: { id: 'v4', x, y: y + size },
      },
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

const addPathTextNode = (x: number, y: number, size = 200): string => {
  store.dispatch(
    addNode({
      content: 'Hi',
      fill: '#ffffff',
      flipX: false,
      flipY: false,
      fontFamily: 'Inter',
      fontSize: 14,
      height: size,
      name: 'Text',
      parentId: null,
      pathFlip: false,
      pathId: 'ellipse-1',
      pathStartOffset: 0,
      rotation: 0,
      type: NodeType.text,
      width: size,
      x,
      y,
    }),
  );

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('handlePointerDown', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should ignore a non-primary button press', () => {
    // mock
    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(10, 10, { button: 1 }),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      setClassName,
    );

    // result
    expect(dragStateRef.current).toBeNull();
    expect(selectSelectedIds(store.getState())).toEqual([]);
  });

  it('should toggle the hit node into the selection on shift-click', () => {
    // mock
    const idA = addFrameNode(100, 100);
    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(105, 105, { shiftKey: true }),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      setClassName,
    );

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idA]);
    expect(dragStateRef.current).toBeNull();
  });

  it('should delegate to armHitDrag when the pointer hits a node', () => {
    // mock
    const idA = addFrameNode(200, 200);
    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(205, 205),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      setClassName,
    );

    // result
    expect(selectSelectedIds(store.getState())).toEqual([idA]);
    expect(dragStateRef.current).toMatchObject({ pendingClickAction: null });
  });

  it('should delegate to armGroupBoundsDrag when clicking the gap inside a shared multi-selection', () => {
    // mock
    const idA = addFrameNode(300, 300, 20);
    const idB = addFrameNode(360, 300, 20);

    store.dispatch(setSelection([idA, idB]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before - 330,310 is in the gap but clear of the Smart Selection gap handle at the midpoint (340,310)
    handlePointerDown(
      canvas,
      pointerEvent(330, 310),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      setClassName,
    );

    // result
    expect(dragStateRef.current).toMatchObject({ pendingClickAction: { kind: 'deselect' } });
  });

  it('should clear the selection and arm the marquee when clicking empty canvas', () => {
    // mock
    const idA = addFrameNode(400, 400);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(900, 900),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      setClassName,
    );

    // result
    expect(selectSelectedIds(store.getState())).toEqual([]);
    expect(dragStateRef.current).toBeNull();
    expect(marqueeStartRef.current).not.toBeNull();
    expect(canvas.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should fall through to the marquee instead of dragging the whole shape when clicking the interior of a vector node currently being edited', () => {
    // mock — a closed 100x100 square vector node, currently open in Vector Edit Mode
    const idA = addClosedSquareVectorNode(6400, 6400, 100);

    store.dispatch(setSelection([idA]));
    store.dispatch(setVectorEditingNodeIds([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const marqueeStartRef = createMarqueeStartRef();
    const vectorMarqueeStartRef: RefObject<TPoint | null> = { current: null };
    const setClassName = vi.fn();

    // before — dead center of the square, well clear of every vertex/handle/segment
    handlePointerDown(
      canvas,
      pointerEvent(6450, 6450),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
        vectorMarqueeStartRef,
      }),
      setClassName,
    );

    // result — no whole-node drag armed; falls through to the vector marquee instead
    expect(dragStateRef.current).toBeNull();
    expect(marqueeStartRef.current).toBeNull();
    expect(vectorMarqueeStartRef.current).not.toBeNull();
    store.dispatch(setVectorEditingNodeIds([]));
  });

  it('should still drag the whole shape when clicking the interior of a vector node that is selected but not currently being edited', () => {
    // mock — same square, but no Vector Edit Mode session open for it
    const idA = addClosedSquareVectorNode(6600, 6400, 100);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(6650, 6450),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      setClassName,
    );

    // result — a whole-node drag is armed (a real drag still moves it); released without moving,
    // this deselects instead of leaving it selected, since the click missed the shape's own contour
    expect(dragStateRef.current).toMatchObject({ pendingClickAction: { kind: 'deselect' } });
    expect(marqueeStartRef.current).toBeNull();
  });

  it('should allow dragging from anywhere in a selected text node fixed box, even past its rendered content', () => {
    // mock
    const idA = addTextNode(1000, 1000);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before — click far from the actual "Hi" glyphs but still inside the 500x500 box
    handlePointerDown(
      canvas,
      pointerEvent(1300, 1300),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      setClassName,
    );

    // result — a whole-node drag is armed (a real drag still moves it); released without moving,
    // this deselects instead of leaving it selected, since the click missed the rendered content
    expect(dragStateRef.current).toMatchObject({ pendingClickAction: { kind: 'deselect' } });
    expect(marqueeStartRef.current).toBeNull();
  });

  it('should not select or drag an unselected text node when clicking inside its box but past its rendered content', () => {
    // mock
    const idA = addTextNode(1500, 1500);

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(1800, 1800),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      setClassName,
    );

    // result — falls through to marquee instead of grabbing the text
    expect(selectSelectedIds(store.getState())).not.toContain(idA);
    expect(dragStateRef.current).toBeNull();
    expect(marqueeStartRef.current).not.toBeNull();
  });

  it('should delegate to armEndpointDrag when a selected line endpoint is hit, instead of moving the whole shape', () => {
    // mock
    const idA = addLineNode(500, 500, 600, 500);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const endpointDragRef = createEndpointDragRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(500, 500),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef,
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      setClassName,
    );

    // result
    expect(endpointDragRef.current).toEqual({ endpoint: 'a', nodeId: idA });
    expect(dragStateRef.current).toBeNull();
  });

  it('should fall back to a whole-shape move when the line is selected but the hit is not near an endpoint', () => {
    // mock
    const idA = addLineNode(700, 700, 800, 700);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const endpointDragRef = createEndpointDragRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(750, 700),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef,
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      setClassName,
    );

    // result
    expect(endpointDragRef.current).toBeNull();
    expect(dragStateRef.current).toMatchObject({ pendingClickAction: null });
  });

  it('should delegate to armResizeDrag when a resize handle on a selected node is hit, instead of moving the node', () => {
    // mock
    const idA = addFrameNode(2000, 2000, 100);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const resizeDragRef = createResizeDragRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before — exactly on the "nw" corner handle
    handlePointerDown(
      canvas,
      pointerEvent(2000, 2000),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef,
      }),
      setClassName,
    );

    // result
    expect(resizeDragRef.current).toMatchObject({ handle: 'nw' });
    expect(dragStateRef.current).toBeNull();
    expect(canvas.setPointerCapture).toHaveBeenCalled();
  });

  it('should delegate to armRotateDrag when the ring just outside a resize handle is hit', () => {
    // mock — the "nw" corner sits at (2500, 2500)
    const idA = addFrameNode(2500, 2500, 100);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const rotateDragRef = createRotateDragRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before — 10 world units above the corner, inside the rotate ring but outside the resize radius
    handlePointerDown(
      canvas,
      pointerEvent(2500, 2490),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      setClassName,
    );

    // result
    expect(rotateDragRef.current).not.toBeNull();
    expect(dragStateRef.current).toBeNull();
    expect(canvas.setPointerCapture).toHaveBeenCalled();
  });

  it('should delegate to armCornerRadiusDrag when a corner-radius handle on a selected rectangle is hit', () => {
    // mock — a 100x100 rectangle with cornerRadius 20 has its ne handle at (4080, 4020)
    const idA = addRectangleNode(4000, 4000, 100, 20);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const cornerRadiusDragRef = createCornerRadiusDragRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(4080, 4020),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: cornerRadiusDragRef,
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      setClassName,
    );

    // result
    expect(cornerRadiusDragRef.current).toMatchObject({ corner: 'ne', nodeId: idA });
    expect(dragStateRef.current).toBeNull();
    expect(canvas.setPointerCapture).toHaveBeenCalled();
  });

  it('should delegate to armPolygonCornerRadiusDrag when the corner-radius handle on a selected polygon is hit', () => {
    // mock — top vertex of a 100x100 triangle at (5000, 5000) sits at (5050, 5000); radius 15 moves
    const idA = addPolygonNode(5000, 5000, 100, 3, 15);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const polygonCornerRadiusDragRef = createPolygonCornerRadiusDragRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(5050, 5030),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: polygonCornerRadiusDragRef,
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      setClassName,
    );

    // result
    expect(polygonCornerRadiusDragRef.current).toMatchObject({ nodeId: idA, sides: 3 });
    expect(dragStateRef.current).toBeNull();
    expect(canvas.setPointerCapture).toHaveBeenCalled();
  });

  it('should delegate to armStarCornerRadiusDrag when the corner-radius handle on a selected star is hit', () => {
    // mock — top vertex of a 100x100 5-point star at (5200, 5000) sits at (5250, 5000); radius 15
    const idA = addStarNode(5200, 5000, 100, 5, 0.5, 15);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const starCornerRadiusDragRef = createStarCornerRadiusDragRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(5250, 5033.893272),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: starCornerRadiusDragRef,
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      setClassName,
    );

    // result
    expect(starCornerRadiusDragRef.current).toMatchObject({ nodeId: idA, points: 5, ratio: 0.5 });
    expect(dragStateRef.current).toBeNull();
    expect(canvas.setPointerCapture).toHaveBeenCalled();
  });

  it('should delegate to armResizeDrag, not armCornerRadiusDrag, when clicking exactly on the corner even with a nonzero cornerRadius', () => {
    // mock — a 100x100 rectangle with cornerRadius 20; the resize handle still sits exactly at the
    // raw "ne" corner (4180, 4100), which the radius handle's own inset position never touches
    const idA = addRectangleNode(4100, 4100, 100, 20);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const resizeDragRef = createResizeDragRef();
    const cornerRadiusDragRef = createCornerRadiusDragRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(4200, 4100),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: cornerRadiusDragRef,
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef: createDragStateRef(),
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef,
      }),
      setClassName,
    );

    // result
    expect(resizeDragRef.current).toMatchObject({ handle: 'ne' });
    expect(cornerRadiusDragRef.current).toBeNull();
  });

  it("should delegate to armPathOffsetDrag when a path-text node's offset handle is hit, instead of moving the whole node", () => {
    // mock — a 200x200 path-text box centered at (3100, 3100), handle at offset 0 sits at the rightmost edge
    const idA = addPathTextNode(3000, 3000, 200);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const pathOffsetDragRef = createPathOffsetDragRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(3200, 3100),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef,
        resizeDragRef: createResizeDragRef(),
      }),
      setClassName,
    );

    // result
    expect(pathOffsetDragRef.current).toEqual({ nodeId: idA });
    expect(dragStateRef.current).toBeNull();
    expect(canvas.setPointerCapture).toHaveBeenCalled();
    expect(setClassName).toHaveBeenCalledWith('pressing');
  });

  it('should delegate to armPolygonVertexCountDrag when the vertex-count handle on a selected polygon is hit', () => {
    // mock — vertex index 1 of a 100x100 triangle at (5400, 5000) sits at (5493.301270, 5075)
    const idA = addPolygonNode(5400, 5000, 100, 3);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const polygonVertexCountDragRef = createPolygonVertexCountDragRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(5493.30127, 5075),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
        vertexCount: { polygonVertexCountDragRef, starVertexCountDragRef: createStarVertexCountDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      setClassName,
    );

    // result
    expect(polygonVertexCountDragRef.current).toMatchObject({ nodeId: idA, rotation: 0 });
    expect(dragStateRef.current).toBeNull();
    expect(canvas.setPointerCapture).toHaveBeenCalled();
  });

  it('should give a 4-sided polygon vertex-count handle priority over the coincident resize handle at the same point', () => {
    // mock — vertex index 1 of a 100x100 4-sided polygon at (5600, 5000) sits at (5700, 5050),
    // exactly the same point as the bounding box's own "e" (east edge midpoint) resize handle
    const idA = addPolygonNode(5600, 5000, 100, 4);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const resizeDragRef = createResizeDragRef();
    const polygonVertexCountDragRef = createPolygonVertexCountDragRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(5700, 5050),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
        vertexCount: { polygonVertexCountDragRef, starVertexCountDragRef: createStarVertexCountDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef,
      }),
      setClassName,
    );

    // result
    expect(polygonVertexCountDragRef.current).toMatchObject({ nodeId: idA });
    expect(resizeDragRef.current).toBeNull();
    expect(dragStateRef.current).toBeNull();
  });

  it('should delegate to armStarVertexCountDrag when the vertex-count handle on a selected star is hit', () => {
    // mock — vertex index 2 of a 100x100 5-point star at (5500, 5000) sits at (5597.552826, 5034.549150)
    const idA = addStarNode(5500, 5000, 100, 5, 0.5);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const starVertexCountDragRef = createStarVertexCountDragRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(5597.552826, 5034.54915),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
        vertexCount: { polygonVertexCountDragRef: createPolygonVertexCountDragRef(), starVertexCountDragRef },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      setClassName,
    );

    // result
    expect(starVertexCountDragRef.current).toMatchObject({ nodeId: idA, rotation: 0 });
    expect(dragStateRef.current).toBeNull();
    expect(canvas.setPointerCapture).toHaveBeenCalled();
  });

  it('should delegate to armEllipseArcDrag when the Sweep handle on a selected ellipse is hit', () => {
    // mock — a 100x100 ellipse at (5800, 5000); default arcEndAngle (90°) puts the Sweep handle at (5900, 5050)
    const idA = addEllipseNode(5800, 5000, 100);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const ellipseArcDragRef = createEllipseArcDragRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(5900, 5050),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: ellipseArcDragRef,
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      setClassName,
    );

    // result
    expect(ellipseArcDragRef.current).toMatchObject({ nodeId: idA });
    expect(dragStateRef.current).toBeNull();
    expect(canvas.setPointerCapture).toHaveBeenCalled();
  });

  it('should delegate to armEllipseArcRotateDrag when the Start handle on a selected, already-cut ellipse is hit', () => {
    // mock — a 100x100 ellipse at (6000, 5000), cut from the default arcStartAngle (90°) to
    // arcEndAngle 0°; the Start handle stays at its own east rim (6100, 5050)
    const idA = addEllipseNode(6000, 5000, 100, 90, 0);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const ellipseArcRotateDragRef = createEllipseArcRotateDragRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(6100, 5050),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: createEllipseArcRatioDragRef(),
          ellipseArcRotateDragRef: ellipseArcRotateDragRef,
        },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      setClassName,
    );

    // result
    expect(ellipseArcRotateDragRef.current).toMatchObject({ nodeId: idA });
    expect(dragStateRef.current).toBeNull();
    expect(canvas.setPointerCapture).toHaveBeenCalled();
  });

  it('should delegate to armEllipseArcRatioDrag when the Ratio handle on a selected ellipse is hit', () => {
    // mock — a 100x100 ellipse at (6200, 5000); the Ratio handle rests at dead center (6250, 5050)
    const idA = addEllipseNode(6200, 5000, 100);

    store.dispatch(setSelection([idA]));

    const canvas = createCanvas();
    const dragStateRef = createDragStateRef();
    const ellipseArcRatioDragRef = createEllipseArcRatioDragRef();
    const marqueeStartRef = createMarqueeStartRef();
    const setClassName = vi.fn();

    // before
    handlePointerDown(
      canvas,
      pointerEvent(6250, 5050),
      store.dispatch,
      createCanvasRefs({
        cornerRadius: {
          cornerRadiusDragRef: createCornerRadiusDragRef(),
          polygonCornerRadiusDragRef: createPolygonCornerRadiusDragRef(),
          starCornerRadiusDragRef: createStarCornerRadiusDragRef(),
        },
        ellipseArc: {
          ellipseArcDragRef: createEllipseArcDragRef(),
          ellipseArcRatioDragRef: ellipseArcRatioDragRef,
          ellipseArcRotateDragRef: createEllipseArcRotateDragRef(),
        },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      setClassName,
    );

    // result
    expect(ellipseArcRatioDragRef.current).toMatchObject({ nodeId: idA });
    expect(dragStateRef.current).toBeNull();
    expect(canvas.setPointerCapture).toHaveBeenCalled();
  });
});
