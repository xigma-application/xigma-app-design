import { FC, useMemo, useRef } from 'react';

// others
import { CanvasRefsContext } from './context';
import { ERASER_DEFAULT_DIAMETER_PX } from 'constant/canvas';

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
  TVectorCutPreview,
  TVectorCutSegmentHover,
  TVectorDraggedFillFaces,
  TVectorFaceHover,
  TVectorHandleHover,
  TVectorMultiSelectBox,
  TVectorNodeDragSnapshot,
  TVectorNodeResizeSnapshot,
  TVectorNodeRotateSnapshot,
  TVectorPaintFaceHover,
  TVectorShapeBuilderTouchedFaces,
  TVectorWidthHandleSelection,
  TVectorWidthLastHandleSide,
  TVectorWidthPointDragState,
  TVectorWidthPointHover,
} from 'types/design/canvas/types';
import { TCanvasRefsProviderProps } from './types';
import { TColorSampleRequest } from 'utils/canvas/colorPixelSampler/types';
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
  const colorSampleRequestRef = useRef<TColorSampleRequest | null>(null);
  const cornerRadiusDragRef = useRef<TCornerRadiusDragState | null>(null);
  const draftRef = useRef<TDraftEntity | null>(null);
  const draggedNodeIdsRef = useRef<Set<string> | null>(null);
  const draggedVectorFillFacesRef = useRef<TVectorDraggedFillFaces | null>(null);
  const draggedVectorNodeSnapshotsRef = useRef<Map<string, TVectorNodeDragSnapshot> | null>(null);
  const ellipseArcDragRef = useRef<TEllipseArcDragState | null>(null);
  const ellipseArcRatioDragRef = useRef<TEllipseArcRatioDragState | null>(null);
  const ellipseArcRotateDragRef = useRef<TEllipseArcRotateDragState | null>(null);
  const eraseBrushCenterRef = useRef<TPoint | null>(null);
  const eraserDiameterRef = useRef<number>(ERASER_DEFAULT_DIAMETER_PX);
  const hoveredSegmentIdRef = useRef<string | null>(null);
  const hoveredVectorCutPointRef = useRef<TPoint | null>(null);
  const hoveredVectorCutSegmentRef = useRef<TVectorCutSegmentHover | null>(null);
  const hoveredVectorEdgeInsertPointRef = useRef<TPoint | null>(null);
  const hoveredVectorFaceSelectRef = useRef<TVectorFaceHover | null>(null);
  const hoveredVectorHandleRef = useRef<TVectorHandleHover | null>(null);
  const hoveredVectorPaintFaceKeyRef = useRef<TVectorPaintFaceHover | null>(null);
  const hoveredVectorSegmentIdRef = useRef<string | null>(null);
  const hoveredVectorShapeBuilderFaceRef = useRef<TVectorFaceHover | null>(null);
  const hoveredVectorVertexIdRef = useRef<string | null>(null);
  const hoveredVectorWidthPointRef = useRef<TVectorWidthPointHover | null>(null);
  const hoverRef = useRef<string | null>(null);
  const isVectorShapeBuilderBoxModeRef = useRef<boolean>(false);
  const isVectorShapeBuilderSubtractRef = useRef<boolean>(false);
  const lastVectorWidthHandleSideRef = useRef<TVectorWidthLastHandleSide | null>(null);
  const marqueeRef = useRef<TDraftRect | null>(null);
  const newVectorCutVertexIdsRef = useRef<Set<string>>(new Set());
  const penDragOriginRef = useRef<TPenDragOrigin | null>(null);
  const penDraggedHandleIsSnappedRef = useRef<boolean>(false);
  const penDraggedHandlePositionRef = useRef<TPoint | null>(null);
  const penHoveredDragArmableVertexRef = useRef<boolean>(false);
  const penNewVertexPreviewRef = useRef<TPoint | null>(null);
  const penPreviewRef = useRef<TPenPreview | null>(null);
  const pencilPreviewPointsRef = useRef<TPoint[] | null>(null);
  const pencilRawPreviewPointsRef = useRef<TPoint[] | null>(null);
  const pencilShowRawPreviewRef = useRef<boolean>(false);
  const polygonCornerRadiusDragRef = useRef<TPolygonCornerRadiusDragState | null>(null);
  const preVectorMarqueeSegmentIdsRef = useRef<string[]>([]);
  const preVectorMarqueeVertexIdsRef = useRef<string[]>([]);
  const resizedNodeIdsRef = useRef<Set<string> | null>(null);
  const resizedVectorNodeSnapshotsRef = useRef<Map<string, TVectorNodeResizeSnapshot> | null>(null);
  const rotateDragRef = useRef<TRotateDragState | null>(null);
  const rotatedNodeIdsRef = useRef<Set<string> | null>(null);
  const rotatedVectorNodeSnapshotsRef = useRef<Map<string, TVectorNodeRotateSnapshot> | null>(null);
  const selectedVectorHandlesRef = useRef<TVectorHandleHover[]>([]);
  const selectedVectorSegmentIdsRef = useRef<string[]>([]);
  const selectedVectorVertexIdsRef = useRef<string[]>([]);
  const selectedVectorWidthHandlesRef = useRef<TVectorWidthHandleSelection[]>([]);
  const sliceRef = useRef<TSliceDraft | null>(null);
  const snappedVectorHandleRef = useRef<TVectorHandleHover | null>(null);
  const starCornerRadiusDragRef = useRef<TStarCornerRadiusDragState | null>(null);
  const touchedVectorCutVertexIdsRef = useRef<Set<string>>(new Set());
  const touchedVectorShapeBuilderFacesRef = useRef<TVectorShapeBuilderTouchedFaces>({});
  const vectorAlignmentGuideRef = useRef<TVectorAlignmentGuide | null>(null);
  const vectorCutPreviewRef = useRef<TVectorCutPreview | null>(null);
  const vectorEraseStrokeRef = useRef<TPoint[] | null>(null);
  const vectorLassoPathRef = useRef<TPoint[] | null>(null);
  const vectorMultiDragRef = useRef<TVectorMultiDragState | null>(null);
  const vectorMultiSelectBoxRef = useRef<TVectorMultiSelectBox | null>(null);
  const vectorMultiSelectResizeDragRef = useRef<TVectorMultiSelectResizeDragState | null>(null);
  const vectorMultiSelectRotateDragRef = useRef<TVectorMultiSelectRotateDragState | null>(null);
  const vectorShapeBuilderPathRef = useRef<TPoint[] | null>(null);
  const vectorWidthPointDragRef = useRef<TVectorWidthPointDragState | null>(null);

  const refs = useMemo<TCanvasRefs>(
    () => ({
      canvasRef,
      colorSampleRequestRef,
      cornerRadiusDragRef,
      draftRef,
      draggedNodeIdsRef,
      draggedVectorFillFacesRef,
      draggedVectorNodeSnapshotsRef,
      ellipseArcDragRef,
      ellipseArcRatioDragRef,
      ellipseArcRotateDragRef,
      eraseBrushCenterRef,
      eraserDiameterRef,
      hoverRef,
      hoveredSegmentIdRef,
      hoveredVectorCutPointRef,
      hoveredVectorCutSegmentRef,
      hoveredVectorEdgeInsertPointRef,
      hoveredVectorFaceSelectRef,
      hoveredVectorHandleRef,
      hoveredVectorPaintFaceKeyRef,
      hoveredVectorSegmentIdRef,
      hoveredVectorShapeBuilderFaceRef,
      hoveredVectorVertexIdRef,
      hoveredVectorWidthPointRef,
      isVectorShapeBuilderBoxModeRef,
      isVectorShapeBuilderSubtractRef,
      lastVectorWidthHandleSideRef,
      marqueeRef,
      newVectorCutVertexIdsRef,
      penDragOriginRef,
      penDraggedHandleIsSnappedRef,
      penDraggedHandlePositionRef,
      penHoveredDragArmableVertexRef,
      penNewVertexPreviewRef,
      penPreviewRef,
      pencilPreviewPointsRef,
      pencilRawPreviewPointsRef,
      pencilShowRawPreviewRef,
      polygonCornerRadiusDragRef,
      preVectorMarqueeSegmentIdsRef,
      preVectorMarqueeVertexIdsRef,
      resizedNodeIdsRef,
      resizedVectorNodeSnapshotsRef,
      rotateDragRef,
      rotatedNodeIdsRef,
      rotatedVectorNodeSnapshotsRef,
      selectedVectorHandlesRef,
      selectedVectorSegmentIdsRef,
      selectedVectorVertexIdsRef,
      selectedVectorWidthHandlesRef,
      sliceRef,
      snappedVectorHandleRef,
      starCornerRadiusDragRef,
      touchedVectorCutVertexIdsRef,
      touchedVectorShapeBuilderFacesRef,
      vectorAlignmentGuideRef,
      vectorCutPreviewRef,
      vectorEraseStrokeRef,
      vectorLassoPathRef,
      vectorMultiDragRef,
      vectorMultiSelectBoxRef,
      vectorMultiSelectResizeDragRef,
      vectorMultiSelectRotateDragRef,
      vectorShapeBuilderPathRef,
      vectorWidthPointDragRef,
    }),
    [],
  );

  return <CanvasRefsContext.Provider value={refs}>{children}</CanvasRefsContext.Provider>;
};

export default CanvasRefsProvider;
