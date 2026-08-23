import { RefObject } from 'react';

// types
import { TCornerRadiusHandle, TDraftRect, TPoint } from 'types/canvas';
import { TDraftEntity, TVectorTangent } from 'types/design/types';
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

export type TCanvasRefs = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  cornerRadiusDragRef: RefObject<TCornerRadiusDragState | null>;
  draftRef: RefObject<TDraftEntity | null>;
  draggedVectorFillFacesRef: RefObject<TVectorDraggedFillFaces | null>;
  ellipseArcDragRef: RefObject<TEllipseArcDragState | null>;
  ellipseArcRatioDragRef: RefObject<TEllipseArcRatioDragState | null>;
  ellipseArcRotateDragRef: RefObject<TEllipseArcRotateDragState | null>;
  hoveredSegmentIdRef: RefObject<string | null>;
  hoveredVectorCutPointRef: RefObject<TPoint | null>;
  hoveredVectorCutSegmentRef: RefObject<TVectorCutSegmentHover | null>;
  hoveredVectorEdgeInsertPointRef: RefObject<TPoint | null>;
  hoveredVectorHandleRef: RefObject<TVectorHandleHover | null>;
  hoveredVectorPaintFaceKeyRef: RefObject<TVectorPaintFaceHover | null>;
  hoveredVectorSegmentIdRef: RefObject<string | null>;
  hoveredVectorVertexIdRef: RefObject<string | null>;
  hoverRef: RefObject<string | null>;
  marqueeRef: RefObject<TDraftRect | null>;
  newVectorCutVertexIdsRef: RefObject<Set<string>>;
  penDragOriginRef: RefObject<TPenDragOrigin | null>;
  penDraggedHandleIsSnappedRef: RefObject<boolean>;
  penDraggedHandlePositionRef: RefObject<TPoint | null>;
  penHoveredDragArmableVertexRef: RefObject<boolean>;
  penNewVertexPreviewRef: RefObject<TPoint | null>;
  penPreviewRef: RefObject<TPenPreview | null>;
  polygonCornerRadiusDragRef: RefObject<TPolygonCornerRadiusDragState | null>;
  preVectorMarqueeSegmentIdsRef: RefObject<string[]>;
  preVectorMarqueeVertexIdsRef: RefObject<string[]>;
  rotateDragRef: RefObject<TRotateDragState | null>;
  selectedVectorHandlesRef: RefObject<TVectorHandleHover[]>;
  selectedVectorSegmentIdsRef: RefObject<string[]>;
  selectedVectorVertexIdsRef: RefObject<string[]>;
  sliceRef: RefObject<TSliceDraft | null>;
  snappedVectorHandleRef: RefObject<TVectorHandleHover | null>;
  starCornerRadiusDragRef: RefObject<TStarCornerRadiusDragState | null>;
  touchedVectorCutVertexIdsRef: RefObject<Set<string>>;
  vectorAlignmentGuideRef: RefObject<TVectorAlignmentGuide | null>;
  vectorCutPreviewRef: RefObject<TVectorCutPreview | null>;
  vectorLassoPathRef: RefObject<TPoint[] | null>;
  vectorMultiDragRef: RefObject<TVectorMultiDragState | null>;
  vectorMultiSelectBoxRef: RefObject<TVectorMultiSelectBox | null>;
  vectorMultiSelectResizeDragRef: RefObject<TVectorMultiSelectResizeDragState | null>;
  vectorMultiSelectRotateDragRef: RefObject<TVectorMultiSelectRotateDragState | null>;
};
