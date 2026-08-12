// types
import { TPoint } from 'types/canvas';

export type TPendingClickAction = { id: string; kind: 'collapse' } | { kind: 'deselect' };

export type TLineEndpoint = 'a' | 'b';

export type TNodeOrigin = { x1: number; x2: number; y1: number; y2: number } | { x: number; y: number };

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
