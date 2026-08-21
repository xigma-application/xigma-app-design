import { FC, useMemo, useRef } from 'react';

// others
import { CanvasRefsContext } from './context';

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
import { TCanvasRefsProviderProps } from './types';
import { TDraftEntity } from 'types/design/types';
import { TDraftRect, TPoint } from 'types/canvas';
import { TPenDragOrigin } from 'components/Design/Canvas/hooks/useDrawPenTool/types';
import { TVectorAlignmentGuide } from 'components/Design/Canvas/utils/applyVectorPointSnapping';
import {
  TRotateDragState,
  TVectorMultiDragState,
  TVectorMultiSelectResizeDragState,
  TVectorMultiSelectRotateDragState,
} from 'types/design/selectionTool/types';

const CanvasRefsProvider: FC<TCanvasRefsProviderProps> = ({ children }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cornerRadiusDragRef = useRef<TCornerRadiusDragState | null>(null);
  const draftRef = useRef<TDraftEntity | null>(null);
  const ellipseArcDragRef = useRef<TEllipseArcDragState | null>(null);
  const ellipseArcRatioDragRef = useRef<TEllipseArcRatioDragState | null>(null);
  const ellipseArcRotateDragRef = useRef<TEllipseArcRotateDragState | null>(null);
  const hoveredSegmentIdRef = useRef<string | null>(null);
  const hoveredVectorEdgeInsertPointRef = useRef<TPoint | null>(null);
  const hoveredVectorHandleRef = useRef<TVectorHandleHover | null>(null);
  const hoveredVectorPaintFaceKeyRef = useRef<string | null>(null);
  const hoveredVectorSegmentIdRef = useRef<string | null>(null);
  const hoveredVectorVertexIdRef = useRef<string | null>(null);
  const hoverRef = useRef<string | null>(null);
  const marqueeRef = useRef<TDraftRect | null>(null);
  const penDragOriginRef = useRef<TPenDragOrigin | null>(null);
  const penDraggedHandleIsSnappedRef = useRef<boolean>(false);
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
  const snappedVectorHandleRef = useRef<TVectorHandleHover | null>(null);
  const starCornerRadiusDragRef = useRef<TStarCornerRadiusDragState | null>(null);
  const vectorAlignmentGuideRef = useRef<TVectorAlignmentGuide | null>(null);
  const vectorLassoPathRef = useRef<TPoint[] | null>(null);
  const vectorMultiDragRef = useRef<TVectorMultiDragState | null>(null);
  const vectorMultiSelectBoxRef = useRef<TVectorMultiSelectBox | null>(null);
  const vectorMultiSelectResizeDragRef = useRef<TVectorMultiSelectResizeDragState | null>(null);
  const vectorMultiSelectRotateDragRef = useRef<TVectorMultiSelectRotateDragState | null>(null);

  const refs = useMemo<TCanvasRefs>(
    () => ({
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
      hoveredVectorPaintFaceKeyRef,
      hoveredVectorSegmentIdRef,
      hoveredVectorVertexIdRef,
      marqueeRef,
      penDragOriginRef,
      penDraggedHandleIsSnappedRef,
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
      snappedVectorHandleRef,
      starCornerRadiusDragRef,
      vectorAlignmentGuideRef,
      vectorLassoPathRef,
      vectorMultiDragRef,
      vectorMultiSelectBoxRef,
      vectorMultiSelectResizeDragRef,
      vectorMultiSelectRotateDragRef,
    }),
    [],
  );

  return <CanvasRefsContext.Provider value={refs}>{children}</CanvasRefsContext.Provider>;
};

export default CanvasRefsProvider;
