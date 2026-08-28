import { RefObject } from 'react';

// types
import { TCornerRadiusHandle, TDraftRect, TPoint } from 'types/canvas';
import { TDraftEntity, TVectorTangent, TVectorWidthPoint } from 'types/design/types';
import { TColorSampleRequest } from 'utils/canvas/colorPixelSampler/types';
import { TFlattenedVectorSegment } from 'utils/canvas/vectorNetwork/flattenVectorSegments';
import { TPenDragOrigin } from 'components/Design/Canvas/hooks/useDrawPenTool/types';
import { TVectorAlignmentGuide } from 'components/Design/Canvas/utils/applyVectorPointSnapping';
import {
  TRotateDragState,
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

export type TVectorWidthLastHandleSide = { nodeId: string; pointId: string; side: 'left' | 'right' };

export type TVectorNodeDragSnapshot = {
  deltaX: number;
  deltaY: number;
  facesByColor: { color: string; points: TPoint[][] }[];
  strokeColor: string;
  strokeVertices: number[];
};

export type TVectorNodeResizeSnapshot = {
  anchorX: number | null;
  anchorY: number | null;
  facesByColor: { color: string; points: TPoint[][] }[];
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
  facesByColor: { color: string; points: TPoint[][] }[];
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
  vectorAlignmentGuideRef: RefObject<TVectorAlignmentGuide | null>;
};

export type THoverRefs = {
  hoverRef: RefObject<string | null>;
  hoveredSegmentIdRef: RefObject<string | null>;
  hoveredVectorCutPointRef: RefObject<TPoint | null>;
  hoveredVectorCutSegmentRef: RefObject<TVectorCutSegmentHover | null>;
  hoveredVectorEdgeInsertPointRef: RefObject<TPoint | null>;
  hoveredVectorFaceSelectRef: RefObject<TVectorFaceHover | null>;
  hoveredVectorHandleRef: RefObject<TVectorHandleHover | null>;
  hoveredVectorPaintFaceKeyRef: RefObject<TVectorPaintFaceHover | null>;
  hoveredVectorSegmentIdRef: RefObject<string | null>;
  hoveredVectorShapeBuilderFaceRef: RefObject<TVectorFaceHover | null>;
  hoveredVectorVertexIdRef: RefObject<string | null>;
  hoveredVectorWidthPointRef: RefObject<TVectorWidthPointHover | null>;
};

export type TVectorSnapshotsRefs = {
  draggedVectorFillFacesRef: RefObject<TVectorDraggedFillFaces | null>;
  draggedVectorNodeSnapshotsRef: RefObject<Map<string, TVectorNodeDragSnapshot> | null>;
  resizedVectorNodeSnapshotsRef: RefObject<Map<string, TVectorNodeResizeSnapshot> | null>;
  rotatedVectorNodeSnapshotsRef: RefObject<Map<string, TVectorNodeRotateSnapshot> | null>;
};

export type TTransformRefs = {
  draggedNodeIdsRef: RefObject<Set<string> | null>;
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

export type TShapeBuilderRefs = {
  isVectorShapeBuilderBoxModeRef: RefObject<boolean>;
  isVectorShapeBuilderSubtractRef: RefObject<boolean>;
  touchedVectorShapeBuilderFacesRef: RefObject<TVectorShapeBuilderTouchedFaces>;
  vectorShapeBuilderPathRef: RefObject<TPoint[] | null>;
};

export type TCanvasRefs = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  colorSampleRequestRef: RefObject<TColorSampleRequest | null>;
  cornerRadius: TCornerRadiusRefs;
  draftRef: RefObject<TDraftEntity | null>;
  ellipseArc: TEllipseArcRefs;
  hover: THoverRefs;
  lassoMarquee: TLassoMarqueeRefs;
  pen: TPenRefs;
  pencil: TPencilRefs;
  shapeBuilder: TShapeBuilderRefs;
  slice: TSliceRefs;
  transform: TTransformRefs;
  vectorCut: TVectorCutRefs;
  vectorEdit: TVectorEditRefs;
  vectorErase: TVectorEraseRefs;
  vectorMultiSelect: TVectorMultiSelectRefs;
  vectorPaint: TVectorPaintRefs;
  vectorSnapshots: TVectorSnapshotsRefs;
  vectorWidth: TVectorWidthRefs;
};

export type TCanvasRefsOverrides = {
  [K in keyof TCanvasRefs]?: TCanvasRefs[K] extends RefObject<unknown> ? TCanvasRefs[K] : Partial<TCanvasRefs[K]>;
};
