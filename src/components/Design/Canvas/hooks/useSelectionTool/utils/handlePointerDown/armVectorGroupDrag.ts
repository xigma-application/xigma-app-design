// store
import { selectVectorEditingNodeIds } from 'store/design/selectors';
import { store } from 'store';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TVectorPendingClickAction } from 'types/design/selectionTool/types';

// utils
import { armVectorMultiDrag } from './armVectorMultiDrag';
import { getVectorMultiSelectBox } from '../../../../utils/getVectorMultiSelectBox';
import { getVectorMultiSelectVertexIds } from '../../../../utils/getVectorMultiSelectVertexIds';
import { isVectorMultiSelectBoxEligible } from '../../../../utils/isVectorMultiSelectBoxEligible';

export const armVectorGroupDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  canvasRefs: TCanvasRefs,
  point: TPoint,
  pendingClickAction: TVectorPendingClickAction,
): void => {
  const state = store.getState();
  const vectorEditingNodeIds = selectVectorEditingNodeIds(state);
  const selectedVertexIds = canvasRefs.selectedVectorVertexIdsRef.current;
  const selectedHandles = canvasRefs.selectedVectorHandlesRef.current;
  const vertexIds = getVectorMultiSelectVertexIds(
    state.design.nodes,
    vectorEditingNodeIds,
    selectedVertexIds,
    canvasRefs.selectedVectorSegmentIdsRef.current,
  );
  const box = isVectorMultiSelectBoxEligible(vertexIds, selectedHandles)
    ? getVectorMultiSelectBox(state.design.nodes, vectorEditingNodeIds, vertexIds, selectedHandles, canvasRefs.vectorMultiSelectBoxRef)
    : null;

  armVectorMultiDrag(
    canvas,
    event,
    canvasRefs,
    state.design.nodes,
    vectorEditingNodeIds,
    vertexIds,
    selectedHandles,
    point,
    pendingClickAction,
    box,
  );
};
