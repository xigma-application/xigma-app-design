import { RefObject } from 'react';

// store
import { updateNode } from 'store/design/slice';
import { AppDispatch } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';
import { TVectorSegmentBendDragState } from 'types/design/selectionTool/types';

const getStraightTangent = (from: TPoint, to: TPoint): TPoint => ({ x: (to.x - from.x) / 3, y: (to.y - from.y) / 3 });

type TCommittedVectorSegmentBendDragState = Extract<TVectorSegmentBendDragState, { status: 'committed' }>;

export const commitVectorBendSegment = (
  node: TVectorNode,
  segmentId: string,
  dragStart: TPoint,
  dispatch: AppDispatch,
  canvasRefs: TCanvasRefs,
  vectorSegmentBendDragRef: RefObject<TVectorSegmentBendDragState | null>,
): TCommittedVectorSegmentBendDragState => {
  const segment = node.segments[segmentId];
  const start = node.vertices[segment.startId];
  const end = node.vertices[segment.endId];
  const tangentStart = segment.tangentStart ?? getStraightTangent(start, end);
  const tangentEnd = segment.tangentEnd ?? getStraightTangent(end, start);
  const segments = { ...node.segments, [segmentId]: { ...segment, tangentEnd, tangentStart } };
  const vertexHandleModes = {
    ...node.vertexHandleModes,
    [segment.endId]: 'symmetric' as const,
    [segment.startId]: 'symmetric' as const,
  };

  dispatch(updateNode({ changes: { segments, vertexHandleModes }, id: node.id }));

  canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = [segmentId];
  canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = [];
  canvasRefs.vectorEdit.selectedVectorHandlesRef.current = [];

  const committedState: TCommittedVectorSegmentBendDragState = {
    dragStart,
    nodeId: node.id,
    originalTangentEnd: segment.tangentEnd,
    originalTangentStart: segment.tangentStart,
    segmentId,
    status: 'committed',
    tangentEnd,
    tangentStart,
  };

  vectorSegmentBendDragRef.current = committedState;

  return committedState;
};
