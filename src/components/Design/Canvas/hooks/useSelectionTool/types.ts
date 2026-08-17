// types
import { TCornerRadiusHandle, TDraftRect, TPoint, TResizeHandle } from 'types/canvas';

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

export type TCornerRadiusDragState = {
  bounds: TDraftRect;
  candidates: TCornerRadiusHandle[];
  corner: TCornerRadiusHandle | null;
  nodeId: string;
  pointerStart: TPoint;
  rotation: number;
};

export type TPolygonCornerRadiusDragState = {
  bounds: TDraftRect;
  nodeId: string;
  rotation: number;
  sides: number;
};

export type TRotateNodeOrigin =
  { x1: number; x2: number; y1: number; y2: number } | { height: number; rotation: number; width: number; x: number; y: number };

export type TRotateDragState = {
  cursorAngle: number;
  nodeOrigins: Record<string, TRotateNodeOrigin>;
  pivot: TPoint;
  startAngle: number;
};
