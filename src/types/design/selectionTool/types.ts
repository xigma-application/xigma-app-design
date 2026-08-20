import { RefObject } from 'react';

// types
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';
import { TVectorSegment } from 'types/design/types';

export type TPendingClickAction = { id: string; kind: 'collapse' } | { kind: 'deselect' };

export type TLineEndpoint = 'a' | 'b';

// full segments (not just tangents) so a group transform can rebuild the whole `segments` record from
// the origin snapshot alone, with no live store read needed — mirrors the line x1/y1/x2/y2 shape
export type TVectorNodeOrigin = {
  segments: Record<string, TVectorSegment>;
  vertices: Record<string, TPoint>;
};

export type TNodeOrigin = { x1: number; x2: number; y1: number; y2: number } | { x: number; y: number } | TVectorNodeOrigin;

// resize keeps the node's live rotation (unlike rotate's TVectorNodeOrigin, resize never bakes it away)
// so a rotated single vector node's opposite corner can be anchored the same way a rotated box is
export type TVectorResizeOrigin = TVectorNodeOrigin & { rotation: number };

export type TResizeNodeOrigin =
  | { x1: number; x2: number; y1: number; y2: number }
  | { flip: { x: boolean; y: boolean } | null; height: number; rotation: number; width: number; x: number; y: number }
  | TVectorResizeOrigin;

export type TDragState = {
  hasMoved: boolean;
  nodeOrigins: Record<string, TNodeOrigin>;
  pendingClickAction: TPendingClickAction | null;
  pointerStart: TPoint;
};

export type TEndpointDragState = {
  endpoint: TLineEndpoint;
  nodeId: string;
};

export type TPathOffsetDragState = {
  nodeId: string;
};

export type TResizeDragState = {
  aspectRatio: number;
  bounds: TDraftRect;
  handle: TResizeHandle;
  nodeOrigins: Record<string, TResizeNodeOrigin>;
};

export type TPolygonVertexCountDragState = {
  bounds: TDraftRect;
  flipX: boolean;
  flipY: boolean;
  nodeId: string;
  rotation: number;
};

export type TStarVertexCountDragState = {
  bounds: TDraftRect;
  flipX: boolean;
  flipY: boolean;
  nodeId: string;
  rotation: number;
};

export type TStarRatioDragState = {
  bounds: TDraftRect;
  flipX: boolean;
  flipY: boolean;
  nodeId: string;
  points: number;
  rotation: number;
};

export type TRotateNodeOrigin =
  | { x1: number; x2: number; y1: number; y2: number }
  | { height: number; rotation: number; width: number; x: number; y: number }
  | (TVectorNodeOrigin & { rotation: number });

export type TRotateDragState = {
  cursorAngle: number;
  nodeOrigins: Record<string, TRotateNodeOrigin>;
  pivot: TPoint;
  startAngle: number;
};

export type TVectorVertexDragState = {
  nodeId: string;
  origins: Record<string, TPoint>;
  pointerStart: TPoint;
};

export type TVectorHandleDragState = {
  end: 'end' | 'start';
  nodeId: string;
  segmentId: string;
  vertexId: string;
};

export type TVectorPendingClickAction =
  { id: string; kind: 'vertex' } | { end: 'end' | 'start'; kind: 'handle'; segmentId: string } | { id: string; kind: 'segment' };

export type TVectorMultiDragState = {
  handleOrigins: Record<string, TPoint>;
  hasMoved: boolean;
  nodeId: string;
  pendingClickAction: TVectorPendingClickAction | null;
  pointerStart: TPoint;
  vertexOrigins: Record<string, TPoint>;
};

export type TSelectionToolRefs = {
  dragStateRef: RefObject<TDragState | null>;
  endpointDragRef: RefObject<TEndpointDragState | null>;
  marqueeStartRef: RefObject<TPoint | null>;
  pathOffsetDragRef: RefObject<TPathOffsetDragState | null>;
  polygonVertexCountDragRef: RefObject<TPolygonVertexCountDragState | null>;
  resizeDragRef: RefObject<TResizeDragState | null>;
  starRatioDragRef: RefObject<TStarRatioDragState | null>;
  starVertexCountDragRef: RefObject<TStarVertexCountDragState | null>;
  vectorHandleDragRef: RefObject<TVectorHandleDragState | null>;
  vectorMarqueeStartRef: RefObject<TPoint | null>;
  vectorMultiDragRef: RefObject<TVectorMultiDragState | null>;
  vectorVertexDragRef: RefObject<TVectorVertexDragState | null>;
};
