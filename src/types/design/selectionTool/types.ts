import { RefObject } from 'react';

// types
import { TAxisLock } from 'components/Design/Canvas/utils/getAxisLockedPoint';
import { TCandidateShape } from 'components/Design/Canvas/utils/getDragAlignmentSnap/getCandidateShapes';
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';
import { TVectorSegment } from 'types/design/types';

export type TPendingClickAction = { id: string; kind: 'collapse' } | { kind: 'deselect' };

export type TLineEndpoint = 'a' | 'b';

export type TVectorNodeOrigin = {
  segments: Record<string, TVectorSegment>;
  vertices: Record<string, TPoint>;
};

export type TNodeOrigin = { x1: number; x2: number; y1: number; y2: number } | { x: number; y: number } | TVectorNodeOrigin;

export type TVectorResizeOrigin = TVectorNodeOrigin & { rotation: number };

export type TResizeNodeOrigin =
  | { x1: number; x2: number; y1: number; y2: number }
  | { flip: { x: boolean; y: boolean } | null; height: number; rotation: number; width: number; x: number; y: number }
  | TVectorResizeOrigin;

export type TDragState = {
  candidateShapes: TCandidateShape[];
  dispatchThrottle: TThrottledDispatchState;
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
  candidateShapes: TCandidateShape[];
  handle: TResizeHandle;
  nodeOrigins: Record<string, TResizeNodeOrigin>;
  rotatedGroupChildOrigins?: Record<string, TResizeNodeOrigin>;
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

export type TThrottledDispatchState = { frameId: number | null; run: (() => void) | null };

export type TVectorVertexDragState = {
  dispatchThrottle: TThrottledDispatchState;
  mergeTarget?: { nodeId: string; vertexId: string } | null;
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

export type TVectorCornerHandleDragCandidate = { angle: number; end: 'end' | 'start'; segmentId: string };

export type TPendingVectorCornerHandleDragState = {
  candidates: TVectorCornerHandleDragCandidate[];
  dragStart: TPoint;
  nodeId: string;
  vertexId: string;
};

export type TVectorPendingClickAction =
  | { id: string; kind: 'vertex' }
  | { end: 'end' | 'start'; kind: 'handle'; segmentId: string }
  | { id: string; kind: 'segment' }
  | { kind: 'split-segment'; nodeId: string; segmentId: string; t: number };

export type TVectorMultiDragState = {
  boxOrigin: TDraftRect | null;
  dispatchThrottle: TThrottledDispatchState;
  handleOrigins: Record<string, TPoint>;
  hasMoved: boolean;
  pendingClickAction: TVectorPendingClickAction | null;
  pointerStart: TPoint;
  vertexOrigins: Record<string, TPoint>;
};

export type TVectorMarqueeMode = 'everything' | 'handles' | 'points';

export type TVectorBendDragCandidate = { angle: number; segmentId: string };

export type TVectorSegmentBendDragState =
  | { candidates: TVectorBendDragCandidate[]; dragStart: TPoint; nodeId: string; status: 'pending' }
  | {
      dragStart: TPoint;
      nodeId: string;
      originalTangentEnd: TPoint | null;
      originalTangentStart: TPoint | null;
      segmentId: string;
      status: 'committed';
      tangentEnd: TPoint;
      tangentStart: TPoint;
    };

export type TVectorMultiSelectResizeDragState = {
  anchor: { x: number | null; y: number | null };
  anchorWorld: TPoint;
  bounds: TDraftRect;
  handle: TResizeHandle;
  handleOrigins: Record<string, TPoint>;
  liveBounds: TDraftRect;
  rotation: number;
  vertexOrigins: Record<string, TPoint>;
};

export type TVectorMultiSelectRotateDragState = {
  bounds: TDraftRect;
  cursorAngle: number;
  deltaDegrees: number;
  handleOrigins: Record<string, TPoint>;
  pivot: TPoint;
  rotation: number;
  startAngle: number;
  vertexOrigins: Record<string, TPoint>;
};

export type TVectorCutHit = { nodeId: string; segmentId: string; t: number };

export type TVectorCutDragState =
  { hit: TVectorCutHit | null; lineStart: TPoint; status: 'pending' } | { lineStart: TPoint; status: 'dividing' };

export type TVectorEraseDragState = { axisLock: TAxisLock | null; lastPoint: TPoint; shiftAnchor: TPoint | null };

export type TSelectionToolRefs = {
  dragStateRef: RefObject<TDragState | null>;
  endpointDragRef: RefObject<TEndpointDragState | null>;
  marqueeStartRef: RefObject<TPoint | null>;
  pathOffsetDragRef: RefObject<TPathOffsetDragState | null>;
  pendingVectorCornerHandleDragRef: RefObject<TPendingVectorCornerHandleDragState | null>;
  resizeDragRef: RefObject<TResizeDragState | null>;
  vectorCutDragRef: RefObject<TVectorCutDragState | null>;
  vectorEraseDragRef: RefObject<TVectorEraseDragState | null>;
  vectorHandleDragRef: RefObject<TVectorHandleDragState | null>;
  vectorMarqueeModeRef: RefObject<TVectorMarqueeMode | null>;
  vectorMarqueeStartRef: RefObject<TPoint | null>;
  vectorSegmentBendDragRef: RefObject<TVectorSegmentBendDragState | null>;
  vectorVertexDragRef: RefObject<TVectorVertexDragState | null>;
};
