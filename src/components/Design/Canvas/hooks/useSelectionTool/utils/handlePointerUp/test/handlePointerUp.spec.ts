import { RefObject } from 'react';

// store
import { setSelection } from 'store/design/slice';
import { store } from 'store';
import { selectSelectedIds } from 'store/design/selectors';

// types
import { TDraftRect, TPoint } from 'types/canvas';
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
import { handlePointerUp } from '../handlePointerUp';
import { createSelectionToolRefs } from '../../../hooks/useSelectionToolRefs/createSelectionToolRefs';

const createCanvas = (): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');

  canvas.releasePointerCapture = vi.fn();

  return canvas;
};

const pointerEvent = (pointerId = 1): PointerEvent => new PointerEvent('pointerup', { pointerId });

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
const createPolygonVertexCountDragRef = (
  polygonVertexCountDragState: TPolygonVertexCountDragState | null = null,
): RefObject<TPolygonVertexCountDragState | null> => ({ current: polygonVertexCountDragState });
const createStarVertexCountDragRef = (
  starVertexCountDragState: TStarVertexCountDragState | null = null,
): RefObject<TStarVertexCountDragState | null> => ({ current: starVertexCountDragState });
const createEllipseArcDragRef = (): RefObject<TEllipseArcDragState | null> => ({ current: null });
const createEllipseArcRotateDragRef = (): RefObject<TEllipseArcRotateDragState | null> => ({ current: null });
const createEllipseArcRatioDragRef = (): RefObject<TEllipseArcRatioDragState | null> => ({ current: null });
const createMarqueeStartRef = (point: TPoint | null = null): RefObject<TPoint | null> => ({ current: point });
const createMarqueeRef = (rect: TDraftRect | null = null): RefObject<TDraftRect | null> => ({ current: rect });

describe('handlePointerUp', () => {
  beforeEach(() => {
    store.dispatch(setSelection([]));
  });

  it('should do nothing when no drag, endpoint-drag or marquee is in progress', () => {
    // mock
    const canvas = createCanvas();

    // before
    handlePointerUp(
      canvas,
      pointerEvent(),
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
        polygonVertexCountDragRef: createPolygonVertexCountDragRef(),
        resizeDragRef: createResizeDragRef(),
        starVertexCountDragRef: createStarVertexCountDragRef(),
      }),
      vi.fn(),
    );

    // result
    expect(canvas.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('should delegate to disarmDrag for a pending drag', () => {
    // mock
    const canvas = createCanvas();
    const dragStateRef = createDragStateRef({
      candidateShapes: [],
      dispatchThrottle: { frameId: null, run: null },
      hasMoved: false,
      nodeOrigins: {},
      pendingClickAction: { id: 'a', kind: 'collapse' },
      pointerStart: { x: 0, y: 0 },
    });

    // before
    handlePointerUp(
      canvas,
      pointerEvent(),
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
        polygonVertexCountDragRef: createPolygonVertexCountDragRef(),
        resizeDragRef: createResizeDragRef(),
        starVertexCountDragRef: createStarVertexCountDragRef(),
      }),
      vi.fn(),
    );

    // result
    expect(selectSelectedIds(store.getState())).toEqual(['a']);
    expect(dragStateRef.current).toBeNull();
  });

  it('should delegate to disarmEndpointDrag for a pending endpoint drag', () => {
    // mock
    const canvas = createCanvas();
    const endpointDragRef = createEndpointDragRef({ endpoint: 'a', nodeId: 'line-1' });

    // before
    handlePointerUp(
      canvas,
      pointerEvent(),
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
        polygonVertexCountDragRef: createPolygonVertexCountDragRef(),
        resizeDragRef: createResizeDragRef(),
        starVertexCountDragRef: createStarVertexCountDragRef(),
      }),
      vi.fn(),
    );

    // result
    expect(endpointDragRef.current).toBeNull();
  });

  it('should delegate to disarmMarqueeDrag for a pending marquee', () => {
    // mock
    const canvas = createCanvas();
    const marqueeStartRef = createMarqueeStartRef({ x: 10, y: 10 });
    const marqueeRef = createMarqueeRef({ height: 5, width: 5, x: 10, y: 10 });

    // before
    handlePointerUp(
      canvas,
      pointerEvent(),
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
        polygonVertexCountDragRef: createPolygonVertexCountDragRef(),
        resizeDragRef: createResizeDragRef(),
        starVertexCountDragRef: createStarVertexCountDragRef(),
      }),
      vi.fn(),
    );

    // result
    expect(marqueeStartRef.current).toBeNull();
    expect(marqueeRef.current).toBeNull();
  });
});
