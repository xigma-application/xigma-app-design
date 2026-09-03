import { RefObject } from 'react';

// store
import { addNode, setSelection } from 'store/design/slice';
import { selectActivePage, selectSelectedIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { NodeType } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';
import {
  TCornerRadiusDragState,
  TEllipseArcDragState,
  TEllipseArcRatioDragState,
  TEllipseArcRotateDragState,
  TPolygonCornerRadiusDragState,
  TStarCornerRadiusDragState,
} from 'types/design/canvas/types';
import { TDragState, TEndpointDragState, TPathOffsetDragState, TResizeDragState, TRotateDragState } from 'types/design/selectionTool/types';

// utils
import { createCanvasRefs } from '../../../../useCanvasRefs/createCanvasRefs';
import { flushThrottledDispatch } from 'components/Design/Canvas/utils/flushThrottledDispatch';
import { handlePointerMove } from '../handlePointerMove';
import { createSelectionToolRefs } from '../../../hooks/useSelectionToolRefs/createSelectionToolRefs';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0 } as DOMRect);

  return canvas;
};

const pointerEvent = (x: number, y: number): PointerEvent => new PointerEvent('pointermove', { clientX: x, clientY: y });

const createDragStateRef = (dragState: TDragState | null = null): RefObject<TDragState | null> => ({ current: dragState });
const createEndpointDragRef = (endpointDragState: TEndpointDragState | null = null): RefObject<TEndpointDragState | null> => ({
  current: endpointDragState,
});
const createPathOffsetDragRef = (pathOffsetDragState: TPathOffsetDragState | null = null): RefObject<TPathOffsetDragState | null> => ({
  current: pathOffsetDragState,
});
const createResizeDragRef = (resizeDragState: TResizeDragState | null = null): RefObject<TResizeDragState | null> => ({
  current: resizeDragState,
});
const createRotateDragRef = (rotateDragState: TRotateDragState | null = null): RefObject<TRotateDragState | null> => ({
  current: rotateDragState,
});
const createCornerRadiusDragRef = (
  cornerRadiusDragState: TCornerRadiusDragState | null = null,
): RefObject<TCornerRadiusDragState | null> => ({ current: cornerRadiusDragState });
const createPolygonCornerRadiusDragRef = (
  polygonCornerRadiusDragState: TPolygonCornerRadiusDragState | null = null,
): RefObject<TPolygonCornerRadiusDragState | null> => ({ current: polygonCornerRadiusDragState });
const createStarCornerRadiusDragRef = (
  starCornerRadiusDragState: TStarCornerRadiusDragState | null = null,
): RefObject<TStarCornerRadiusDragState | null> => ({ current: starCornerRadiusDragState });
const createEllipseArcDragRef = (): RefObject<TEllipseArcDragState | null> => ({ current: null });
const createEllipseArcRotateDragRef = (): RefObject<TEllipseArcRotateDragState | null> => ({ current: null });
const createEllipseArcRatioDragRef = (): RefObject<TEllipseArcRatioDragState | null> => ({ current: null });
const createMarqueeStartRef = (point: TPoint | null = null): RefObject<TPoint | null> => ({ current: point });
const createMarqueeRef = (rect: TDraftRect | null = null): RefObject<TDraftRect | null> => ({ current: rect });

const addFrameNode = (x: number, y: number, size = 20): string => {
  store.dispatch(
    addNode({
      childIds: [],
      clipContent: true,
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

const addLineNode = (x1: number, y1: number, x2: number, y2: number): string => {
  store.dispatch(addNode({ name: 'Line', parentId: null, stroke: '#000000', type: NodeType.line, x1, x2, y1, y2 }));

  const { rootOrder } = selectActivePage(store.getState());

  return rootOrder[rootOrder.length - 1];
};

describe('handlePointerMove', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no drag, endpoint-drag or marquee is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    handlePointerMove(
      canvas,
      pointerEvent(10, 10),
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
        lassoMarquee: { marqueeRef: createMarqueeRef() },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef: createDragStateRef(),
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef: createMarqueeStartRef(),
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      vi.fn(),
    );

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes).toEqual({});
  });

  it('should delegate to continueDrag for a pending drag', () => {
    // mock
    const idA = addFrameNode(500, 500);
    const canvas = createCanvas();
    const dragStateRef = createDragStateRef({
      candidateShapes: [],
      dispatchThrottle: { frameId: null, run: null },
      hasMoved: false,
      nodeOrigins: { [idA]: { x: 500, y: 500 } },
      pendingClickAction: null,
      pointerStart: { x: 0, y: 0 },
    });

    // before
    handlePointerMove(
      canvas,
      pointerEvent(10, 20),
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
        lassoMarquee: { marqueeRef: createMarqueeRef() },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef,
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef: createMarqueeStartRef(),
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      vi.fn(),
    );
    flushThrottledDispatch(dragStateRef.current!.dispatchThrottle);

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toMatchObject({ x: 510, y: 520 });
  });

  it('should delegate to continueEndpointDrag for a pending endpoint drag', () => {
    // mock
    const idA = addLineNode(600, 600, 700, 600);
    const canvas = createCanvas();
    const endpointDragRef = createEndpointDragRef({ endpoint: 'a', nodeId: idA });

    // before
    handlePointerMove(
      canvas,
      pointerEvent(650, 660),
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
        lassoMarquee: { marqueeRef: createMarqueeRef() },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef: createDragStateRef(),
        endpointDragRef,
        marqueeStartRef: createMarqueeStartRef(),
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      vi.fn(),
    );

    // result
    expect(store.getState().design.pages[store.getState().design.activePageId].nodes[idA]).toMatchObject({ x1: 650, y1: 660 });
  });

  it('should delegate to continueMarqueeDrag for a pending marquee', () => {
    // mock
    const idA = addFrameNode(100, 100, 20);
    const canvas = createCanvas();
    const marqueeStartRef = createMarqueeStartRef({ x: 0, y: 0 });
    const marqueeRef = createMarqueeRef();

    // before
    handlePointerMove(
      canvas,
      pointerEvent(110, 110),
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
        lassoMarquee: { marqueeRef: marqueeRef },
        transform: { rotateDragRef: createRotateDragRef() },
      }),
      createSelectionToolRefs({
        dragStateRef: createDragStateRef(),
        endpointDragRef: createEndpointDragRef(),
        marqueeStartRef,
        pathOffsetDragRef: createPathOffsetDragRef(),
        resizeDragRef: createResizeDragRef(),
      }),
      vi.fn(),
    );

    // result
    expect(marqueeRef.current).toEqual({ height: 110, width: 110, x: 0, y: 0 });
    expect(selectSelectedIds(store.getState())).toEqual([idA]);
  });
});
