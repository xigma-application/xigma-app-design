import { RefObject } from 'react';

// types
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';

export type TPendingClickAction = { id: string; kind: 'collapse' } | { kind: 'deselect' };

export type TLineEndpoint = 'a' | 'b';

export type TNodeOrigin = { x1: number; x2: number; y1: number; y2: number } | { x: number; y: number };

export type TResizeNodeOrigin =
  | { x1: number; x2: number; y1: number; y2: number }
  | { flip: { x: boolean; y: boolean } | null; height: number; rotation: number; width: number; x: number; y: number };

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

export type TRotateNodeOrigin =
  { x1: number; x2: number; y1: number; y2: number } | { height: number; rotation: number; width: number; x: number; y: number };

export type TRotateDragState = {
  cursorAngle: number;
  nodeOrigins: Record<string, TRotateNodeOrigin>;
  pivot: TPoint;
  startAngle: number;
};

export type TSelectionToolRefs = {
  dragStateRef: RefObject<TDragState | null>;
  endpointDragRef: RefObject<TEndpointDragState | null>;
  marqueeStartRef: RefObject<TPoint | null>;
  pathOffsetDragRef: RefObject<TPathOffsetDragState | null>;
  polygonVertexCountDragRef: RefObject<TPolygonVertexCountDragState | null>;
  resizeDragRef: RefObject<TResizeDragState | null>;
  rotateDragRef: RefObject<TRotateDragState | null>;
  starVertexCountDragRef: RefObject<TStarVertexCountDragState | null>;
};
