// others
import { VECTOR_SEGMENT_INSERT_T } from 'constant/canvas';

// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

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
  canvasRefs.vectorEdit.selectedVectorSegmentIdsRef.current = [segmentId];
  canvasRefs.vectorEdit.selectedVectorVertexIdsRef.current = [];
  canvasRefs.vectorEdit.selectedVectorHandlesRef.current = [];

  const vertexIds = getVectorSegmentVertexIds(node, [segmentId]);
  const pendingClickAction = canSplit ? { kind: 'split-segment' as const, nodeId: node.id, segmentId, t: VECTOR_SEGMENT_INSERT_T } : null;
  const state = store.getState();

  armVectorMultiDrag(
    canvas,
    event,
    canvasRefs,
    state.design.nodes,
    selectVectorEditingNodeIds(state),
    vertexIds,
    [],
    point,
    pendingClickAction,
  );
};
