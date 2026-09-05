import { RefObject } from 'react';

// types
import { TAlignmentGuide } from 'components/Design/Canvas/utils/getGroupAlignmentGuide';
import { TArmedMedia } from 'components/Design/Canvas/hooks/useDrawMediaTool/utils/loadArmedMedia';
import { TAutoLayoutDropTarget } from 'store/design/utils/autoLayout/getAutoLayoutDropTarget/getAutoLayoutDropTarget';
import { TAspectRatioLockGuide, TCornerRadiusHandle, TDraftRect, TPoint } from 'types/canvas';
import { TDistanceGuides } from 'components/Design/Canvas/utils/getDistanceGuides/types';
import { TEqualSpacingGuides, TMatchedPairGuides } from 'components/Design/Canvas/utils/getEqualSpacingGuides/types';
import { TDraftEntity, TVectorTangent, TVectorWidthPoint } from 'types/design/types';
import { TGuideAxis } from 'types/design/guides/types';
import { TColorSampleRequest } from 'utils/canvas/colorPixelSampler/types';
import { TFlattenedVectorSegment } from 'utils/canvas/vectorNetwork/flattenVectorSegments';
import { TPaint } from 'types/design/paint/types';
import { TPenDragOrigin } from 'components/Design/Canvas/hooks/useDrawPenTool/types';
import { TShapeContactGuide } from 'components/Design/Canvas/utils/getShapeContactGuides';
import {
  TNodeOrigin,
  TPolygonVertexCountDragState,
  TRotateDragState,
  TStarRatioDragState,
  TStarVertexCountDragState,
  TThrottledDispatchState,
  TVectorMultiDragState,
  TVectorMultiSelectResizeDragState,
  TVectorMultiSelectRotateDragState,
} from 'types/design/selectionTool/types';

export type TCornerRadiusDragState = {
  bounds: TDraftRect;
  candidates: TCornerRadiusHandle[];
  corner: TCornerRadiusHandle | null;
  hasMoved: boolean;
  nodeId: string;
  pointerStart: TPoint;
  rotation: number;
};

export type TCornerRadiusHandleHover = { corner: TCornerRadiusHandle; nodeId: string };

export type TPolygonCornerRadiusDragState = {
  bounds: TDraftRect;
  flipX: boolean;
  flipY: boolean;
  hasMoved: boolean;
  nodeId: string;
  rotation: number;
  sides: number;
};

export type TStarCornerRadiusDragState = {
  bounds: TDraftRect;
  flipX: boolean;
  flipY: boolean;
  hasMoved: boolean;
  nodeId: string;
  points: number;
  ratio: number;
  rotation: number;
};

export type TEllipseArcDragState = {
  bounds: TDraftRect;
  draggedHandlePosition: TPoint | null;
  flipX: boolean;
  flipY: boolean;
  nodeId: string;
  rotation: number;
};

export type TEllipseArcRotateDragState = {
  bounds: TDraftRect;
  draggedHandlePosition: TPoint | null;
  flipX: boolean;
  flipY: boolean;
  nodeId: string;
  rotation: number;
};

export type TEllipseArcRatioDragState = {
  bounds: TDraftRect;
  draggedHandlePosition: TPoint | null;
  flipX: boolean;
  flipY: boolean;
  nodeId: string;
  rotation: number;
};

export type TSliceDraft = TDraftRect & { rotation: number };

export type TPenPreview = {
  from: TPoint;
  isSnapped: boolean;
  tangentFromOffset: TVectorTangent;
  to: TPoint;
};

export type TVectorHandleHover = { end: 'end' | 'start'; segmentId: string };

export type TVectorSelectionSnapshot = {
  selectedVectorHandles: TVectorHandleHover[];
  selectedVectorSegmentIds: string[];
  selectedVectorVertexIds: string[];
};

export type TVectorFaceHover = { faceKey: string; nodeId: string };

export type TVectorPaintFaceHover = { faceKey: string; isFilled: boolean; nodeId: string };

export type TVectorMultiSelectBox = {
  bounds: TDraftRect;
  rotation: number;
  selectionKey: string;
};

export type TVectorCutCrossing = { nodeId: string; point: TPoint; segmentId: string; t: number };

export type TVectorCutPreview = { crossings: TVectorCutCrossing[]; lineEnd: TPoint; lineStart: TPoint };

export type TVectorDraggedFillFaces = Record<string, string[]>;

export type TVectorCutSegmentHover = { nodeId: string; segmentId: string };

export type TVectorShapeBuilderTouchedFaces = Record<string, Set<string>>;

export type TVectorPaintTouchedLoopKeys = Record<string, Set<string>>;

export type TVectorWidthPointHover = { nodeId: string; segmentId: string; t: number };

export type TVectorWidthPointDragTarget = 'left' | 'point' | 'right';

export type TVectorWidthPointDragGroupTarget = { nodeId: string; point: TVectorWidthPoint };

export type TVectorWidthPointDragState = {
  armMagnitude: number;
  armWorldPoint: TPoint;
  groupTargets: TVectorWidthPointDragGroupTarget[];
  isNewPoint: boolean;
  nodeId: string;
  point: TVectorWidthPoint;
  target: TVectorWidthPointDragTarget;
};

export type TVectorWidthHandleSelection = { nodeId: string; pointId: string; side: 'left' | 'point' | 'right' };

export type TVectorWidthLabelEditTarget = { nodeId: string; pointId: string };

export type TVectorWidthLastHandleSide = { nodeId: string; pointId: string; side: 'left' | 'right' };

export type TVectorNodeDragSnapshot = {
  deltaX: number;
  deltaY: number;
  facesByPaint: { paint: TPaint[]; points: TPoint[][] }[];
  strokeColor: string;
  strokeVertices: number[];
};

export type TVectorNodeResizeSnapshot = {
  anchorX: number | null;
  anchorY: number | null;
  facesByPaint: { paint: TPaint[]; points: TPoint[][] }[];
  flattenedSegments: TFlattenedVectorSegment[];
  pivot: TPoint;
  rotation: number;
  scaleX: number;
  scaleY: number;
  scaledCenter: TPoint;
  strokeColor: string;
  strokeWidth: number;
};

export type TVectorNodeRotateSnapshot = {
  deltaDegrees: number;
  facesByPaint: { paint: TPaint[]; points: TPoint[][] }[];
  pivot: TPoint;
  strokeColor: string;
  strokeVertices: number[];
};

export type TSliceRefs = {
  sliceRef: RefObject<TSliceDraft | null>;
};

export type TPencilRefs = {
  pencilPreviewPointsRef: RefObject<TPoint[] | null>;
  pencilRawPreviewPointsRef: RefObject<TPoint[] | null>;
  pencilShowRawPreviewRef: RefObject<boolean>;
};

export type TVectorWidthRefs = {
  editingWidthLabelRef: RefObject<TVectorWidthLabelEditTarget | null>;
  vectorWidthPointDragRef: RefObject<TVectorWidthPointDragState | null>;
};

export type TVectorCutRefs = {
  newVectorCutVertexIdsRef: RefObject<Set<string>>;
  touchedVectorCutVertexIdsRef: RefObject<Set<string>>;
  vectorCutPreviewRef: RefObject<TVectorCutPreview | null>;
};

export type TVectorEraseRefs = {
  eraseBrushCenterRef: RefObject<TPoint | null>;
  eraserDiameterRef: RefObject<number>;
  vectorEraseStrokeRef: RefObject<TPoint[] | null>;
};

export type TVectorPaintRefs = {
  isVectorPaintRemoveRef: RefObject<boolean>;
  touchedVectorPaintLoopKeysRef: RefObject<TVectorPaintTouchedLoopKeys>;
  vectorPaintPathRef: RefObject<TPoint[] | null>;
  vectorPaintTouchedFacesRef: RefObject<TVectorDraggedFillFaces | null>;
};

export type TVectorEditRefs = {
  lastVectorWidthHandleSideRef: RefObject<TVectorWidthLastHandleSide | null>;
  preVectorMarqueeSegmentIdsRef: RefObject<string[]>;
  preVectorMarqueeVertexIdsRef: RefObject<string[]>;
  selectedVectorHandlesRef: RefObject<TVectorHandleHover[]>;
  selectedVectorSegmentIdsRef: RefObject<string[]>;
  selectedVectorVertexIdsRef: RefObject<string[]>;
  selectedVectorWidthHandlesRef: RefObject<TVectorWidthHandleSelection[]>;
  snappedVectorHandleRef: RefObject<TVectorHandleHover | null>;
  vectorAlignmentGuideRef: RefObject<TAlignmentGuide | null>;
};

export type THoverRefs = {
  hoverRef: RefObject<string | null>;
  hoveredCornerRadiusHandleRef: RefObject<TCornerRadiusHandleHover | null>;
  hoveredEllipseArcHandleRef: RefObject<string | null>;
  hoveredEllipseArcRatioHandleRef: RefObject<string | null>;
  hoveredEllipseArcRotateHandleRef: RefObject<string | null>;
  hoveredPolygonCornerRadiusHandleRef: RefObject<string | null>;
  hoveredPolygonVertexCountHandleRef: RefObject<string | null>;
  hoveredSegmentIdRef: RefObject<string | null>;
  hoveredSmartSelectionGapRef: RefObject<TSmartSelectionGapHoverState | null>;
  hoveredSmartSelectionSwapRef: RefObject<TSmartSelectionSwapHoverState | null>;
  hoveredStarCornerRadiusHandleRef: RefObject<string | null>;
  hoveredStarRatioHandleRef: RefObject<string | null>;
  hoveredStarVertexCountHandleRef: RefObject<string | null>;
  hoveredVectorCutPointRef: RefObject<TPoint | null>;
  hoveredVectorCutSegmentRef: RefObject<TVectorCutSegmentHover | null>;
  hoveredVectorEdgeInsertPointRef: RefObject<TPoint | null>;
  hoveredVectorFaceSelectRef: RefObject<TVectorFaceHover | null>;
  hoveredVectorHandleRef: RefObject<TVectorHandleHover | null>;
  hoveredVectorPaintFaceKeyRef: RefObject<TVectorPaintFaceHover | null>;
  hoveredVectorSegmentIdRef: RefObject<string | null>;
  hoveredVectorShapeBuilderFaceRef: RefObject<TVectorFaceHover | null>;
  hoveredVectorVertexIdRef: RefObject<string | null>;
  hoveredVectorWidthLabelRef: RefObject<TVectorWidthPointHover | null>;
  hoveredVectorWidthPointRef: RefObject<TVectorWidthPointHover | null>;
  isSmartSelectionBoxHoveredRef: RefObject<boolean>;
};

export type TVectorSnapshotsRefs = {
  draggedVectorFillFacesRef: RefObject<TVectorDraggedFillFaces | null>;
  draggedVectorNodeSnapshotsRef: RefObject<Map<string, TVectorNodeDragSnapshot> | null>;
  resizedVectorNodeSnapshotsRef: RefObject<Map<string, TVectorNodeResizeSnapshot> | null>;
  rotatedVectorNodeSnapshotsRef: RefObject<Map<string, TVectorNodeRotateSnapshot> | null>;
};

export type TAutoLayoutDropTargetHover = TAutoLayoutDropTarget & { frameId: string };

export type TAutoLayoutReorderPreview = { activeIndex: number; frameId: string; positions: Record<string, TPoint> };

export type TTransformRefs = {
  alignmentGuideRef: RefObject<TAlignmentGuide | null>;
  aspectRatioLockGuideRef: RefObject<TAspectRatioLockGuide | null>;
  autoLayoutDropTargetRef: RefObject<TAutoLayoutDropTargetHover | null>;
  autoLayoutReorderPreviewRef: RefObject<TAutoLayoutReorderPreview | null>;
  contactGuidesRef: RefObject<TShapeContactGuide[] | null>;
  distanceGuidesRef: RefObject<TDistanceGuides | null>;
  draggedNodeIdsRef: RefObject<Set<string> | null>;
  dropTargetFrameIdRef: RefObject<string | null>;
  equalSpacingGuidesRef: RefObject<TEqualSpacingGuides | null>;
  matchedPairGuidesRef: RefObject<TMatchedPairGuides | null>;
  resizedNodeIdsRef: RefObject<Set<string> | null>;
  rotateDragRef: RefObject<TRotateDragState | null>;
  rotatedNodeIdsRef: RefObject<Set<string> | null>;
};

export type TPenRefs = {
  penDragOriginRef: RefObject<TPenDragOrigin | null>;
  penDraggedHandleIsSnappedRef: RefObject<boolean>;
  penDraggedHandlePositionRef: RefObject<TPoint | null>;
  penHoveredDragArmableVertexRef: RefObject<boolean>;
  penNewVertexPreviewRef: RefObject<TPoint | null>;
  penPreviewRef: RefObject<TPenPreview | null>;
};

export type TEllipseArcRefs = {
  ellipseArcDragRef: RefObject<TEllipseArcDragState | null>;
  ellipseArcRatioDragRef: RefObject<TEllipseArcRatioDragState | null>;
  ellipseArcRotateDragRef: RefObject<TEllipseArcRotateDragState | null>;
};

export type TCornerRadiusRefs = {
  cornerRadiusDragRef: RefObject<TCornerRadiusDragState | null>;
  polygonCornerRadiusDragRef: RefObject<TPolygonCornerRadiusDragState | null>;
  starCornerRadiusDragRef: RefObject<TStarCornerRadiusDragState | null>;
};

export type TVertexCountRefs = {
  polygonVertexCountDragRef: RefObject<TPolygonVertexCountDragState | null>;
  starVertexCountDragRef: RefObject<TStarVertexCountDragState | null>;
};

export type TStarRatioRefs = {
  starRatioDragRef: RefObject<TStarRatioDragState | null>;
};

export type TVectorMultiSelectRefs = {
  vectorMultiDragRef: RefObject<TVectorMultiDragState | null>;
  vectorMultiSelectBoxRef: RefObject<TVectorMultiSelectBox | null>;
  vectorMultiSelectResizeDragRef: RefObject<TVectorMultiSelectResizeDragState | null>;
  vectorMultiSelectRotateDragRef: RefObject<TVectorMultiSelectRotateDragState | null>;
};

export type TLassoMarqueeRefs = {
  marqueeRef: RefObject<TDraftRect | null>;
  vectorLassoPathRef: RefObject<TPoint[] | null>;
};

export type TLayoutRefs = {
  leftPanelWidthRef: RefObject<number>;
  rightPanelWidthRef: RefObject<number>;
};

export type TMediaRefs = {
  armedRef: RefObject<TArmedMedia | null>;
  queueRef: RefObject<File[]>;
};

export type TShapeBuilderRefs = {
  isVectorShapeBuilderBoxModeRef: RefObject<boolean>;
  isVectorShapeBuilderSubtractRef: RefObject<boolean>;
  touchedVectorShapeBuilderFacesRef: RefObject<TVectorShapeBuilderTouchedFaces>;
  vectorShapeBuilderPathRef: RefObject<TPoint[] | null>;
};

export type TFrameNameRefs = {
  editingLabelRef: RefObject<string | null>;
};

export type TGuideDragState = {
  axis: TGuideAxis;
  frameId: string | null;
  hasMoved: boolean;
  id: string | null;
  position: number;
};

export type TGuideIdentity = {
  frameId: string | null;
  id: string;
};

export type TGuideRefs = {
  draggingGuideRef: RefObject<TGuideDragState | null>;
  hoveredGuideRef: RefObject<TGuideIdentity | null>;
  selectedGuideRef: RefObject<TGuideIdentity | null>;
};

export type TSectionNameRefs = {
  editingLabelRef: RefObject<string | null>;
};

export type TSmartSelectionCascadeGroup = {
  nodeIds: string[];
  originalPosition: number;
  size: number;
};

export type TSmartSelectionGapDragState = {
  anchorPosition: number;
  anchorSize: number;
  axis: 'x' | 'y';
  badgeAnchor: TPoint;
  cascadeGroups: TSmartSelectionCascadeGroup[];
  currentGapValue: number;
  dispatchThrottle: TThrottledDispatchState;
  gapIndex: number;
  hasMoved: boolean;
  nodeOrigins: Record<string, TNodeOrigin>;
  originalGapValue: number;
  pointerStart: TPoint;
};

export type TSmartSelectionGapHoverState = {
  axis: 'x' | 'y';
  gapValue: number;
  point: TPoint;
};

export type TSmartSelectionSwapHoverState = {
  center: TPoint;
};

export type TSmartSelectionSwapDragState = {
  dispatchThrottle: TThrottledDispatchState;
  fromIndex: number;
  hasMoved: boolean;
  nodeOrigins: Record<string, TNodeOrigin>;
  pointerStart: TPoint;
  slots: { bounds: TDraftRect; id: string | null }[];
  targetIndex: number;
};

export type TSmartSelectionRefs = {
  gapDragRef: RefObject<TSmartSelectionGapDragState | null>;
  swapDragRef: RefObject<TSmartSelectionSwapDragState | null>;
};

export type TCanvasRefs = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  colorSampleRequestRef: RefObject<TColorSampleRequest | null>;
  cornerRadius: TCornerRadiusRefs;
  draftRef: RefObject<TDraftEntity | null>;
  ellipseArc: TEllipseArcRefs;
  frameName: TFrameNameRefs;
  guides: TGuideRefs;
  hover: THoverRefs;
  lassoMarquee: TLassoMarqueeRefs;
  layout: TLayoutRefs;
  media: TMediaRefs;
  pen: TPenRefs;
  pencil: TPencilRefs;
  sectionName: TSectionNameRefs;
  shapeBuilder: TShapeBuilderRefs;
  slice: TSliceRefs;
  smartSelection: TSmartSelectionRefs;
  starRatio: TStarRatioRefs;
  transform: TTransformRefs;
  vectorCut: TVectorCutRefs;
  vectorEdit: TVectorEditRefs;
  vectorErase: TVectorEraseRefs;
  vectorMultiSelect: TVectorMultiSelectRefs;
  vectorPaint: TVectorPaintRefs;
  vectorSnapshots: TVectorSnapshotsRefs;
  vectorWidth: TVectorWidthRefs;
  vertexCount: TVertexCountRefs;
};

export type TCanvasRefsOverrides = {
  [K in keyof TCanvasRefs]?: TCanvasRefs[K] extends RefObject<unknown> ? TCanvasRefs[K] : Partial<TCanvasRefs[K]>;
};
