// others
import { VECTOR_SEGMENT_INSERT_T } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TVectorNode } from 'types/design/types';

// utils
import { armVectorMultiDrag } from '../../armVectorMultiDrag';
import { getVectorSegmentVertexIds } from 'utils/canvas/vectorNetwork/getVectorSegmentVertexIds';

export const selectAndArmVectorSegmentDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  node: TVectorNode,
  segmentId: string,
  canSplit: boolean,
  point: TPoint,
): void => {
  canvasRefs.selectedVectorSegmentIdsRef.current = [segmentId];
  canvasRefs.selectedVectorVertexIdsRef.current = [];
  canvasRefs.selectedVectorHandlesRef.current = [];

  const vertexIds = getVectorSegmentVertexIds(node, [segmentId]);
  const pendingClickAction = canSplit ? { kind: 'split-segment' as const, segmentId, t: VECTOR_SEGMENT_INSERT_T } : null;

  armVectorMultiDrag(canvas, event, canvasRefs.vectorMultiDragRef, node, vertexIds, [], point, pendingClickAction);
};
