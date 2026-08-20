import { useRef } from 'react';

// types
import {
  TCanvasRefs,
  TCornerRadiusDragState,
  TEllipseArcDragState,
  TEllipseArcRatioDragState,
  TEllipseArcRotateDragState,
  TPenPreview,
  TPolygonCornerRadiusDragState,
  TSliceDraft,
  TStarCornerRadiusDragState,
  TVectorHandleHover,
  TVectorMultiSelectBox,
} from 'types/design/canvas/types';
import { TDraftEntity } from 'types/design/types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TPenDragOrigin } from '../useDrawPenTool/types';
import { TRotateDragState, TVectorMultiSelectResizeDragState, TVectorMultiSelectRotateDragState } from 'types/design/selectionTool/types';

export const useCanvasRefs = (): TCanvasRefs => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cornerRadiusDragRef = useRef<TCornerRadiusDragState | null>(null);
  const draftRef = useRef<TDraftEntity | null>(null);
  const ellipseArcDragRef = useRef<TEllipseArcDragState | null>(null);
  const ellipseArcRatioDragRef = useRef<TEllipseArcRatioDragState | null>(null);
  const ellipseArcRotateDragRef = useRef<TEllipseArcRotateDragState | null>(null);
  const hoveredSegmentIdRef = useRef<string | null>(null);
  const hoveredVectorEdgeInsertPointRef = useRef<TPoint | null>(null);
  const hoveredVectorHandleRef = useRef<TVectorHandleHover | null>(null);
  const hoveredVectorSegmentIdRef = useRef<string | null>(null);
  const hoveredVectorVertexIdRef = useRef<string | null>(null);
  const hoverRef = useRef<string | null>(null);
  const marqueeRef = useRef<TDraftRect | null>(null);
  const penDragOriginRef = useRef<TPenDragOrigin | null>(null);
  const penDraggedHandlePositionRef = useRef<TPoint | null>(null);
  const penHoveredDragArmableVertexRef = useRef<boolean>(false);
  const penNewVertexPreviewRef = useRef<TPoint | null>(null);
  const penPreviewRef = useRef<TPenPreview | null>(null);
  const polygonCornerRadiusDragRef = useRef<TPolygonCornerRadiusDragState | null>(null);
  const preVectorMarqueeSegmentIdsRef = useRef<string[]>([]);
  const preVectorMarqueeVertexIdsRef = useRef<string[]>([]);
  const rotateDragRef = useRef<TRotateDragState | null>(null);
  const selectedVectorHandlesRef = useRef<TVectorHandleHover[]>([]);
  const selectedVectorSegmentIdsRef = useRef<string[]>([]);
  const selectedVectorVertexIdsRef = useRef<string[]>([]);
  const sliceRef = useRef<TSliceDraft | null>(null);
  const starCornerRadiusDragRef = useRef<TStarCornerRadiusDragState | null>(null);
  const vectorMultiSelectBoxRef = useRef<TVectorMultiSelectBox | null>(null);
  const vectorMultiSelectResizeDragRef = useRef<TVectorMultiSelectResizeDragState | null>(null);
  const vectorMultiSelectRotateDragRef = useRef<TVectorMultiSelectRotateDragState | null>(null);
  const refsRef = useRef<TCanvasRefs | null>(null);

  if (refsRef.current === null) {
    refsRef.current = {
      canvasRef,
      cornerRadiusDragRef,
      draftRef,
      ellipseArcDragRef,
      ellipseArcRatioDragRef,
      ellipseArcRotateDragRef,
      hoverRef,
      hoveredSegmentIdRef,
      hoveredVectorEdgeInsertPointRef,
      hoveredVectorHandleRef,
      hoveredVectorSegmentIdRef,
      hoveredVectorVertexIdRef,
      marqueeRef,
      penDragOriginRef,
      penDraggedHandlePositionRef,
      penHoveredDragArmableVertexRef,
      penNewVertexPreviewRef,
      penPreviewRef,
      polygonCornerRadiusDragRef,
      preVectorMarqueeSegmentIdsRef,
      preVectorMarqueeVertexIdsRef,
      rotateDragRef,
      selectedVectorHandlesRef,
      selectedVectorSegmentIdsRef,
      selectedVectorVertexIdsRef,
      sliceRef,
      starCornerRadiusDragRef,
      vectorMultiSelectBoxRef,
      vectorMultiSelectResizeDragRef,
      vectorMultiSelectRotateDragRef,
    };
  }

  return refsRef.current;
};
