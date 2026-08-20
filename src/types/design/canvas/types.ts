import { RefObject } from 'react';

// types
import { TCornerRadiusHandle, TDraftRect, TPoint } from 'types/canvas';
import { TDraftEntity, TVectorTangent } from 'types/design/types';
import { TPenDragOrigin } from 'components/Design/Canvas/hooks/useDrawPenTool/types';
import { TRotateDragState } from 'types/design/selectionTool/types';

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
  tangentFromOffset: TVectorTangent;
  to: TPoint;
};

export type TVectorHandleHover = { end: 'end' | 'start'; segmentId: string };

export type TCanvasRefs = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  cornerRadiusDragRef: RefObject<TCornerRadiusDragState | null>;
  draftRef: RefObject<TDraftEntity | null>;
  ellipseArcDragRef: RefObject<TEllipseArcDragState | null>;
  ellipseArcRatioDragRef: RefObject<TEllipseArcRatioDragState | null>;
  ellipseArcRotateDragRef: RefObject<TEllipseArcRotateDragState | null>;
  hoveredSegmentIdRef: RefObject<string | null>;
  hoveredVectorHandleRef: RefObject<TVectorHandleHover | null>;
  hoveredVectorSegmentIdRef: RefObject<string | null>;
  hoveredVectorVertexIdRef: RefObject<string | null>;
  hoverRef: RefObject<string | null>;
  marqueeRef: RefObject<TDraftRect | null>;
  penDragOriginRef: RefObject<TPenDragOrigin | null>;
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
  starCornerRadiusDragRef: RefObject<TStarCornerRadiusDragState | null>;
};
