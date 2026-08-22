// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TVectorPendingClickAction } from 'types/design/selectionTool/types';
import { TVectorNode } from 'types/design/types';

// utils
import { armVectorMultiDrag } from './armVectorMultiDrag';
import { getVectorMultiSelectBox } from '../../../../utils/getVectorMultiSelectBox';
import { getVectorMultiSelectVertexIds } from '../../../../utils/getVectorMultiSelectVertexIds';
import { isVectorMultiSelectBoxEligible } from '../../../../utils/isVectorMultiSelectBoxEligible';

export const armVectorGroupDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  node: TVectorNode,
  point: TPoint,
  pendingClickAction: TVectorPendingClickAction,
): void => {
  const selectedVertexIds = canvasRefs.selectedVectorVertexIdsRef.current;
  const selectedHandles = canvasRefs.selectedVectorHandlesRef.current;
  const vertexIds = getVectorMultiSelectVertexIds(node, selectedVertexIds, canvasRefs.selectedVectorSegmentIdsRef.current);
  const box = isVectorMultiSelectBoxEligible(vertexIds, selectedHandles)
    ? getVectorMultiSelectBox(node, vertexIds, selectedHandles, canvasRefs.vectorMultiSelectBoxRef)
    : null;

  armVectorMultiDrag(canvas, event, canvasRefs.vectorMultiDragRef, node, vertexIds, selectedHandles, point, pendingClickAction, box);
};
