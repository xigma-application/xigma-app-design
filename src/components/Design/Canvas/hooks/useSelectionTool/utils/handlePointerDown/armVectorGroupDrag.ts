// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSelectionToolRefs, TVectorPendingClickAction } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

// utils
import { armVectorMultiDrag } from './armVectorMultiDrag';
import { getVectorSegmentVertexIds } from 'utils/canvas/vectorNetwork/getVectorSegmentVertexIds';

export const armVectorGroupDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  selectionRefs: TSelectionToolRefs,
  node: TVectorNode,
  point: TPoint,
  pendingClickAction: TVectorPendingClickAction,
): void => {
  const vertexIds = Array.from(
    new Set([
      ...canvasRefs.selectedVectorVertexIdsRef.current,
      ...getVectorSegmentVertexIds(node, canvasRefs.selectedVectorSegmentIdsRef.current),
    ]),
  );

  armVectorMultiDrag(
    canvas,
    event,
    selectionRefs.vectorMultiDragRef,
    node,
    vertexIds,
    canvasRefs.selectedVectorHandlesRef.current,
    point,
    pendingClickAction,
  );
};
